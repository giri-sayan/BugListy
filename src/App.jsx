import React, { useState, useEffect } from 'react';
import { 
  Bug, Plus, Link2, RefreshCw, CheckCircle2, AlertTriangle, 
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
  
  // Theme State
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
  const [currentView, setCurrentView] = useState('dual'); // 'dual' | 'kanban' | 'stream' | 'telemetry' | 'roadmap'
  const [selectedBug, setSelectedBug] = useState(null);
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isAddBugOpen, setIsAddBugOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  // Issue Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH'
  const [filterPlatform, setFilterPlatform] = useState('ALL');
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
          ? `Clustered review into "${data.affectedBug?.title}"`
          : `New issue extracted: "${data.affectedBug?.title}"`,
        reviewText: data.review.reviewText,
        author: data.review.authorName,
        platform: data.review.platform
      });

      await loadData();
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  // Quick prompt copy
  const handleQuickCopyPrompt = async (e, bug) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/bugs/${bug.id}/cursor-prompt`);
      const data = await res.json();
      navigator.clipboard.writeText(data.prompt);
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

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Issue key", "Type", "Title", "Severity", "Status", "Platform", "Reports", "Summary"];
    const rows = allFilteredBugs.map(b => [
      b.originType === 'USER_REPORTED' ? `BL-USR-${b.id.slice(-3)}` : `BL-INT-${b.id.slice(-3)}`,
      b.originType === 'USER_REPORTED' ? 'User reported' : 'Internal bug',
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

  // Filtering
  const filterBug = (b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = b.title.toLowerCase().includes(q) || (b.technicalSummary || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (filterStatus === 'ACTIVE' && b.status === 'RESOLVED') return false;
    if (filterStatus === 'RESOLVED' && b.status !== 'RESOLVED') return false;
    if (filterSeverity !== 'ALL' && b.severity !== filterSeverity) return false;

    if (filterPlatform !== 'ALL') {
      const p = (b.platform || '').toLowerCase();
      const platformRegexMap = {
        chrome: /chrome/i,
        app_store: /app_store|ios|apple/i,
        play_store: /play|android/i,
        firefox_addons: /firefox/i,
        edge_addons: /edge/i,
        product_hunt: /product_hunt|producthunt/i,
        trustpilot: /trustpilot/i,
        g2: /g2/i,
        capterra: /capterra/i,
        steam: /steam/i,
        github: /github/i,
        shopify: /shopify/i,
        discord: /discord/i
      };
      const rx = platformRegexMap[filterPlatform] || new RegExp(filterPlatform, 'i');
      if (!rx.test(p)) return false;
    }

    return true;
  };

  const filteredInternal = internalBugs.filter(filterBug);
  const filteredUser = userBugs.filter(filterBug);
  const allFilteredBugs = [...filteredUser, ...filteredInternal];

  const severityLabels = {
    CRITICAL: { label: 'Critical', color: 'text-semantic-negative-light dark:text-semantic-negative-dark bg-red-500/10' },
    HIGH: { label: 'High', color: 'text-semantic-warning-light dark:text-semantic-warning-dark bg-amber-500/10' },
    MEDIUM: { label: 'Medium', color: 'text-ink-secondary-light dark:text-ink-secondary-dark bg-surface-raised-light dark:bg-surface-raised-dark' },
    LOW: { label: 'Low', color: 'text-ink-muted-light dark:text-ink-muted-dark bg-surface-raised-light dark:bg-surface-raised-dark' }
  };

  const viewTitles = {
    dual: 'Dual backlog',
    kanban: 'Kanban workflow',
    stream: 'Review stream',
    telemetry: 'Store telemetry',
    roadmap: 'Public roadmap'
  };

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark flex flex-row font-sans selection:bg-accent/20 transition-colors duration-150">
      
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
        <header className="h-14 border-b border-surface-border-light dark:border-surface-border-dark bg-canvas-light dark:bg-canvas-dark sticky top-0 z-20 px-6 flex items-center justify-between transition-colors duration-150">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
              {viewTitles[currentView]}
            </h1>
            <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark font-mono tabular">
              v2.4.2
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="h-8 px-2.5 rounded-lg text-xs font-medium surface-raised text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-1.5 transition-colors duration-140"
              title="Submit feedback on BugListy"
            >
              <MessageSquarePlus size={13} strokeWidth={1.5} />
              <span>Feedback</span>
            </button>

            <button
              onClick={() => setIsAddSourceOpen(true)}
              className="h-8 px-2.5 rounded-lg text-xs font-medium surface-raised text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-1.5 transition-colors duration-140"
            >
              <Link2 size={13} strokeWidth={1.5} />
              <span>Add channel</span>
            </button>

            <button
              onClick={() => setIsAddBugOpen(true)}
              className="h-8 px-3 rounded-lg text-xs font-medium bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark hover:opacity-90 flex items-center gap-1.5 transition-opacity duration-140"
            >
              <Plus size={14} strokeWidth={2} />
              <span>Create issue</span>
            </button>
          </div>
        </header>

        {/* Real-time Notification Banner */}
        {notification && (
          <div className="border-b border-surface-border-light dark:border-surface-border-dark bg-surface-raised-light dark:bg-surface-raised-dark px-6 py-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span className="font-medium text-ink-primary-light dark:text-ink-primary-dark">{notification.message}</span>
                <span className="text-ink-muted-light dark:text-ink-muted-dark truncate max-w-md">"{notification.reviewText}"</span>
                <span className="text-ink-muted-light dark:text-ink-muted-dark shrink-0 font-mono text-[11px]">— {notification.author} ({notification.platform})</span>
              </div>
              <button 
                onClick={() => setNotification(null)} 
                className="text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark pl-4 text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Main Body Canvas */}
        <main className="p-6 space-y-5 flex-1 max-w-7xl w-full">
          
          {/* Metric Cards */}
          <MetricCards analytics={analytics} />

          {/* Search & Quick Filter Controls */}
          <div className="p-2 rounded-xl surface-card flex flex-wrap items-center justify-between gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search size={13} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted-light dark:text-ink-muted-dark" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8 bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg pl-8 pr-3 text-xs text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none focus:border-ink-primary-light dark:focus:border-ink-primary-dark transition-colors duration-140 font-mono"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              
              {/* Status Segmented Control */}
              <div className="flex items-center gap-0.5 bg-surface-inset-light dark:bg-surface-inset-dark p-0.5 rounded-lg border border-surface-border-light dark:border-surface-border-dark">
                {['ACTIVE', 'ALL', 'RESOLVED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`h-7 px-2.5 rounded-md text-xs transition-colors duration-140 ${
                      filterStatus === st 
                        ? 'bg-canvas-light dark:bg-surface-raised-dark text-ink-primary-light dark:text-ink-primary-dark font-medium shadow-xs' 
                        : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                    }`}
                  >
                    {st === 'ACTIVE' ? 'Active' : st === 'RESOLVED' ? 'Resolved' : 'All'}
                  </button>
                ))}
              </div>

              {/* Critical Severity Filter */}
              <button
                onClick={() => setFilterSeverity(filterSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
                className={`h-7 px-2.5 rounded-lg border text-xs font-medium transition-colors duration-140 ${
                  filterSeverity === 'CRITICAL'
                    ? 'bg-red-500/10 text-semantic-negative-light dark:text-semantic-negative-dark border-semantic-negative-light/30 dark:border-semantic-negative-dark/30'
                    : 'surface-card text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                }`}
              >
                Critical only
              </button>

              {/* Platform filters */}
              {(() => {
                const platformMap = {
                  chrome: { label: 'Chrome', match: 'chrome' },
                  app_store: { label: 'iOS', match: 'app_store|ios|apple' },
                  play_store: { label: 'Android', match: 'play|android' },
                  firefox_addons: { label: 'Firefox', match: 'firefox' },
                  edge_addons: { label: 'Edge', match: 'edge' },
                  product_hunt: { label: 'Product Hunt', match: 'product_hunt|producthunt' },
                  trustpilot: { label: 'Trustpilot', match: 'trustpilot' }
                };

                const activeKeys = Object.keys(platformMap).filter(k => {
                  const pattern = new RegExp(platformMap[k].match, 'i');
                  return (sources && sources.some(s => pattern.test(s.platform || ''))) ||
                         (userBugs && userBugs.some(b => pattern.test(b.platform || '')));
                });

                const displayKeys = activeKeys.length > 0 ? activeKeys.slice(0, 4) : ['chrome', 'app_store', 'play_store'];

                return displayKeys.map(plat => {
                  const info = platformMap[plat] || { label: plat };
                  const isActive = filterPlatform === plat;
                  return (
                    <button
                      key={plat}
                      onClick={() => setFilterPlatform(isActive ? 'ALL' : plat)}
                      className={`h-7 px-2.5 rounded-lg border text-xs transition-colors duration-140 ${
                        isActive
                          ? 'bg-surface-raised-light dark:bg-surface-raised-dark text-ink-primary-light dark:text-ink-primary-dark font-medium border-surface-border-light dark:border-surface-border-dark'
                          : 'surface-card text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                      }`}
                    >
                      {info.label}
                    </button>
                  );
                });
              })()}

              {/* CSV Export */}
              <button
                onClick={handleExportCSV}
                className="h-7 px-2.5 rounded-lg surface-card text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-1.5 transition-colors duration-140"
                title="Export filtered backlog to CSV"
              >
                <Download size={12} strokeWidth={1.5} />
                <span>Export CSV</span>
              </button>

            </div>
          </div>

          {/* VIEW SWITCHER CONTENT */}

          {/* VIEW 1: DUAL BACKLOG VIEW */}
          {currentView === 'dual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              
              {/* COLUMN 1: INTERNAL BACKLOG */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border-light dark:border-surface-border-dark">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-ink-muted-light dark:bg-ink-muted-dark" />
                    <h2 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
                      Internal issues
                    </h2>
                    <span className="text-[11px] font-mono tabular text-ink-muted-light dark:text-ink-muted-dark">
                      {filteredInternal.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAddBugOpen(true)}
                    className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark font-medium flex items-center gap-1 transition-colors duration-140"
                  >
                    <Plus size={12} strokeWidth={1.5} />
                    <span>Add</span>
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-ink-muted-light dark:text-ink-muted-dark font-mono text-xs">
                    Loading issues...
                  </div>
                ) : filteredInternal.length === 0 ? (
                  <div className="p-8 text-center surface-card rounded-xl text-ink-muted-light dark:text-ink-muted-dark text-xs">
                    No internal issues match the current filter.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredInternal.map(bug => {
                      const sev = severityLabels[bug.severity] || severityLabels.MEDIUM;
                      return (
                        <div
                          key={bug.id}
                          onClick={() => setSelectedBug(bug)}
                          className="p-3.5 rounded-xl surface-card cursor-pointer group space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="text-ink-muted-light dark:text-ink-muted-dark font-mono text-[11px] tabular">
                                  BL-INT-{bug.id.slice(-3)}
                                </span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${sev.color}`}>
                                  {sev.label}
                                </span>
                                <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
                                  {bug.status.replace('_', ' ').toLowerCase()}
                                </span>
                                {bug.tags && bug.tags.map(t => (
                                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised-light dark:bg-surface-raised-dark text-ink-muted-light dark:text-ink-muted-dark font-mono">
                                    {t}
                                  </span>
                                ))}
                              </div>
                              <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:text-accent transition-colors duration-140 leading-snug">
                                {bug.title}
                              </h3>
                            </div>
                            <ChevronRight size={14} strokeWidth={1.5} className="text-ink-muted-light dark:text-ink-muted-dark group-hover:text-ink-primary-light dark:group-hover:text-ink-primary-dark transition-colors shrink-0 mt-0.5" />
                          </div>

                          <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark line-clamp-2 surface-inset p-2.5 rounded-lg leading-relaxed">
                            {bug.technicalSummary}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* COLUMN 2: CUSTOMER ISSUES */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border-light dark:border-surface-border-dark">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <h2 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
                      Customer issues
                    </h2>
                    <span className="text-[11px] font-mono tabular text-ink-muted-light dark:text-ink-muted-dark">
                      {filteredUser.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
                    Citations attached
                  </span>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-ink-muted-light dark:text-ink-muted-dark font-mono text-xs">
                    Loading customer issues...
                  </div>
                ) : filteredUser.length === 0 ? (
                  <div className="p-8 text-center surface-card rounded-xl text-ink-muted-light dark:text-ink-muted-dark text-xs">
                    No customer issues match the current filter.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredUser.map(bug => {
                      const sev = severityLabels[bug.severity] || severityLabels.MEDIUM;
                      return (
                        <div
                          key={bug.id}
                          onClick={() => setSelectedBug(bug)}
                          className="p-3.5 rounded-xl surface-card cursor-pointer group space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="text-accent font-mono text-[11px] tabular font-medium">
                                  BL-USR-{bug.id.slice(-3)}
                                </span>
                                
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${sev.color}`}>
                                  {sev.label}
                                </span>

                                <button
                                  onClick={(e) => handleUpvoteBug(e, bug)}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono tabular text-ink-secondary-light dark:text-ink-secondary-dark surface-raised hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition-colors duration-140"
                                  title="Add +1 affected report"
                                >
                                  {bug.reportCount || 1} reports +
                                </button>

                                {bug.platform && (
                                  <span className="text-[10px] text-ink-muted-light dark:text-ink-muted-dark font-mono">
                                    {bug.platform.replace('_', ' ')}
                                  </span>
                                )}

                                {bug.actionabilityScore && (
                                  <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
                                    {bug.actionabilityScore}/5
                                  </span>
                                )}
                              </div>

                              <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:text-accent transition-colors duration-140 leading-snug">
                                {bug.title}
                              </h3>
                            </div>

                            <ChevronRight size={14} strokeWidth={1.5} className="text-ink-muted-light dark:text-ink-muted-dark group-hover:text-ink-primary-light dark:group-hover:text-ink-primary-dark transition-colors shrink-0 mt-0.5" />
                          </div>

                          <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark line-clamp-2 surface-inset p-2.5 rounded-lg leading-relaxed">
                            {bug.technicalSummary}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-ink-muted-light dark:text-ink-muted-dark font-mono text-[10px]">
                              {bug.reviewIds?.length || 1} citation(s)
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleQuickCopyPrompt(e, bug)}
                                className="h-6 px-2 rounded surface-raised text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition-colors duration-140 flex items-center gap-1 text-[10px] font-mono"
                                title="Copy prompt for Cursor / Claude"
                              >
                                <Terminal size={10} strokeWidth={1.5} />
                                <span>Prompt</span>
                              </button>
                              <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark group-hover:text-accent transition-colors duration-140">
                                Citations →
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
            message: `Scraped ${res.scrapedCount} reviews (${res.newBugsCount} issues, ${res.mergedCount} deduplicated)`,
            reviewText: "Initial batch processed successfully.",
            author: "System",
            platform: res.source.title
          });
          setTimeout(() => setNotification(null), 5000);
        }}
      />

      {/* Add Bug Modal */}
      <AddBugModal
        isOpen={isAddBugOpen}
        onClose={() => setIsAddBugOpen(false)}
        onBugAdded={() => loadData()}
      />

      {/* Pinned Dogfood Action Pill */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-8 px-3 rounded-lg surface-card text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-2 transition-colors duration-140 shadow-sm"
        title="Submit an in-app review or report an issue on BugListy"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span>Feedback</span>
      </button>

      {/* In-App Feedback Modal */}
      <FeedbackWidgetModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onFeedbackSubmitted={(res) => {
          loadData();
          setNotification({
            message: res.triageResult?.isDuplicate
              ? `Clustered feedback into "${res.affectedBug?.title}"`
              : res.affectedBug
              ? `Created customer issue: "${res.affectedBug?.title}"`
              : `Review ingested into stream`,
            reviewText: res.review?.reviewText || '',
            author: res.review?.authorName || 'BugListy User',
            platform: 'In-app'
          });
          setTimeout(() => setNotification(null), 5000);
        }}
      />

    </div>
  );
}
