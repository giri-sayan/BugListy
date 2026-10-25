import React, { useState } from 'react';
import { X, Link2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function AddSourceModal({ isOpen, onClose, onSourceAdded }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const detectPlatform = (val) => {
    const l = val.toLowerCase();
    if (l.includes('chromewebstore.google.com') || l.includes('chrome.google.com')) return 'Chrome Web Store';
    if (l.includes('apps.apple.com')) return 'iOS App Store';
    if (l.includes('play.google.com')) return 'Google Play Store';
    if (l.startsWith('http')) return 'Website / In-App';
    return null;
  };

  const detected = detectPlatform(url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add source');

      onSourceAdded(data);
      setUrl('');
      setTitle('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreloadExample = (exampleUrl, exampleTitle) => {
    setUrl(exampleUrl);
    setTitle(exampleTitle);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white dark:bg-sidebar border border-slate-200 dark:border-surface-border rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-accent-mint/10 border border-emerald-200 dark:border-accent-mint/20 flex items-center justify-center text-emerald-600 dark:text-accent-mint">
              <Link2 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Review Source</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Paste where your users review, we handle the rest</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Store or App Public URL
            </label>
            <input
              type="url"
              required
              placeholder="e.g. https://chromewebstore.google.com/detail/my-extension..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-accent-mint transition font-mono"
            />
            {detected && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-accent-mint pt-1 font-medium font-mono">
                <CheckCircle2 size={14} />
                Detected platform: <span className="font-bold">{detected}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Friendly Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Production Chrome Extension"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-accent-mint transition"
            />
          </div>

          {/* Quick Click Demo Links */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Or Try One-Click Example Sources:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handlePreloadExample("https://chromewebstore.google.com/detail/quicktab-smart-dashboard/abcdefghijklmnop", "QuickTab Chrome Extension")}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-elevated hover:bg-slate-100 dark:hover:bg-surface-hover border border-slate-200 dark:border-white/5 text-left text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium"
              >
                🌐 Chrome Web Store
              </button>
              <button
                type="button"
                onClick={() => handlePreloadExample("https://apps.apple.com/app/quicktab-companion/id1523456789", "QuickTab iOS App")}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-elevated hover:bg-slate-100 dark:hover:bg-surface-hover border border-slate-200 dark:border-white/5 text-left text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium"
              >
                🍎 Apple App Store
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-elevated transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-gradient-to-r dark:from-accent-mint dark:to-emerald-600 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white dark:text-slate-950 flex items-center gap-2 shadow-md shadow-emerald-600/20 dark:shadow-accent-mint/20 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "Scraping & Triaging..." : "Start Tracking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
