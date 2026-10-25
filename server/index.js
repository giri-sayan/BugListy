import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { scrapeSourceReviews, detectPlatform } from './scrapers/engine.js';
import { triageAndDeduplicate, generateCursorPrompt, generateStoreReply } from './aiTriage.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Projects
app.get('/api/projects', (req, res) => {
  res.json(db.getProjects());
});

// 2. Sources (Pastable URLs)
app.get('/api/sources', (req, res) => {
  const { projectId } = req.query;
  res.json(db.getSources(projectId));
});

app.post('/api/sources', async (req, res) => {
  try {
    const { url, title, projectId = 'proj_default' } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const platform = detectPlatform(url);
    const platformNames = {
      chrome_webstore: "Chrome Web Store",
      app_store: "iOS App Store",
      play_store: "Google Play Store",
      website: "Website / Webhook"
    };

    const newSource = db.addSource({
      projectId,
      platform,
      title: title || platformNames[platform] || "Public Source",
      url
    });

    // Auto-scrape right after adding source
    const rawReviews = await scrapeSourceReviews(newSource);
    db.addRawReviews(rawReviews);

    // Run AI Triage on the new reviews
    let triagedCount = 0;
    let mergedCount = 0;
    const existingBugs = db.getBugs(projectId);

    for (const review of rawReviews) {
      const result = triageAndDeduplicate(review, existingBugs);
      if (result.isBug) {
        if (result.isDuplicate) {
          const bug = db.getBugs(projectId).find(b => b.id === result.targetBugId);
          if (bug) {
            const updatedReviewIds = Array.from(new Set([...(bug.reviewIds || []), result.reviewId]));
            const updatedVersions = Array.from(new Set([...(bug.affectedVersions || []), result.version].filter(Boolean)));
            db.updateBug(bug.id, {
              reportCount: (bug.reportCount || 1) + 1,
              reviewIds: updatedReviewIds,
              affectedVersions: updatedVersions
            });
            mergedCount++;
          }
        } else {
          const created = db.addBug({
            ...result.bugData,
            projectId
          });
          existingBugs.push(created);
          triagedCount++;
        }
      }
    }

    res.json({
      source: newSource,
      scrapedCount: rawReviews.length,
      newBugsCount: triagedCount,
      mergedCount
    });
  } catch (err) {
    console.error("Error adding source:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sources/:id', (req, res) => {
  db.deleteSource(req.params.id);
  res.json({ success: true });
});

// Trigger scraping for a specific source
app.post('/api/sources/:id/scrape', async (req, res) => {
  try {
    const sources = db.getSources();
    const source = sources.find(s => s.id === req.params.id);
    if (!source) return res.status(404).json({ error: "Source not found" });

    const rawReviews = await scrapeSourceReviews(source);
    db.addRawReviews(rawReviews);

    const existingBugs = db.getBugs(source.projectId);
    let newBugs = 0;
    let mergedBugs = 0;

    for (const review of rawReviews) {
      const result = triageAndDeduplicate(review, existingBugs);
      if (result.isBug) {
        if (result.isDuplicate) {
          const bug = db.getBugs(source.projectId).find(b => b.id === result.targetBugId);
          if (bug) {
            db.updateBug(bug.id, {
              reportCount: (bug.reportCount || 1) + 1,
              reviewIds: Array.from(new Set([...(bug.reviewIds || []), result.reviewId]))
            });
            mergedBugs++;
          }
        } else {
          const created = db.addBug({
            ...result.bugData,
            projectId: source.projectId
          });
          existingBugs.push(created);
          newBugs++;
        }
      }
    }

    res.json({ success: true, reviewsCount: rawReviews.length, newBugs, mergedBugs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Bugs (Dual-List: Internal + User Reported)
app.get('/api/bugs', (req, res) => {
  const { projectId } = req.query;
  const allBugs = db.getBugs(projectId);

  const internalBugs = allBugs.filter(b => b.originType === 'INTERNAL');
  const userBugs = allBugs.filter(b => b.originType === 'USER_REPORTED');

  res.json({
    internalBugs,
    userBugs,
    totalCount: allBugs.length,
    openInternal: internalBugs.filter(b => b.status !== 'RESOLVED').length,
    openUser: userBugs.filter(b => b.status !== 'RESOLVED').length
  });
});

// Add Internal "My Bug"
app.post('/api/bugs/internal', (req, res) => {
  const { title, technicalSummary, severity = "MEDIUM", tags = [], projectId = "proj_default" } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const newBug = db.addBug({
    projectId,
    originType: "INTERNAL",
    title,
    technicalSummary: technicalSummary || "Internal developer note.",
    severity,
    status: "OPEN",
    actionabilityScore: 5,
    tags
  });

  res.json(newBug);
});

// Update Bug (Status, Severity, FixedInVersion)
app.patch('/api/bugs/:id', (req, res) => {
  const updated = db.updateBug(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Bug not found" });
  res.json(updated);
});

// Delete Bug
app.delete('/api/bugs/:id', (req, res) => {
  db.deleteBug(req.params.id);
  res.json({ success: true });
});

// Merge User Bug into Internal Bug (or merge two bugs)
app.post('/api/bugs/merge', (req, res) => {
  const { targetBugId, sourceBugId } = req.body;
  if (!targetBugId || !sourceBugId) {
    return res.status(400).json({ error: "targetBugId and sourceBugId are required" });
  }

  const merged = db.mergeBugs(targetBugId, sourceBugId);
  if (!merged) return res.status(404).json({ error: "Could not find bugs to merge" });

  res.json({ success: true, bug: merged });
});

// Get verbatim raw reviews linked to a bug
app.get('/api/bugs/:id/reviews', (req, res) => {
  const reviews = db.getReviewsForBug(req.params.id);
  res.json(reviews);
});

// Generate Prompt for Cursor / Claude
app.get('/api/bugs/:id/cursor-prompt', (req, res) => {
  const bugs = db.getBugs();
  const bug = bugs.find(b => b.id === req.params.id);
  if (!bug) return res.status(404).json({ error: "Bug not found" });

  const reviews = db.getReviewsForBug(bug.id);
  const prompt = generateCursorPrompt(bug, reviews);
  res.json({ prompt });
});

// Generate Store Reply Draft
app.post('/api/bugs/:id/reply-draft', (req, res) => {
  const { reviewId } = req.body;
  const bugs = db.getBugs();
  const bug = bugs.find(b => b.id === req.params.id);
  if (!bug) return res.status(404).json({ error: "Bug not found" });

  const reviews = db.getReviewsForBug(bug.id);
  const targetReview = reviews.find(r => r.id === reviewId) || reviews[0];

  const reply = generateStoreReply(bug, targetReview);
  res.json({ reply });
});

// Raw Reviews stream
app.get('/api/raw-reviews', (req, res) => {
  const reviews = db.getRawReviews();
  res.json(reviews);
});

// High-density analytics & health metrics
app.get('/api/analytics', (req, res) => {
  const reviews = db.getRawReviews();
  const bugs = db.getBugs();
  const sources = db.getSources();

  const totalReviews = reviews.length;
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRatingSum = 0;

  for (const r of reviews) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating || 1)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    totalRatingSum += star;
  }

  const averageRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : "0.0";
  const userBugs = bugs.filter(b => b.originType === 'USER_REPORTED');
  const internalBugs = bugs.filter(b => b.originType === 'INTERNAL');

  const totalAffectedUsers = userBugs.reduce((acc, b) => acc + (b.reportCount || 1), 0);
  const criticalBugs = bugs.filter(b => b.severity === 'CRITICAL' && b.status !== 'RESOLVED').length;
  const resolvedCount = bugs.filter(b => b.status === 'RESOLVED').length;

  res.json({
    totalReviews,
    averageRating,
    ratingCounts,
    totalBugs: bugs.length,
    activeUserBugs: userBugs.filter(b => b.status !== 'RESOLVED').length,
    activeInternalBugs: internalBugs.filter(b => b.status !== 'RESOLVED').length,
    resolvedCount,
    totalAffectedUsers,
    criticalBugs,
    activeSources: sources.length
  });
});

// Settings
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.post('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// In-App Feedback Endpoint (Dogfooding BugListy on BugListy)
app.post('/api/feedback', (req, res) => {
  try {
    const { authorName, rating = 5, reviewText, category = "bug", deviceInfo, devLogs } = req.body;
    if (!reviewText || !reviewText.trim()) {
      return res.status(400).json({ error: "Feedback message is required." });
    }

    const timestamp = Date.now();
    const formattedText = category === 'bug' 
      ? `[BUG REPORT] ${reviewText.trim()}`
      : category === 'feature'
      ? `[FEATURE REQUEST] ${reviewText.trim()}`
      : reviewText.trim();

    const newReview = {
      id: `rev_inapp_${timestamp}`,
      sourceId: "src_inapp",
      authorName: (authorName && authorName.trim()) || "BugListy User",
      rating: parseInt(rating, 10) || 5,
      reviewText: formattedText,
      appVersion: "v2.4.2",
      platform: "BugListy (In-App)",
      deviceInfo: deviceInfo || "Web Browser",
      devLogs: devLogs || null,
      reviewDate: new Date().toISOString(),
      storeUrl: "http://localhost:3001"
    };

    db.addRawReviews([newReview]);

    // Run AI triage
    const existingBugs = db.getBugs("proj_default");
    const triageResult = triageAndDeduplicate(newReview, existingBugs);

    let affectedBug = null;
    if (triageResult.isBug) {
      if (triageResult.isDuplicate) {
        const bug = existingBugs.find(b => b.id === triageResult.targetBugId);
        if (bug) {
          db.updateBug(bug.id, {
            reportCount: (bug.reportCount || 1) + 1,
            reviewIds: Array.from(new Set([...(bug.reviewIds || []), newReview.id])),
            actionabilityScore: devLogs ? 5 : (bug.actionabilityScore || 4),
            devLogs: devLogs || bug.devLogs
          });
          affectedBug = bug;
        }
      } else {
        affectedBug = db.addBug({
          ...triageResult.bugData,
          actionabilityScore: devLogs ? 5 : (triageResult.bugData.actionabilityScore || 4),
          devLogs: devLogs || null,
          platform: "website",
          projectId: "proj_default"
        });
      }
    }

    res.json({
      success: true,
      review: newReview,
      triageResult,
      affectedBug
    });
  } catch (err) {
    console.error("Error processing in-app feedback:", err);
    res.status(500).json({ error: err.message });
  }
});

// Simulator Endpoint: Generates a new live 1-star bug review so user can see AI live extraction
app.post('/api/simulate-review', (req, res) => {
  const { platform = "chrome_webstore", customText } = req.body;
  const timestamp = Date.now();

  const presets = [
    {
      text: "After updating to Chrome 130, clicking 'Download PDF' freezes the entire browser window. Uncaught TypeError in background script.",
      platform: "Chrome Web Store",
      device: "Chrome 130 / macOS Sequoia",
      version: "v2.4.3"
    },
    {
      text: "Biometric FaceID login fails silently without any error prompt on iPhone 16 Pro Max.",
      platform: "iOS App Store",
      device: "iPhone 16 Pro / iOS 18.1",
      version: "v1.9.1"
    },
    {
      text: "Dark theme toggle does not persist when closing the app on Pixel 9. Reverts to blinding white.",
      platform: "Google Play Store",
      device: "Pixel 9 / Android 15",
      version: "v3.2.0"
    }
  ];

  const selected = presets[Math.floor(Math.random() * presets.length)];
  const reviewText = customText || selected.text;

  const newReview = {
    id: `rev_sim_${timestamp}`,
    sourceId: "src_1",
    authorName: `User_${Math.floor(Math.random() * 900 + 100)}`,
    rating: 1,
    reviewText,
    appVersion: selected.version,
    platform: selected.platform,
    deviceInfo: selected.device,
    reviewDate: new Date().toISOString(),
    storeUrl: "https://chromewebstore.google.com/detail/example"
  };

  db.addRawReviews([newReview]);

  // Run AI triage
  const existingBugs = db.getBugs("proj_default");
  const triageResult = triageAndDeduplicate(newReview, existingBugs);

  let affectedBug = null;
  if (triageResult.isBug) {
    if (triageResult.isDuplicate) {
      const bug = existingBugs.find(b => b.id === triageResult.targetBugId);
      if (bug) {
        db.updateBug(bug.id, {
          reportCount: (bug.reportCount || 1) + 1,
          reviewIds: Array.from(new Set([...(bug.reviewIds || []), newReview.id]))
        });
        affectedBug = bug;
      }
    } else {
      affectedBug = db.addBug({
        ...triageResult.bugData,
        projectId: "proj_default"
      });
    }
  }

  res.json({
    review: newReview,
    triageResult,
    affectedBug
  });
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

// Serve static build if dist exists
app.use(express.static(distPath));

// Catch-all route for SPA navigation in Express 5
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 BugListy running at http://localhost:${PORT}`);
});
