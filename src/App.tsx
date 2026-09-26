import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Cpu,
  Layers,
  GraduationCap,
  FileText,
  ExternalLink,
  ShieldCheck,
  Zap,
  Code2,
  Download,
  Copy,
  Check,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Share2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { PaperAnalysis, StudentProjectIdea } from './types/paper';
import { PRESET_PAPERS, PresetPaper } from './data/presetPapers';
import { MermaidViewer } from './components/MermaidViewer';
import { ProjectScaffoldModal } from './components/ProjectScaffoldModal';
import { AskAgentDrawer } from './components/AskAgentDrawer';

// Rich default initial state for FlashAttention
const INITIAL_DEMO_PAPER: PaperAnalysis = {
  paperTitle: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
  authors: ['Tri Dao', 'Daniel Y. Fu', 'Stefano Ermon', 'Atri Rudra', 'Christopher Ré'],
  year: '2022',
  venueOrArxiv: 'arXiv:2205.14135 (NeurIPS 2022)',
  url: 'https://arxiv.org/abs/2205.14135',
  oneLineHook: 'IO-aware exact attention algorithm computing softmax and matrix multiplication with sub-quadratic memory reads/writes between GPU HBM and SRAM.',
  coreConcept: {
    problemStatement:
      'Standard Multi-Head Attention scales quadratically in time and memory with sequence length O(N²). Modern GPUs spend most time reading and writing the intermediate N×N attention matrix to slow High-Bandwidth Memory (HBM) rather than performing arithmetic in fast SRAM.',
    methodology:
      'FlashAttention reorganizes attention computation to be IO-aware. It splits the input Query, Key, and Value matrices into blocks, loads them into fast GPU on-chip SRAM, computes attention with an incremental online softmax reduction, and computes gradients without storing the N×N intermediate matrix by recomputing it on the fly during backward passes.',
    mathematicalBreakthroughs:
      'Online Softmax formulation allowing the scaling denominator to be updated iteratively across block increments (m_new = max(m_prev, row_max), l_new = exp(m_prev - m_new) * l_prev + row_sum), completely bypassing the need to materialize the full N×N attention matrix in GPU memory.',
    summaryText:
      'FlashAttention tackles the primary memory bottleneck of transformers: slow data transfers between GPU high-bandwidth memory (HBM) and fast on-chip SRAM. Rather than materializing the full N-by-N attention matrix in slow memory, FlashAttention tiles the input matrices into smaller blocks and computes exact attention using an iterative online softmax algorithm. It never stores the large attention matrix in global memory, instead recomputing it during the backward pass. This cuts memory IO from quadratic O(N²) to linear O(N), delivering 2x to 4x speedups and allowing models to scale to significantly longer sequence lengths without any accuracy approximations.',
    wordCount: 104,
  },
  mermaidFlowchart: `graph TD
    subgraph Inputs
      Q[Query Matrix Q in HBM]
      K[Key Matrix K in HBM]
      V[Value Matrix V in HBM]
    end

    subgraph GPU_SRAM_Tiling [On-Chip GPU SRAM Processing]
      Tiler[IO-Aware Block Tiler]
      Qi[Load Block Qi into SRAM]
      Kj[Load Block Kj into SRAM]
      Vj[Load Block Vj into SRAM]
      S_ij[Compute Local Scores S_ij = Qi * Kj^T / sqrt d]
      OnlineSoftmax[Online Softmax: Update running max & sum without full matrix]
      O_accum[Accumulate Output Block Oi in SRAM]
    end

    subgraph Outputs
      O_final[Final Attention Output O in HBM]
      Stats[Online Softmax Stats m, l for Backward Pass]
    end

    Q --> Tiler
    K --> Tiler
    V --> Tiler
    Tiler --> Qi
    Tiler --> Kj
    Tiler --> Vj
    Qi --> S_ij
    Kj --> S_ij
    S_ij --> OnlineSoftmax
    Vj --> O_accum
    OnlineSoftmax --> O_accum
    O_accum --> O_final
    OnlineSoftmax --> Stats`,
  futureWorkAndInternships: [
    {
      id: 'project-1',
      title: 'Lightweight Mamba-Flash Hybrid for Edge Devices',
      exactExtension:
        'Replacing standard self-attention in the lower transformer blocks with a hardware-fused selective State Space (Mamba) block, while retaining FlashAttention only in upper layers for hierarchical edge inference.',
      targetedPerformanceMetric:
        '45% reduction in latency and 60% reduction in peak VRAM consumption on embedded edge platforms (e.g. Jetson Orin / Apple Silicon) with <0.5% perplexity degradation.',
      recommendedTechStack: ['PyTorch', 'ONNX Runtime', 'Triton', 'Hugging Face Transformers'],
      difficultyLevel: 'Intermediate',
      estimatedTimelineWeeks: 4,
      weeklyRoadmap: [
        'Week 1: Benchmark baseline FlashAttention transformer on Wikitext-103 using PyTorch profiler.',
        'Week 2: Implement hybrid module swapping alternating attention layers with Mamba SSM state projections.',
        'Week 3: Export the hybrid architecture to ONNX Runtime and optimize operator fusions for edge devices.',
        'Week 4: Benchmark tokens/sec, VRAM footprint, write GitHub documentation with latency charts.'
      ],
      interviewTalkingPoint:
        'Demonstrates mastery of hardware-level sequence bottlenecks, profiling GPU compute vs memory IO bound regimes, and orchestrating hybrid architectures for edge deployment constraints.',
      starterCodeSnippet: `import torch
import torch.nn as nn

class HybridFlashMambaBlock(nn.Module):
    def __init__(self, d_model, n_heads, use_ssm=False):
        super().__init__()
        self.use_ssm = use_ssm
        if use_ssm:
            # Lightweight selective linear recurrence
            self.proj = nn.Linear(d_model, d_model)
            self.state = nn.Parameter(torch.zeros(1, d_model))
        else:
            self.attn = nn.MultiheadAttention(d_model, n_heads, batch_first=True)
            
    def forward(self, x):
        if self.use_ssm:
            # Linear time state update
            return x + torch.relu(self.proj(x))
        return x + self.attn(x, x, x)[0]`,
      hardwareRequirements: 'Single free Google Colab T4 GPU or local 8GB+ GPU',
    },
    {
      id: 'project-2',
      title: 'FP8 / Int8 Quantized Tiling Kernel with Bit-Shift Softmax',
      exactExtension:
        'Quantizing the SRAM block representations from FP16 to FP8 E4M3 with calibrated clipping and bit-shift power-of-two approximations for the online softmax exponentiation.',
      targetedPerformanceMetric:
        '2.1x speedup in SRAM GEMM throughput and 50% memory bandwidth traffic reduction with minimal loss on Llama-3 8B zero-shot evals.',
      recommendedTechStack: ['PyTorch', 'Triton Kernel DSL', 'CUDA / C++', 'BitsAndBytes'],
      difficultyLevel: 'Advanced',
      estimatedTimelineWeeks: 4,
      weeklyRoadmap: [
        'Week 1: Write a pure Python reference of tiled online softmax with simulated FP8 quantizers.',
        'Week 2: Port the tiled logic to an elementary OpenAI Triton kernel with block size tuning (64x64 vs 128x128).',
        'Week 3: Benchmark SRAM bandwidth saturation and compute throughput against PyTorch standard F.scaled_dot_product_attention.',
        'Week 4: Package as a pip-installable library and publish reproducible benchmark scripts.'
      ],
      interviewTalkingPoint:
        'Showcases deep systems engineering capability: writing custom Triton GPU kernels, navigating low-precision numerical formats (FP8), and profiling memory memory hierarchies.',
      starterCodeSnippet: `@triton.jit
def _fused_quant_attention_kernel(
    Q, K, V, Out,
    sm_scale,
    stride_qz, stride_qh, stride_qm, stride_qk,
    BLOCK_M: tl.constexpr, BLOCK_N: tl.constexpr
):
    # Triton kernel with FP8 block accumulation
    tl.static_assert(BLOCK_M <= 128)
    # Loop over K, V blocks in SRAM...`,
      hardwareRequirements: 'Colab A100 or local RTX 4080/4090 with FP8 tensor core support',
    },
    {
      id: 'project-3',
      title: 'Sparse-Windowed IO-Aware Attention for Million-Token Audio Streams',
      exactExtension:
        'Extending FlashAttention with dynamic local sliding-window masks and landmark summary tokens specifically tailored for streaming 16kHz continuous audio spectrograms.',
      targetedPerformanceMetric:
        'Enabling 1M+ token context window processing in under 4GB VRAM with constant-time generation latency.',
      recommendedTechStack: ['PyTorch', 'Torchaudio', 'Hugging Face Datasets', 'Wandb'],
      difficultyLevel: 'Intermediate',
      estimatedTimelineWeeks: 3,
      weeklyRoadmap: [
        'Week 1: Profile Torchaudio Whisper attention patterns on long speech recordings.',
        'Week 2: Introduce block-sparse mask to the IO-aware tiler to skip irrelevant cross-block tiles.',
        'Week 3: Evaluate WER (Word Error Rate) vs latency savings across 1-hour audio files.'
      ],
      interviewTalkingPoint:
        'Combines practical domain application (speech/audio transformers) with algorithmic memory optimization to solve a real-world long-context inference challenge.',
      starterCodeSnippet: `def create_streaming_sparse_mask(seq_len, window_size=512):
    row_idx = torch.arange(seq_len).unsqueeze(-1)
    col_idx = torch.arange(seq_len).unsqueeze(0)
    return (row_idx - col_idx).abs() <= window_size`,
      hardwareRequirements: 'Consumer GPU (6GB+ VRAM)',
    },
  ],
  systemArchitectureNotes: {
    inputs: ['Query Tensor Q (B, H, N, d)', 'Key Tensor K (B, H, N, d)', 'Value Tensor V (B, H, N, d)'],
    layers: [
      'IO-Aware SRAM Block Tiler',
      'Tile Matrix Multiplications (Q_i * K_j^T)',
      'Incremental Online Softmax Rescaling',
      'Tile Output Accumulator (O_i += P_ij * V_j)',
      'Backward Pass Recomputation Engine'
    ],
    outputs: ['Attention Output Tensor O (B, H, N, d)', 'Logsumexp statistics vector (B, H, N)'],
    computationalComplexity: 'Time: O(N² d) FLOPs, IO: O(N d) memory accesses to HBM (sub-quadratic IO)',
  },
  tokenAudit: {
    promptTokens: 1240,
    completionTokens: 890,
    totalTokens: 2130,
    tokenLimit: 25000,
    tokenEfficiencyScore: 'Exceptional (<8k tokens)',
    durationMs: 1420,
  },
};

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [showPastedInput, setShowPastedInput] = useState(false);
  const [analysis, setAnalysis] = useState<PaperAnalysis>(INITIAL_DEMO_PAPER);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'concepts' | 'flowchart' | 'student-projects' | 'token-audit'>('concepts');
  const [selectedProject, setSelectedProject] = useState<StudentProjectIdea | null>(null);
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleAnalyze = async (overrideUrl?: string, overrideTitle?: string) => {
    const urlToUse = overrideUrl !== undefined ? overrideUrl : inputUrl;
    if (!urlToUse.trim() && !pastedText.trim() && !overrideTitle) {
      setErrorMessage('Please provide a research paper URL, title, or abstract text.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Engaging CS Research Agent & checking token constraints...');

    try {
      setStatusMessage('Ingesting paper context & parsing architectural layers...');
      const res = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToUse.trim(),
          paperText: pastedText.trim(),
          paperTitle: overrideTitle || '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze paper');
      }

      setStatusMessage('Generating syntactically valid Mermaid.js graph & student blueprints...');
      const data: PaperAnalysis = await res.json();
      setAnalysis(data);
      setActiveTab('concepts');
      if (overrideUrl) setInputUrl(overrideUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handlePresetSelect = (preset: PresetPaper) => {
    setInputUrl(preset.url);
    handleAnalyze(preset.url, preset.title);
  };

  const handleCopyMarkdown = () => {
    if (!analysis) return;
    const md = `# ${analysis.paperTitle}
**Authors:** ${analysis.authors.join(', ')} (${analysis.year})
**Venue:** ${analysis.venueOrArxiv} | **URL:** ${analysis.url}

## Core Concept Extraction
### Problem Statement
${analysis.coreConcept.problemStatement}

### Primary Methodology Introduced
${analysis.coreConcept.methodology}

### Key Mathematical/Algorithmic Breakthroughs
${analysis.coreConcept.mathematicalBreakthroughs}

### Accessible Summary (${analysis.coreConcept.wordCount} words)
${analysis.coreConcept.summaryText}

## Architectural Flowchart (Mermaid.js)
\`\`\`mermaid
[FLOWCHART]
${analysis.mermaidFlowchart}
\`\`\`

## Future Work & Student Internship Opportunities
${analysis.futureWorkAndInternships
  .map(
    (p, i) => `### Idea ${i + 1}: ${p.title}
- **Exact Extension:** ${p.exactExtension}
- **Targeted Performance Metric:** ${p.targetedPerformanceMetric}
- **Recommended Tech Stack:** ${p.recommendedTechStack.join(', ')}
- **Estimated Timeline:** ${p.estimatedTimelineWeeks} weeks (${p.difficultyLevel})
- **Interview Pitch:** ${p.interviewTalkingPoint}
`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopiedSection('markdown');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyLatex = () => {
    if (!analysis) return;
    const citeKey = (analysis.authors[0]?.split(' ').pop() || 'paper') + analysis.year;
    const latex = `@article{${citeKey.toLowerCase()},
  title = {${analysis.paperTitle}},
  author = {${analysis.authors.join(' and ')}},
  year = {${analysis.year}},
  eprint = {${analysis.venueOrArxiv}},
  url = {${analysis.url}}
}`;
    navigator.clipboard.writeText(latex);
    setCopiedSection('latex');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">PaperArchitect</span>
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                  CS Research Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                System Architecture Extraction & Student Development Workbench
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Strict Token Constraint Guard Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Token Guard: &lt;25,000 Cap Active</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <button
              onClick={() => setIsAgentDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition shadow-sm"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
              <span>Ask Agent</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Paper Input & Action Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-blue-400" />
                Input Research Paper URL, arXiv ID, or Paper Title
              </label>
              <button
                onClick={() => setShowPastedInput(!showPastedInput)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
              >
                {showPastedInput ? 'Hide Abstract Input' : '+ Paste Abstract / Draft Text'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="e.g. https://arxiv.org/abs/2205.14135 or 'FlashAttention' or arXiv ID"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <button
                onClick={() => handleAnalyze()}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Analyze Paper</span>
                  </>
                )}
              </button>
            </div>

            {/* Optional Pasted Text Area */}
            {showPastedInput && (
              <div className="mt-2">
                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste paper abstract or full text excerpt here if not available via public URL..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Loading Indicator with status progress */}
            {loading && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-300 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 animate-spin text-blue-400" />
                  <span>{statusMessage}</span>
                </div>
                <span className="font-mono text-[11px] text-blue-400">Token-efficient mode</span>
              </div>
            )}

            {/* Presets Row */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Benchmark Papers (Instant 1-Click Exploration):
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_PAPERS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:scale-105 active:scale-95 ${preset.badgeColor}`}
                  >
                    <span>{preset.shortName}</span>
                    <span className="text-[10px] opacity-75">({preset.year})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Paper Executive Summary Card */}
        {analysis && (
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                    {analysis.venueOrArxiv || 'Research Paper'}
                  </span>
                  <span className="rounded-md bg-slate-800 px-2.5 py-0.5 text-xs font-mono text-slate-300 border border-slate-700">
                    {analysis.year}
                  </span>
                  {analysis.url && (
                    <a
                      href={analysis.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Original Paper</span>
                    </a>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {analysis.paperTitle}
                </h1>

                <p className="text-xs text-slate-400 font-mono">
                  {analysis.authors.join(' • ')}
                </p>

                <p className="text-sm text-slate-300 italic">
                  &quot;{analysis.oneLineHook}&quot;
                </p>
              </div>

              {/* Action Buttons & Token Audit */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                  >
                    {copiedSection === 'markdown' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedSection === 'markdown' ? 'Copied MD!' : 'Export Markdown'}</span>
                  </button>

                  <button
                    onClick={handleCopyLatex}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                  >
                    {copiedSection === 'latex' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedSection === 'latex' ? 'Copied BibTeX!' : 'BibTeX'}</span>
                  </button>
                </div>

                {/* Token Audit Pill */}
                <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 text-xs">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="font-mono font-semibold">{analysis.tokenAudit.totalTokens.toLocaleString()}</span>
                  </div>
                  <span className="text-slate-500 font-mono">/ 25,000 tokens</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                    {analysis.tokenAudit.tokenEfficiencyScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
              <button
                onClick={() => setActiveTab('concepts')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === 'concepts'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>1. Core Concept Extraction</span>
                <span className="rounded-full bg-slate-900/60 px-1.5 py-0.2 text-[10px] text-blue-300">
                  &lt;300 Words
                </span>
              </button>

              <button
                onClick={() => setActiveTab('flowchart')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === 'flowchart'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>2. Architectural Flowchart</span>
                <span className="rounded-full bg-slate-900/60 px-1.5 py-0.2 text-[10px] text-emerald-300">
                  [FLOWCHART]
                </span>
              </button>

              <button
                onClick={() => setActiveTab('student-projects')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === 'student-projects'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>3. Student Internship Opportunities</span>
                <span className="rounded-full bg-slate-900/60 px-1.5 py-0.2 text-[10px] text-amber-300">
                  3 Resume Ideas
                </span>
              </button>

              <button
                onClick={() => setActiveTab('token-audit')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === 'token-audit'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Audit & Sources</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Core Concept Extraction */}
        {analysis && activeTab === 'concepts' && (
          <div className="space-y-6">
            {/* Plain Language Accessible Summary Pill */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300">
                    Accessible plain-language summary
                  </h3>
                </div>
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-mono text-blue-400 border border-blue-500/20">
                  {analysis.coreConcept.wordCount} words (Strict &lt;300 word limit met)
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {analysis.coreConcept.summaryText}
              </p>
            </div>

            {/* Tripartite Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Problem Statement */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">Problem Statement</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed flex-1">
                  {analysis.coreConcept.problemStatement}
                </p>
              </div>

              {/* Primary Methodology */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">Primary Methodology</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed flex-1">
                  {analysis.coreConcept.methodology}
                </p>
              </div>

              {/* Key Mathematical Breakthroughs */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">Mathematical Breakthroughs</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed flex-1 font-mono text-[11px]">
                  {analysis.coreConcept.mathematicalBreakthroughs}
                </p>
              </div>
            </div>

            {/* System Architectural Specification Notes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-blue-400" />
                System Components & Complexity Specification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Data Inputs:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {analysis.systemArchitectureNotes.inputs.map((inp, idx) => (
                      <li key={idx} className="truncate">{inp}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Model Layers:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {analysis.systemArchitectureNotes.layers.map((layer, idx) => (
                      <li key={idx} className="truncate">{layer}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Data Outputs:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {analysis.systemArchitectureNotes.outputs.map((out, idx) => (
                      <li key={idx} className="truncate">{out}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Complexity:</span>
                  <span className="font-mono text-emerald-400 block font-medium">
                    {analysis.systemArchitectureNotes.computationalComplexity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Architectural Flowchart (Mermaid.js) */}
        {analysis && activeTab === 'flowchart' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">System Architecture Flowchart</h3>
                <p className="text-xs text-slate-400">
                  Mermaid.js (graph TD) visual diagram charting components, data inputs, model layers, and data outputs.
                </p>
              </div>
            </div>

            <MermaidViewer
              chart={analysis.mermaidFlowchart}
              title={analysis.paperTitle}
            />
          </div>
        )}

        {/* Tab 3: Future Work & Student Internship Opportunities */}
        {analysis && activeTab === 'student-projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-amber-400" />
                  3 Resume-Defining Projects for 3rd-Year CS Students
                </h3>
                <p className="text-xs text-slate-400">
                  Concrete, realistic ways to build upon, extend, or optimize this research paper for competitive internship applications.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {analysis.futureWorkAndInternships.map((project, idx) => (
                <div
                  key={project.id || idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/10 text-xs font-bold text-blue-400 border border-blue-500/20">
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                          {project.difficultyLevel}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          {project.estimatedTimelineWeeks}w
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 leading-snug">
                      {project.title}
                    </h4>

                    {/* Exact Extension */}
                    <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Exact Extension
                      </span>
                      <p className="text-xs text-blue-200 leading-relaxed">
                        {project.exactExtension}
                      </p>
                    </div>

                    {/* Targeted Performance Metric */}
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Targeted Performance Metric
                      </span>
                      <p className="text-xs font-semibold text-emerald-400">
                        {project.targetedPerformanceMetric}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Recommended Tech Stack
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.recommendedTechStack.map((tech, i) => (
                          <span
                            key={i}
                            className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Interview Talking Point Preview */}
                    <div className="border-t border-slate-800/80 pt-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Tech Interview Talking Point
                      </span>
                      <p className="text-xs text-slate-300 line-clamp-3">
                        {project.interviewTalkingPoint}
                      </p>
                    </div>
                  </div>

                  {/* Scaffolding CTA Button */}
                  <div className="mt-5 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-2.5 text-xs font-semibold text-white shadow-md transition"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      <span>Generate Starter Code & Repo</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Token Efficiency & Literature Sources */}
        {analysis && activeTab === 'token-audit' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Token Efficiency & Operational Constraint Audit
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Under the system prompt constraint, all paper parsing, system architecture modeling, and tool execution MUST strictly stay well under 25,000 tokens.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <span className="text-slate-400 text-xs block mb-1">Prompt & Ingestion Tokens</span>
                  <span className="text-xl font-mono font-bold text-slate-200">
                    {analysis.tokenAudit.promptTokens.toLocaleString()}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <span className="text-slate-400 text-xs block mb-1">Completion Tokens</span>
                  <span className="text-xl font-mono font-bold text-slate-200">
                    {analysis.tokenAudit.completionTokens.toLocaleString()}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <span className="text-slate-400 text-xs block mb-1">Total Token Footprint</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono font-bold text-emerald-400">
                      {analysis.tokenAudit.totalTokens.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-slate-500">/ 25,000 max</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Budget Consumption</span>
                  <span className="text-emerald-400 font-semibold">
                    {((analysis.tokenAudit.totalTokens / 25000) * 100).toFixed(1)}% of 25,000 limit
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (analysis.tokenAudit.totalTokens / 25000) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Web Search Sources */}
            {analysis.searchSources && analysis.searchSources.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Grounding & Literature Search Citations
                </h4>
                <div className="space-y-2">
                  {analysis.searchSources.map((source, i) => (
                    <a
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800 hover:border-slate-700 text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      <span className="truncate pr-4">{source.title || source.uri}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Project Scaffolding Code Modal */}
      {selectedProject && (
        <ProjectScaffoldModal
          paperTitle={analysis?.paperTitle || 'Research Paper'}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Ask Agent Drawer */}
      {isAgentDrawerOpen && analysis && (
        <AskAgentDrawer
          analysis={analysis}
          onClose={() => setIsAgentDrawerOpen(false)}
        />
      )}
    </div>
  );
}
