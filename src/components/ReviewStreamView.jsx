import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';

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
    if (/crash|freeze|broke|blank|error|fail|died|stopped/i.test(t)) {
      return { id: 'crash', label: 'Crashes' };
    }
    if (/ui|theme|dark|light|color|contrast|font|layout|button/i.test(t)) {
      return { id: 'ui', label: 'UI & theme' };
    }
    if (/slow|lag|memory|ram|sync|delay|heavy|battery/i.test(t)) {
      return { id: 'perf', label: 'Performance' };
    }
    if (/feature|wish|would love|add|support|export|request/i.test(t)) {
      return { id: 'feature', label: 'Feature requests' };
    }
    return { id: 'general', label: 'General' };
  };

  const filteredReviews = reviews.filter(r => {
    if (selectedPlatform !== 'ALL') {
      const p = (r.platform || '').toLowerCase();
      if (selectedPlatform === 'chrome' && !p.includes('chrome')) return false;
      if (selectedPlatform === 'ios' && !p.includes('ios') && !p.includes('apple')) return false;
      if (selectedPlatform === 'android' && !p.includes('play') && !p.includes('google') && !p.includes('android')) return false;
      if (selectedPlatform === 'firefox' && !p.includes('firefox')) return false;
      if (selectedPlatform === 'edge' && !p.includes('edge')) return false;
      if (selectedPlatform === 'producthunt' && !p.includes('product hunt') && !p.includes('product_hunt')) return false;
      if (selectedPlatform === 'trustpilot' && !p.includes('trustpilot')) return false;
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

  const platformOptions = [
    { id: 'ALL', label: 'All channels' },
    { id: 'chrome', label: 'Chrome' },
    { id: 'ios', label: 'iOS' },
    { id: 'android', label: 'Android' },
    { id: 'firefox', label: 'Firefox' },
    { id: 'edge', label: 'Edge' },
    { id: 'trustpilot', label: 'Trustpilot' }
  ];

  const topicOptions = [
    { id: 'ALL', label: 'All topics' },
    { id: 'crash', label: 'Crashes' },
    { id: 'ui', label: 'UI & theme' },
    { id: 'perf', label: 'Performance' },
    { id: 'feature', label: 'Feature requests' }
  ];

  return (
    <div className="space-y-4">
      {/* Stream Controls Bar */}
      <div className="p-3 rounded-xl surface-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
              Review stream
            </h3>
            <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
              Incoming customer feedback across connected channels and store webhooks
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Platform filter */}
            <div className="flex items-center gap-0.5 bg-surface-inset-light dark:bg-surface-inset-dark p-0.5 rounded-lg border border-surface-border-light dark:border-surface-border-dark text-xs">
              {platformOptions.map(plat => (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id)}
                  className={`h-6 px-2 rounded-md text-[11px] transition-colors duration-140 ${
                    selectedPlatform === plat.id 
                      ? 'bg-canvas-light dark:bg-surface-raised-dark text-ink-primary-light dark:text-ink-primary-dark font-medium shadow-xs' 
                      : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                  }`}
                >
                  {plat.label}
                </button>
              ))}
            </div>

            {/* Rating filter */}
            <div className="flex items-center gap-0.5 bg-surface-inset-light dark:bg-surface-inset-dark p-0.5 rounded-lg border border-surface-border-light dark:border-surface-border-dark text-xs">
              {['ALL', '5', '4', '3', '2', '1'].map(star => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`h-6 px-2 rounded-md font-mono text-[11px] tabular transition-colors duration-140 ${
                    selectedRating === star 
                      ? 'bg-canvas-light dark:bg-surface-raised-dark text-ink-primary-light dark:text-ink-primary-dark font-medium shadow-xs' 
                      : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                  }`}
                >
                  {star === 'ALL' ? 'All' : `${star}★`}
                </button>
              ))}
            </div>

            <button
              onClick={loadReviews}
              className="w-7 h-7 rounded-lg surface-raised flex items-center justify-center text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition-colors duration-140"
              title="Refresh stream"
            >
              <RefreshCw size={13} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Topic filter row */}
        <div className="pt-2 border-t border-surface-border-light dark:border-surface-border-dark flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark mr-1">
            Topics:
          </span>
          {topicOptions.map(t => {
            const count = t.id === 'ALL' 
              ? reviews.length 
              : reviews.filter(r => detectTopic(r.reviewText).id === t.id).length;
            const isActive = selectedTopic === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`h-6 px-2 rounded-md text-[11px] transition-colors duration-140 flex items-center gap-1 ${
                  isActive 
                    ? 'surface-raised text-ink-primary-light dark:text-ink-primary-dark font-medium' 
                    : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                }`}
              >
                <span>{t.label}</span>
                <span className="font-mono tabular text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 text-center text-ink-muted-light dark:text-ink-muted-dark text-xs font-mono">
          Loading review stream...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-8 text-center surface-card rounded-xl text-ink-muted-light dark:text-ink-muted-dark text-xs">
          No reviews match the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredReviews.map(rev => {
            const topic = detectTopic(rev.reviewText);
            return (
              <div 
                key={rev.id}
                className="p-3.5 rounded-xl surface-card space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-ink-primary-light dark:text-ink-primary-dark">
                      {rev.authorName || 'Reviewer'}
                    </span>
                    <span className="text-ink-muted-light dark:text-ink-muted-dark">·</span>
                    <span className="text-ink-muted-light dark:text-ink-muted-dark text-[11px] font-mono">
                      {rev.platform || 'Store'}
                    </span>
                    {rev.appVersion && (
                      <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
                        {rev.appVersion}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark surface-raised px-1.5 py-0.5 rounded">
                      {topic.label}
                    </span>
                    <span className="text-ink-muted-light dark:text-ink-muted-dark font-mono text-[10px] tabular">
                      {new Date(rev.reviewDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={11} 
                          strokeWidth={1.5}
                          className={i < (rev.rating || 1) ? "fill-amber-500" : "text-surface-border-light dark:text-surface-border-dark"}
                        />
                      ))}
                    </div>
                    {rev.storeUrl && (
                      <a
                        href={rev.storeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition-colors"
                        title="Open source"
                      >
                        <ExternalLink size={12} strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark leading-relaxed surface-inset p-3 rounded-lg">
                  "{rev.reviewText}"
                </p>

                {/* Footer status */}
                <div className="flex items-center justify-between text-[11px] text-ink-muted-light dark:text-ink-muted-dark pt-0.5 font-mono">
                  <span>{rev.deviceInfo || 'Standard client'}</span>
                  <span className="flex items-center gap-1 text-[10px] text-accent">
                    <CheckCircle2 size={11} strokeWidth={1.5} />
                    <span>Triaged</span>
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
