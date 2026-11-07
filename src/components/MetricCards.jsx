import React from 'react';

export default function MetricCards({ analytics }) {
  const cards = [
    {
      label: "Active user bugs",
      value: analytics?.activeUserBugs ?? 2,
      detail: `${analytics?.totalAffectedUsers ?? 27} users impacted across channels`,
      highlight: false
    },
    {
      label: "Critical defects",
      value: analytics?.criticalBugs ?? 1,
      detail: "Crash or data loss severity",
      highlight: (analytics?.criticalBugs ?? 1) > 0,
      highlightColor: "text-semantic-negative-light dark:text-semantic-negative-dark"
    },
    {
      label: "Average store rating",
      value: `${analytics?.averageRating ?? "1.8"}`,
      suffix: "★",
      detail: `Across ${analytics?.totalReviews ?? 6} verified reviews`,
      highlight: false
    },
    {
      label: "Claude Skills routed",
      value: "100%",
      detail: "67 specialized skills & CLI ready",
      highlight: true,
      highlightColor: "text-accent"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="p-4 rounded-xl surface-card space-y-1"
        >
          <div className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark font-medium">
            {c.label}
          </div>

          <div className="flex items-baseline gap-1 pt-1">
            <span className={`text-2xl font-mono tabular font-medium tracking-tight ${
              c.highlight && c.highlightColor 
                ? c.highlightColor 
                : 'text-ink-primary-light dark:text-ink-primary-dark'
            }`}>
              {c.value}
            </span>
            {c.suffix && (
              <span className="text-xs font-mono text-ink-muted-light dark:text-ink-muted-dark">
                {c.suffix}
              </span>
            )}
          </div>

          <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark truncate pt-1">
            {c.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
