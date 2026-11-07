import React, { useState } from 'react';
import { ThumbsUp, Search, Clock, Wrench, CheckCircle2 } from 'lucide-react';

export default function PublicRoadmapView({ bugs = [], onUpvote, onOpenFeedback }) {
  const [search, setSearch] = useState('');

  // Only public user-reported bugs / feedback are shown on the public roadmap
  const publicBugs = bugs.filter(b => b.originType === 'USER_REPORTED');

  const filtered = publicBugs.filter(b => {
    const q = search.toLowerCase();
    return b.title.toLowerCase().includes(q) || (b.technicalSummary || '').toLowerCase().includes(q);
  });

  const columns = [
    {
      id: 'PLANNED',
      label: 'Planned',
      desc: 'Triaged issues queued for upcoming work',
      icon: Clock,
      items: filtered.filter(b => b.status === 'OPEN' || !b.status)
    },
    {
      id: 'IN_PROGRESS',
      label: 'In development',
      desc: 'Fix currently being written and tested',
      icon: Wrench,
      items: filtered.filter(b => b.status === 'IN_PROGRESS' || b.status === 'IN_REVIEW')
    },
    {
      id: 'SHIPPED',
      label: 'Shipped',
      desc: 'Verified and deployed in production release',
      icon: CheckCircle2,
      items: filtered.filter(b => b.status === 'RESOLVED')
    }
  ];

  return (
    <div className="space-y-4">
      
      {/* Public Header Banner */}
      <div className="p-4 rounded-xl surface-card flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5 max-w-xl">
          <h2 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
            Public roadmap & changelog
          </h2>
          <p className="text-xs text-ink-muted-light dark:text-ink-muted-dark leading-relaxed">
            Transparent tracking of bug fixes and community feedback. Upvote issues to help prioritize what gets addressed first.
          </p>
        </div>

        <button
          onClick={onOpenFeedback}
          className="h-8 px-3 rounded-lg bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark hover:opacity-90 font-medium text-xs flex items-center gap-1.5 transition-opacity"
        >
          <span>Submit issue or idea</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search size={13} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted-light dark:text-ink-muted-dark" />
        <input
          type="text"
          placeholder="Search planned or shipped fixes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-8 bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg pl-8 pr-3 text-xs text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none focus:border-ink-primary-light dark:focus:border-ink-primary-dark transition-colors font-mono"
        />
      </div>

      {/* 3 Columns: Planned, In Development, Shipped */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {columns.map(col => {
          const Icon = col.icon;
          return (
            <div key={col.id} className="space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border-light dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                  <Icon size={14} strokeWidth={1.5} className="text-ink-muted-light dark:text-ink-muted-dark" />
                  <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
                    {col.label}
                  </h3>
                  <span className="text-[11px] font-mono tabular text-ink-muted-light dark:text-ink-muted-dark">
                    {col.items.length}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">{col.desc}</p>

              {/* Cards List */}
              <div className="space-y-2">
                {col.items.length === 0 ? (
                  <div className="p-6 text-center surface-card rounded-lg text-ink-muted-light dark:text-ink-muted-dark text-xs font-mono">
                    No items in this stage
                  </div>
                ) : (
                  col.items.map(bug => (
                    <div 
                      key={bug.id} 
                      className="p-3.5 rounded-xl surface-card space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] tabular text-ink-muted-light dark:text-ink-muted-dark">
                            <span className="text-accent font-medium">
                              BL-USR-{bug.id.slice(-3)}
                            </span>
                            {bug.affectedVersions && bug.affectedVersions[0] && (
                              <span>· {bug.affectedVersions[0]}</span>
                            )}
                          </div>
                          <h4 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark leading-snug">
                            {bug.title}
                          </h4>
                        </div>

                        {/* Upvote Button */}
                        <button
                          onClick={(e) => onUpvote && onUpvote(e, bug)}
                          className="h-7 px-2 rounded-lg surface-raised hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-1.5 text-xs font-mono tabular text-ink-secondary-light dark:text-ink-secondary-dark transition-colors shrink-0"
                          title="Upvote issue"
                        >
                          <ThumbsUp size={11} strokeWidth={1.5} />
                          <span>{bug.reportCount || 1}</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark leading-relaxed surface-inset p-2.5 rounded-lg line-clamp-2">
                        {bug.technicalSummary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark pt-0.5">
                        <span className="capitalize">{bug.platform || 'General'}</span>
                        <span>
                          {col.id === 'SHIPPED' ? 'Verified in release' : `${bug.reportCount || 1} reports`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
