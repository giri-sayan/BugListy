# 🐞 BugListy

> **The Developer-First Customer Feedback & Bug Triage Workstation**  
> Automatically turn chaotic app store reviews into actionable code fixes, side-by-side with your internal bugs.

---

## 🌟 Overview

Most feedback tools are either read-only store analytics dashboards ($50–$300/mo) or enterprise product management suites ($500+/mo) that treat Chrome extensions as an afterthought and force you to buy third-party issue trackers.

**BugListy** is an all-in-one workstation that acts as both the **automated store scraper** AND the **developer issue tracker**:
* Scrapes reviews from **Chrome Web Store**, **Apple App Store**, and **Google Play Store**.
* Uses AI to extract technical bugs, eliminate duplicates, and assign actionability scores.
* Organizes issues in a **Native Dual Backlog**: your own internal bugs alongside crowdsourced user bugs.
* Drills down to exact verbatim customer quotes with 1-click proof citations.
* Generates 1-click **Cursor / Claude Code prompts** ready for instant debugging.

---

## ✨ Key Features

### 1. 📌 Native Dual Backlog ("My Bugs" vs. "User Bugs")
* **My Bugs (Internal Backlog):** Private defects and tech debt found by developers during daily coding.
* **User Bugs (AI Store Triage):** Real-world issues extracted and clustered from public app store rants with direct source links and affected versions.

### 2. 📋 Engineering Kanban Workflow
* 4-stage column lifecycle (`OPEN` $\to$ `IN_PROGRESS` $\to$ `IN_REVIEW` $\to$ `RESOLVED`).
* 1-click status advance and priority chevrons (▲▲ Highest, ▲ High, ■ Medium, ▼ Low).
* Filter bar with real-time search, platform filters, active/resolved toggles, and critical fire filters.

### 3. 🛠️ In-App Dogfooding Widget + Console DevLogs Recorder
* Floating feedback pill allowing users and developers to report bugs or submit ratings directly inside BugListy.
* **Auto-Captured DevLogs:** Automatically intercepts browser `console.error` logs, unhandled exceptions, and environment metadata (browser, OS, resolution) to boost AI actionability scores to 5/5.
* Includes a built-in simulation button to test log capture live.

### 4. 🔍 1-Click Verbatim Proof Drawer
* Click any user bug to open a side drawer showing exact customer quotes, star ratings, reviewer handles, and direct links to live store listings.
* Displays AI technical diagnosis and attached DevLogs.

### 5. 🤖 AI Cursor & Claude Prompt Generator
* Automatically transforms emotional user complaints into structured, developer-ready code prompts (`CRITICAL USER BUG FIX REQUEST`) with 1-click copy for Cursor Composer and Claude Code.

### 6. 📈 Store Rating Recovery & Fix ROI Simulator
* Interactive predictive model on the Telemetry dashboard.
* Select which bugs you plan to fix in your next sprint to see real-time projected store rating recovery (e.g. `1.4 ★` $\to$ `3.8 ★`, `+2.4 gain`) and calculate the exact number of 5-star reviews needed to reach `4.5 ★`.

### 7. 📢 "Close-the-Loop" Release Reply Dispatcher
* When an issue is resolved, BugListy generates personalized responses for every reviewer who complained about that bug.
* Multiple tone options (`Friendly`, `Formal`, `Quick`).
* 1-click **"Dispatch Reply"** copies the personalized response and opens the store review console.

### 8. 🏷️ Sentiment & Topic Quick Filter Pills
* Live Review Stream with automated categorization pills:
  * `[All Topics]`
  * `[💥 Crashes & Freezes]`
  * `[🎨 UI & Theme]`
  * `[⏱️ Performance & Sync]`
  * `[💡 Feature Ideas]`

### 9. 🌐 Public Community Roadmap & Changelog Portal
* A transparent public-facing portal for community members to view `Planned / Up Next`, `In Development`, and `Shipped & Changelog` updates.
* Keeps internal developer bugs private.
* Built-in `👍 Upvote` counter on all public cards.

### 10. 📥 1-Click Backlog Export to CSV
* Export your active or filtered backlog directly into standard CSV format compatible with spreadsheets, Jira, or Linear.

### 11. 🌓 Seamless Day & Night Themes
* Built with custom design tokens, sub-pixel antialiasing, and typography inspired by `beminimalist.co` (Proxima Nova & DM Sans).

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* `npm` (v9 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/giri-sayan/BugListy.git
cd BugListy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the frontend
```bash
npm run build
```

### 4. Start the server
```bash
npm start
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser!

### Development Mode (Concurrent Vite + Express)
```bash
npm run dev
```

---

## 📁 Project Structure

```
BugListy/
├── data/
│   └── db.json               # Seed database (sources, raw reviews, bugs)
├── server/
│   ├── index.js              # Express 5 API server & static server
│   ├── db.js                 # LowDB/JSON storage helper
│   ├── triageEngine.js       # AI extraction, clustering & deduplication engine
│   └── scrapers.js           # Multi-platform store scrapers
├── src/
│   ├── components/
│   │   ├── AddBugModal.jsx            # Modal to add internal "My Bugs"
│   │   ├── AddSourceModal.jsx         # Modal to connect new store URLs
│   │   ├── BugListLogo.jsx            # Custom SVG vector brand logo
│   │   ├── FeedbackWidgetModal.jsx    # In-App Dogfood widget with DevLogs recorder
│   │   ├── KanbanBoard.jsx            # Engineering Kanban board with 4 columns
│   │   ├── MetricCards.jsx            # Top-level store & backlog health cards
│   │   ├── PublicRoadmapView.jsx      # Public community roadmap & changelog
│   │   ├── ReviewStreamView.jsx       # Omnichannel live review stream with topic pills
│   │   ├── Sidebar.jsx                # Lark-inspired collapsible sidebar
│   │   ├── TelemetryView.jsx          # Voice-of-Customer telemetry & ROI simulator
│   │   └── VerbatimProofDrawer.jsx    # Evidence drawer with prompts & reply dispatcher
│   ├── App.jsx                        # Main workspace application
│   ├── index.css                      # Global styles, typography & glass elevation
│   └── main.jsx                       # React 19 entry point
├── index.html                         # HTML template
├── package.json                       # Scripts and dependencies
├── tailwind.config.js                 # Semantic design tokens & typography
└── vite.config.js                     # Vite build configuration
```

---

## 📄 License
ISC License. Built for developers, by developers.
