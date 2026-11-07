// Claude Skills Engine for BugListy
// Powered by https://github.com/jeffallan/claude-skills (67 Skills, 9 Workflows, Context Engineering)

export const CLAUDE_SKILLS_REGISTRY = [
  {
    id: "debugging-wizard",
    name: "Debugging Wizard",
    domain: "Debugging & Quality",
    icon: "Bug",
    description: "Systematic root-cause analysis, reproduction vector isolation, hypothesis testing, defensive guard rails.",
    command: "/debugging-wizard",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/debugging/debugging-wizard/",
    bestFor: ["Crashes", "Freezes", "Uncaught exceptions", "Silent failures", "Deadlocks"]
  },
  {
    id: "swift-expert",
    name: "Swift Expert",
    domain: "Frontend & Mobile",
    icon: "Smartphone",
    description: "Swift for iOS & macOS, SwiftUI, ASWebAuthenticationSession, app lifecycle, App Store review crashes.",
    command: "/swift-expert",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/language/swift-expert/",
    bestFor: ["iOS App Store crashes", "Safari Auth sessions", "Universal links", "SwiftUI view hierarchy"]
  },
  {
    id: "kotlin-specialist",
    name: "Kotlin Specialist",
    domain: "Frontend & Mobile",
    icon: "Smartphone",
    description: "Kotlin for Android, Jetpack Compose, Coroutines, Flow, DateTimeFormatter, Google Play crash recovery.",
    command: "/kotlin-specialist",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/language/kotlin-specialist/",
    bestFor: ["Google Play Store reviews", "Android lifecycle", "Widget configurations", "Locale formatting"]
  },
  {
    id: "javascript-pro",
    name: "JavaScript Pro",
    domain: "Language Specialists",
    icon: "Code",
    description: "Modern JavaScript, Chrome Extension MV3, Service Workers, Content Script DOM observers, event listeners.",
    command: "/javascript-pro",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/language/javascript-pro/",
    bestFor: ["Chrome Web Store", "Content script injection", "Service worker alarms", "DOM mutation observers"]
  },
  {
    id: "react-expert",
    name: "React Expert",
    domain: "Frontend & Mobile",
    icon: "Layers",
    description: "React component lifecycles, hooks, hydration mismatches, virtual DOM re-renders, theme transitions.",
    command: "/react-expert",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/frontend/react-expert/",
    bestFor: ["UI flicker", "Theme toggles", "State sync", "Component re-renders", "Form validation"]
  },
  {
    id: "secure-code-guardian",
    name: "Secure Code Guardian",
    domain: "Security & Hardening",
    icon: "ShieldAlert",
    description: "Vulnerability analysis, OAuth callback validation, input sanitization, token leakage prevention.",
    command: "/secure-code-guardian",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/security/secure-code-guardian/",
    bestFor: ["OAuth login dismissals", "Auth handshakes", "Session hijacking", "Credential exposure"]
  },
  {
    id: "performance-optimization",
    name: "Performance Optimization",
    domain: "Architecture & Performance",
    icon: "Zap",
    description: "Memory leak diagnostics, event listener detachment, CPU throttling, WebSocket lifecycles, garbage collection.",
    command: "/performance-optimization",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/performance/performance-optimization/",
    bestFor: ["Memory leaks", "Service worker RAM climb", "Infinite loops", "UI stutter", "High battery usage"]
  },
  {
    id: "test-master",
    name: "Test Master",
    domain: "Testing & Quality",
    icon: "CheckCircle",
    description: "Surgical unit tests, reproduction test harnesses, regression test suites, boundary condition coverage.",
    command: "/test-master",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/testing/test-master/",
    bestFor: ["Regression prevention", "Reproduction test suites", "Edge cases", "CI/CD automated tests"]
  },
  {
    id: "api-designer",
    name: "API Designer",
    domain: "Backend & APIs",
    icon: "Terminal",
    description: "RESTful endpoints, error status mapping, payload schemas, rate limit handling, sync protocols.",
    command: "/api-designer",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/backend/api-designer/",
    bestFor: ["Telemetry endpoints", "Sync failure", "Network status codes", "Payload formatting"]
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    domain: "Code Quality",
    icon: "FileCode",
    description: "Defensive programming audits, anti-pattern removal, DRY code quality, exception containment.",
    command: "/code-reviewer",
    referenceUrl: "https://jeffallan.github.io/claude-skills/skills/review/code-reviewer/",
    bestFor: ["Code hygiene", "Defensive fallbacks", "Pre-merge audit", "Maintainability"]
  }
];

export const CLAUDE_WORKFLOWS = [
  {
    id: "bug-investigation",
    name: "Bug Investigation & Remediation",
    description: "Standard full-cycle epic from user complaint isolation to regression test and clean review.",
    steps: [
      { skill: "debugging-wizard", label: "Root Cause Hypothesis & Reproduction" },
      { skill: "framework-specialist", label: "Platform-Specific Implementation" },
      { skill: "test-master", label: "Regression Test Harness" },
      { skill: "code-reviewer", label: "Defensive Code Review" }
    ]
  },
  {
    id: "security-hardening",
    name: "Security & Auth Hardening",
    description: "Used for login popups, OAuth handshakes, and credentials vulnerabilities.",
    steps: [
      { skill: "secure-code-guardian", label: "Auth Vulnerability Assessment" },
      { skill: "debugging-wizard", label: "Token Handshake Trace" },
      { skill: "test-master", label: "Security & Replay Attack Tests" }
    ]
  },
  {
    id: "performance-leak",
    name: "Memory Leak & Freeze Mitigation",
    description: "Used for DOM deadlocks, runaway workers, and background listener leaks.",
    steps: [
      { skill: "performance-optimization", label: "Heap & Worker Profiling" },
      { skill: "debugging-wizard", label: "Listener Detach & Garbage Collection" },
      { skill: "test-master", label: "Load & Stress Regression Suite" }
    ]
  },
  {
    id: "rapid-hotfix",
    name: "Rapid Hotfix Sprint",
    description: "Streamlined 2-step workflow for high-severity store rating emergency fixes.",
    steps: [
      { skill: "debugging-wizard", label: "Minimal Defensive Patch" },
      { skill: "framework-specialist", label: "Platform Deployment Verification" }
    ]
  }
];

// Determine the ideal Claude Skill & Workflow for any given bug
export function analyzeBugForClaudeSkills(bug, reviews = []) {
  const title = (bug.title || "").toLowerCase();
  const summary = (bug.technicalSummary || "").toLowerCase();
  const platform = (bug.platform || "").toLowerCase();
  const logs = (bug.devLogs || "").toLowerCase();
  const combined = `${title} ${summary} ${logs}`;

  let primarySkillId = "debugging-wizard";
  let reasoning = "Defaulting to systematic debugging and root-cause analysis.";
  let workflowId = "bug-investigation";
  let platformSpecialistId = "javascript-pro";

  // Platform specialist detection
  if (platform.includes("app_store") || platform.includes("ios") || platform.includes("apple") || combined.includes("swift") || combined.includes("ios")) {
    platformSpecialistId = "swift-expert";
  } else if (platform.includes("play") || platform.includes("android") || combined.includes("kotlin")) {
    platformSpecialistId = "kotlin-specialist";
  } else if (platform.includes("chrome") || combined.includes("extension") || combined.includes("manifest")) {
    platformSpecialistId = "javascript-pro";
  } else {
    platformSpecialistId = "react-expert";
  }

  // Symptom / Category matching
  if (combined.includes("oauth") || combined.includes("login") || combined.includes("auth") || combined.includes("token") || combined.includes("credential")) {
    primarySkillId = platformSpecialistId === "swift-expert" ? "swift-expert" : "secure-code-guardian";
    reasoning = "Auth modal & session handshake requires security-first inspection and platform credential isolation.";
    workflowId = "security-hardening";
  } else if (combined.includes("memory leak") || combined.includes("ram") || combined.includes("freeze") || combined.includes("deadlock") || combined.includes("observer") || combined.includes("loop")) {
    primarySkillId = "performance-optimization";
    reasoning = "DOM observer deadlocks and service worker memory climb demand heap profiling and listener lifecycle management.";
    workflowId = "performance-leak";
  } else if (combined.includes("theme") || combined.includes("flicker") || combined.includes("dark mode") || combined.includes("css") || combined.includes("ui")) {
    primarySkillId = "react-expert";
    reasoning = "View hierarchy transitions, style hydration, and client storage race conditions fit React & Frontend specialist patterns.";
    workflowId = "rapid-hotfix";
  } else if (platformSpecialistId === "swift-expert") {
    primarySkillId = "swift-expert";
    reasoning = "Native iOS runtime exceptions and entitlement schemas require Swift / ASWebAuthenticationSession specialist.";
    workflowId = "bug-investigation";
  } else if (platformSpecialistId === "kotlin-specialist") {
    primarySkillId = "kotlin-specialist";
    reasoning = "Android locale formatting and widget lifecycle settings require Kotlin & Android framework specialist.";
    workflowId = "bug-investigation";
  } else if (bug.severity === "CRITICAL") {
    primarySkillId = "debugging-wizard";
    reasoning = "Critical crash impacting live users requires systematic hypothesis testing and minimal defensive patch.";
    workflowId = "rapid-hotfix";
  }

  const primarySkill = CLAUDE_SKILLS_REGISTRY.find(s => s.id === primarySkillId) || CLAUDE_SKILLS_REGISTRY[0];
  const platformSpecialist = CLAUDE_SKILLS_REGISTRY.find(s => s.id === platformSpecialistId) || CLAUDE_SKILLS_REGISTRY[3];
  const workflow = CLAUDE_WORKFLOWS.find(w => w.id === workflowId) || CLAUDE_WORKFLOWS[0];

  return {
    primarySkill,
    platformSpecialist,
    workflow,
    reasoning,
    alternativeSkills: CLAUDE_SKILLS_REGISTRY.filter(s => s.id !== primarySkill.id).slice(0, 4)
  };
}

// Generate Claude Code CLI command & Progressive Disclosure Prompts
export function generateClaudeSkillPrompt(bug, reviews = [], selectedSkillId = null) {
  const analysis = analyzeBugForClaudeSkills(bug, reviews);
  const activeSkill = selectedSkillId 
    ? (CLAUDE_SKILLS_REGISTRY.find(s => s.id === selectedSkillId) || analysis.primarySkill)
    : analysis.primarySkill;

  const key = bug.originType === 'USER_REPORTED' 
    ? `BL-USR-${bug.id.slice(-3)}` 
    : `BL-INT-${bug.id.slice(-3)}`;

  const reviewsContext = (reviews || []).slice(0, 5).map((r, i) => 
    `  - Citation #${i+1} [${r.platform || 'Store'}] (${r.appVersion || 'v?'}, ${r.deviceInfo || 'Client'}, ${r.rating || 1}★): "${r.reviewText}"`
  ).join('\n');

  // Format 1: Direct Claude Code CLI Command
  const claudeCliCommand = `claude "${activeSkill.command} Fix customer bug ${key}: '${bug.title.replace(/"/g, '\\"')}' - Affected: ${(bug.affectedVersions || ['Latest']).join(', ')} on ${bug.platform || 'all'}"`;

  // Format 2: Full Context-Engineered Prompt (Context Engineering + Progressive Disclosure)
  const fullPrompt = `<!-- CLAUDE SKILLS CONTEXT-ENGINEERED BUG FIX REQUEST -->
<!-- Activated Skill: ${activeSkill.name} (${activeSkill.command}) -->
<!-- Multi-Skill Workflow: ${analysis.workflow.name} -->
<!-- Source: BugListy Developer Triage Workstation -->

## Objective
You are operating with the specialized capabilities of **${activeSkill.name}** (${activeSkill.referenceUrl}).
Your mission is to resolve issue **${key}: ${bug.title}**.

### 1. Issue Metadata & Telemetry
- **Issue Key:** \`${key}\`
- **Severity:** \`${bug.severity}\` (Actionability: ${bug.actionabilityScore || 4}/5)
- **Target Platform:** \`${bug.platform || 'Cross-Platform'}\`
- **Impacted Users:** ${bug.reportCount || 1} reported customer instance(s)
- **Affected Versions:** ${(bug.affectedVersions || ['Latest']).join(', ')}
- **Skill Routing Rationale:** ${analysis.reasoning}

### 2. Technical Diagnosis & Root Cause
\`\`\`
${bug.technicalSummary}
\`\`\`

${bug.devLogs ? `### 3. Captured Browser DevLogs & Console Errors
\`\`\`text
${bug.devLogs}
\`\`\`
` : ''}
### 4. Verbatim User Citations (${reviews.length} Verified Evidence Records)
${reviewsContext || '  - No raw user citations attached; derived from internal developer report.'}

### 5. Multi-Skill Execution Plan (${analysis.workflow.name})
Follow this rigorous progressive disclosure sequence:
1. **[Hypothesis Formulation (${activeSkill.name})]:** Formulate testable root-cause hypotheses based on the stack trace, DOM lifecycles, or platform entitlement state.
2. **[Surgical Fix]:** Implement the minimal defensive code change. Wrap vulnerable APIs in defensive guards to eliminate uncaught exceptions.
3. **[Regression Harness (@test-master)]:** Write an automated unit or integration test reproducing the exact failure case before confirming the fix.
4. **[Audit (@code-reviewer)]:** Check for side-effects, memory leaks, or unhandled promise rejections.

Begin by locating the responsible module and stating your initial diagnosis.`;

  // Format 3: Minimal CLI One-Liner with Context
  const minimalPrompt = `claude "Fix ${key} [${bug.title}]: ${bug.technicalSummary}. Run test-master regression tests."`;

  return {
    skill: activeSkill,
    analysis,
    claudeCliCommand,
    minimalPrompt,
    fullPrompt,
    installCommand: "/plugin install fullstack-dev-skills@fullstack-dev-skills"
  };
}
