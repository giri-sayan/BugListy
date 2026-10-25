import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function KanbanBoard({ bugs, onSelectBug, onUpdateStatus, onUpvote }) {
  const columns = [
    { id: 'OPEN', label: 'To Do / Backlog', border: 'border-slate-200 dark:border-slate-800', headerBg: 'bg-slate-100 dark:bg-surface-elevated/80 text-slate-700 dark:text-slate-300' },
    { id: 'IN_PROGRESS', label: 'In Progress', border: 'border-amber-200 dark:border-amber-500/30', headerBg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300' },
    { id: 'IN_REVIEW', label: 'In Review / Testing', border: 'border-sky-200 dark:border-sky-500/30', headerBg: 'bg-sky-50 dark:bg-sky-950/20 text-sky-800 dark:text-sky-300' },
    { id: 'RESOLVED', label: 'Done & Shipped', border: 'border-emerald-200 dark:border-accent-mint/30', headerBg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-accent-mint' }
  ];

  const priorityChevrons = {
    CRITICAL: { icon: '▲▲', label: 'Highest', color: 'text-rose-600 dark:text-priority-red bg-rose-50 dark:bg-priority-red/10 border-rose-200 dark:border-priority-red/30' },
    HIGH: { icon: '▲', label: 'High', color: 'text-amber-600 dark:text-priority-amber bg-amber-50 dark:bg-priority-amber/10 border-amber-200 dark:border-priority-amber/30' },
    MEDIUM: { icon: '■', label: 'Medium', color: 'text-blue-600 dark:text-priority-blue bg-blue-50 dark:bg-priority-blue/10 border-blue-200 dark:border-priority-blue/30' },
    LOW: { icon: '▼', label: 'Low', color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20' }
  };

  const platformBadges = {
    chrome_webstore: '🌐 Chrome',
    app_store: '🍎 iOS',
    play_store: '🤖 Play',
    website: '🔗 Web'
  };

  const getBugsByStatus = (status) => {
    return bugs.filter(b => (b.status || 'OPEN') === status);
  };

  const nextStatus = {
    OPEN: 'IN_PROGRESS',
    IN_PROGRESS: 'IN_REVIEW',
    IN_REVIEW: 'RESOLVED',
    RESOLVED: 'OPEN'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {columns.map(col => {
        const columnBugs = getBugsByStatus(col.id);
        return (
          <div 
            key={col.id}
            className={`bg-slate-100/60 dark:bg-surface/50 border ${col.border} rounded-2xl flex flex-col max-h-[calc(100vh-250px)] backdrop-blur shadow-sm dark:shadow-xl transition`}
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b border-slate-200 dark:border-surface-border flex items-center justify-between rounded-t-2xl ${col.headerBg}`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider font-mono">{col.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white dark:bg-surface-inset text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 shadow-xs">
                  {columnBugs.length}
                </span>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 overflow-y-auto space-y-3 flex-1 min-h-[160px]">
              {columnBugs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-600 text-xs italic font-mono">
                  No issues in this column
                </div>
              ) : (
                columnBugs.map(bug => {
                  const prio = priorityChevrons[bug.severity] || priorityChevrons.MEDIUM;
                  const isUser = bug.originType === 'USER_REPORTED';

                  return (
                    <div
                      key={bug.id}
                      onClick={() => onSelectBug(bug)}
                      className="p-3.5 rounded-xl glass-card transition cursor-pointer group space-y-2.5"
                    >
                      {/* Top Header: Issue Key + Origin */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={`${isUser ? 'text-emerald-600 dark:text-accent-mint' : 'text-blue-600 dark:text-priority-blue'} font-bold text-[11px]`}>
                            {isUser ? `BL-USR-${bug.id.slice(-3)}` : `BL-INT-${bug.id.slice(-3)}`}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isUser ? 'bg-emerald-50 text-emerald-700 dark:bg-accent-mint/10 dark:text-accent-mint border border-emerald-200 dark:border-accent-mint/20' : 'bg-blue-50 text-blue-700 dark:bg-priority-blue/10 dark:text-priority-blue border border-blue-200 dark:border-priority-blue/20'
                          }`}>
                            {isUser ? '👥 User' : '🛠️ Internal'}
                          </span>
                        </div>

                        {/* Priority Chevron */}
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${prio.color}`} title={prio.label}>
                          {prio.icon} {prio.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-accent-mint transition leading-snug">
                        {bug.title}
                      </h4>

                      {/* Impact / Verbatim Snippet */}
                      {isUser && bug.reportCount && (
                        <div className="flex items-center gap-2 text-[10px]">
                          <button
                            onClick={(e) => onUpvote && onUpvote(e, bug)}
                            className="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-500/30 flex items-center gap-1 transition"
                            title="Upvote: +1 User Reported"
                          >
                            🔥 {bug.reportCount} reports <span className="text-[9px] text-rose-500">+1</span>
                          </button>
                          {bug.platform && (
                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                              {platformBadges[bug.platform] || 'Store'}
                            </span>
                          )}
                          {bug.actionabilityScore && (
                            <span className="text-amber-600 dark:text-accent-gold font-mono font-semibold">
                              ⭐ {bug.actionabilityScore}/5
                            </span>
                          )}
                        </div>
                      )}

                      {/* Technical Summary preview */}
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono line-clamp-2 glass-inset p-2 rounded-lg">
                        {bug.technicalSummary}
                      </p>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5 text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400 font-mono">
                          {bug.affectedVersions?.[0] || 'vLatest'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(bug.id, nextStatus[col.id]);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-surface-elevated dark:hover:bg-surface-hover text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 transition border border-slate-200 dark:border-white/5"
                            title={`Advance to ${columns.find(c => c.id === nextStatus[col.id])?.label}`}
                          >
                            Advance <ArrowRight size={10} />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
