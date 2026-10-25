// AI Triage and Analysis Engine

// Token similarity calculation for deduplication
function calculateSimilarity(text1, text2) {
  const getTokens = (t) => new Set(
    t.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2)
  );

  const setA = getTokens(text1);
  const setB = getTokens(text2);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

// Rule & NLP-based triage engine (works out of the box with zero external API key requirements)
export function triageReviewWithNLP(review) {
  const text = (review.reviewText || "").toLowerCase();

  // 1. Noise check: Is it praise or pure emotion without tech detail?
  const praiseWords = ["love", "awesome", "perfect", "great", "best app", "5 stars", "fantastic"];
  const isPraise = praiseWords.some(w => text.includes(w)) && review.rating >= 4;
  if (isPraise) {
    return { isBug: false, reason: "Positive praise review, not a bug." };
  }

  const pureRants = ["trash", "scam", "waste of time", "garbage", "sucks", "bad", "horrible"];
  const isTooShort = text.split(/\s+/).length < 5;
  const isPureRant = pureRants.some(w => text === w || (isTooShort && text.includes(w)));
  if (isPureRant) {
    return { isBug: false, reason: "Vague emotional rant with zero reproducible details." };
  }

  // 2. Defect keywords
  const bugIndicators = [
    "crash", "freeze", "freezes", "frozen", "lock up", "error", "broken", "fails", "failed",
    "blank", "white screen", "black screen", "disappears", "missing", "shortcut", "stuck",
    "doesn't work", "does not work", "bug", "glitch", "loop", "unresponsive", "cannot", "can't"
  ];

  const hasBugKeywords = bugIndicators.some(w => text.includes(w)) || review.rating <= 2;
  if (!hasBugKeywords) {
    return { isBug: false, reason: "General feedback or feature request, no defect detected." };
  }

  // 3. Extract Severity
  let severity = "MEDIUM";
  if (text.includes("crash") || text.includes("freeze") || text.includes("lock up") || text.includes("white screen") || text.includes("unresponsive")) {
    severity = review.rating === 1 ? "CRITICAL" : "HIGH";
  } else if (text.includes("missing") || text.includes("shortcut") || text.includes("toggle") || text.includes("format")) {
    severity = "MEDIUM";
  } else if (text.includes("flicker") || text.includes("typo") || text.includes("slow")) {
    severity = "LOW";
  }

  // 4. Calculate Actionability Score (1-5)
  let actionability = 2;
  if (review.deviceInfo && review.deviceInfo.length > 5) actionability += 1;
  if (review.appVersion && review.appVersion !== "Latest") actionability += 1;
  if (text.includes("when") || text.includes("after") || text.includes("every time") || text.includes("reproduce")) actionability += 1;
  actionability = Math.min(5, Math.max(1, actionability));

  // 5. Generate Technical Title & Summary
  let title = "Uncaught error during operation";
  let summary = `User reports issue: "${review.reviewText}"`;

  if (text.includes("toolbar") || text.includes("icon")) {
    title = "Extension toolbar icon disappears intermittently";
    summary = "Service worker lifecycle or browser restart causes extension action icon to drop from toolbar active state.";
  } else if (text.includes("shortcut") || text.includes("hotkey") || text.includes("alt+shift")) {
    title = "Registered keyboard hotkey fails to trigger popup";
    summary = "chrome.commands listener unresponsive; potential event handler unbinding on background idle.";
  } else if (text.includes("linkedin") || text.includes("image") || text.includes("upload")) {
    title = "Content script deadlock on media attachment in social feeds";
    summary = "DOM mutation observer triggers unbounded loops when file drag-and-drop elements are attached.";
  } else if (text.includes("notification") || text.includes("push") || text.includes("white screen")) {
    title = "Push notification deep link opens blank frozen screen";
    summary = "App routing fails to resolve payload parameters when launched from background push notification state.";
  } else if (text.includes("login") || text.includes("oauth") || text.includes("sign in")) {
    title = "OAuth web authentication session auto-dismisses on launch";
    summary = "Authentication modal window dismisses prematurely prior to callback handshake.";
  } else if (text.includes("theme") || text.includes("dark") || text.includes("galaxy")) {
    title = "Runtime crash during system theme configuration change";
    summary = "Resource recreation cycle fails to restore saved view hierarchy during dark/light transition.";
  } else {
    // Generate clean concise title from first sentence
    const firstSentence = review.reviewText.split(/[.!?]/)[0].trim();
    title = firstSentence.length > 60 ? firstSentence.substring(0, 57) + "..." : firstSentence;
    summary = `Reported on ${review.platform || 'Client'} (${review.deviceInfo || 'Unknown device'}): ${review.reviewText}`;
  }

  return {
    isBug: true,
    title,
    technicalSummary: summary,
    severity,
    actionabilityScore: actionability,
    suspectedCause: summary
  };
}

// Deduplicate or Merge with existing bugs
export function triageAndDeduplicate(review, existingBugs) {
  const triageResult = triageReviewWithNLP(review);
  if (!triageResult.isBug) {
    return { isBug: false, reason: triageResult.reason };
  }

  // Check similarity against existing OPEN or IN_PROGRESS user bugs
  let bestMatch = null;
  let highestScore = 0;

  for (const bug of existingBugs) {
    if (bug.originType !== 'USER_REPORTED') continue;
    if (bug.status === 'RESOLVED') continue;

    const titleSim = calculateSimilarity(bug.title, triageResult.title);
    const summarySim = calculateSimilarity(bug.technicalSummary, triageResult.technicalSummary);
    const combinedScore = (titleSim * 0.7) + (summarySim * 0.3);

    if (combinedScore > 0.35 && combinedScore > highestScore) {
      highestScore = combinedScore;
      bestMatch = bug;
    }
  }

  if (bestMatch) {
    // Merge into existing bug
    return {
      isBug: true,
      isDuplicate: true,
      targetBugId: bestMatch.id,
      reviewId: review.id,
      version: review.appVersion
    };
  }

  // Create new bug
  return {
    isBug: true,
    isDuplicate: false,
    bugData: {
      originType: "USER_REPORTED",
      title: triageResult.title,
      technicalSummary: triageResult.technicalSummary,
      severity: triageResult.severity,
      actionabilityScore: triageResult.actionabilityScore,
      platform: review.platform ? review.platform.toLowerCase().replace(/\s+/g, '_') : 'website',
      reportCount: 1,
      affectedVersions: review.appVersion ? [review.appVersion] : ["Latest"],
      reviewIds: [review.id]
    }
  };
}

// Generate an optimal Prompt for Cursor, Claude Code, or Copilot
export function generateCursorPrompt(bug, reviews) {
  const reviewsContext = (reviews || []).slice(0, 5).map((r, i) => 
    `  ${i+1}. [${r.platform || 'Store'}] (${r.appVersion || 'v?'}, ${r.deviceInfo || 'Device'}): "${r.reviewText}"`
  ).join('\n');

  return `### Bug Fix Request: ${bug.title}
**Severity:** ${bug.severity} | **Reported By:** ${bug.reportCount || 1} User(s) | **Platform:** ${bug.platform || 'All'}
**Actionability Score:** ${bug.actionabilityScore || 3}/5

#### Technical Summary & Suspected Cause:
${bug.technicalSummary}

#### Affected Versions:
${(bug.affectedVersions || ['Latest']).join(', ')}

#### Verbatim User Evidence (${reviews.length} report${reviews.length > 1 ? 's' : ''}):
${reviewsContext || '  No raw quotes attached.'}

---
### Instructions for AI Coding Assistant:
1. Locate where this component/event is handled in our codebase.
2. Identify why this failure or uncaught exception occurs under these reproduction steps.
3. Propose a minimal, defensive code fix and a corresponding unit test to prevent regression.`;
}

// Generate store reply to win back 1-star reviews
export function generateStoreReply(bug, review) {
  const author = review?.authorName || "there";
  const version = bug.fixedInVersion || "our latest update";
  
  return `Hi ${author}, thank you for flagging this! We investigated the issue you encountered with "${bug.title}" and pushed a complete fix in ${version}. Please update the app/extension and let us know if everything is running smoothly. We'd appreciate it if you'd consider updating your rating once verified!`;
}
