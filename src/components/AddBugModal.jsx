import React, { useState } from 'react';
import { X, Loader2, Plus } from 'lucide-react';

export default function AddBugModal({ isOpen, onClose, onBugAdded }) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [technicalSummary, setTechnicalSummary] = useState('');
  const [tags, setTags] = useState('Frontend, Tech debt');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);

    try {
      const res = await fetch('/api/bugs/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          severity,
          technicalSummary,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      const data = await res.json();
      onBugAdded(data);
      setTitle('');
      setTechnicalSummary('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-sidebar-light dark:bg-sidebar-dark border border-surface-border-light dark:border-surface-border-dark rounded-xl shadow-lg p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-border-light dark:border-surface-border-dark pb-3">
          <div>
            <h2 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
              Create internal issue
            </h2>
            <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
              Log an internal bug, defect, or technical debt item
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 flex items-center justify-center text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark rounded-md hover:bg-surface-raised-light dark:hover:bg-surface-raised-dark transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Memory leak during tab reload cycle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full h-8 bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg px-2.5 text-xs text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                Severity
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="w-full h-8 bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg px-2 text-xs text-ink-primary-light dark:text-ink-primary-dark focus:outline-none font-mono"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                Tags
              </label>
              <input
                type="text"
                placeholder="Frontend, Tech debt"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full h-8 bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg px-2.5 text-xs text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
              Technical summary
            </label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, relevant files, or reproduction steps..."
              value={technicalSummary}
              onChange={e => setTechnicalSummary(e.target.value)}
              className="w-full bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg p-2.5 text-xs text-ink-primary-light dark:text-ink-primary-dark font-mono placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none resize-none leading-relaxed"
            />
          </div>

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
              disabled={loading || !title}
              className="h-8 px-3.5 rounded-lg text-xs font-medium bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>{loading ? "Adding..." : "Create issue"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
