import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Terminal, Copy, Check, ExternalLink, Layers, Bug, 
  ShieldAlert, Zap, CheckCircle2, Smartphone, Code, FileCode, 
  ArrowRight, ChevronRight, Play, Filter, Search, Rocket, 
  Workflow, Puzzle, BookOpen, AlertCircle
} from 'lucide-react';
import { 
  CLAUDE_SKILLS, 
  CLAUDE_WORKFLOWS_DATA, 
  getRecommendedSkillForBug 
} from '../data/claudeSkillsData';

export default function ClaudeSkillsStudioView({ bugs = [], onSelectBug }) {
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [activeSkillId, setActiveSkillId] = useState('debugging-wizard');
  const [outputFormat, setOutputFormat] = useState('cli'); // 'cli' | 'prompt' | 'minimal'
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [promptData, setPromptData] = useState(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  // Default selection to first active critical or user bug
  useEffect(() => {
    if (!selectedBugId && bugs.length > 0) {
      const topBug = bugs.find(b => b.severity === 'CRITICAL') || bugs.find(b => b.originType === 'USER_REPORTED') || bugs[0];
      if (topBug) {
        setSelectedBugId(topBug.id);
        const rec = getRecommendedSkillForBug(topBug);
        setActiveSkillId(rec.id);
      }
    }
  }, [bugs, selectedBugId]);

  const selectedBug = useMemo(() => {
    return bugs.find(b => b.id === selectedBugId) || bugs[0] || null;
  }, [bugs, selectedBugId]);

  // When bug changes, update active skill to recommended
  const handleSelectBug = (bug) => {
    setSelectedBugId(bug.id);
    const rec = getRecommendedSkillForBug(bug);
    setActiveSkillId(rec.id);
  };

  // Fetch or generate prompt
  useEffect(() => {
    if (!selectedBug) return;
    setLoadingPrompt(true);
    fetch(`/api/bugs/${selectedBug.id}/cursor-prompt?skill=${activeSkillId}`)
      .then(res => res.json())
      .then(data => {
        setPromptData(data);
        setLoadingPrompt(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPrompt(false);
      });
  }, [selectedBug, activeSkillId]);

  const activeSkill = useMemo(() => {
    return CLAUDE_SKILLS.find(s => s.id === activeSkillId) || CLAUDE_SKILLS[0];
  }, [activeSkillId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('/plugin marketplace add jeffallan/claude-skills\n/plugin install fullstack-dev-skills@fullstack-dev-skills');
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  // Filter bugs by skill or search
  const filteredBugs = useMemo(() => {
    return bugs.filter(b => {
      const rec = getRecommendedSkillForBug(b);
      if (skillFilter !== 'ALL' && rec.id !== skillFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = (b.title || '').toLowerCase().includes(q) || 
                        (b.technicalSummary || '').toLowerCase().includes(q) ||
                        (rec.name || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [bugs, skillFilter, searchQuery]);

  const getSkillIcon = (iconName) => {
    switch(iconName) {
      case 'Bug': return <Bug size={13} strokeWidth={1.5} />;
      case 'Smartphone': return <Smartphone size={13} strokeWidth={1.5} />;
      case 'Code': return <Code size={13} strokeWidth={1.5} />;
      case 'Layers': return <Layers size={13} strokeWidth={1.5} />;
      case 'ShieldAlert': return <ShieldAlert size={13} strokeWidth={1.5} />;
      case 'Zap': return <Zap size={13} strokeWidth={1.5} />;
      case 'CheckCircle': return <CheckCircle2 size={13} strokeWidth={1.5} />;
      case 'Terminal': return <Terminal size={13} strokeWidth={1.5} />;
      default: return <Sparkles size={13} strokeWidth={1.5} />;
    }
  };

  const currentDisplayPrompt = useMemo(() => {
    if (!promptData) return "Generating prompt...";
    if (outputFormat === 'cli') return promptData.cliCommand;
    if (outputFormat === 'minimal') return promptData.minimalPrompt;
    return promptData.prompt;
  }, [promptData, outputFormat]);

  return (
    <div className="space-y-6 max-w-7xl pb-12 animate-fadeIn">
      
      {/* 1. HERO BANNER: CLAUDE SKILLS WORKBENCH */}
      <div className="relative rounded-2xl surface-card p-6 border border-surface-border-light dark:border-surface-border-dark overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-accent/10 text-accent font-medium border border-accent/20">
                <Sparkles size={12} />
                <span>Powered by jeffallan/claude-skills</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono surface-raised text-ink-muted-light dark:text-ink-muted-dark">
                67 Skills & 9 Workflows
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono surface-raised text-ink-muted-light dark:text-ink-muted-dark">
                Progressive Disclosure
              </span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
              Claude Skills Pair-Programmer Studio
            </h2>
            
            <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark leading-relaxed">
              Bridge the gap between noisy customer app store reviews and surgical AI code fixes. BugListy automatically extracts reproduction vectors, pairs each defect with its ideal Claude Skill persona, and compiles ready-to-run CLI commands for Claude Code and Cursor.
            </p>
          </div>

          {/* Quick Install Pill */}
          <div className="surface-inset p-3.5 rounded-xl border border-surface-border-light dark:border-surface-border-dark space-y-2 shrink-0 md:w-80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-ink-muted-light dark:text-ink-muted-dark">Claude Code Plugin Install:</span>
              <button 
                onClick={handleCopyInstall}
                className="text-[11px] text-accent hover:underline flex items-center gap-1 font-mono"
              >
                {copiedInstall ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedInstall ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="bg-canvas-dark p-2 rounded text-[10px] font-mono text-ink-muted-dark overflow-x-auto select-all">
              /plugin install fullstack-dev-skills@fullstack-dev-skills
            </div>
            <a 
              href="https://jeffallan.github.io/claude-skills" 
              target="_blank" 
              rel="noreferrer"
              className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center justify-between pt-1 transition-colors"
            >
              <span>View Official Documentation</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE SPLIT: BUG DISPATCH MATRIX + LIVE PROMPT TERMINAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: ACTIVE BUGS DISPATCH LIST (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark">
                Active Bug Routing ({filteredBugs.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
              100% Routed
            </span>
          </div>

          {/* Search & Skill Pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted-light dark:text-ink-muted-dark" />
              <input
                type="text"
                placeholder="Search bugs or skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-7 bg-surface-inset-light dark:bg-surface-inset-dark border border-surface-border-light dark:border-surface-border-dark rounded-lg pl-7 pr-2.5 text-xs text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark focus:outline-none font-mono"
              />
            </div>

            {/* Quick Skill Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              <button
                onClick={() => setSkillFilter('ALL')}
                className={`h-6 px-2 rounded-md font-mono shrink-0 transition-colors ${
                  skillFilter === 'ALL'
                    ? 'bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark font-medium'
                    : 'surface-raised text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                }`}
              >
                All
              </button>
              {CLAUDE_SKILLS.slice(0, 5).map(sk => (
                <button
                  key={sk.id}
                  onClick={() => setSkillFilter(skillFilter === sk.id ? 'ALL' : sk.id)}
                  className={`h-6 px-2 rounded-md font-mono shrink-0 transition-colors flex items-center gap-1 ${
                    skillFilter === sk.id
                      ? 'bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark font-medium'
                      : 'surface-raised text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                  }`}
                >
                  {getSkillIcon(sk.iconName)}
                  <span>{sk.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bug Card List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredBugs.length === 0 ? (
              <div className="p-8 text-center surface-card rounded-xl text-ink-muted-light dark:text-ink-muted-dark text-xs font-mono">
                No issues match the selected skill filter.
              </div>
            ) : (
              filteredBugs.map(b => {
                const isSelected = selectedBug?.id === b.id;
                const rec = getRecommendedSkillForBug(b);
                const isUser = b.originType === 'USER_REPORTED';

                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBug(b)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-140 space-y-2 ${
                      isSelected
                        ? 'surface-raised border-accent/40 shadow-xs ring-1 ring-accent/20'
                        : 'surface-card border-surface-border-light dark:border-surface-border-dark hover:border-ink-muted-light/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className={`text-[11px] font-medium ${isUser ? 'text-accent' : 'text-ink-muted-light dark:text-ink-muted-dark'}`}>
                          {isUser ? `BL-USR-${b.id.slice(-3)}` : `BL-INT-${b.id.slice(-3)}`}
                        </span>
                        <span className="text-ink-muted-light dark:text-ink-muted-dark">·</span>
                        <span className="text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                          {b.platform ? b.platform.replace('_', ' ') : 'all'}
                        </span>
                      </div>

                      {/* Matched Claude Skill Pill */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${rec.badgeColor || 'surface-raised'}`}>
                        {getSkillIcon(rec.iconName)}
                        <span>{rec.name}</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark leading-snug line-clamp-1">
                      {b.title}
                    </h4>

                    <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark line-clamp-2 surface-inset p-2 rounded leading-relaxed font-mono">
                      {b.technicalSummary}
                    </p>

                    <div className="flex items-center justify-between pt-0.5 text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
                      <span>{b.reportCount || 1} report(s)</span>
                      <span className="text-accent flex items-center gap-1 group-hover:underline">
                        <span>Deploy in studio</span>
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE CLAUDE CODE PROMPT STUDIO (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {selectedBug ? (
            <div className="surface-card rounded-2xl border border-surface-border-light dark:border-surface-border-dark p-5 space-y-4">
              
              {/* Studio Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-border-light dark:border-surface-border-dark">
                <div className="space-y-1 max-w-[80%]">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono text-accent font-medium">
                      {selectedBug.originType === 'USER_REPORTED' 
                        ? `BL-USR-${selectedBug.id.slice(-3)}` 
                        : `BL-INT-${selectedBug.id.slice(-3)}`}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono surface-raised text-ink-muted-light dark:text-ink-muted-dark">
                      {selectedBug.platform || 'Cross-Platform'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-500/10 text-semantic-negative-light dark:text-semantic-negative-dark">
                      {selectedBug.severity}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
                    {selectedBug.title}
                  </h3>
                </div>

                {onSelectBug && (
                  <button
                    onClick={() => onSelectBug(selectedBug)}
                    className="h-7 px-2.5 rounded-lg surface-raised text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-1 transition-colors"
                    title="View user citations & proof drawer"
                  >
                    <span>Citations</span>
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>

              {/* RATIONALE BANNER */}
              <div className="surface-inset p-3 rounded-xl border border-surface-border-light dark:border-surface-border-dark flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-accent/15 text-accent shrink-0 mt-0.5">
                  <Sparkles size={13} />
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink-primary-light dark:text-ink-primary-dark">
                      Skill Recommendation:
                    </span>
                    <span className="font-mono text-accent font-medium">
                      {activeSkill.name} ({activeSkill.command})
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark leading-relaxed">
                    {promptData?.analysis?.reasoning || activeSkill.description}
                  </p>
                </div>
              </div>

              {/* SKILL SELECTOR PILLS */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-ink-muted-light dark:text-ink-muted-dark">
                  Target Claude Skill Persona:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CLAUDE_SKILLS.slice(0, 6).map(sk => {
                    const isRec = sk.id === activeSkillId;
                    return (
                      <button
                        key={sk.id}
                        onClick={() => setActiveSkillId(sk.id)}
                        className={`h-7 px-2.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                          isRec
                            ? 'bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark border-transparent shadow-xs'
                            : 'surface-card border-surface-border-light dark:border-surface-border-dark text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                        }`}
                      >
                        {getSkillIcon(sk.iconName)}
                        <span>{sk.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OUTPUT FORMAT TABS + COPY ACTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-surface-inset-light dark:bg-surface-inset-dark p-0.5 rounded-lg border border-surface-border-light dark:border-surface-border-dark text-xs">
                    <button
                      onClick={() => setOutputFormat('cli')}
                      className={`h-6 px-2.5 rounded-md font-medium transition-colors ${
                        outputFormat === 'cli'
                          ? 'bg-canvas-light dark:bg-surface-raised-dark text-ink-primary-light dark:text-ink-primary-dark shadow-xs'
                          : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                      }`}
                    >
                      Claude CLI Command
                    </button>
                    <button
                      onClick={() => setOutputFormat('prompt')}
                      className={`h-6 px-2.5 rounded-md font-medium transition-colors ${
                        outputFormat === 'prompt'
                          ? 'bg-canvas-light dark:bg-surface-raised-dark text-ink-primary-light dark:text-ink-primary-dark shadow-xs'
                          : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                      }`}
                    >
                      Context-Engineered Prompt
                    </button>
                    <button
                      onClick={() => setOutputFormat('minimal')}
                      className={`h-6 px-2.5 rounded-md font-medium transition-colors ${
                        outputFormat === 'minimal'
                          ? 'bg-canvas-light dark:bg-surface-raised-dark text-ink-primary-light dark:text-ink-primary-dark shadow-xs'
                          : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                      }`}
                    >
                      One-Liner
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(currentDisplayPrompt)}
                    className="h-7 px-3 bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark rounded-lg text-xs font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90 shadow-xs"
                  >
                    {copied ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={1.5} />}
                    <span>{copied ? "Copied" : "Copy to clipboard"}</span>
                  </button>
                </div>

                {/* THE TERMINAL / PROMPT CONTAINER */}
                <div className="relative rounded-xl border border-surface-border-dark bg-canvas-dark p-4 overflow-hidden">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-border-dark/60 text-[10px] font-mono text-ink-muted-dark">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="pl-2">claude-code — {activeSkill.command}</span>
                    </div>
                    <span>{outputFormat.toUpperCase()}</span>
                  </div>

                  <pre className="text-xs font-mono text-ink-muted-dark leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[380px] selection:bg-accent/30 selection:text-white">
                    {loadingPrompt ? "Generating Claude Skill prompt..." : currentDisplayPrompt}
                  </pre>
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-muted-light dark:text-ink-muted-dark font-mono pt-1">
                  <span>Target CLI: <code className="text-accent">claude &lt;prompt&gt;</code></span>
                  <span>Active Skill Ref: <a href={activeSkill.docsUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">{activeSkill.command}</a></span>
                </div>
              </div>

            </div>
          ) : (
            <div className="surface-card rounded-2xl p-12 text-center text-ink-muted-light dark:text-ink-muted-dark font-mono text-xs">
              Select a bug from the matrix on the left to inspect its Claude Skill pairing.
            </div>
          )}

        </div>

      </div>

      {/* 3. MULTI-SKILL WORKFLOW EXPLORER (FROM JEFFALLAN/CLAUDE-SKILLS) */}
      <div className="surface-card rounded-2xl border border-surface-border-light dark:border-surface-border-dark p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Workflow size={14} className="text-accent" />
              <h3 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
                Proven Claude Skills Workflows
              </h3>
            </div>
            <p className="text-xs text-ink-muted-light dark:text-ink-muted-dark">
              How BugListy structures progressive disclosure across multi-skill fullstack workflows
            </p>
          </div>
          <span className="text-xs font-mono text-accent">
            jeffallan/claude-skills standards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CLAUDE_WORKFLOWS_DATA.map(wf => (
            <div 
              key={wf.id}
              className="surface-inset p-4 rounded-xl border border-surface-border-light dark:border-surface-border-dark space-y-3"
            >
              <div>
                <h4 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark flex items-center gap-1.5">
                  <span>{wf.title}</span>
                </h4>
                <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark pt-0.5">
                  {wf.subtitle}
                </p>
              </div>

              {/* Steps timeline */}
              <div className="space-y-1.5 pt-1">
                {wf.steps.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-md surface-raised text-[10px] font-mono flex items-center justify-center font-medium text-ink-muted-light dark:text-ink-muted-dark shrink-0">
                      {st.num}
                    </span>
                    <span className="font-mono text-accent text-[11px] font-medium shrink-0">
                      {st.name}
                    </span>
                    <span className="text-ink-muted-light dark:text-ink-muted-dark text-[10px] truncate">
                      — {st.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SKILLS REFERENCE DIRECTORY */}
      <div className="surface-card rounded-2xl border border-surface-border-light dark:border-surface-border-dark p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-accent" />
            <h3 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
              Claude Skills Directory Reference
            </h3>
          </div>
          <a
            href="https://github.com/jeffallan/claude-skills"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
          >
            <span>GitHub Repository (12k+ stars)</span>
            <ExternalLink size={11} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CLAUDE_SKILLS.map(sk => (
            <div 
              key={sk.id}
              className="p-3.5 rounded-xl surface-inset border border-surface-border-light dark:border-surface-border-dark space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${sk.badgeColor || 'surface-raised'}`}>
                  {getSkillIcon(sk.iconName)}
                  <span>{sk.name}</span>
                </span>
                <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
                  {sk.category}
                </span>
              </div>

              <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark leading-relaxed">
                {sk.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-surface-border-light dark:border-surface-border-dark text-[10px] font-mono">
                <code className="text-accent">{sk.command}</code>
                <a
                  href={sk.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-0.5"
                >
                  <span>docs</span>
                  <ExternalLink size={9} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
