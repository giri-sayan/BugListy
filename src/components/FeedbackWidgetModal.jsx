import React, { useState, useEffect } from 'react';
import { 
  X, Star, CheckCircle2, Copy, Check, 
  Terminal, Monitor, ArrowRight, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

let globalCapturedLogs = [
  `[${new Date().toLocaleTimeString()}] INFO: Client initialized on ${window?.location?.origin || 'http://localhost:3001'}`,
];

if (typeof window !== 'undefined' && !window.__buglisty_listener_installed) {
  window.__buglisty_listener_installed = true;
  
  const origError = console.error;
  console.error = function (...args) {
    globalCapturedLogs.push(`[${new Date().toLocaleTimeString()}] ERROR: ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
    if (globalCapturedLogs.length > 8) globalCapturedLogs.shift();
    origError.apply(console, args);
  };

  window.addEventListener('error', (event) => {
    globalCapturedLogs.push(`[${new Date().toLocaleTimeString()}] UNCAUGHT: ${event.message} at ${event.filename}:${event.lineno}`);
    if (globalCapturedLogs.length > 8) globalCapturedLogs.shift();
  });
}

export default function FeedbackWidgetModal({ isOpen, onClose, onFeedbackSubmitted }) {
  const [category, setCategory] = useState('bug'); // 'bug' | 'feature' | 'general'
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [includeDeviceInfo, setIncludeDeviceInfo] = useState(true);
  const [deviceInfoStr, setDeviceInfoStr] = useState('');
  
  const [devLogs, setDevLogs] = useState([]);
  const [includeDevLogs, setIncludeDevLogs] = useState(true);
  const [showLogsDetails, setShowLogsDetails] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let browser = "Chrome";
      if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
      else if (ua.includes("Edg")) browser = "Edge";

      let os = "Windows";
      if (navigator.platform?.includes("Mac") || ua.includes("Mac OS")) os = "macOS";
      else if (navigator.platform?.includes("Linux") || ua.includes("Linux")) os = "Linux";

      const resolution = `${window.innerWidth}x${window.innerHeight}`;
      setDeviceInfoStr(`${browser} on ${os} (${resolution})`);
      setDevLogs([...globalCapturedLogs]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmitting(true);
    try {
      const logsPayload = includeDevLogs && devLogs.length > 0 
        ? devLogs.slice(-5).join('\n') 
        : null;

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim() || 'BugListy User',
          rating,
          category,
          reviewText: reviewText.trim(),
          deviceInfo: includeDeviceInfo ? deviceInfoStr : 'Client Device',
          devLogs: logsPayload
        })
      });

      const data = await res.json();
      setResult(data);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(data);
      }
    } catch (err) {
      console.error("Feedback submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!result?.affectedBug) return;
    const bug = result.affectedBug;
    const prompt = `USER DEFECT REPORT
Title: ${bug.title}
Severity: ${bug.severity || 'HIGH'}
Platform: BugListy (In-app)
Summary: ${bug.technicalSummary || bug.title}
User verbatim: "${result.review?.reviewText || ''}"
Environment: ${result.review?.deviceInfo || 'Browser'}
Captured DevLogs:
${result.review?.devLogs || 'No console errors captured'}`;

    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleResetAndClose = () => {
    setResult(null);
    setReviewText('');
    setAuthorName('');
    setRating(5);
    setCategory('bug');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-sidebar-light dark:bg-sidebar-dark border border-surface-border-light dark:border-surface-border-dark rounded-xl shadow-lg p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border-light dark:border-surface-border-dark pb-3">
          <div>
            <h2 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
              In-app feedback
            </h2>
            <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
              Submit an issue or suggestion to test the live triage pipeline
            </p>
          </div>
          <button 
            onClick={handleResetAndClose} 
            className="w-7 h-7 flex items-center justify-center text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark rounded-md hover:bg-surface-raised-light dark:hover:bg-surface-raised-dark transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Triage result */}
        {result ? (
          <div className="space-y-3 py-1">
            <div className="p-3.5 rounded-lg surface-inset space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
                <CheckCircle2 size={15} className="text-accent" />
                <span>Feedback processed</span>
              </div>

              {result.affectedBug ? (
                <div className="space-y-1.5 surface-card p-3 rounded-lg text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                    <span>
                      {result.triageResult?.isDuplicate ? 'Clustered into existing issue' : 'Created new customer issue'}
                    </span>
                    <span className="text-semantic-negative-light dark:text-semantic-negative-dark">
                      {result.affectedBug.severity || 'HIGH'}
                    </span>
                  </div>
                  <h4 className="font-medium text-ink-primary-light dark:text-ink-primary-dark text-xs">
                    {result.affectedBug.title}
                  </h4>
                </div>
              ) : (
                <div className="surface-card p-3 rounded-lg text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
                  Feedback recorded to live stream.
                </div>
              )}
            </div>

            {result.affectedBug && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted-light dark:text-ink-muted-dark text-[11px] font-mono">
                    Developer prompt generated
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="text-[11px] font-medium text-ink-primary-light dark:text-ink-primary-dark hover:text-accent flex items-center gap-1 font-mono"
                  >
                    {copiedPrompt ? <Check size={11} strokeWidth={2} /> : <Copy size={11} strokeWidth={1.5} />}
                    <span>{copiedPrompt ? "Copied" : "Copy prompt"}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="h-8 px-3.5 rounded-lg bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Category tabs */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                Feedback category
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'bug', label: 'Bug report' },
                  { id: 'feature', label: 'Feature idea' },
                  { id: 'general', label: 'General' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setCategory(cat.id); if (cat.id === 'bug' && rating > 2) setRating(1); }}
                    className={`h-7 px-2 rounded-md text-xs font-medium transition-colors ${
                      category === cat.id
                        ? 'surface-raised text-ink-primary-light dark:text-ink-primary-dark'
                        : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                Rating
              </label>
              <div className="flex items-center gap-1 p-1.5 rounded-lg surface-inset">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star 
                      size={16} 
                      strokeWidth={1.5}
                      className={star <= rating ? "fill-amber-500 text-amber-500" : "text-surface-border-light dark:text-surface-border-dark"}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono tabular text-ink-muted-light dark:text-ink-muted-dark ml-2">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                Name (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Maya Chen"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full h-8 bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg px-2.5 text-xs text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                {category === 'bug' ? 'Defect description' : 'Details'}
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe what occurred, expected outcome, or feature suggestion..."
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                className="w-full bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg p-2.5 text-xs text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Environment Telemetry */}
            <div className="p-2.5 rounded-lg surface-inset space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink-muted-light dark:text-ink-muted-dark font-mono truncate">
                  {deviceInfoStr || "Detecting environment..."}
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-ink-secondary-light dark:text-ink-secondary-dark select-none">
                  <input
                    type="checkbox"
                    checked={includeDeviceInfo}
                    onChange={e => setIncludeDeviceInfo(e.target.checked)}
                    className="rounded text-accent focus:ring-0"
                  />
                  <span>Attach</span>
                </label>
              </div>

              {/* Console log recorder */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-surface-border-light dark:border-surface-border-dark">
                <span className="text-ink-muted-light dark:text-ink-muted-dark font-mono">
                  Console logs ({devLogs.length} events)
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-ink-secondary-light dark:text-ink-secondary-dark select-none">
                  <input
                    type="checkbox"
                    checked={includeDevLogs}
                    onChange={e => setIncludeDevLogs(e.target.checked)}
                    className="rounded text-accent focus:ring-0"
                  />
                  <span>Attach</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-border-light dark:border-surface-border-dark">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="h-8 px-3 rounded-lg text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark hover:bg-surface-raised-light dark:hover:bg-surface-raised-dark transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reviewText.trim()}
                className="h-8 px-3.5 rounded-lg bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
              >
                {submitting && <Loader2 size={13} className="animate-spin" />}
                <span>{submitting ? "Triaging..." : "Submit feedback"}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
