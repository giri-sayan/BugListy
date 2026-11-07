// Claude Skills Data & Definitions
// Sourced from https://github.com/jeffallan/claude-skills

export const CLAUDE_SKILLS = [
  {
    id: "debugging-wizard",
    name: "Debugging Wizard",
    category: "Debugging & Quality",
    iconName: "Bug",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    badgeColor: "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30",
    command: "/debugging-wizard",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/debugging/debugging-wizard/",
    description: "Systematic root cause analysis, reproduction vector isolation, hypothesis testing, defensive guard rails.",
    keywords: ["crash", "freeze", "white screen", "deadlock", "exception", "broken", "unresponsive", "fails"]
  },
  {
    id: "swift-expert",
    name: "Swift Expert",
    category: "Frontend & Mobile",
    iconName: "Smartphone",
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    badgeColor: "bg-orange-500/15 text-orange-500 dark:text-orange-400 border-orange-500/30",
    command: "/swift-expert",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/language/swift-expert/",
    description: "Swift for iOS & macOS, SwiftUI, ASWebAuthenticationSession, app lifecycle, App Store crashes.",
    keywords: ["ios", "app store", "apple", "iphone", "swift", "safari", "universal link"]
  },
  {
    id: "kotlin-specialist",
    name: "Kotlin Specialist",
    category: "Frontend & Mobile",
    iconName: "Smartphone",
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    badgeColor: "bg-purple-500/15 text-purple-500 dark:text-purple-400 border-purple-500/30",
    command: "/kotlin-specialist",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/language/kotlin-specialist/",
    description: "Kotlin for Android, Jetpack Compose, Coroutines, Flow, DateTimeFormatter, Google Play crash recovery.",
    keywords: ["android", "play store", "google play", "kotlin", "widget", "compose", "locale"]
  },
  {
    id: "javascript-pro",
    name: "JavaScript Pro",
    category: "Language Specialists",
    iconName: "Code",
    color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    badgeColor: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    command: "/javascript-pro",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/language/javascript-pro/",
    description: "Chrome Extension MV3, Service Workers, Content Script DOM observers, event listeners.",
    keywords: ["chrome", "extension", "webstore", "service worker", "content script", "dom", "mv3"]
  },
  {
    id: "react-expert",
    name: "React Expert",
    category: "Frontend & Mobile",
    iconName: "Layers",
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    badgeColor: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    command: "/react-expert",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/frontend/react-expert/",
    description: "React component lifecycles, hooks, hydration mismatches, virtual DOM re-renders, theme transitions.",
    keywords: ["theme", "dark mode", "light mode", "flicker", "css", "ui", "render", "state"]
  },
  {
    id: "secure-code-guardian",
    name: "Secure Code Guardian",
    category: "Security & Hardening",
    iconName: "ShieldAlert",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    command: "/secure-code-guardian",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/security/secure-code-guardian/",
    description: "Vulnerability analysis, OAuth callback validation, input sanitization, token leakage prevention.",
    keywords: ["oauth", "login", "auth", "token", "session", "credential", "sign in", "security"]
  },
  {
    id: "performance-optimization",
    name: "Performance Optimization",
    category: "Architecture & Performance",
    iconName: "Zap",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    command: "/performance-optimization",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/performance/performance-optimization/",
    description: "Memory leak diagnostics, event listener detachment, CPU throttling, WebSocket lifecycles.",
    keywords: ["memory", "leak", "ram", "cpu", "slow", "lag", "loop", "battery", "sync"]
  },
  {
    id: "test-master",
    name: "Test Master",
    category: "Testing & Quality",
    iconName: "CheckCircle",
    color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
    badgeColor: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
    command: "/test-master",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/testing/test-master/",
    description: "Surgical unit tests, reproduction test harnesses, regression test suites, boundary condition coverage.",
    keywords: ["test", "regression", "unit test", "spec", "assert", "coverage"]
  },
  {
    id: "api-designer",
    name: "API Designer",
    category: "Backend & APIs",
    iconName: "Terminal",
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    command: "/api-designer",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/backend/api-designer/",
    description: "RESTful endpoints, error status mapping, payload schemas, rate limit handling, sync protocols.",
    keywords: ["api", "rest", "endpoint", "fetch", "telemetry", "status code", "500", "payload"]
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    category: "Code Quality",
    iconName: "FileCode",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    command: "/code-reviewer",
    docsUrl: "https://jeffallan.github.io/claude-skills/skills/review/code-reviewer/",
    description: "Defensive programming audits, anti-pattern removal, DRY code quality, exception containment.",
    keywords: ["review", "audit", "lint", "anti-pattern", "clean code"]
  }
];

export const CLAUDE_WORKFLOWS_DATA = [
  {
    id: "bug-investigation",
    title: "Bug Investigation & Remediation",
    subtitle: "The gold-standard fullstack developer triage workflow",
    steps: [
      { num: "01", name: "Debugging Wizard", role: "Root cause isolation & reproduction hypothesis" },
      { num: "02", name: "Platform Specialist", role: "Swift / Kotlin / React / MV3 implementation" },
      { num: "03", name: "Test Master", role: "Automated regression unit & integration tests" },
      { num: "04", name: "Code Reviewer", role: "Defensive exception guards & anti-pattern audit" }
    ]
  },
  {
    id: "security-hardening",
    title: "Security & Auth Hardening",
    subtitle: "For login popup closures, OAuth flow failures, and session drops",
    steps: [
      { num: "01", name: "Secure Code Guardian", role: "OAuth callback & entitlement audit" },
      { num: "02", name: "Debugging Wizard", role: "Auth session lifecycle trace" },
      { num: "03", name: "Test Master", role: "Replay & expired token automated tests" }
    ]
  },
  {
    id: "performance-leak",
    title: "Memory Leak & Freeze Mitigation",
    subtitle: "For background service workers, DOM deadlocks, and infinite loops",
    steps: [
      { num: "01", name: "Performance Optimization", role: "Worker memory & DOM observer analysis" },
      { num: "02", name: "Debugging Wizard", role: "Listener detachment & garbage collection" },
      { num: "03", name: "Test Master", role: "Stress tests under repeated action cycles" }
    ]
  },
  {
    id: "rapid-hotfix",
    title: "Rapid Hotfix Sprint",
    subtitle: "Targeted 2-step patch for high-urgency store rating crashes",
    steps: [
      { num: "01", name: "Debugging Wizard", role: "Minimal defensive patch & exception wrapper" },
      { num: "02", name: "Platform Specialist", role: "Runtime smoke-test on target device" }
    ]
  }
];

// Helper to get or compute skill for bug
export function getRecommendedSkillForBug(bug) {
  if (bug.claudeSkill) {
    return bug.claudeSkill;
  }
  
  const text = `${bug.title || ''} ${bug.technicalSummary || ''} ${bug.platform || ''}`.toLowerCase();
  
  if (text.includes('oauth') || text.includes('login') || text.includes('auth')) {
    return text.includes('ios') || text.includes('app_store') 
      ? CLAUDE_SKILLS.find(s => s.id === 'swift-expert')
      : CLAUDE_SKILLS.find(s => s.id === 'secure-code-guardian');
  }
  if (text.includes('memory') || text.includes('leak') || text.includes('freeze') || text.includes('deadlock')) {
    return CLAUDE_SKILLS.find(s => s.id === 'performance-optimization');
  }
  if (text.includes('theme') || text.includes('flicker') || text.includes('dark')) {
    return CLAUDE_SKILLS.find(s => s.id === 'react-expert');
  }
  if (text.includes('ios') || text.includes('app_store')) {
    return CLAUDE_SKILLS.find(s => s.id === 'swift-expert');
  }
  if (text.includes('android') || text.includes('play')) {
    return CLAUDE_SKILLS.find(s => s.id === 'kotlin-specialist');
  }
  if (text.includes('chrome') || text.includes('extension')) {
    return CLAUDE_SKILLS.find(s => s.id === 'javascript-pro');
  }
  return CLAUDE_SKILLS[0]; // Debugging Wizard
}
