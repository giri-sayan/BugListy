import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Copy, Check, Star, AlertCircle, 
  Terminal, MessageSquare, ShieldAlert, Cpu, Sparkles, Send, CheckCircle2
} from 'lucide-react';

export default function VerbatimProofDrawer({ bug, onClose, onUpdateStatus, allBugs, onMerge }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'prompt' | 'reply'
  const [promptText, setPromptText] = useState('');
  const [copied, setCopied] = useState(false);
  const [storeReply, setStoreReply] = useState('');
  const [copiedReply, setCopiedReply] = useState(false);
  
  // Close-the-loop state
  const [replyTone, setReplyTone] = useState('friendly'); // 'friendly' | 'formal' | 'quick'
  const [dispatchedMap, setDispatchedMap] = useState({});

  useEffect(() => {
    if (!bug) return;
    setLoading(true);
    fetch(`/api/bugs/${bug.id}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch(`/api/bugs/${bug.id}/cursor-prompt`)
      .then(res => res.json())
      .then(data => setPromptText(data.prompt))
      .catch(console.error);

    generateReply(replyTone, bug);
  }, [bug, replyTone]);

  const generateReply = (tone, currentBug) => {
    if (!currentBug) return;
    const isResolved = currentBug.status === 'RESOLVED';
    const bugTitle = currentBug.title;

    let text = "";
    if (isResolved) {
      if (tone === 'friendly') {
        text = `Hi there! Thank you so much for reporting this issue. Our team investigated and resolved the bug ("${bugTitle}") in our latest release. Please update your app and let us know if everything is running smoothly! If you love the fix, we'd be thrilled if you could consider updating your review. ⭐`;
      } else if (tone === 'formal') {
        text = `Dear user, thank you for your feedback. We are pleased to inform you that the reported issue regarding "${bugTitle}" has been resolved and deployed in the latest version. Please update your installation at your earliest convenience.`;
      } else {
        text = `Update: This bug ("${bugTitle}") has been fixed and shipped in our latest patch! Please update and check it out.`;
      }
    } else {
      if (tone === 'friendly') {
        text = `Hi! Thanks for reporting this. We've reproduced the issue ("${bugTitle}") and our developers are actively working on a fix right now. We expect to push an update shortly!`;
      } else if (tone === 'formal') {
        text = `Thank you for contacting us. Your report regarding "${bugTitle}" has been logged with our engineering team and is currently under active investigation.`;
      } else {
        text = `We are investigating "${bugTitle}" now. A patch is underway.`;
      }
    }
    setStoreReply(text);
  };

  if (!bug) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(storeReply);
    setCopiedReply(true);
    setTimeout(() => setCopiedReply(false), 2000);
  };

  const handleDispatchForReview = (rev) => {
    const personalized = storeReply.replace("Hi there!", `Hi ${rev.authorName || 'there'}!`);
    navigator.clipboard.writeText(personalized);
    setDispatchedMap(prev => ({ ...prev, [rev.id]: true }));
    if (rev.storeUrl) {
      window.open(rev.storeUrl, '_blank');
    }
  };

  const severityColors = {
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-priority-red/15 dark:text-priority-red dark:border-priority-red/30',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-priority-amber/15 dark:text-priority-amber dark:border-priority-amber/30',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-priority-blue/15 dark:text-priority-blue dark:border-priority-blue/30',
    LOW: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/30'
  };

  const isUser = bug.originType === 'USER_REPORTED';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 dark:bg-black/75 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-sidebar border-l border-slate-200 dark:border-surface-border shadow-2xl flex flex-col h-full transform transition-transform"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-surface-border flex items-start justify-between bg-white/95 dark:bg-sidebar/95 sticky top-0 z-10 backdrop-blur">
          <div className="space-y-2.5 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-surface-inset px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                {isUser ? `BL-USR-${bug.id.slice(-3)}` : `BL-INT-${bug.id.slice(-3)}`}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${severityColors[bug.severity] || severityColors.MEDIUM}`}>
                {bug.severity}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isUser ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-accent-mint/10 dark:text-accent-mint dark:border-accent-mint/20' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-priority-blue/10 dark:text-priority-blue dark:border-priority-blue/20'
              }`}>
                {isUser ? '👥 User Reported' : '🛠️ My Bug'}
              </span>
              {bug.reportCount && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30">
                  🔥 {bug.reportCount} user report{bug.reportCount > 1 ? 's' : ''}
                </span>
              )}
              {bug.affectedVersions && bug.affectedVersions.length > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-surface-inset text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                  {bug.affectedVersions.join(', ')}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {bug.title}
            </h2>

            {/* Quick Status Bar */}
            <div className="flex items-center gap-2 pt-1 font-mono">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
              {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(bug.id, st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    bug.status === st 
                      ? (st === 'RESOLVED' ? 'bg-emerald-600 text-white font-bold' : st === 'IN_PROGRESS' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-blue-600 text-white font-bold')
                      : 'bg-slate-100 dark:bg-surface-elevated text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-surface-hover hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-white/5'
                  }`}
                >
                  {st === 'RESOLVED' ? '✓ RESOLVED' : st}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-surface-elevated transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-surface-border bg-slate-50/70 dark:bg-surface-inset/60 px-6 font-mono">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700 dark:border-accent-mint dark:text-accent-mint font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare size={14} />
            Verbatim Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'prompt'
                ? 'border-emerald-600 text-emerald-700 dark:border-accent-mint dark:text-accent-mint font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Terminal size={14} />
            Cursor / Claude Prompt
          </button>
          <button
            onClick={() => setActiveTab('reply')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'reply'
                ? 'border-emerald-600 text-emerald-700 dark:border-accent-mint dark:text-accent-mint font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} />
            Close-the-Loop Release Reply
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: VERBATIM PROOFS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                  <Cpu size={14} className="text-emerald-600 dark:text-accent-mint" />
                  AI Technical Diagnosis
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                  {bug.technicalSummary}
                </p>
                {bug.devLogs && (
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-accent-mint font-bold block mb-1">
                      Attached Client DevLogs:
                    </span>
                    <pre className="p-2.5 rounded bg-slate-950 text-emerald-400 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">
                      {bug.devLogs}
                    </pre>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Raw Customer Evidence ({reviews.length} Sources)
                </h3>

                {loading ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading verbatim citations...</div>
                ) : reviews.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs glass-card rounded-2xl">
                    No verbatim reviews directly attached to this bug ID yet.
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="p-4 rounded-2xl glass-card space-y-3 border border-slate-200 dark:border-surface-border bg-white dark:bg-[#101522]"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{rev.authorName}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 text-[11px] font-mono">{rev.platform}</span>
                          {rev.appVersion && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-surface-inset text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                              {rev.appVersion}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 text-amber-500 dark:text-accent-gold">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={i < (rev.rating || 1) ? "fill-amber-500 dark:fill-accent-gold text-amber-500 dark:text-accent-gold" : "text-slate-300 dark:text-slate-700"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <blockquote className="text-sm text-slate-800 dark:text-slate-200 italic border-l-2 border-emerald-500 dark:border-accent-mint/70 pl-3.5 leading-relaxed font-sans glass-inset p-3 rounded-r-xl">
                        "{rev.reviewText}"
                      </blockquote>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="font-mono">{rev.deviceInfo || 'Standard Client Device'}</span>
                        {rev.storeUrl && (
                          <a 
                            href={rev.storeUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 text-emerald-600 dark:text-accent-mint hover:underline font-medium"
                          >
                            <span>Verify on Store</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CURSOR / CLAUDE PROMPT */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Developer Prompt Generator</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Copy directly into Cursor Composer or Claude Code</p>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-gradient-to-r dark:from-accent-mint dark:to-emerald-600 dark:hover:from-emerald-500 dark:hover:to-emerald-600 dark:text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Prompt"}
                </button>
              </div>

              <pre className="p-4 bg-slate-100 dark:bg-surface-inset border border-slate-200 dark:border-white/5 rounded-2xl text-xs text-slate-900 dark:text-accent-mint font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[400px]">
                {promptText || "Generating prompt..."}
              </pre>
            </div>
          )}

          {/* TAB 3: CLOSE-THE-LOOP RELEASE REPLY DISPATCHER */}
          {activeTab === 'reply' && (
            <div className="space-y-5">
              
              {/* Release notification header */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                bug.status === 'RESOLVED' 
                  ? 'bg-emerald-50 border-emerald-300 dark:bg-accent-mint/10 dark:border-accent-mint/30' 
                  : 'bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30'
              }`}>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className={bug.status === 'RESOLVED' ? "text-emerald-600 dark:text-accent-mint" : "text-amber-600 dark:text-amber-400"} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {bug.status === 'RESOLVED' ? "Issue Marked Resolved: Ready to Win Back Ratings" : "Issue Under Active Investigation"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {bug.status === 'RESOLVED' 
                        ? "Responding to past 1-star reviews after shipping a fix recovers up to 40% of reviews into 5 stars."
                        : "Notify reviewers that an engineer is actively fixing their complaint."}
                    </p>
                  </div>
                </div>

                {/* Tone Selector */}
                <div className="flex items-center gap-1 bg-white dark:bg-surface-inset p-1 rounded-lg border border-slate-200 dark:border-white/5 text-[11px] font-mono">
                  {['friendly', 'formal', 'quick'].map(t => (
                    <button
                      key={t}
                      onClick={() => setReplyTone(t)}
                      className={`px-2 py-0.5 rounded capitalize font-medium transition ${
                        replyTone === t 
                          ? 'bg-emerald-600 text-white dark:bg-accent-mint dark:text-slate-950 font-bold' 
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Master Reply Template */}
              <div className="p-4 glass-card rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                    Master Reply Template ({replyTone}):
                  </span>
                  <button
                    onClick={handleCopyReply}
                    className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-accent-mint hover:underline flex items-center gap-1"
                  >
                    {copiedReply ? <Check size={12} /> : <Copy size={12} />}
                    {copiedReply ? "Copied!" : "Copy Master"}
                  </button>
                </div>
                <textarea
                  value={storeReply}
                  onChange={(e) => setStoreReply(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-accent-mint transition leading-relaxed"
                />
              </div>

              {/* Per-Reviewer 1-Click Dispatch List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  1-Click Dispatch to Reviewers ({reviews.length})
                </h4>

                {reviews.map(rev => {
                  const isDispatched = dispatchedMap[rev.id];
                  return (
                    <div 
                      key={rev.id} 
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-surface-border bg-slate-50/50 dark:bg-surface-inset/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{rev.authorName}</span>
                          <span className="text-amber-500 font-mono text-[11px]">{rev.rating}★</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-mono text-[11px]">{rev.platform}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate italic mt-0.5 max-w-md">
                          "{rev.reviewText}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isDispatched && (
                          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-accent-mint flex items-center gap-1 bg-emerald-50 dark:bg-accent-mint/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-accent-mint/20">
                            ✓ Copied & Opened
                          </span>
                        )}
                        <button
                          onClick={() => handleDispatchForReview(rev)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-accent-mint dark:hover:bg-emerald-400 dark:text-slate-950 flex items-center gap-1.5 shadow-sm transition"
                          title="Copy personalized reply and open store review console"
                        >
                          <Send size={12} />
                          <span>Dispatch Reply</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-sidebar/90 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>Bug ID: <code className="text-emerald-600 dark:text-accent-mint font-bold">{bug.id}</code></span>
          <span>Created: {new Date(bug.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
