import React from 'react';
import { Flame, ShieldAlert, Star, CheckCircle } from 'lucide-react';

export default function MetricCards({ analytics }) {
  const cards = [
    {
      title: "Active User Bugs",
      value: analytics?.activeUserBugs ?? 2,
      subtitle: `${analytics?.totalAffectedUsers ?? 27} users impacted across stores`,
      icon: Flame,
      color: "bg-white dark:bg-[#101522] dark:bg-gradient-to-b dark:from-rose-500/10 dark:to-[#101522] border-slate-200 dark:border-rose-500/30 shadow-sm dark:shadow-lg dark:shadow-rose-950/20",
      iconColor: "text-rose-500 dark:text-rose-400",
      valueColor: "text-slate-900 dark:text-white",
      badge: "Production Fire",
      badgeStyle: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30"
    },
    {
      title: "Critical Defect Ratio",
      value: `${analytics?.criticalBugs ?? 1} Critical`,
      subtitle: "Highest priority (Crash / Data loss)",
      icon: ShieldAlert,
      color: "bg-white dark:bg-[#101522] dark:bg-gradient-to-b dark:from-amber-500/10 dark:to-[#101522] border-slate-200 dark:border-amber-500/30 shadow-sm dark:shadow-lg dark:shadow-amber-950/20",
      iconColor: "text-amber-500 dark:text-amber-400",
      valueColor: "text-slate-900 dark:text-white",
      badge: "Immediate Action",
      badgeStyle: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
    },
    {
      title: "Avg Store Rating",
      value: `${analytics?.averageRating ?? "1.8"} ★`,
      subtitle: `Based on ${analytics?.totalReviews ?? 6} analyzed reviews`,
      icon: Star,
      color: "bg-white dark:bg-[#101522] dark:bg-gradient-to-b dark:from-sky-500/10 dark:to-[#101522] border-slate-200 dark:border-sky-500/30 shadow-sm dark:shadow-lg dark:shadow-sky-950/20",
      iconColor: "text-sky-500 dark:text-sky-400",
      valueColor: "text-slate-900 dark:text-white",
      badge: "Store Rating",
      badgeStyle: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30"
    },
    {
      title: "Resolved Issues",
      value: analytics?.resolvedCount ?? 1,
      subtitle: "Verified & pushed in latest releases",
      icon: CheckCircle,
      color: "bg-white dark:bg-[#101522] dark:bg-gradient-to-b dark:from-emerald-500/10 dark:to-[#101522] border-slate-200 dark:border-accent-mint/30 shadow-sm dark:shadow-lg dark:shadow-emerald-950/20",
      iconColor: "text-emerald-500 dark:text-accent-mint",
      valueColor: "text-slate-900 dark:text-white",
      badge: "Shipped",
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-accent-mint/15 dark:text-accent-mint dark:border-accent-mint/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl ${c.color} border relative overflow-hidden space-y-2.5 transition-all duration-200 hover:scale-[1.01] hover:shadow-md dark:hover:border-opacity-60`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                {c.title}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badgeStyle}`}>
                {c.badge}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-black tracking-tight ${c.valueColor} font-mono`}>
                {c.value}
              </span>
              <Icon size={22} className={`${c.iconColor} opacity-90`} />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
              {c.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
