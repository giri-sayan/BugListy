import React, { useState } from 'react';
import { X, Wrench, Plus, Loader2 } from 'lucide-react';

export default function AddBugModal({ isOpen, onClose, onBugAdded }) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [technicalSummary, setTechnicalSummary] = useState('');
  const [tags, setTags] = useState('Frontend, Tech Debt');
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white dark:bg-sidebar border border-slate-200 dark:border-surface-border rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Wrench size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add to "My Bugs"</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track an internal bug or edge case you found</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Bug Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Memory leak when reopening popup repeatedly"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Severity
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition font-mono"
              >
                <option value="CRITICAL">Critical (Crash/Data loss)</option>
                <option value="HIGH">High (Major feature broken)</option>
                <option value="MEDIUM">Medium (Normal defect)</option>
                <option value="LOW">Low (Cosmetic/Typo)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="UI, Performance, Chrome MV3"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Technical Details / Repro Notes
            </label>
            <textarea
              rows={4}
              placeholder="Describe symptoms, relevant files, or reproduction steps..."
              value={technicalSummary}
              onChange={e => setTechnicalSummary(e.target.value)}
              className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
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
              disabled={loading || !title}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? "Adding..." : "Add to My Bugs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
