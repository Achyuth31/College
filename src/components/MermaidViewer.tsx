import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Minimize2, Code2, Eye } from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  title?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, title = 'System Architecture Flowchart' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#090d16',
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#60a5fa',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        fontSize: '13px',
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false,
      },
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setError(null);

    const renderChart = async () => {
      if (!chart.trim()) return;
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        // Clean any residual markdown artifacts
        let cleanChart = chart.trim();
        if (cleanChart.startsWith('[FLOWCHART]')) {
          cleanChart = cleanChart.replace('[FLOWCHART]', '').trim();
        }
        if (!cleanChart.startsWith('graph ') && !cleanChart.startsWith('flowchart ')) {
          cleanChart = 'graph TD\n' + cleanChart;
        }

        const { svg } = await mermaid.render(id, cleanChart);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        console.warn('Mermaid render issue:', err);
        if (isMounted) {
          setError(err?.message || 'Unable to parse diagram syntax automatically.');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleCopyCode = () => {
    const rawFormatted = `[FLOWCHART]\n${chart.trim()}`;
    navigator.clipboard.writeText(rawFormatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-architecture.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`relative rounded-xl border border-slate-800 bg-slate-950/90 shadow-2xl transition-all duration-300 overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col bg-slate-950' : ''
      }`}
    >
      {/* Viewer Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/60 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            [FLOWCHART] Architectural Graph
          </span>
          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-500/20">
            Mermaid.js TD
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-slate-700/60 bg-slate-800/60 p-0.5 mr-2">
            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition ${
                viewMode === 'diagram'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Diagram
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Mermaid Code
            </button>
          </div>

          {viewMode === 'diagram' && !error && (
            <>
              <button
                onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
                title="Zoom Out"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-mono text-slate-400 px-1">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
                title="Zoom In"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                title="Reset Zoom"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleDownloadSvg}
                title="Export SVG"
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export SVG</span>
              </button>
            </>
          )}

          <button
            onClick={handleCopyCode}
            title="Copy Mermaid Code"
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-auto p-6 ${
          isFullscreen ? 'flex-1 min-h-0' : 'min-h-[380px] max-h-[640px]'
        }`}
      >
        {viewMode === 'code' ? (
          <div className="relative font-mono text-xs text-blue-300 bg-slate-900/90 rounded-lg p-4 border border-slate-800 leading-relaxed overflow-x-auto select-text">
            <div className="text-slate-500 mb-2 font-sans text-xs">
              // Syntactically clean Mermaid.js string (graph TD)
            </div>
            <pre className="whitespace-pre-wrap">{`[FLOWCHART]\n${chart}`}</pre>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-amber-500/10 p-3 text-amber-400 mb-3 border border-amber-500/20">
              <Code2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Diagram Rendering Note</h4>
            <p className="mt-1 text-xs text-slate-400 max-w-md">
              A node label contained non-standard characters. You can view the raw valid Mermaid code or copy it directly into any Mermaid viewer.
            </p>
            <div className="mt-4 w-full max-w-xl text-left font-mono text-xs bg-slate-900/90 p-4 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto">
              <pre>{chart}</pre>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-center transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoom})` }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Diagram Footer with architectural guidance */}
      <div className="flex items-center justify-between border-t border-slate-900 bg-slate-950/80 px-4 py-2 text-[11px] text-slate-400">
        <span>Nodes: Input tensors → Layer operations → Outputs</span>
        <span>Rendered natively with Mermaid.js SVG</span>
      </div>
    </div>
  );
};
