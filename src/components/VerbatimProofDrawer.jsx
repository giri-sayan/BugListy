import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Copy, Check, Star, 
  Terminal, MessageSquare, Cpu, Send, CheckCircle2
} from 'lucide-react';

export default function VerbatimProofDrawer({ bug, onClose, onUpdateStatus, allBugs }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'prompt' | 'reply'
  const [promptText, setPromptText] = useState('');
  const [copied, setCopied] = useState(false);
  const [storeReply, setStoreReply] = useState('');
  const [copiedReply, setCopiedReply] = useState(false);
  const [replyTone, setReplyTone] = useState('friendly'); // 'friendly' | 'formal' | 'quick'
  const [dispatchedMap, setDispatchedMap] = useState({});

  useEffect(() => {
    if (!bug) return;
    setLoading(true);
    fetch(`/api/bugs/${bug.id}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data || []);
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
        text = `Hi there! Thank you for reporting this issue. Our team resolved "${bugTitle}" in our latest release. Please update your app and let us know if everything is running smoothly.`;
      } else if (tone === 'formal') {
        text = `Thank you for your feedback. The reported issue regarding "${bugTitle}" has been resolved and deployed in the latest release.`;
      } else {
        text = `Update: "${bugTitle}" has been fixed in the latest release patch.`;
      }
    } else {
      if (tone === 'friendly') {
        text = `Hi! Thanks for reporting this. We've reproduced "${bugTitle}" and are actively working on a fix now.`;
      } else if (tone === 'formal') {
        text = `Thank you for contacting us. Your report regarding "${bugTitle}" is currently under active investigation by our engineering team.`;
      } else {
        text = `We are investigating "${bugTitle}". A patch is underway.`;
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

  const severityLabels = {
    CRITICAL: { label: 'Critical', color: 'text-semantic-negative-light dark:text-semantic-negative-dark bg-red-500/10' },
    HIGH: { label: 'High', color: 'text-semantic-warning-light dark:text-semantic-warning-dark bg-amber-500/10' },
    MEDIUM: { label: 'Medium', color: 'text-ink-secondary-light dark:text-ink-secondary-dark bg-surface-raised-light dark:bg-surface-raised-dark' },
    LOW: { label: 'Low', color: 'text-ink-muted-light dark:text-ink-muted-dark bg-surface-raised-light dark:bg-surface-raised-dark' }
  };

  const isUser = bug.originType === 'USER_REPORTED';
  const sev = severityLabels[bug.severity] || severityLabels.MEDIUM;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-xl bg-sidebar-light dark:bg-sidebar-dark border-l border-surface-border-light dark:border-surface-border-dark flex flex-col h-full transition-colors duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-surface-border-light dark:border-surface-border-dark flex items-start justify-between">
          <div className="space-y-2 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-ink-muted-light dark:text-ink-muted-dark tabular">
                {isUser ? `BL-USR-${bug.id.slice(-3)}` : `BL-INT-${bug.id.slice(-3)}`}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${sev.color}`}>
                {sev.label}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono surface-raised text-ink-secondary-light dark:text-ink-secondary-dark">
                {isUser ? 'Customer report' : 'Internal bug'}
              </span>
              {bug.reportCount && (
                <span className="text-[11px] font-mono tabular text-ink-muted-light dark:text-ink-muted-dark">
                  {bug.reportCount} reports
                </span>
              )}
            </div>

            <h2 className="text-base font-medium text-ink-primary-light dark:text-ink-primary-dark leading-snug">
              {bug.title}
            </h2>

            {/* Status Control */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-xs text-ink-muted-light dark:text-ink-muted-dark">Status:</span>
              <div className="flex items-center gap-1 bg-surface-inset-light dark:bg-surface-inset-dark p-0.5 rounded-lg border border-surface-border-light dark:border-surface-border-dark">
                {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(bug.id, st)}
                    className={`h-6 px-2 text-xs rounded transition-colors duration-140 ${
                      bug.status === st 
                        ? 'bg-canvas-light dark:bg-surface-raised-dark text-ink-primary-light dark:text-ink-primary-dark font-medium shadow-xs'
                        : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                    }`}
                  >
                    {st === 'RESOLVED' ? 'Resolved' : st === 'IN_PROGRESS' ? 'In progress' : 'Open'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark rounded-md hover:bg-surface-raised-light dark:hover:bg-surface-raised-dark transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-surface-border-light dark:border-surface-border-dark px-5">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`h-9 px-3 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-ink-primary-light dark:border-ink-primary-dark text-ink-primary-light dark:text-ink-primary-dark'
                : 'border-transparent text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
            }`}
          >
            <MessageSquare size={13} strokeWidth={1.5} />
            <span>Citations ({reviews.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`h-9 px-3 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'prompt'
                ? 'border-ink-primary-light dark:border-ink-primary-dark text-ink-primary-light dark:text-ink-primary-dark'
                : 'border-transparent text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
            }`}
          >
            <Terminal size={13} strokeWidth={1.5} />
            <span>Developer prompt</span>
          </button>
          <button
            onClick={() => setActiveTab('reply')}
            className={`h-9 px-3 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'reply'
                ? 'border-ink-primary-light dark:border-ink-primary-dark text-ink-primary-light dark:text-ink-primary-dark'
                : 'border-transparent text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
            }`}
          >
            <Send size={13} strokeWidth={1.5} />
            <span>Release reply</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* TAB 1: CITATIONS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg surface-inset space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                  <Cpu size={13} strokeWidth={1.5} />
                  <span>Technical diagnosis</span>
                </div>
                <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark leading-relaxed font-mono">
                  {bug.technicalSummary}
                </p>
                {bug.devLogs && (
                  <div className="pt-2 border-t border-surface-border-light dark:border-surface-border-dark">
                    <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark block mb-1">
                      Attached devlogs:
                    </span>
                    <pre className="p-2 rounded bg-canvas-dark text-ink-muted-dark text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">
                      {bug.devLogs}
                    </pre>
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-medium text-ink-muted-light dark:text-ink-muted-dark">
                  Customer citations ({reviews.length})
                </h3>

                {loading ? (
                  <div className="py-12 text-center text-ink-muted-light dark:text-ink-muted-dark text-xs font-mono">
                    Loading citations...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="p-6 text-center text-ink-muted-light dark:text-ink-muted-dark text-xs surface-card rounded-lg">
                    No citations directly attached to this issue.
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="p-3.5 rounded-lg surface-card space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink-primary-light dark:text-ink-primary-dark">{rev.authorName}</span>
                          <span className="text-ink-muted-light dark:text-ink-muted-dark">·</span>
                          <span className="text-ink-muted-light dark:text-ink-muted-dark text-[11px] font-mono">{rev.platform}</span>
                          {rev.appVersion && (
                            <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
                              {rev.appVersion}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              strokeWidth={1.5}
                              className={i < (rev.rating || 1) ? "fill-amber-500" : "text-surface-border-light dark:text-surface-border-dark"}
                            />
                          ))}
                        </div>
                      </div>

                      <blockquote className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark italic border-l-2 border-accent/60 pl-3 leading-relaxed surface-inset p-2.5 rounded-r">
                        "{rev.reviewText}"
                      </blockquote>

                      <div className="flex items-center justify-between text-[11px] text-ink-muted-light dark:text-ink-muted-dark pt-0.5 font-mono text-[10px]">
                        <span>{rev.deviceInfo || 'Standard client'}</span>
                        {rev.storeUrl && (
                          <a 
                            href={rev.storeUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition-colors"
                          >
                            <span>Verify source</span>
                            <ExternalLink size={10} strokeWidth={1.5} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROMPT GENERATOR */}
          {activeTab === 'prompt' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">Prompt generator</h3>
                  <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">Copy directly into Cursor Composer or Claude Code</p>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="h-7 px-2.5 bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark rounded-md text-xs font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90"
                >
                  {copied ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={1.5} />}
                  <span>{copied ? "Copied" : "Copy prompt"}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-canvas-dark text-ink-muted-dark border border-surface-border-dark rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[420px]">
                {promptText || "Generating prompt..."}
              </pre>
            </div>
          )}

          {/* TAB 3: RELEASE REPLY */}
          {activeTab === 'reply' && (
            <div className="space-y-4">
              
              <div className="p-3 rounded-lg surface-inset flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-ink-primary-light dark:text-ink-primary-dark">
                    {bug.status === 'RESOLVED' ? "Issue resolved" : "Under investigation"}
                  </h4>
                  <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
                    Reply template to close the loop with reviewers on app stores
                  </p>
                </div>

                {/* Tone switch */}
                <div className="flex items-center gap-0.5 bg-canvas-light dark:bg-surface-raised-dark p-0.5 rounded-md border border-surface-border-light dark:border-surface-border-dark text-[11px]">
                  {['friendly', 'formal', 'quick'].map(t => (
                    <button
                      key={t}
                      onClick={() => setReplyTone(t)}
                      className={`h-5 px-1.5 rounded capitalize transition-colors ${
                        replyTone === t 
                          ? 'surface-raised font-medium text-ink-primary-light dark:text-ink-primary-dark' 
                          : 'text-ink-muted-light dark:text-ink-muted-dark'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Master Reply */}
              <div className="p-3.5 surface-card rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                    Reply draft
                  </span>
                  <button
                    onClick={handleCopyReply}
                    className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-1"
                  >
                    {copiedReply ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedReply ? "Copied" : "Copy draft"}</span>
                  </button>
                </div>
                <textarea
                  value={storeReply}
                  onChange={(e) => setStoreReply(e.target.value)}
                  rows={4}
                  className="w-full bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-md p-2.5 text-xs text-ink-primary-light dark:text-ink-primary-dark focus:outline-none leading-relaxed resize-none"
                />
              </div>

              {/* Per-Reviewer Dispatch */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-ink-muted-light dark:text-ink-muted-dark">
                  Dispatch to reviewers ({reviews.length})
                </h4>

                {reviews.map(rev => {
                  const isDispatched = dispatchedMap[rev.id];
                  return (
                    <div 
                      key={rev.id} 
                      className="p-3 rounded-lg surface-raised flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-ink-primary-light dark:text-ink-primary-dark">{rev.authorName}</span>
                          <span className="text-ink-muted-light dark:text-ink-muted-dark font-mono text-[10px] tabular">{rev.rating}★</span>
                          <span className="text-ink-muted-light dark:text-ink-muted-dark font-mono text-[10px]">{rev.platform}</span>
                        </div>
                        <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark truncate italic mt-0.5 max-w-sm">
                          "{rev.reviewText}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isDispatched && (
                          <span className="text-[10px] font-mono text-accent">
                            Dispatched
                          </span>
                        )}
                        <button
                          onClick={() => handleDispatchForReview(rev)}
                          className="h-6 px-2.5 rounded surface-card hover:bg-canvas-light dark:hover:bg-canvas-dark text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark flex items-center gap-1 transition-colors"
                          title="Copy reply and open store console"
                        >
                          <Send size={11} strokeWidth={1.5} />
                          <span>Dispatch</span>
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
        <div className="p-3.5 border-t border-surface-border-light dark:border-surface-border-dark flex items-center justify-between text-[11px] text-ink-muted-light dark:text-ink-muted-dark font-mono tabular">
          <span>ID: {bug.id}</span>
          <span>Created: {new Date(bug.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
