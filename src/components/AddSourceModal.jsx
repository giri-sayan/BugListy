import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

const EXAMPLE_SOURCES = [
  // Stores & Extensions
  {
    id: 'chrome',
    category: 'stores',
    name: 'Chrome Web Store',
    badge: 'Browser extension',
    url: 'https://chromewebstore.google.com/detail/quicktab-smart-dashboard/abcdefghijklmnop',
    title: 'QuickTab Chrome Extension'
  },
  {
    id: 'apple',
    category: 'stores',
    name: 'Apple App Store',
    badge: 'iOS',
    url: 'https://apps.apple.com/app/quicktab-companion/id1523456789',
    title: 'QuickTab iOS App'
  },
  {
    id: 'play',
    category: 'stores',
    name: 'Google Play Store',
    badge: 'Android',
    url: 'https://play.google.com/store/apps/details?id=com.quicktab.app',
    title: 'QuickTab Android App'
  },
  {
    id: 'firefox',
    category: 'stores',
    name: 'Firefox Add-ons',
    badge: 'Add-on',
    url: 'https://addons.mozilla.org/en-US/firefox/addon/quicktab-dashboard/',
    title: 'QuickTab Firefox Add-on'
  },
  {
    id: 'edge',
    category: 'stores',
    name: 'Edge Add-ons',
    badge: 'Extension',
    url: 'https://microsoftedge.microsoft.com/addons/detail/quicktab-sidebar/kjlmanbopcqrestuv',
    title: 'QuickTab Edge Extension'
  },

  // SaaS Reviews
  {
    id: 'trustpilot',
    category: 'saas',
    name: 'Trustpilot',
    badge: 'Customer reviews',
    url: 'https://www.trustpilot.com/review/quicktab.io',
    title: 'QuickTab Trustpilot Reviews'
  },
  {
    id: 'g2',
    category: 'saas',
    name: 'G2',
    badge: 'B2B reviews',
    url: 'https://www.g2.com/products/quicktab-workspace/reviews',
    title: 'QuickTab G2 Enterprise Reviews'
  },
  {
    id: 'capterra',
    category: 'saas',
    name: 'Capterra',
    badge: 'Directory',
    url: 'https://www.capterra.com/p/987654/QuickTab-Pro/reviews',
    title: 'QuickTab Capterra Reviews'
  },
  {
    id: 'producthunt',
    category: 'saas',
    name: 'Product Hunt',
    badge: 'Launch',
    url: 'https://www.producthunt.com/products/quicktab-ai/reviews',
    title: 'QuickTab Product Hunt Launch'
  },

  // Developer & Commerce
  {
    id: 'github',
    category: 'dev',
    name: 'GitHub Issues',
    badge: 'Repository',
    url: 'https://github.com/quicktab/quicktab-core/issues',
    title: 'QuickTab Core GitHub Repository'
  },
  {
    id: 'shopify',
    category: 'dev',
    name: 'Shopify App Store',
    badge: 'Merchant app',
    url: 'https://apps.shopify.com/quicktab-ecommerce-analytics',
    title: 'QuickTab Shopify Merchant App'
  },
  {
    id: 'discord',
    category: 'dev',
    name: 'Discord',
    badge: 'Community',
    url: 'https://discord.com/channels/quicktab-community/feedback',
    title: 'QuickTab Discord Feedback'
  }
];

export default function AddSourceModal({ isOpen, onClose, onSourceAdded }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const detectPlatform = (val) => {
    if (!val) return null;
    const l = val.toLowerCase();
    if (l.includes('chromewebstore.google.com') || l.includes('chrome.google.com/webstore')) {
      return { name: 'Chrome Web Store', badge: 'Extension' };
    }
    if (l.includes('apps.apple.com')) {
      return { name: 'Apple App Store', badge: 'iOS' };
    }
    if (l.includes('play.google.com')) {
      return { name: 'Google Play Store', badge: 'Android' };
    }
    if (l.includes('addons.mozilla.org')) {
      return { name: 'Firefox Add-ons', badge: 'Add-on' };
    }
    if (l.includes('microsoftedge.microsoft.com')) {
      return { name: 'Edge Add-ons', badge: 'Extension' };
    }
    if (l.includes('producthunt.com')) {
      return { name: 'Product Hunt', badge: 'Launch' };
    }
    if (l.includes('trustpilot.com')) {
      return { name: 'Trustpilot', badge: 'Reviews' };
    }
    if (l.includes('github.com')) {
      return { name: 'GitHub Issues', badge: 'Issues' };
    }
    if (l.startsWith('http')) {
      return { name: 'Web Source', badge: 'URL' };
    }
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
      if (!res.ok) throw new Error(data.error || 'Failed to add channel');

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

  const filteredExamples = selectedCategory === 'ALL'
    ? EXAMPLE_SOURCES
    : EXAMPLE_SOURCES.filter(s => s.category === selectedCategory);

  const categories = [
    { id: 'ALL', label: 'All' },
    { id: 'stores', label: 'Stores' },
    { id: 'saas', label: 'SaaS' },
    { id: 'dev', label: 'Dev' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-xl bg-sidebar-light dark:bg-sidebar-dark border border-surface-border-light dark:border-surface-border-dark rounded-xl shadow-lg p-5 space-y-4 my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border-light dark:border-surface-border-dark pb-3">
          <div>
            <h2 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
              Connect review channel
            </h2>
            <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
              Enter a public app store, extension, or feedback URL
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 flex items-center justify-center text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark rounded-md hover:bg-surface-raised-light dark:hover:bg-surface-raised-dark transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-red-500/10 text-semantic-negative-light dark:text-semantic-negative-dark text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* URL Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                Public store or product URL
              </label>
              {detected && (
                <span className="text-[11px] font-mono text-accent">
                  {detected.name} ({detected.badge})
                </span>
              )}
            </div>
            <input
              type="url"
              required
              placeholder="https://chromewebstore.google.com/detail/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full h-8 bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg px-2.5 text-xs text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none font-mono"
            />
          </div>

          {/* Friendly Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
              Display title (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. QuickTab Chrome Store"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full h-8 bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg px-2.5 text-xs text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none"
            />
          </div>

          {/* Preset Example Sources */}
          <div className="space-y-2 pt-2 border-t border-surface-border-light dark:border-surface-border-dark">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                Preset channels:
              </span>
              <div className="flex items-center gap-0.5 bg-surface-inset-light dark:bg-surface-inset-dark p-0.5 rounded-md border border-surface-border-light dark:border-surface-border-dark text-[11px]">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`h-5 px-1.5 rounded transition-colors ${
                      selectedCategory === cat.id
                        ? 'surface-raised text-ink-primary-light dark:text-ink-primary-dark font-medium'
                        : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Sources */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredExamples.map(src => {
                const isSelected = url === src.url;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => handlePreloadExample(src.url, src.title)}
                    className={`p-2 rounded-lg border text-left transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'surface-raised border-surface-border-light dark:border-surface-border-dark'
                        : 'surface-card border-transparent hover:border-surface-border-light dark:hover:border-surface-border-dark'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark truncate">
                        {src.name}
                      </div>
                      <div className="text-[10px] text-ink-muted-light dark:text-ink-muted-dark font-mono truncate">
                        {src.badge}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={12} strokeWidth={2} className="text-accent shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border-light dark:border-surface-border-dark">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark hover:bg-surface-raised-light dark:hover:bg-surface-raised-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url}
              className="h-8 px-3.5 rounded-lg text-xs font-medium bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>{loading ? "Connecting..." : "Add channel"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
