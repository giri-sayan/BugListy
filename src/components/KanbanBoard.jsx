import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function KanbanBoard({ bugs = [], onSelectBug, onUpdateStatus, onUpvote }) {
  const columns = [
    { id: 'OPEN', label: 'To do' },
    { id: 'IN_PROGRESS', label: 'In progress' },
    { id: 'IN_REVIEW', label: 'In review' },
    { id: 'RESOLVED', label: 'Done' }
  ];

  const severityLabels = {
    CRITICAL: { label: 'Critical', color: 'text-semantic-negative-light dark:text-semantic-negative-dark bg-red-500/10' },
    HIGH: { label: 'High', color: 'text-semantic-warning-light dark:text-semantic-warning-dark bg-amber-500/10' },
    MEDIUM: { label: 'Medium', color: 'text-ink-secondary-light dark:text-ink-secondary-dark bg-surface-raised-light dark:bg-surface-raised-dark' },
    LOW: { label: 'Low', color: 'text-ink-muted-light dark:text-ink-muted-dark bg-surface-raised-light dark:bg-surface-raised-dark' }
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start">
      {columns.map(col => {
        const columnBugs = getBugsByStatus(col.id);
        return (
          <div 
            key={col.id}
            className="surface-card rounded-xl flex flex-col max-h-[calc(100vh-220px)] transition-colors duration-140"
          >
            {/* Column Header */}
            <div className="h-10 px-3.5 border-b border-surface-border-light dark:border-surface-border-dark flex items-center justify-between">
              <span className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
                {col.label}
              </span>
              <span className="text-[11px] font-mono tabular text-ink-muted-light dark:text-ink-muted-dark">
                {columnBugs.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="p-2.5 overflow-y-auto space-y-2 flex-1 min-h-[140px]">
              {columnBugs.length === 0 ? (
                <div className="py-8 text-center text-ink-muted-light dark:text-ink-muted-dark text-xs font-mono">
                  No issues
                </div>
              ) : (
                columnBugs.map(bug => {
                  const sev = severityLabels[bug.severity] || severityLabels.MEDIUM;
                  const isUser = bug.originType === 'USER_REPORTED';

                  return (
                    <div
                      key={bug.id}
                      onClick={() => onSelectBug(bug)}
                      className="p-3 rounded-lg surface-raised cursor-pointer group space-y-2 transition-colors duration-140 hover:border-ink-muted-light/30"
                    >
                      {/* Issue Key + Origin */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] tabular">
                          <span className={`font-medium ${isUser ? 'text-accent' : 'text-ink-muted-light dark:text-ink-muted-dark'}`}>
                            {isUser ? `BL-USR-${bug.id.slice(-3)}` : `BL-INT-${bug.id.slice(-3)}`}
                          </span>
                          <span className="text-ink-muted-light dark:text-ink-muted-dark">·</span>
                          <span className="text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                            {isUser ? 'user' : 'internal'}
                          </span>
                        </div>

                        {/* Severity tag */}
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${sev.color}`}>
                          {sev.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:text-accent transition-colors duration-140 leading-snug">
                        {bug.title}
                      </h4>

                      {/* Details row */}
                      {isUser && bug.reportCount && (
                        <div className="flex items-center gap-2 text-[10px] text-ink-muted-light dark:text-ink-muted-dark font-mono tabular">
                          <button
                            onClick={(e) => onUpvote && onUpvote(e, bug)}
                            className="px-1.5 py-0.5 rounded surface-card hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition-colors duration-140"
                            title="Add +1 affected report"
                          >
                            {bug.reportCount} reports +
                          </button>
                          {bug.platform && (
                            <span>{bug.platform.replace('_', ' ')}</span>
                          )}
                        </div>
                      )}

                      {/* Technical Summary preview */}
                      <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark line-clamp-2 surface-inset p-2 rounded leading-relaxed">
                        {bug.technicalSummary}
                      </p>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-surface-border-light dark:border-surface-border-dark text-[10px] font-mono">
                        <span className="text-ink-muted-light dark:text-ink-muted-dark tabular">
                          {bug.affectedVersions?.[0] || 'vLatest'}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(bug.id, nextStatus[col.id]);
                          }}
                          className="h-5 px-1.5 rounded surface-card hover:bg-canvas-light dark:hover:bg-canvas-dark text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-1 transition-colors duration-140"
                          title={`Move to ${columns.find(c => c.id === nextStatus[col.id])?.label}`}
                        >
                          <span>Move</span>
                          <ArrowRight size={10} strokeWidth={1.5} />
                        </button>
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
