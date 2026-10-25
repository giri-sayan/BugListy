import React, { useState, useEffect } from 'react';
import { 
  X, MessageSquarePlus, Star, Sparkles, CheckCircle2, 
  AlertTriangle, Bug, Lightbulb, Heart, Copy, Check, 
  Terminal, Monitor, ArrowRight, Loader2, Info, ChevronDown, ChevronUp, FlaskConical
} from 'lucide-react';

// Global error listener buffer
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
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [includeDeviceInfo, setIncludeDeviceInfo] = useState(true);
  const [deviceInfoStr, setDeviceInfoStr] = useState('');
  
  // DevLogs state (Console & Network error auto-recorder)
  const [devLogs, setDevLogs] = useState([]);
  const [includeDevLogs, setIncludeDevLogs] = useState(true);
  const [showLogsDetails, setShowLogsDetails] = useState(false);
  const [testErrorTriggered, setTestErrorTriggered] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Auto-detect client environment & sync logs
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

  const handleRatingClick = (r) => {
    setRating(r);
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 1: return "1★ - Critical Issue / Broken Feature";
      case 2: return "2★ - Frustrating / Needs Work";
      case 3: return "3★ - Average / Functional";
      case 4: return "4★ - Great / Very Good";
      case 5: return "5★ - Excellent / Loving it!";
      default: return "";
    }
  };

  // Trigger test console error so user can test the capture live!
  const handleSimulateError = () => {
    const errorMsg = `TypeError: Connection reset during sync alarm at syncWorker.js:142 (simulated test error)`;
    console.error(errorMsg);
    setDevLogs([...globalCapturedLogs]);
    setTestErrorTriggered(true);
    if (rating > 2) setRating(1);
    if (!reviewText) setReviewText("Encountered connection drop error during sync.");
    setTimeout(() => setTestErrorTriggered(false), 3000);
  };

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
      alert("Failed to submit review. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!result?.affectedBug) return;
    const bug = result.affectedBug;
    const prompt = `CRITICAL USER BUG FIX REQUEST
Bug Title: ${bug.title}
Severity: ${bug.severity || 'HIGH'}
Platform: BugListy (In-App)
Description: ${bug.technicalSummary || bug.title}
User Verbatim: "${result.review?.reviewText || ''}"
Client Environment: ${result.review?.deviceInfo || 'Browser'}
Captured DevLogs:
${result.review?.devLogs || 'No console errors captured'}

Please inspect the codebase and resolve this issue.`;

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white dark:bg-sidebar border border-slate-200 dark:border-surface-border rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-accent-mint">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Review & Dogfood BugListy</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-accent-mint/20 text-emerald-800 dark:text-accent-mint font-semibold">
                  Live AI Dogfooding
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share a review or report a bug. It gets triaged live by our own AI engine!
              </p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose} 
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* If successfully submitted, show AI Triage Result */}
        {result ? (
          <div className="space-y-4 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-accent-mint">
                <CheckCircle2 size={18} className="shrink-0" />
                <span className="text-sm font-bold">Feedback Successfully Ingested!</span>
              </div>

              {result.affectedBug ? (
                <div className="space-y-2 bg-white dark:bg-sidebar p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {result.triageResult?.isDuplicate ? '⚡ Clustered Into Existing Issue' : '✨ New Issue Created in User Bugs'}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                      {result.affectedBug.severity || 'HIGH'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {result.affectedBug.title}
                  </h4>
                  {result.affectedBug.actionabilityScore && (
                    <div className="flex items-center gap-2 pt-1 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-emerald-600 dark:text-accent-mint">
                        🎯 Actionability: {result.affectedBug.actionabilityScore}/5
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">Auto-generated Cursor / Claude prompt ready</span>
                    </div>
                  )}
                  {result.review?.devLogs && (
                    <div className="p-2 rounded bg-slate-950 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                      ✓ Attached DevLogs: {result.review.devLogs.split('\n').length} console events captured
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-sidebar p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300">
                  <p>Your review was added directly to the <span className="font-semibold text-slate-900 dark:text-white">Live Store Review Stream</span>.</p>
                </div>
              )}
            </div>

            {/* Quick Prompt Copy if bug created */}
            {result.affectedBug && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Terminal size={14} className="text-emerald-600 dark:text-accent-mint" />
                    AI Cursor Prompt Ready for Developers
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-accent-mint hover:underline"
                  >
                    {copiedPrompt ? <Check size={13} /> : <Copy size={13} />}
                    {copiedPrompt ? "Copied!" : "Copy Prompt"}
                  </button>
                </div>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed max-h-28 overflow-y-auto border border-slate-800">
                  CRITICAL USER BUG FIX REQUEST<br />
                  Bug: {result.affectedBug.title}<br />
                  Verbatim: "{result.review?.reviewText}"<br />
                  Platform: BugListy (In-App)
                  {result.review?.devLogs && <><br />DevLogs: Attached ✓</>}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-gradient-to-r dark:from-accent-mint dark:to-emerald-600 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>Done & View on Board</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Form for submitting feedback */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Category Selector Tabs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Feedback Type
                </label>
                <button
                  type="button"
                  onClick={handleSimulateError}
                  className="text-[11px] font-mono text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  title="Simulate a real console error to test live DevLog capture"
                >
                  <FlaskConical size={12} />
                  <span>{testErrorTriggered ? "✓ Error Logged!" : "Simulate Test Error"}</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setCategory('bug'); if (rating > 2) setRating(1); }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    category === 'bug'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-surface-inset text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-surface-elevated'
                  }`}
                >
                  <Bug size={14} />
                  <span>Bug Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setCategory('feature'); if (rating < 4) setRating(4); }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    category === 'feature'
                      ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-surface-inset text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-surface-elevated'
                  }`}
                >
                  <Lightbulb size={14} />
                  <span>Feature Idea</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('general')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    category === 'general'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-surface-inset text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-surface-elevated'
                  }`}
                >
                  <Star size={14} />
                  <span>Site Review</span>
                </button>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rating
                </label>
                <span className="text-[11px] font-mono text-amber-600 dark:text-accent-gold font-medium">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingClick(star)}
                      className="p-1 hover:scale-115 transition transform"
                    >
                      <Star 
                        size={22} 
                        className={isFilled ? "fill-amber-400 text-amber-400 drop-shadow-xs" : "text-slate-300 dark:text-slate-600"}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-mono text-slate-400 ml-2">
                  ({rating} / 5)
                </span>
              </div>
            </div>

            {/* Author Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Name / Handle <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Maya Chen or Anonymous Dev"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Feedback / Review Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {category === 'bug' ? 'Describe the Bug / Reproduction Steps' : category === 'feature' ? 'Feature Details' : 'Your Review / Thoughts'}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {reviewText.length} chars
                </span>
              </div>
              <textarea
                required
                rows={3}
                placeholder={
                  category === 'bug'
                    ? "e.g. When clicking 'Copy Prompt' on a low severity bug, the toast notification doesn't dismiss automatically..."
                    : category === 'feature'
                    ? "e.g. It would be amazing to filter bugs by date range or export them directly to CSV or external issue trackers..."
                    : "e.g. BugListy solved our feedback backlog chaos in minutes! Love the dual backlog split..."
                }
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition leading-relaxed resize-none"
              />
            </div>

            {/* Telemetry / Device Info Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-start gap-2.5 text-xs">
                <Monitor size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      Auto-Captured Client Telemetry
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500 dark:text-slate-400 select-none">
                      <input
                        type="checkbox"
                        checked={includeDeviceInfo}
                        onChange={e => setIncludeDeviceInfo(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-0"
                      />
                      <span>Attach</span>
                    </label>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {deviceInfoStr || "Detecting browser environment..."}
                  </p>
                </div>
              </div>

              {/* DevLogs Console Error Recorder */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Terminal size={13} className="text-emerald-600 dark:text-accent-mint" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Console & DevLogs Recorder
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-accent-mint/20 dark:text-accent-mint">
                      {devLogs.length} events
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLogsDetails(!showLogsDetails)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-0.5"
                    >
                      <span>{showLogsDetails ? "Hide" : "Inspect"}</span>
                      {showLogsDetails ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 select-none">
                      <input
                        type="checkbox"
                        checked={includeDevLogs}
                        onChange={e => setIncludeDevLogs(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-0"
                      />
                      <span>Attach</span>
                    </label>
                  </div>
                </div>

                {showLogsDetails && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-950 text-slate-300 font-mono text-[10px] max-h-24 overflow-y-auto leading-relaxed border border-slate-800">
                    {devLogs.length === 0 ? (
                      <span className="text-slate-600">No console errors detected in current session.</span>
                    ) : (
                      devLogs.map((log, idx) => (
                        <div key={idx} className={log.includes('ERROR') || log.includes('UNCAUGHT') ? "text-rose-400 font-bold" : "text-slate-400"}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                )}
                <p className="text-[10px] text-emerald-600 dark:text-accent-mint mt-1">
                  💡 Attaching environment telemetry & DevLogs guarantees 5/5 AI actionability.
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-elevated transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reviewText.trim()}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-gradient-to-r dark:from-accent-mint dark:to-emerald-600 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 dark:shadow-accent-mint/20 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>AI Triaging Review...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Submit to AI Triage</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
