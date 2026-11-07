import React, { useState } from 'react';
import { Check, ArrowUpRight, Calculator } from 'lucide-react';

export default function TelemetryView({ analytics, bugs = [], sources = [] }) {
  const ratingCounts = analytics?.ratingCounts || { 1: 3, 2: 2, 3: 1, 4: 0, 5: 0 };
  const totalReviews = analytics?.totalReviews || 6;
  const avgRating = parseFloat(analytics?.averageRating || "1.8");

  const userBugs = bugs.filter(b => b.originType === 'USER_REPORTED');
  const activeUserBugs = userBugs.filter(b => b.status !== 'RESOLVED');

  const knownChannels = [
    { id: 'chrome', match: 'chrome', name: 'Chrome Web Store' },
    { id: 'ios', match: 'ios|app_store|apple', name: 'Apple App Store' },
    { id: 'play', match: 'play|android', name: 'Google Play Store' },
    { id: 'firefox', match: 'firefox', name: 'Firefox Add-ons' },
    { id: 'edge', match: 'edge', name: 'Microsoft Edge' },
    { id: 'producthunt', match: 'product_hunt|producthunt', name: 'Product Hunt' },
    { id: 'trustpilot', match: 'trustpilot', name: 'Trustpilot' }
  ];

  const channelCounts = knownChannels.map(ch => {
    const re = new RegExp(ch.match, 'i');
    const count = userBugs.filter(b => re.test(b.platform || '')).length;
    return { ...ch, count };
  });

  const activeChannels = channelCounts.filter(ch => ch.count > 0 || ['chrome', 'ios', 'play'].includes(ch.id));

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

  // Math
  const currentStarSum = Object.entries(ratingCounts).reduce((acc, [star, count]) => acc + (parseInt(star, 10) * count), 0);
  const convertedReviews = activeUserBugs
    .filter(b => selectedBugsToFix.has(b.id))
    .reduce((sum, b) => sum + (b.reportCount || 1), 0);

  const simulatedStarSum = currentStarSum + (convertedReviews * 4);
  const simulatedRating = totalReviews > 0 
    ? Math.min(5.0, Math.max(1.0, simulatedStarSum / totalReviews)).toFixed(1)
    : "5.0";
  
  const ratingJump = (parseFloat(simulatedRating) - avgRating).toFixed(1);
  const neededFor45 = Math.max(0, Math.ceil((4.5 * totalReviews - currentStarSum) / 0.5));

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="p-4 rounded-xl surface-card flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
            Store telemetry & channel distribution
          </h2>
          <p className="text-xs text-ink-muted-light dark:text-ink-muted-dark">
            Aggregated customer health across Chrome Web Store, App Store and Google Play
          </p>
        </div>
        <div className="text-right surface-raised px-3 py-2 rounded-lg">
          <span className="text-xl font-mono tabular font-medium text-ink-primary-light dark:text-ink-primary-dark">
            {avgRating.toFixed(1)} ★
          </span>
          <span className="text-[10px] text-ink-muted-light dark:text-ink-muted-dark block">
            Average rating
          </span>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Rating Breakdown */}
        <div className="p-4 rounded-xl surface-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
              Rating distribution
            </h3>
            <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark font-mono tabular">
              {totalReviews} reviews
            </span>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingCounts[star] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="space-y-1 text-xs">
                  <div className="flex justify-between text-ink-muted-light dark:text-ink-muted-dark font-mono tabular text-[10px]">
                    <span>{star} stars</span>
                    <span>{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-1.5 bg-surface-raised-light dark:bg-surface-raised-dark rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        star >= 4 ? 'bg-accent' : star === 3 ? 'bg-amber-500' : 'bg-red-500/70'
                      }`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Bug Distribution */}
        <div className="p-4 rounded-xl surface-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
              Channel defect count
            </h3>
            <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark font-mono">
              Channels
            </span>
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {activeChannels.map(ch => (
              <div key={ch.id} className="p-2 rounded-lg surface-raised flex items-center justify-between text-xs">
                <span className="text-ink-secondary-light dark:text-ink-secondary-dark truncate">
                  {ch.name}
                </span>
                <span className="text-[11px] font-mono tabular text-ink-primary-light dark:text-ink-primary-dark shrink-0">
                  {ch.count} issues
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Efficiency */}
        <div className="p-4 rounded-xl surface-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
              Triage efficiency
            </h3>
            <span className="text-[11px] text-accent font-mono">
              automated
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg surface-inset space-y-0.5">
              <span className="text-ink-muted-light dark:text-ink-muted-dark text-[10px] font-mono">
                Noise filter rejection
              </span>
              <p className="text-xs font-mono font-medium text-ink-primary-light dark:text-ink-primary-dark tabular">
                43% discarded
              </p>
              <p className="text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                Filtered unhelpful or generic comments
              </p>
            </div>

            <div className="p-2.5 rounded-lg surface-inset space-y-0.5">
              <span className="text-ink-muted-light dark:text-ink-muted-dark text-[10px] font-mono">
                Cluster deduplication
              </span>
              <p className="text-xs font-mono font-medium text-accent tabular">
                3.8x compression
              </p>
              <p className="text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                Duplicate complaints grouped into master issues
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* RATING RECOVERY & FIX FORECAST SIMULATOR (The Moment) */}
      <div className="p-4 rounded-xl surface-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-border-light dark:border-surface-border-dark">
          <div>
            <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
              Rating recovery forecast
            </h3>
            <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
              Simulate score improvement as customer reported defects are resolved
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={selectAll}
              className="h-6 px-2 rounded surface-raised text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition-colors"
            >
              Select all ({activeUserBugs.length})
            </button>
            <button
              onClick={clearAll}
              className="h-6 px-2 rounded surface-raised text-[11px] text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Prediction figures */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-lg surface-inset">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
              Current rating
            </span>
            <div className="text-lg font-mono tabular font-medium text-ink-primary-light dark:text-ink-primary-dark">
              {avgRating.toFixed(1)} ★
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
              Selected fixes
            </span>
            <div className="text-lg font-mono tabular font-medium text-ink-primary-light dark:text-ink-primary-dark">
              {selectedBugsToFix.size} <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">({convertedReviews} reviews)</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-accent">
              Projected rating
            </span>
            <div className="text-lg font-mono tabular font-medium text-accent flex items-center gap-1">
              <span>{simulatedRating} ★</span>
              {parseFloat(ratingJump) > 0 && (
                <span className="text-xs font-normal text-accent">
                  (+{ratingJump})
                </span>
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
              Needed for 4.5 ★
            </span>
            <div className="text-lg font-mono tabular font-medium text-ink-primary-light dark:text-ink-primary-dark">
              +{neededFor45} <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">reviews</span>
            </div>
          </div>
        </div>

        {/* Bug checklist for simulation */}
        <div className="space-y-2">
          <span className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark font-medium">
            Toggle customer issues to include in forecast:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {activeUserBugs.map(bug => {
              const isSelected = selectedBugsToFix.has(bug.id);
              return (
                <div
                  key={bug.id}
                  onClick={() => toggleBugSelection(bug.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors duration-140 ${
                    isSelected 
                      ? 'surface-raised border-surface-border-light dark:border-surface-border-dark'
                      : 'surface-card border-transparent opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                      isSelected 
                        ? 'bg-accent border-accent text-canvas-dark' 
                        : 'border-surface-border-light dark:border-surface-border-dark'
                    }`}>
                      {isSelected && <Check size={10} strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-primary-light dark:text-ink-primary-dark truncate">
                        {bug.title}
                      </p>
                      <span className="text-[10px] text-ink-muted-light dark:text-ink-muted-dark font-mono tabular">
                        {bug.reportCount || 1} complaints · {bug.severity.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono tabular text-accent shrink-0">
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
