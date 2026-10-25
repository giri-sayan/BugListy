import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Filter, Radio, RefreshCw, Sparkles, CheckCircle2, Flame, Tag } from 'lucide-react';

export default function ReviewStreamView({ onSimulate, simulating }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [selectedTopic, setSelectedTopic] = useState('ALL');

  const loadReviews = () => {
    setLoading(true);
    fetch('/api/raw-reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const detectTopic = (text = '') => {
    const t = text.toLowerCase();
    if (/crash|freeze|broke|blank|error|fail|died|stopped/i.test(t)) return { id: 'crash', label: '💥 Crash / Freeze', color: 'bg-rose-50 text-rose-700 dark:bg-priority-red/15 dark:text-priority-red border-rose-200 dark:border-priority-red/30' };
    if (/ui|theme|dark|light|color|contrast|font|layout|button/i.test(t)) return { id: 'ui', label: '🎨 UI & Theme', color: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border-purple-200 dark:border-purple-500/30' };
    if (/slow|lag|memory|ram|sync|delay|heavy|battery/i.test(t)) return { id: 'perf', label: '⏱️ Performance & Sync', color: 'bg-amber-50 text-amber-700 dark:bg-priority-amber/15 dark:text-priority-amber border-amber-200 dark:border-priority-amber/30' };
    if (/feature|wish|would love|add|support|export|request/i.test(t)) return { id: 'feature', label: '💡 Feature Request', color: 'bg-blue-50 text-blue-700 dark:bg-priority-blue/15 dark:text-priority-blue border-blue-200 dark:border-priority-blue/30' };
    return { id: 'general', label: '💬 General Feedback', color: 'bg-slate-100 text-slate-700 dark:bg-surface-elevated dark:text-slate-300 border-slate-200 dark:border-white/5' };
  };

  const filteredReviews = reviews.filter(r => {
    if (selectedPlatform !== 'ALL') {
      const p = (r.platform || '').toLowerCase();
      if (selectedPlatform === 'chrome' && !p.includes('chrome')) return false;
      if (selectedPlatform === 'ios' && !p.includes('ios') && !p.includes('apple')) return false;
      if (selectedPlatform === 'android' && !p.includes('play') && !p.includes('google')) return false;
      if (selectedPlatform === 'inapp' && !p.includes('in-app') && !p.includes('buglisty')) return false;
    }
    if (selectedRating !== 'ALL') {
      if (r.rating !== parseInt(selectedRating, 10)) return false;
    }
    if (selectedTopic !== 'ALL') {
      const detected = detectTopic(r.reviewText);
      if (detected.id !== selectedTopic) return false;
    }
    return true;
  });

  const topicDefinitions = [
    { id: 'ALL', label: 'All Topics' },
    { id: 'crash', label: '💥 Crashes' },
    { id: 'ui', label: '🎨 UI & Theme' },
    { id: 'perf', label: '⏱️ Performance' },
    { id: 'feature', label: '💡 Feature Ideas' }
  ];

  return (
    <div className="space-y-4">
      {/* Stream Controls Header */}
      <div className="p-4 rounded-2xl glass-panel space-y-3.5 shadow-sm dark:shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-accent-mint/10 border border-emerald-200 dark:border-accent-mint/20 flex items-center justify-center text-emerald-600 dark:text-accent-mint">
              <Radio size={16} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Store Review Stream</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time incoming feedback from Chrome Web Store, App Store, Google Play & In-App</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Platform Filters */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-inset p-1 border border-slate-200 dark:border-white/5 rounded-xl text-xs">
              {['ALL', 'chrome', 'ios', 'android', 'inapp'].map(plat => (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedPlatform === plat 
                      ? 'bg-emerald-600 text-white dark:bg-accent-mint dark:text-slate-950 font-bold shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {plat === 'ALL' ? 'All Channels' : plat === 'chrome' ? '🌐 Chrome' : plat === 'ios' ? '🍎 iOS' : plat === 'android' ? '🤖 Play Store' : '💬 In-App'}
                </button>
              ))}
            </div>

            {/* Rating Filters */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-inset p-1 border border-slate-200 dark:border-white/5 rounded-xl text-xs">
              {['ALL', '5', '4', '3', '2', '1'].map(star => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`px-2 py-1 rounded-lg font-mono font-medium transition ${
                    selectedRating === star 
                      ? 'bg-amber-400 text-slate-950 dark:bg-accent-gold dark:text-slate-950 font-bold shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {star === 'ALL' ? 'All ★' : `${star}★`}
                </button>
              ))}
            </div>

            <button
              onClick={loadReviews}
              className="p-2 rounded-xl bg-white dark:bg-surface-elevated hover:bg-slate-50 dark:hover:bg-surface-hover text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 transition shadow-xs"
              title="Refresh stream"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Sentiment & Topic Quick Filter Pills */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Tag size={12} /> Topics:
          </span>
          {topicDefinitions.map(t => {
            const count = t.id === 'ALL' 
              ? reviews.length 
              : reviews.filter(r => detectTopic(r.reviewText).id === t.id).length;
            const isActive = selectedTopic === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold border transition flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-accent-mint dark:text-slate-950 dark:border-accent-mint shadow-xs' 
                    : 'bg-white dark:bg-surface-inset text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{t.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/20 text-white dark:text-slate-950 font-bold' : 'bg-slate-100 dark:bg-surface-elevated text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-mono">Streaming reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-8 text-center glass-panel rounded-2xl text-slate-500 text-xs space-y-2">
          <p>No reviews match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map(rev => {
            const topic = detectTopic(rev.reviewText);
            return (
              <div 
                key={rev.id}
                className="p-4 rounded-2xl glass-card transition space-y-3 border border-slate-200 dark:border-surface-border bg-white dark:bg-[#101522]"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white">{rev.authorName || 'Store Reviewer'}</span>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-elevated text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-white/5">
                      {rev.platform || 'Store Review'}
                    </span>
                    {rev.appVersion && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-surface-inset text-slate-600 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-white/5">
                        {rev.appVersion}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${topic.color}`}>
                      {topic.label}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">{new Date(rev.reviewDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500 dark:text-accent-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < (rev.rating || 1) ? "fill-amber-400 dark:fill-accent-gold text-amber-400 dark:text-accent-gold" : "text-slate-300 dark:text-slate-700"}
                        />
                      ))}
                    </div>
                    {rev.storeUrl && (
                      <a
                        href={rev.storeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-emerald-600 dark:hover:text-accent-mint transition"
                        title="Open source"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Review Body */}
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-slate-50 dark:bg-surface-inset p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                  "{rev.reviewText}"
                </p>

                {/* System Analysis Tag */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="font-mono text-slate-400">{rev.deviceInfo || 'Standard Client'}</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-accent-mint font-medium font-mono text-[10px]">
                    <CheckCircle2 size={12} />
                    TRIAGED BY AI INTO BUG TRACKER
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
