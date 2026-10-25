import React, { useState, useEffect } from 'react';
import { 
  Bug, Plus, Link2, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, 
  Clock, ShieldAlert, Cpu, Terminal, ExternalLink, ChevronRight, Filter,
  ArrowRight, Search, Check, Layers, Copy, LayoutGrid, Kanban, Radio, BarChart3,
  Sun, Moon, MessageSquarePlus, Download, ThumbsUp, Globe
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import MetricCards from './components/MetricCards';
import KanbanBoard from './components/KanbanBoard';
import ReviewStreamView from './components/ReviewStreamView';
import TelemetryView from './components/TelemetryView';
import VerbatimProofDrawer from './components/VerbatimProofDrawer';
import AddSourceModal from './components/AddSourceModal';
import AddBugModal from './components/AddBugModal';
import FeedbackWidgetModal from './components/FeedbackWidgetModal';
import PublicRoadmapView from './components/PublicRoadmapView';

export default function App() {
  const [internalBugs, setInternalBugs] = useState([]);
  const [userBugs, setUserBugs] = useState([]);
  const [sources, setSources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Theme State (Day / Light vs Night / Dark)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Navigation & View State
  const [currentView, setCurrentView] = useState('dual'); // 'dual' | 'kanban' | 'stream' | 'telemetry'
  const [selectedBug, setSelectedBug] = useState(null);
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isAddBugOpen, setIsAddBugOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  // Issue Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH'
  const [filterPlatform, setFilterPlatform] = useState('ALL'); // 'ALL' | 'chrome' | 'app_store' | 'play_store'
  const [filterStatus, setFilterStatus] = useState('ACTIVE');   // 'ACTIVE' | 'ALL' | 'RESOLVED'
  
  const [simulating, setSimulating] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load all backend data
  const loadData = async () => {
    try {
      const [bugsRes, sourcesRes, analyticsRes] = await Promise.all([
        fetch('/api/bugs'),
        fetch('/api/sources'),
        fetch('/api/analytics')
      ]);
      const bugsData = await bugsRes.json();
      const sourcesData = await sourcesRes.json();
      const analyticsData = await analyticsRes.json();

      setInternalBugs(bugsData.internalBugs || []);
      setUserBugs(bugsData.userBugs || []);
      setSources(sourcesData || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update status: OPEN -> IN_PROGRESS -> IN_REVIEW -> RESOLVED
  const handleUpdateStatus = async (bugId, newStatus) => {
    try {
      const res = await fetch(`/api/bugs/${bugId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      
      setInternalBugs(prev => prev.map(b => b.id === bugId ? updated : b));
      setUserBugs(prev => prev.map(b => b.id === bugId ? updated : b));
      if (selectedBug && selectedBug.id === bugId) {
        setSelectedBug(updated);
      }
      fetch('/api/analytics').then(r => r.json()).then(setAnalytics);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Simulate review
  const handleSimulateReview = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/simulate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();

      setNotification({
        message: data.triageResult.isDuplicate 
          ? `⚡ AI clustered review into: "${data.affectedBug?.title}"`
          : `✨ New bug extracted by AI: "${data.affectedBug?.title}"`,
        reviewText: data.review.reviewText,
        author: data.review.authorName,
        platform: data.review.platform
      });

      await loadData();
      setTimeout(() => setNotification(null), 6000);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  // Quick 1-click prompt copy
  const handleQuickCopyPrompt = async (e, bug) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/bugs/${bug.id}/cursor-prompt`);
      const data = await res.json();
      navigator.clipboard.writeText(data.prompt);
      alert(`Copied Cursor/Claude Prompt for:\n"${bug.title}"`);
    } catch (err) {
      console.error(err);
    }
  };

  // Upvote / +1 Affected User 
  const handleUpvoteBug = async (e, bug) => {
    e.stopPropagation();
    const nextCount = (bug.reportCount || 1) + 1;
    try {
      const res = await fetch(`/api/bugs/${bug.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportCount: nextCount })
      });
      const updated = await res.json();
      setUserBugs(prev => prev.map(b => b.id === bug.id ? updated : b));
      setInternalBugs(prev => prev.map(b => b.id === bug.id ? updated : b));
      if (selectedBug && selectedBug.id === bug.id) setSelectedBug(updated);
      fetch('/api/analytics').then(r => r.json()).then(setAnalytics);
    } catch (err) {
      console.error("Failed to upvote:", err);
    }
  };

  // 1-Click Export to CSV
  const handleExportCSV = () => {
    const headers = ["Issue Key", "Type", "Title", "Severity", "Status", "Platform", "Reports", "Technical Summary"];
    const rows = allFilteredBugs.map(b => [
      b.originType === 'USER_REPORTED' ? `BL-USR-${b.id.slice(-3)}` : `BL-INT-${b.id.slice(-3)}`,
      b.originType === 'USER_REPORTED' ? 'User Reported' : 'Internal Bug',
      `"${(b.title || '').replace(/"/g, '""')}"`,
      b.severity,
      b.status,
      b.platform || 'General',
      b.reportCount || 1,
      `"${(b.technicalSummary || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `buglisty-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering Function
  const filterBug = (b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = b.title.toLowerCase().includes(q) || (b.technicalSummary || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (filterStatus === 'ACTIVE' && b.status === 'RESOLVED') return false;
    if (filterStatus === 'RESOLVED' && b.status !== 'RESOLVED') return false;

    if (filterSeverity !== 'ALL' && b.severity !== filterSeverity) return false;

    if (filterPlatform !== 'ALL') {
      const p = (b.platform || '').toLowerCase();
      if (!p.includes(filterPlatform)) return false;
    }

    return true;
  };

  const filteredInternal = internalBugs.filter(filterBug);
  const filteredUser = userBugs.filter(filterBug);
  const allFilteredBugs = [...filteredUser, ...filteredInternal];

  const priorityChevrons = {
    CRITICAL: { icon: '▲▲', label: 'Highest', color: 'text-rose-600 dark:text-priority-red bg-rose-50 dark:bg-priority-red/10 border-rose-200 dark:border-priority-red/30' },
    HIGH: { icon: '▲', label: 'High', color: 'text-amber-600 dark:text-priority-amber bg-amber-50 dark:bg-priority-amber/10 border-amber-200 dark:border-priority-amber/30' },
    MEDIUM: { icon: '■', label: 'Medium', color: 'text-blue-600 dark:text-priority-blue bg-blue-50 dark:bg-priority-blue/10 border-blue-200 dark:border-priority-blue/30' },
    LOW: { icon: '▼', label: 'Low', color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20' }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-canvas text-slate-900 dark:text-slate-100 flex flex-row selection:bg-emerald-500 selection:text-white font-sans transition-colors duration-200">
      
      {/* 1. SIDEBAR */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        analytics={analytics}
        sources={sources}
        onAddSource={() => setIsAddSourceOpen(true)}
        onAddBug={() => setIsAddBugOpen(true)}
        onSimulate={handleSimulateReview}
        simulating={simulating}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* Top Header Bar */}
        <header className="border-b border-slate-200 dark:border-surface-border bg-white/80 dark:bg-sidebar/70 backdrop-blur sticky top-0 z-20 px-8 py-3.5 flex items-center justify-between shadow-xs dark:shadow-lg transition-colors duration-200">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {currentView === 'dual' && '📌 Dual Backlog (My Bugs vs User Bugs)'}
              {currentView === 'kanban' && '📋 Kanban Workflow'}
              {currentView === 'stream' && '📡 Live Store Review Stream'}
              {currentView === 'telemetry' && '📊 Store Health & Telemetry'}
              {currentView === 'roadmap' && '🌐 Public Community Roadmap & Changelog'}
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-surface-inset px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
              [QuickTab Suite v2.4.2]
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-accent-mint border border-emerald-200 dark:border-accent-mint/30 flex items-center gap-1.5 transition shadow-xs"
              title="Submit a review or report an issue on BugListy itself (In-App Dogfooding)"
            >
              <MessageSquarePlus size={13} />
              <span>Review BugListy</span>
            </button>

            <button
              onClick={() => setIsAddSourceOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 dark:bg-surface-elevated dark:hover:bg-surface-hover text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 flex items-center gap-1.5 transition shadow-xs"
            >
              <Link2 size={13} className="text-emerald-600 dark:text-accent-mint" />
              Add Store Link
            </button>

            <button
              onClick={() => setIsAddBugOpen(true)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-gradient-to-r dark:from-accent-mint dark:to-emerald-600 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white dark:text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-600/20 dark:shadow-accent-mint/20 transition"
            >
              <Plus size={15} className="stroke-[2.5]" />
              Create Issue
            </button>
          </div>
        </header>

        {/* Real-time Notification Banner */}
        {notification && (
          <div className="bg-emerald-50 dark:bg-[#0c1322] border-b border-emerald-200 dark:border-accent-mint/40 px-8 py-2.5 animate-in slide-in-from-top duration-150 shadow-sm dark:shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-accent-mint animate-ping shrink-0" />
                <span className="font-bold text-emerald-800 dark:text-accent-mint">{notification.message}</span>
                <span className="text-slate-600 dark:text-slate-300 italic truncate max-w-md">"{notification.reviewText}"</span>
                <span className="text-slate-500 shrink-0 font-mono">— {notification.author} ({notification.platform})</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white pl-4">✕</button>
            </div>
          </div>
        )}

        {/* Main Body Canvas */}
        <main className="p-8 space-y-6 flex-1">
          
          {/* Metric Cards */}
          <MetricCards analytics={analytics} />

          {/* Search & Quick Filter Chips */}
          <div className="p-3.5 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-3 shadow-xs dark:shadow-lg">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues, repro steps, error codes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-accent-mint transition font-mono"
              />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-inset p-1 border border-slate-200 dark:border-white/5 rounded-xl">
                {['ACTIVE', 'ALL', 'RESOLVED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      filterStatus === st 
                        ? 'bg-emerald-600 text-white dark:bg-accent-mint dark:text-slate-950 font-bold shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    {st === 'ACTIVE' ? 'Active Backlog' : st === 'RESOLVED' ? 'Resolved' : 'All Issues'}
                  </button>
                ))}
              </div>

              {/* Severity / Critical Filter */}
              <button
                onClick={() => setFilterSeverity(filterSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  filterSeverity === 'CRITICAL'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-priority-red/20 dark:text-rose-300 dark:border-priority-red/40 shadow-xs'
                    : 'bg-white dark:bg-surface-inset text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🔥 Critical Fires Only
              </button>

              {/* Platform Filters */}
              {['chrome', 'app_store', 'play_store'].map(plat => {
                const labels = {
                  chrome: '🌐 Chrome Store',
                  app_store: '🍎 iOS',
                  play_store: '🤖 Play Store'
                };
                const isActive = filterPlatform === plat;
                return (
                  <button
                    key={plat}
                    onClick={() => setFilterPlatform(isActive ? 'ALL' : plat)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-priority-blue/20 dark:text-priority-blue dark:border-priority-blue/40 font-semibold shadow-xs'
                        : 'bg-white dark:bg-surface-inset text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {labels[plat]}
                  </button>
                );
              })}

              {/* 1-Click CSV Export */}
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 rounded-xl border text-xs font-semibold bg-white hover:bg-slate-50 dark:bg-surface-inset dark:hover:bg-surface-elevated text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 flex items-center gap-1.5 transition shadow-xs"
                title="Export filtered backlog to CSV"
              >
                <Download size={13} className="text-emerald-600 dark:text-accent-mint" />
                <span>Export CSV</span>
              </button>

            </div>
          </div>

          {/* VIEW SWITCHER CONTENT */}

          {/* VIEW 1: DUAL BACKLOG VIEW */}
          {currentView === 'dual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* COLUMN 1: MY BUGS (Internal Backlog) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-surface-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-priority-blue shadow-xs" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                      🛠️ My Bugs to Fix (Internal)
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-priority-blue/10 dark:text-priority-blue border border-blue-200 dark:border-priority-blue/20">
                      {filteredInternal.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAddBugOpen(true)}
                    className="text-xs text-blue-600 dark:text-priority-blue hover:underline font-semibold flex items-center gap-1 font-mono transition"
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">Loading internal issues...</div>
                ) : filteredInternal.length === 0 ? (
                  <div className="p-8 text-center glass-panel rounded-2xl text-slate-400 dark:text-slate-500 text-xs font-mono">
                    No internal bugs match current filters.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInternal.map(bug => {
                      const prio = priorityChevrons[bug.severity] || priorityChevrons.MEDIUM;
                      return (
                        <div
                          key={bug.id}
                          onClick={() => setSelectedBug(bug)}
                          className="p-4 rounded-2xl glass-card transition cursor-pointer group space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="text-blue-600 dark:text-priority-blue font-mono font-bold text-[11px]">
                                  BL-INT-{bug.id.slice(-3)}
                                </span>
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${prio.color}`}>
                                  {prio.icon} {prio.label}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                                  bug.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-accent-mint/10 dark:text-accent-mint dark:border-accent-mint/20' :
                                  bug.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-priority-amber/10 dark:text-priority-amber dark:border-priority-amber/20' : 'bg-slate-100 text-slate-600 dark:bg-surface-inset dark:text-slate-400 border border-slate-200 dark:border-white/5'
                                }`}>
                                  {bug.status.replace('_', ' ')}
                                </span>
                                {bug.tags && bug.tags.map(t => (
                                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-surface-inset text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 font-mono">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-priority-blue transition leading-snug">
                                {bug.title}
                              </h3>
                            </div>
                            <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-priority-blue group-hover:translate-x-0.5 transition shrink-0" />
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-mono glass-inset p-2.5 rounded-xl">
                            {bug.technicalSummary}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                            <span>Internal Issue</span>
                            <span className="text-blue-600 dark:text-priority-blue group-hover:underline font-medium">Details →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* COLUMN 2: USER-REPORTED BUGS (AI Store Triage) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-surface-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-accent-mint shadow-xs animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                      👥 User Bugs (AI Store Triage)
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-accent-mint/10 dark:text-accent-mint border border-emerald-200 dark:border-accent-mint/20">
                      {filteredUser.length}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    1-Click Verbatim Proof
                  </span>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">Triaging store reviews...</div>
                ) : filteredUser.length === 0 ? (
                  <div className="p-8 text-center glass-panel rounded-2xl text-slate-500 text-xs font-mono">
                    No user bugs match current filters.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUser.map(bug => {
                      const prio = priorityChevrons[bug.severity] || priorityChevrons.MEDIUM;
                      const platformNames = {
                        chrome_webstore: '🌐 Chrome',
                        app_store: '🍎 iOS',
                        play_store: '🤖 Play Store'
                      };

                      return (
                        <div
                          key={bug.id}
                          onClick={() => setSelectedBug(bug)}
                          className="p-4 rounded-2xl glass-card transition cursor-pointer group space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="text-emerald-700 dark:text-accent-mint font-mono font-bold text-[11px]">
                                  BL-USR-{bug.id.slice(-3)}
                                </span>
                                
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${prio.color}`}>
                                  {prio.icon} {prio.label}
                                </span>

                                <button
                                  onClick={(e) => handleUpvoteBug(e, bug)}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1 font-mono transition"
                                  title="Upvote: +1 User Reported "
                                >
                                  🔥 {bug.reportCount || 1} Reports <span className="text-[9px] font-bold text-rose-500 hover:scale-110 ml-0.5">+1</span>
                                </button>

                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-surface-inset text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                  {platformNames[bug.platform] || 'Store Review'}
                                </span>

                                {bug.actionabilityScore && (
                                  <span className="text-[10px] font-bold text-amber-700 dark:text-accent-gold bg-amber-50 dark:bg-accent-gold/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-accent-gold/25 font-mono">
                                    ⭐ {bug.actionabilityScore}/5
                                  </span>
                                )}
                              </div>

                              <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-accent-mint transition leading-snug">
                                {bug.title}
                              </h3>
                            </div>

                            <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-accent-mint group-hover:translate-x-0.5 transition shrink-0" />
                          </div>

                          {/* Technical Summary preview */}
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-mono glass-inset p-2.5 rounded-xl">
                            {bug.technicalSummary}
                          </p>

                          {/* Footer Quick Actions */}
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <div className="flex items-center gap-2">
                              {bug.affectedVersions && bug.affectedVersions.length > 0 && (
                                <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px] bg-slate-100 dark:bg-surface-inset border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded">
                                  {bug.affectedVersions.join(', ')}
                                </span>
                              )}
                              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                {bug.reviewIds?.length || 1} verbatim quote(s)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleQuickCopyPrompt(e, bug)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-surface-elevated dark:hover:bg-accent-mint dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 text-[11px] font-bold font-mono border border-slate-200 dark:border-white/5 shadow-xs"
                                title="Copy prompt for Cursor / Claude"
                              >
                                <Terminal size={11} /> Prompt
                              </button>
                              <span className="text-emerald-600 dark:text-accent-mint font-medium group-hover:underline">
                                Proof →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW 2: KANBAN BOARD */}
          {currentView === 'kanban' && (
            <KanbanBoard
              bugs={allFilteredBugs}
              onSelectBug={setSelectedBug}
              onUpdateStatus={handleUpdateStatus}
              onUpvote={handleUpvoteBug}
            />
          )}

          {/* VIEW 3: LIVE REVIEW STREAM */}
          {currentView === 'stream' && (
            <ReviewStreamView
              onSimulate={handleSimulateReview}
              simulating={simulating}
            />
          )}

          {/* VIEW 4: STORE HEALTH & TELEMETRY */}
          {currentView === 'telemetry' && (
            <TelemetryView
              analytics={analytics}
              bugs={[...userBugs, ...internalBugs]}
              sources={sources}
            />
          )}

          {/* VIEW 5: PUBLIC COMMUNITY ROADMAP & CHANGELOG */}
          {currentView === 'roadmap' && (
            <PublicRoadmapView
              bugs={userBugs}
              onUpvote={handleUpvoteBug}
              onOpenFeedback={() => setIsFeedbackOpen(true)}
            />
          )}

        </main>
      </div>

      {/* Slide-out Verbatim Evidence Drawer */}
      {selectedBug && (
        <VerbatimProofDrawer
          bug={selectedBug}
          onClose={() => setSelectedBug(null)}
          onUpdateStatus={handleUpdateStatus}
          allBugs={[...internalBugs, ...userBugs]}
        />
      )}

      {/* Add Source Modal */}
      <AddSourceModal
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
        onSourceAdded={(res) => {
          loadData();
          setNotification({
            message: `Scraped ${res.scrapedCount} reviews! Extracted ${res.newBugsCount} bugs (${res.mergedCount} deduplicated).`,
            reviewText: "Initial batch processed successfully.",
            author: "System",
            platform: res.source.title
          });
          setTimeout(() => setNotification(null), 6000);
        }}
      />

      {/* Add Bug Modal */}
      <AddBugModal
        isOpen={isAddBugOpen}
        onClose={() => setIsAddBugOpen(false)}
        onBugAdded={() => loadData()}
      />

      {/* Floating Dogfood / In-App Review Pill */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#101522] text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-accent-mint shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2.5 group"
        title="Submit an in-app review or report an issue on BugListy itself (In-App Dogfooding)"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-accent-mint transition flex items-center gap-1.5">
          <MessageSquarePlus size={14} className="text-emerald-600 dark:text-accent-mint" />
          Review BugListy
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-accent-mint border border-emerald-200 dark:border-emerald-500/20">
          Dogfood
        </span>
      </button>

      {/* In-App Dogfood Feedback Modal */}
      <FeedbackWidgetModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onFeedbackSubmitted={(res) => {
          loadData();
          setNotification({
            message: res.triageResult?.isDuplicate
              ? `⚡ AI clustered your feedback into: "${res.affectedBug?.title}"`
              : res.affectedBug
              ? `✨ In-App bug triaged into User Bugs: "${res.affectedBug?.title}"`
              : `💬 In-App Review ingested into Live Review Stream!`,
            reviewText: res.review?.reviewText || '',
            author: res.review?.authorName || 'BugListy User',
            platform: 'BugListy (In-App)'
          });
          setTimeout(() => setNotification(null), 6000);
        }}
      />

    </div>
  );
}

