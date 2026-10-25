import React, { useState } from 'react';
import { 
  Sparkles, ThumbsUp, CheckCircle2, Clock, Wrench, Plus, 
  ExternalLink, Search, Tag, MessageSquarePlus, Globe
} from 'lucide-react';

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
      label: 'Planned / Up Next',
      desc: 'Triaged issues prioritized for upcoming sprints',
      badgeBg: 'bg-blue-50 text-blue-700 dark:bg-priority-blue/15 dark:text-priority-blue border-blue-200 dark:border-priority-blue/30',
      icon: Clock,
      items: filtered.filter(b => b.status === 'OPEN' || !b.status)
    },
    {
      id: 'IN_PROGRESS',
      label: 'In Development',
      desc: 'Engineers are actively coding & testing a patch',
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-priority-amber/15 dark:text-priority-amber border-amber-200 dark:border-priority-amber/30',
      icon: Wrench,
      items: filtered.filter(b => b.status === 'IN_PROGRESS' || b.status === 'IN_REVIEW')
    },
    {
      id: 'SHIPPED',
      label: 'Shipped & Changelog',
      desc: 'Fixed and verified in latest production release',
      badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-accent-mint/15 dark:text-accent-mint border-emerald-200 dark:border-accent-mint/30',
      icon: CheckCircle2,
      items: filtered.filter(b => b.status === 'RESOLVED')
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Public Header Banner */}
      <div className="p-6 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4 shadow-lg border border-slate-200 dark:border-surface-border">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-accent-mint/20 dark:text-accent-mint font-bold uppercase tracking-wider flex items-center gap-1">
              <Globe size={11} /> Public Community Portal
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            QuickTab Suite — Public Roadmap & Changelog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Transparent progress on bug fixes, user suggestions, and shipped updates. Upvote issues to help our engineering team prioritize what matters most to you!
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenFeedback}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-gradient-to-r dark:from-accent-mint dark:to-emerald-600 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            <MessageSquarePlus size={14} />
            <span>Submit Issue or Idea</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search planned fixes or shipped updates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition font-mono shadow-xs"
        />
      </div>

      {/* 3 Public Columns: Planned, In Development, Shipped */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map(col => {
          const Icon = col.icon;
          return (
            <div key={col.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-surface-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Icon size={15} className="text-slate-500" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                    {col.label}
                  </h3>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${col.badgeBg}`}>
                    {col.items.length}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{col.desc}</p>

              {/* Cards List */}
              <div className="space-y-3">
                {col.items.length === 0 ? (
                  <div className="p-8 text-center glass-panel rounded-2xl text-slate-400 text-xs italic font-mono">
                    No items currently in this stage.
                  </div>
                ) : (
                  col.items.map(bug => (
                    <div 
                      key={bug.id} 
                      className="p-4 rounded-2xl glass-card transition border border-slate-200 dark:border-surface-border bg-white dark:bg-[#101522] space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-accent-mint bg-emerald-50 dark:bg-accent-mint/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-accent-mint/20">
                              BL-USR-{bug.id.slice(-3)}
                            </span>
                            {bug.affectedVersions && bug.affectedVersions[0] && (
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-surface-inset px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
                                {bug.affectedVersions[0]}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            {bug.title}
                          </h4>
                        </div>

                        {/* Interactive Upvote Button */}
                        <button
                          onClick={(e) => onUpvote && onUpvote(e, bug)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-accent-mint flex items-center gap-1.5 text-xs font-mono font-bold transition hover:scale-105 shrink-0 bg-slate-50 dark:bg-surface-inset shadow-xs"
                          title="Upvote this issue to increase priority"
                        >
                          <ThumbsUp size={12} />
                          <span>{bug.reportCount || 1}</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans glass-inset p-2.5 rounded-xl line-clamp-2">
                        {bug.technicalSummary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-white/5">
                        <span className="capitalize">{bug.platform || 'General'}</span>
                        <span className="text-emerald-600 dark:text-accent-mint font-semibold">
                          {col.id === 'SHIPPED' ? '✓ Verified in Production' : `${bug.reportCount || 1} Community Reports`}
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
