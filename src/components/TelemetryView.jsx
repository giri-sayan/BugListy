import React, { useState } from 'react';
import { 
  BarChart3, Star, Flame, ShieldAlert, CheckCircle2, TrendingUp, 
  Smartphone, Globe, Layers, ArrowUpRight, Calculator, Sparkles, Check
} from 'lucide-react';

export default function TelemetryView({ analytics, bugs = [], sources = [] }) {
  const ratingCounts = analytics?.ratingCounts || { 1: 3, 2: 2, 3: 1, 4: 0, 5: 0 };
  const totalReviews = analytics?.totalReviews || 6;
  const avgRating = parseFloat(analytics?.averageRating || "1.8");

  const userBugs = bugs.filter(b => b.originType === 'USER_REPORTED');
  const activeUserBugs = userBugs.filter(b => b.status !== 'RESOLVED');

  // Breakdown by platform
  const platformCounts = {
    chrome: userBugs.filter(b => (b.platform || '').includes('chrome')).length,
    ios: userBugs.filter(b => (b.platform || '').includes('app') || (b.platform || '').includes('ios')).length,
    android: userBugs.filter(b => (b.platform || '').includes('play')).length
  };

  // Interactive Rating Recovery Simulator State
  const [selectedBugsToFix, setSelectedBugsToFix] = useState(() => 
    new Set(activeUserBugs.map(b => b.id))
  );

  const toggleBugSelection = (id) => {
    const next = new Set(selectedBugsToFix);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBugsToFix(next);
  };

  const selectAll = () => {
    setSelectedBugsToFix(new Set(activeUserBugs.map(b => b.id)));
  };

  const clearAll = () => {
    setSelectedBugsToFix(new Set());
  };

  // Calculate Rating Recovery Math:
  // Current star sum:
  const currentStarSum = Object.entries(ratingCounts).reduce((acc, [star, count]) => acc + (parseInt(star, 10) * count), 0);
  
  // Calculate converted reviews from selected bugs (each resolved bug converts 1-star reviews into 5-star reviews):
  const convertedReviews = activeUserBugs
    .filter(b => selectedBugsToFix.has(b.id))
    .reduce((sum, b) => sum + (b.reportCount || 1), 0);

  // If converted, replace those 1-star reviews (+4 stars each)
  const simulatedStarSum = currentStarSum + (convertedReviews * 4);
  const simulatedRating = totalReviews > 0 
    ? Math.min(5.0, Math.max(1.0, simulatedStarSum / totalReviews)).toFixed(1)
    : "5.0";
  
  const ratingJump = (parseFloat(simulatedRating) - avgRating).toFixed(1);

  // Reviews needed to reach 4.5 Stars:
  // (currentStarSum + 5 * X) / (totalReviews + X) = 4.5 => X = (4.5 * totalReviews - currentStarSum) / 0.5
  const neededFor45 = Math.max(0, Math.ceil((4.5 * totalReviews - currentStarSum) / 0.5));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent-mint font-mono">
              Omni-Channel Store Telemetry
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Store Health & Voice-of-Customer Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Aggregated customer telemetry across Chrome Web Store, App Store & Google Play</p>
        </div>
        <div className="text-right relative z-10 bg-slate-50 dark:bg-surface-inset p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
          <span className="text-3xl font-black text-accent-gold font-mono">{avgRating.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">Overall Rating</span>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Rating Breakdown */}
        <div className="p-5 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">Rating Distribution</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{totalReviews} Reviews</span>
          </div>

          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingCounts[star] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              const colors = {
                5: 'bg-accent-mint',
                4: 'bg-teal-400',
                3: 'bg-accent-gold',
                2: 'bg-amber-500',
                1: 'bg-priority-red'
              };
              return (
                <div key={star} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <span>{star} Stars</span>
                    <span>{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-surface-inset rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                    <div className={`h-full rounded-full ${colors[star]} shadow-sm`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Bug Distribution */}
        <div className="p-5 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">Channel Defect Spread</h3>
            <span className="text-xs text-accent-mint font-mono font-bold">Live Scrapers</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl glass-inset flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe size={16} className="text-accent-chrome" />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Chrome Web Store</span>
              </div>
              <span className="text-xs font-mono font-bold text-accent-chrome px-2.5 py-0.5 rounded-full bg-accent-chrome/10 border border-accent-chrome/30">
                {platformCounts.chrome} Issues
              </span>
            </div>

            <div className="p-3 rounded-xl glass-inset flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone size={16} className="text-accent-apple" />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">iOS App Store</span>
              </div>
              <span className="text-xs font-mono font-bold text-accent-apple px-2.5 py-0.5 rounded-full bg-accent-apple/10 border border-accent-apple/30">
                {platformCounts.ios} Issues
              </span>
            </div>

            <div className="p-3 rounded-xl glass-inset flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone size={16} className="text-accent-play" />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Google Play Store</span>
              </div>
              <span className="text-xs font-mono font-bold text-accent-play px-2.5 py-0.5 rounded-full bg-accent-play/10 border border-accent-play/30">
                {platformCounts.android} Issues
              </span>
            </div>
          </div>
        </div>

        {/* Resolution Efficiency */}
        <div className="p-5 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">Triage Efficiency</h3>
            <span className="text-xs text-accent-mint font-bold font-mono">100% AUTOMATION</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl glass-inset space-y-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">AI Noise Filter Rejection</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">43% Discarded</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Unhelpful rants and generic praise filtered out</p>
            </div>

            <div className="p-3 rounded-xl glass-inset space-y-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">Deduplication Clustering Ratio</span>
              <p className="text-sm font-bold text-accent-mint font-mono">3.8x Compression</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Duplicate reviews merged into single master bugs</p>
            </div>
          </div>
        </div>

      </div>

      {/* NEW KILLER FEATURE: STORE RATING RECOVERY & FIX ROI FORECAST SIMULATOR */}
      <div className="p-6 rounded-2xl glass-card border border-emerald-300/40 dark:border-accent-mint/30 space-y-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-accent-mint/10 border border-emerald-200 dark:border-accent-mint/20 flex items-center justify-center text-emerald-600 dark:text-accent-mint">
              <Calculator size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Store Rating Recovery & Fix ROI Simulator</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-accent-mint/20 dark:text-accent-mint">
                  Live Predictive Model
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate how resolving user bugs lifts your public store score when users update their rating
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-accent-mint/10 dark:text-accent-mint border border-emerald-200 dark:border-accent-mint/20 hover:bg-emerald-100 transition"
            >
              Select All ({activeUserBugs.length})
            </button>
            <button
              onClick={clearAll}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Prediction Display Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Current Rating</span>
            <div className="text-2xl font-black text-slate-700 dark:text-slate-300 font-mono">
              {avgRating.toFixed(1)} ★
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Selected Fixes</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-accent-mint font-mono">
              {selectedBugsToFix.size} <span className="text-xs font-normal text-slate-400">bugs ({convertedReviews} rants)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-accent-mint font-bold">Projected Rating</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-accent-mint font-mono flex items-center gap-1.5">
              <span>{simulatedRating} ★</span>
              {parseFloat(ratingJump) > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-accent-mint/20 dark:text-accent-mint flex items-center">
                  <ArrowUpRight size={12} />+{ratingJump}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target 4.5 ★ Inflow</span>
            <div className="text-2xl font-black text-amber-500 dark:text-accent-gold font-mono">
              +{neededFor45} <span className="text-xs font-normal text-slate-400">5★ reviews needed</span>
            </div>
          </div>
        </div>

        {/* Bug checklist for simulation */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select User Bugs to Include in Your Next Sprint:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {activeUserBugs.map(bug => {
              const isSelected = selectedBugsToFix.has(bug.id);
              return (
                <div
                  key={bug.id}
                  onClick={() => toggleBugSelection(bug.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                    isSelected 
                      ? 'bg-emerald-50/70 dark:bg-accent-mint/10 border-emerald-300 dark:border-accent-mint/30 shadow-xs'
                      : 'bg-white dark:bg-sidebar border-slate-200 dark:border-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-accent-mint dark:text-slate-950' : 'border-slate-400'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {bug.title}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        🔥 {bug.reportCount || 1} complaints • {bug.severity}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-accent-mint shrink-0">
                    +{((bug.reportCount || 1) * 4 / totalReviews).toFixed(1)} ★
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
