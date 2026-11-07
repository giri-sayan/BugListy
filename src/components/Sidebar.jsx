import React from 'react';
import { 
  LayoutGrid, Kanban, Radio, BarChart3, Globe,
  Plus, ExternalLink, Star, Sun, Moon, MessageSquarePlus, RefreshCw, Sparkles
} from 'lucide-react';
import BugListLogo from './BugListLogo';

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  analytics, 
  sources = [], 
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
    { id: 'dual', label: 'Dual backlog', icon: LayoutGrid, count: analytics?.totalBugs },
    { id: 'skills', label: 'Claude Skills', icon: Sparkles, count: '67', highlight: true },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'stream', label: 'Review stream', icon: Radio, count: analytics?.totalReviews },
    { id: 'telemetry', label: 'Store telemetry', icon: BarChart3 },
    { id: 'roadmap', label: 'Public roadmap', icon: Globe }
  ];

  const getPlatformLabel = (platform = '') => {
    const p = platform.toLowerCase();
    if (p.includes('chrome')) return 'Chrome Store';
    if (p.includes('app_store') || p.includes('apple') || p.includes('ios')) return 'App Store';
    if (p.includes('play')) return 'Google Play';
    if (p.includes('firefox')) return 'Firefox Add-ons';
    if (p.includes('edge')) return 'Edge Add-ons';
    if (p.includes('product_hunt') || p.includes('producthunt')) return 'Product Hunt';
    if (p.includes('trustpilot')) return 'Trustpilot';
    if (p.includes('g2')) return 'G2';
    if (p.includes('capterra')) return 'Capterra';
    if (p.includes('steam')) return 'Steam';
    if (p.includes('github')) return 'GitHub';
    if (p.includes('shopify')) return 'Shopify';
    if (p.includes('discord')) return 'Discord';
    if (p.includes('inapp') || p.includes('website') || p.includes('in-app')) return 'In-app';
    return 'Channel';
  };

  return (
    <aside className="w-60 bg-sidebar-light dark:bg-sidebar-dark border-r border-surface-border-light dark:border-surface-border-dark flex flex-col h-screen select-none shrink-0 sticky top-0 transition-colors duration-150">
      
      {/* Workspace Brand Row */}
      <div className="h-14 px-4 border-b border-surface-border-light dark:border-surface-border-dark flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md surface-raised flex items-center justify-center text-ink-primary-light dark:text-ink-primary-dark shrink-0">
            <BugListLogo size={16} />
          </div>
          <div className="min-w-0">
            <span className="font-medium text-sm text-ink-primary-light dark:text-ink-primary-dark truncate block leading-tight">
              BugListy
            </span>
            <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark font-mono truncate block">
              QuickTab Suite
            </span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark hover:bg-surface-raised-light dark:hover:bg-surface-raised-dark transition-colors duration-140"
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="p-3 space-y-1">
        <div className="px-2 pt-3 pb-2 text-[11px] font-medium text-ink-muted-light dark:text-ink-muted-dark">
          Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full h-8 flex items-center justify-between px-2.5 rounded-lg text-xs transition-colors duration-140 ${
                isActive 
                  ? 'bg-surface-raised-light dark:bg-surface-raised-dark text-ink-primary-light dark:text-ink-primary-dark font-medium'
                  : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark hover:bg-surface-raised-light/60 dark:hover:bg-surface-raised-dark/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} strokeWidth={1.5} className={isActive ? "text-accent" : "text-ink-muted-light dark:text-ink-muted-dark"} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`text-[11px] font-mono tabular px-1.5 py-0.5 rounded ${
                  item.highlight
                    ? 'bg-accent/15 text-accent font-medium'
                    : isActive 
                    ? 'text-accent font-medium' 
                    : 'text-ink-muted-light dark:text-ink-muted-dark'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Store Rating Breakdown Widget */}
      <div className="mx-3 my-2 p-3 rounded-xl surface-card space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={13} strokeWidth={1.5} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark font-mono tabular">{avgRating}</span>
            <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark font-mono">/ 5.0</span>
          </div>
          <span className="text-[11px] font-mono tabular text-ink-muted-light dark:text-ink-muted-dark">
            {totalReviews} reviews
          </span>
        </div>

        {/* Rating bars */}
        <div className="space-y-1 pt-1">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = ratingCounts[stars] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2 text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                <span className="w-2.5 text-right font-mono tabular">{stars}</span>
                <div className="flex-1 h-1 bg-surface-raised-light dark:bg-surface-raised-dark rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      stars >= 4 ? 'bg-accent' : stars === 3 ? 'bg-amber-500' : 'bg-red-500/80'
                    }`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
                <span className="w-3 text-right font-mono tabular">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Channels List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-[11px] font-medium text-ink-muted-light dark:text-ink-muted-dark">
            Channels ({sources?.length || 0})
          </span>
          <button 
            onClick={onAddSource}
            className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark hover:text-accent font-medium flex items-center gap-1 transition-colors duration-140"
          >
            <Plus size={12} strokeWidth={1.5} />
            <span>Add</span>
          </button>
        </div>

        <div className="space-y-1">
          {sources?.map(src => {
            const isLocalInApp = src.id === 'src_inapp' || src.title?.includes('In-App');
            const platformTag = getPlatformLabel(src.platform);

            if (isLocalInApp && onOpenFeedback) {
              return (
                <button
                  key={src.id}
                  onClick={onOpenFeedback}
                  className="w-full text-left h-8 px-2.5 rounded-lg flex items-center justify-between text-xs text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark hover:bg-surface-raised-light dark:hover:bg-surface-raised-dark transition-colors duration-140"
                  title="Submit an in-app review or issue"
                >
                  <span className="truncate">{src.title}</span>
                  <span className="text-[10px] font-mono text-accent">
                    in-app
                  </span>
                </button>
              );
            }

            return (
              <a
                key={src.id}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="group h-8 px-2.5 rounded-lg flex items-center justify-between text-xs text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark hover:bg-surface-raised-light dark:hover:bg-surface-raised-dark transition-colors duration-140"
              >
                <span className="truncate">{src.title}</span>
                <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark group-hover:text-ink-secondary-light dark:group-hover:text-ink-secondary-dark flex items-center gap-1">
                  <span>{platformTag}</span>
                  <ExternalLink size={10} strokeWidth={1.5} />
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-surface-border-light dark:border-surface-border-dark space-y-1.5">
        <button
          onClick={onSimulate}
          disabled={simulating}
          className="w-full h-8 px-3 rounded-lg text-xs font-medium surface-raised text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center justify-center gap-2 transition-colors duration-140"
        >
          <RefreshCw size={13} strokeWidth={1.5} className={simulating ? "animate-spin text-accent" : ""} />
          <span>{simulating ? "Triaging review..." : "Simulate review"}</span>
        </button>

        <button
          onClick={onAddBug}
          className="w-full h-8 px-3 rounded-lg text-xs font-medium bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark hover:opacity-90 flex items-center justify-center gap-1.5 transition-opacity duration-140"
        >
          <Plus size={14} strokeWidth={2} />
          <span>Create issue</span>
        </button>
      </div>

    </aside>
  );
}
