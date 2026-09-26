import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, FileCode, BookOpen, Download, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { StudentProjectIdea, ProjectScaffold } from '../types/paper';

interface ProjectScaffoldModalProps {
  paperTitle: string;
  project: StudentProjectIdea | null;
  onClose: () => void;
}

export const ProjectScaffoldModal: React.FC<ProjectScaffoldModalProps> = ({ paperTitle, project, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [scaffold, setScaffold] = useState<ProjectScaffold | null>(null);
  const [activeTab, setActiveTab] = useState<'model' | 'benchmark' | 'readme' | 'interview'>('model');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    let isMounted = true;

    const fetchScaffold = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/scaffold-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paperTitle,
            projectTitle: project.title,
            exactExtension: project.exactExtension,
            recommendedTechStack: project.recommendedTechStack,
          }),
        });
        if (!res.ok) throw new Error('Failed to generate scaffold');
        const data = await res.json();
        if (isMounted) {
          setScaffold(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Error creating starter scaffold');
          setLoading(false);
        }
      }
    };

    fetchScaffold();
    return () => {
      isMounted = false;
    };
  }, [paperTitle, project]);

  if (!project) return null;

  const handleCopy = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownloadAll = () => {
    if (!scaffold) return;
    const bundle = `=== README.md ===\n${scaffold.readmeMarkdown}\n\n=== model.py ===\n${scaffold.modelCode}\n\n=== benchmark.py ===\n${scaffold.benchmarkCode}\n\n=== requirements.txt ===\n${scaffold.requirementsTxt}\n`;
    const blob = new Blob([bundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scaffold.projectName || 'student-project'}-starter.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  Student Project Blueprint & Code Scaffold
                </h3>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/20">
                  {project.difficultyLevel} • {project.estimatedTimelineWeeks} Weeks
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xl">
                {project.exactExtension}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
            <h4 className="text-sm font-semibold text-slate-200">
              Synthesizing Production PyTorch Scaffolding...
            </h4>
            <p className="mt-1 text-xs text-slate-400 max-w-md">
              Generating custom layer module, benchmarking script (latency & VRAM), README documentation, and tech interview talking points.
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        ) : scaffold ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Project Quick Overview Banner */}
            <div className="bg-slate-950/40 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400">Target Metric:</span>
                <span className="font-semibold text-emerald-400">{project.targetedPerformanceMetric}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {project.recommendedTechStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/20 px-6 pt-2">
              <div className="flex space-x-1">
                {[
                  { id: 'model', label: 'model.py', icon: FileCode },
                  { id: 'benchmark', label: 'benchmark.py', icon: Terminal },
                  { id: 'readme', label: 'README.md', icon: BookOpen },
                  { id: 'interview', label: 'Resume & Interview Pitch', icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-xs font-medium transition ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pb-2">
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Bundle
                </button>
              </div>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/60 font-mono text-xs">
              {activeTab === 'model' && (
                <div className="relative">
                  <div className="absolute right-2 top-2 z-10">
                    <button
                      onClick={() => handleCopy(scaffold.modelCode, 'model')}
                      className="flex items-center gap-1 rounded bg-slate-800/90 px-2.5 py-1 text-[11px] font-sans text-slate-300 hover:text-white border border-slate-700 transition shadow"
                    >
                      {copiedTab === 'model' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedTab === 'model' ? 'Copied' : 'Copy Python Code'}
                    </button>
                  </div>
                  <pre className="text-blue-300 leading-relaxed overflow-x-auto p-4 rounded-lg bg-slate-900 border border-slate-800">
                    {scaffold.modelCode || '# Code generation in progress'}
                  </pre>
                </div>
              )}

              {activeTab === 'benchmark' && (
                <div className="relative">
                  <div className="absolute right-2 top-2 z-10">
                    <button
                      onClick={() => handleCopy(scaffold.benchmarkCode, 'benchmark')}
                      className="flex items-center gap-1 rounded bg-slate-800/90 px-2.5 py-1 text-[11px] font-sans text-slate-300 hover:text-white border border-slate-700 transition shadow"
                    >
                      {copiedTab === 'benchmark' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedTab === 'benchmark' ? 'Copied' : 'Copy Benchmark Code'}
                    </button>
                  </div>
                  <pre className="text-emerald-300 leading-relaxed overflow-x-auto p-4 rounded-lg bg-slate-900 border border-slate-800">
                    {scaffold.benchmarkCode || '# Benchmark script in progress'}
                  </pre>
                </div>
              )}

              {activeTab === 'readme' && (
                <div className="relative font-sans text-slate-300 text-xs space-y-4">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => handleCopy(scaffold.readmeMarkdown, 'readme')}
                      className="flex items-center gap-1 rounded bg-slate-800/90 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white border border-slate-700 transition"
                    >
                      {copiedTab === 'readme' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedTab === 'readme' ? 'Copied' : 'Copy Markdown'}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-4 rounded-lg border border-slate-800">
                    {scaffold.readmeMarkdown}
                  </pre>
                </div>
              )}

              {activeTab === 'interview' && (
                <div className="font-sans space-y-6 text-slate-200">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">
                      Resume Bullet Point Formula
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/80 p-3 rounded border border-slate-800">
                      • Engineered a PyTorch extension of &quot;{paperTitle}&quot; implementing {project.exactExtension}, achieving {project.targetedPerformanceMetric} benchmarked across standard NLP/vision baselines using {project.recommendedTechStack.join(', ')}.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <h4 className="text-sm font-semibold text-slate-200 mb-2">
                      Technical Interview Talking Point (How to articulate this in 60s)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {project.interviewTalkingPoint}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <h4 className="text-sm font-semibold text-slate-200 mb-2">
                      4-Week Student Execution Roadmap
                    </h4>
                    <div className="space-y-2 mt-3">
                      {project.weeklyRoadmap.map((week, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-blue-400">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{week}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-emerald-400">✓</span> Designed specifically for 3rd-year CS students building industry-ready portfolios.
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
