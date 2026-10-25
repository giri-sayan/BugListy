import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultSeed = {
  projects: [
    {
      id: "proj_default",
      name: "QuickTab - AI New Tab Extension & App",
      description: "Chrome Web Store extension with companion iOS and Android app",
      createdAt: new Date().toISOString()
    }
  ],
  sources: [
    {
      id: "src_1",
      projectId: "proj_default",
      platform: "chrome_webstore",
      title: "Chrome Web Store",
      url: "https://chromewebstore.google.com/detail/quicktab-smart-dashboard/abcdefghijklmnop",
      lastScrapedAt: new Date(Date.now() - 3600000).toISOString(),
      status: "active"
    },
    {
      id: "src_2",
      projectId: "proj_default",
      platform: "app_store",
      title: "iOS App Store",
      url: "https://apps.apple.com/app/quicktab-companion/id1523456789",
      lastScrapedAt: new Date(Date.now() - 7200000).toISOString(),
      status: "active"
    },
    {
      id: "src_3",
      projectId: "proj_default",
      platform: "play_store",
      title: "Google Play Store",
      url: "https://play.google.com/store/apps/details?id=com.quicktab.app",
      lastScrapedAt: new Date(Date.now() - 14400000).toISOString(),
      status: "active"
    }
  ],
  bugs: [
    {
      id: "bug_int_1",
      projectId: "proj_default",
      originType: "INTERNAL", // 'INTERNAL' = My Bug
      title: "Memory leak in background service worker when sync is enabled",
      technicalSummary: "Chrome MV3 background service worker retains detached WebSocket listeners during periodic sync alarms, causing RAM usage to climb beyond 200MB.",
      severity: "HIGH", // CRITICAL, HIGH, MEDIUM, LOW
      status: "OPEN", // OPEN, IN_PROGRESS, RESOLVED
      actionabilityScore: 5,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      tags: ["Performance", "Manifest V3"]
    },
    {
      id: "bug_int_2",
      projectId: "proj_default",
      originType: "INTERNAL",
      title: "Dark mode flicker on initial tab load before CSS injection",
      technicalSummary: "Flash of unstyled light content occurs for ~120ms before storage.sync retrieves theme preference.",
      severity: "LOW",
      status: "IN_PROGRESS",
      actionabilityScore: 4,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      tags: ["UI", "Theme"]
    },
    {
      id: "bug_usr_1",
      projectId: "proj_default",
      originType: "USER_REPORTED", // AI extracted
      title: "Extension freezes completely when uploading image to LinkedIn post",
      technicalSummary: "DOM mutation observer in content script triggers infinite loop when LinkedIn feed image preview is dropped into editor.",
      severity: "CRITICAL",
      status: "OPEN",
      actionabilityScore: 5,
      platform: "chrome_webstore",
      reportCount: 14,
      affectedVersions: ["v2.4.1", "v2.4.0"],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      reviewIds: ["rev_1", "rev_2", "rev_3"]
    },
    {
      id: "bug_usr_2",
      projectId: "proj_default",
      originType: "USER_REPORTED",
      title: "OAuth login popup auto-closes before redirecting on iOS 18",
      technicalSummary: "Safari WebAuthenticationSession dismisses immediately if URL scheme does not match universal link entitlement.",
      severity: "HIGH",
      status: "OPEN",
      actionabilityScore: 4,
      platform: "app_store",
      reportCount: 8,
      affectedVersions: ["v1.8.2"],
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      reviewIds: ["rev_4", "rev_5"]
    },
    {
      id: "bug_usr_3",
      projectId: "proj_default",
      originType: "USER_REPORTED",
      title: "Widget clock displays 24-hr format despite 12-hr setting selected",
      technicalSummary: "Settings toggle writes boolean to localStorage but DateTimeFormatter defaults to device locale disregarding state.",
      severity: "MEDIUM",
      status: "RESOLVED",
      fixedInVersion: "v2.4.2",
      actionabilityScore: 4,
      platform: "play_store",
      reportCount: 5,
      affectedVersions: ["v2.4.0"],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      reviewIds: ["rev_6"]
    }
  ],
  rawReviews: [
    {
      id: "rev_1",
      sourceId: "src_1",
      authorName: "Marcus Vance",
      rating: 1,
      reviewText: "Completely unusable after the latest update! Every single time I try to drag an image into a LinkedIn post, the whole Chrome tab locks up and I have to kill it in task manager. Please fix ASAP, this is part of my daily job.",
      appVersion: "v2.4.1",
      platform: "Chrome Web Store",
      deviceInfo: "Chrome 129 / macOS Sonoma",
      reviewDate: new Date(Date.now() - 14400000).toISOString(),
      storeUrl: "https://chromewebstore.google.com/detail/quicktab-smart-dashboard/abcdefghijklmnop"
    },
    {
      id: "rev_2",
      sourceId: "src_1",
      authorName: "Sarah_Dev99",
      rating: 1,
      reviewText: "Crashing on LinkedIn feed. When I attach media or pictures to my post, browser becomes totally unresponsive. Had to disable the extension for now.",
      appVersion: "v2.4.0",
      platform: "Chrome Web Store",
      deviceInfo: "Chrome 128 / Windows 11",
      reviewDate: new Date(Date.now() - 43200000).toISOString(),
      storeUrl: "https://chromewebstore.google.com/detail/quicktab-smart-dashboard/abcdefghijklmnop"
    },
    {
      id: "rev_3",
      sourceId: "src_1",
      authorName: "Priya M.",
      rating: 2,
      reviewText: "Loved this extension for 6 months, but v2.4.1 broke image uploads on social feeds (specifically LinkedIn). Tabs crash without error message.",
      appVersion: "v2.4.1",
      platform: "Chrome Web Store",
      deviceInfo: "Chrome 129 / Ubuntu 24.04",
      reviewDate: new Date(Date.now() - 86400000).toISOString(),
      storeUrl: "https://chromewebstore.google.com/detail/quicktab-smart-dashboard/abcdefghijklmnop"
    },
    {
      id: "rev_4",
      sourceId: "src_2",
      authorName: "Jake_T",
      rating: 1,
      reviewText: "Cannot sign in with Google or Apple ID on iOS 18. The auth modal pops open and closes in half a second before I can even type anything.",
      appVersion: "v1.8.2",
      platform: "iOS App Store",
      deviceInfo: "iPhone 15 Pro / iOS 18.0",
      reviewDate: new Date(Date.now() - 28800000).toISOString(),
      storeUrl: "https://apps.apple.com/app/quicktab-companion/id1523456789"
    },
    {
      id: "rev_5",
      sourceId: "src_2",
      authorName: "Elena Rostova",
      rating: 2,
      reviewText: "Login window auto-closes right away. Reinstalled twice, same behavior on iOS 18. Please push an update.",
      appVersion: "v1.8.2",
      platform: "iOS App Store",
      deviceInfo: "iPhone 14 / iOS 18.0.1",
      reviewDate: new Date(Date.now() - 57600000).toISOString(),
      storeUrl: "https://apps.apple.com/app/quicktab-companion/id1523456789"
    },
    {
      id: "rev_6",
      sourceId: "src_3",
      authorName: "David K.",
      rating: 3,
      reviewText: "The new clock widget is neat, but switching to AM/PM 12-hour format in preferences doesn't do anything. It stays in 24hr military time on my Samsung.",
      appVersion: "v2.4.0",
      platform: "Google Play Store",
      deviceInfo: "Samsung Galaxy S23 / Android 14",
      reviewDate: new Date(Date.now() - 172800000).toISOString(),
      storeUrl: "https://play.google.com/store/apps/details?id=com.quicktab.app"
    }
  ],
  settings: {
    geminiApiKey: "",
    autoTriageEnabled: true,
    filterNoise: true,
    minActionabilityScore: 2
  }
};

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultSeed, null, 2), 'utf-8');
    return defaultSeed;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, returning default seed:", err);
    return defaultSeed;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getProjects() {
    return readDb().projects;
  },
  getSources(projectId) {
    const data = readDb();
    return data.sources.filter(s => !projectId || s.projectId === projectId);
  },
  addSource(source) {
    const data = readDb();
    const newSource = {
      id: "src_" + Date.now(),
      status: "active",
      lastScrapedAt: new Date().toISOString(),
      ...source
    };
    data.sources.push(newSource);
    writeDb(data);
    return newSource;
  },
  deleteSource(sourceId) {
    const data = readDb();
    data.sources = data.sources.filter(s => s.id !== sourceId);
    writeDb(data);
    return true;
  },
  getBugs(projectId) {
    const data = readDb();
    return data.bugs.filter(b => !projectId || b.projectId === projectId);
  },
  addBug(bug) {
    const data = readDb();
    const newBug = {
      id: (bug.originType === 'INTERNAL' ? 'bug_int_' : 'bug_usr_') + Date.now(),
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      reportCount: bug.originType === 'USER_REPORTED' ? 1 : undefined,
      reviewIds: bug.reviewIds || [],
      ...bug
    };
    data.bugs.unshift(newBug);
    writeDb(data);
    return newBug;
  },
  updateBug(bugId, updates) {
    const data = readDb();
    const index = data.bugs.findIndex(b => b.id === bugId);
    if (index === -1) return null;
    data.bugs[index] = { ...data.bugs[index], ...updates };
    writeDb(data);
    return data.bugs[index];
  },
  deleteBug(bugId) {
    const data = readDb();
    data.bugs = data.bugs.filter(b => b.id !== bugId);
    writeDb(data);
    return true;
  },
  getRawReviews(projectId) {
    const data = readDb();
    return data.rawReviews;
  },
  addRawReviews(reviews) {
    const data = readDb();
    data.rawReviews.push(...reviews);
    writeDb(data);
    return reviews;
  },
  getReviewsForBug(bugId) {
    const data = readDb();
    const bug = data.bugs.find(b => b.id === bugId);
    if (!bug || !bug.reviewIds) return [];
    return data.rawReviews.filter(r => bug.reviewIds.includes(r.id));
  },
  mergeBugs(targetBugId, sourceBugId) {
    const data = readDb();
    const target = data.bugs.find(b => b.id === targetBugId);
    const source = data.bugs.find(b => b.id === sourceBugId);
    if (!target || !source) return null;

    target.reviewIds = Array.from(new Set([...(target.reviewIds || []), ...(source.reviewIds || [])]));
    target.reportCount = (target.reportCount || 0) + (source.reportCount || 1);
    
    // remove source bug
    data.bugs = data.bugs.filter(b => b.id !== sourceBugId);
    writeDb(data);
    return target;
  },
  getSettings() {
    return readDb().settings || defaultSeed.settings;
  },
  updateSettings(updates) {
    const data = readDb();
    data.settings = { ...data.settings, ...updates };
    writeDb(data);
    return data.settings;
  }
};
