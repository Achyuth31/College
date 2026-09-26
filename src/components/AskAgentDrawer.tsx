import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, X, Loader2, Bot, User, CornerDownLeft } from 'lucide-react';
import { PaperAnalysis } from '../types/paper';

interface AskAgentDrawerProps {
  analysis: PaperAnalysis;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'agent';
  content: string;
}

export const AskAgentDrawer: React.FC<AskAgentDrawerProps> = ({ analysis, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: `Hello! I am your Computer Science Research Agent. I've parsed **${analysis.paperTitle}** and mapped its system architecture and student extensions. What would you like to explore deeper? You can ask about mathematical formulations, hardware bottlenecks, ablation trade-offs, or code implementation details.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'How does the computational complexity compare to standard attention?',
    'What GPU memory bottleneck is this architecture solving?',
    'How would I benchmark this on a single consumer GPU?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: q }];
    setMessages(newMessages);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperTitle: analysis.paperTitle,
          question: q,
          context: {
            problemStatement: analysis.coreConcept.problemStatement,
            methodology: analysis.coreConcept.methodology,
            mathematicalBreakthroughs: analysis.coreConcept.mathematicalBreakthroughs,
            systemArchitecture: analysis.systemArchitectureNotes,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to get answer');
      const data = await res.json();
      setMessages([...newMessages, { role: 'agent', content: data.answer }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'agent',
          content: 'I encountered an issue consulting the research literature. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">CS Research Agent Dialog</h3>
            <p className="text-[11px] text-slate-400">Token-efficient academic consultation</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="bg-slate-950/40 p-3 border-b border-slate-800/60 overflow-x-auto flex gap-2 no-scrollbar">
        {suggestedQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="whitespace-nowrap rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 px-3 py-1 text-[11px] text-slate-300 transition"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'agent' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}
            <div
              className={`rounded-xl p-3.5 max-w-[85%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
            {m.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 text-xs">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-xl p-3 bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
              <span>Analyzing theoretical context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about equations, layers, or student project tradeoffs..."
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-2.5 pr-12 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 rounded-lg bg-blue-600 p-1.5 text-white hover:bg-blue-500 disabled:opacity-40 transition"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
