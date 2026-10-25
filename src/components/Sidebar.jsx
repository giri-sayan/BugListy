import React from 'react';
import { 
  LayoutGrid, Kanban, Radio, BarChart3, Link2, Plus, 
  Sparkles, ExternalLink, Star, Sun, Moon, MessageSquarePlus, Globe
} from 'lucide-react';
import BugListLogo from './BugListLogo';

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  analytics, 
  sources, 
  onAddSource, 
  onAddBug, 
  onSimulate,
  simulating,
  isDark,
  onToggleTheme,
  onOpenFeedback
}) {
  const ratingCounts = analytics?.ratingCounts || { 1: 3, 2: 2, 3: 1, 4: 0, 5: 0 };
  const totalReviews = analytics?.totalReviews || 6;
  const avgRating = analytics?.averageRating || "1.8";

  const navItems = [
    { id: 'dual', label: 'Dual Backlog', icon: LayoutGrid, count: analytics?.totalBugs },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'stream', label: 'Live Review Stream', icon: Radio, count: analytics?.totalReviews },
    { id: 'telemetry', label: 'Store Health & Metrics', icon: BarChart3 },
    { id: 'roadmap', label: 'Public Roadmap', icon: Globe }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-sidebar border-r border-slate-200 dark:border-surface-border flex flex-col h-screen select-none shrink-0 sticky top-0 shadow-lg dark:shadow-2xl transition-colors duration-200">
      
      {/* Workspace Brand / Project Switcher */}
      <div className="p-4 border-b border-slate-200 dark:border-surface-border bg-slate-50/50 dark:bg-sidebar/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-surface-inset border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-sm transition hover:scale-105 shrink-0">
            <BugListLogo size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">BugListy</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
              QuickTab Suite
            </p>
          </div>
        </div>

        {/* Theme Toggle Button (Day / Night) */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-elevated transition"
          title={isDark ? "Switch to Day Theme" : "Switch to Dark Theme"}
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-700" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="p-3 space-y-1">
        <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Views & Triage
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-accent-mint dark:border-accent-mint/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-elevated/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} className={isActive ? "text-emerald-700 dark:text-accent-mint" : "text-slate-400 dark:text-slate-500"} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-accent-mint/20 dark:text-accent-mint font-bold' : 'bg-slate-100 dark:bg-surface-elevated text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Store Rating Breakdown Widget */}
      <div className="mx-3 my-2 p-3.5 rounded-2xl glass-card space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-500 dark:text-accent-gold fill-amber-500 dark:fill-accent-gold" />
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{avgRating}</span>
            <span className="text-[10px] text-slate-400">/ 5.0</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-surface-inset px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/5">
            {totalReviews} reviews
          </span>
        </div>

        {/* 1-5 Star Visual Distribution Bars */}
        <div className="space-y-1.5 pt-1">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = ratingCounts[stars] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const barColors = {
              5: 'bg-emerald-500',
              4: 'bg-teal-500',
              3: 'bg-amber-400',
              2: 'bg-orange-500',
              1: 'bg-rose-500'
            };
            return (
              <div key={stars} className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="w-3 text-right font-mono">{stars}★</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-surface-inset rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                  <div 
                    className={`h-full rounded-full ${barColors[stars]} transition-all duration-500 shadow-sm`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
                <span className="w-4 text-right text-[9px] font-mono text-slate-400 dark:text-slate-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Channels */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Scraped Channels ({sources?.length || 0})
          </span>
          <button 
            onClick={onAddSource}
            className="text-[11px] text-emerald-600 dark:text-accent-mint hover:underline font-semibold flex items-center gap-1 transition"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        <div className="space-y-1">
          {sources?.map(src => {
            const isLocalInApp = src.id === 'src_inapp' || src.title?.includes('In-App');
            const platformConfig = {
              chrome_webstore: { icon: "🌐", color: "text-sky-600 dark:text-accent-chrome border-sky-200 dark:border-accent-chrome/20 bg-sky-50 dark:bg-accent-chrome/10" },
              app_store: { icon: "🍎", color: "text-indigo-600 dark:text-accent-apple border-indigo-200 dark:border-accent-apple/20 bg-indigo-50 dark:bg-accent-apple/10" },
              play_store: { icon: "🤖", color: "text-emerald-600 dark:text-accent-play border-emerald-200 dark:border-accent-play/20 bg-emerald-50 dark:bg-accent-play/10" },
              website: { 
                icon: isLocalInApp ? "💬" : "🔗", 
                color: isLocalInApp 
                  ? "text-emerald-600 dark:text-accent-mint border-emerald-200 dark:border-accent-mint/20 bg-emerald-50 dark:bg-emerald-500/10" 
                  : "text-purple-600 dark:text-accent-violet border-purple-200 dark:border-accent-violet/20 bg-purple-50 dark:bg-accent-violet/10" 
              }
            };
            const cfg = platformConfig[src.platform] || platformConfig.website;

            if (isLocalInApp && onOpenFeedback) {
              return (
                <button
                  key={src.id}
                  onClick={onOpenFeedback}
                  className="w-full text-left group flex items-center justify-between p-2.5 rounded-xl glass-card hover:bg-emerald-50/50 dark:hover:bg-surface-hover transition text-xs border border-emerald-200/50 dark:border-accent-mint/20"
                  title="Click to submit an in-app review or bug report"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs border ${cfg.color}`}>
                      {cfg.icon}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-accent-mint truncate font-semibold">
                      {src.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-accent-mint/20 dark:text-accent-mint">
                      Dogfood
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <a
                key={src.id}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-xl glass-card hover:bg-slate-50 dark:hover:bg-surface-hover transition text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs border ${cfg.color}`}>
                    {cfg.icon}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white truncate font-medium">
                    {src.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-accent-mint animate-pulse" title="Active Scraper" />
                  <ExternalLink size={11} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="p-3.5 border-t border-slate-200 dark:border-surface-border bg-slate-50/50 dark:bg-sidebar/90 space-y-2">
        {onOpenFeedback && (
          <button
            onClick={onOpenFeedback}
            className="w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-accent-mint border border-emerald-300 dark:border-accent-mint/30 text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
          >
            <MessageSquarePlus size={14} className="text-emerald-600 dark:text-accent-mint" />
            <span>Review BugListy</span>
          </button>
        )}

        <button
          onClick={onSimulate}
          disabled={simulating}
          className="w-full py-2 px-3 rounded-xl bg-white dark:bg-surface-elevated hover:bg-slate-100 dark:hover:bg-surface-hover text-amber-700 dark:text-accent-gold border border-amber-300 dark:border-accent-gold/30 text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Sparkles size={13} className={simulating ? "animate-spin text-amber-500 dark:text-accent-gold" : "text-amber-500 dark:text-accent-gold"} />
          {simulating ? "AI Triaging..." : "Simulate Store Review"}
        </button>

        <button
          onClick={onAddBug}
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-gradient-to-r dark:from-accent-mint dark:to-emerald-600 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 dark:shadow-accent-mint/20 transition"
        >
          <Plus size={15} className="stroke-[2.5]" />
          Create Issue
        </button>
      </div>

    </aside>
  );
}
