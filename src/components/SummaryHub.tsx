'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, Copy, Check, FileText, Download, CheckCircle2 } from 'lucide-react';
import { Document, SummaryType } from '@/types';

interface SummaryHubProps {
  documents: Document[];
}

export const SummaryHub: React.FC<SummaryHubProps> = ({ documents }) => {
  const [summaryType, setSummaryType] = useState<SummaryType>('executive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleSummary = `### Executive Research Summary: Transformer & Quantum Architectures

#### 1. Core Technological Paradigm Shift
Modern deep learning sequence modeling has systematically transitioned from recurrent structures (LSTM/GRU) to **Self-Attention Transformer Architectures**. By computing token dependencies in parallel across full matrix multiplications, computational scaling achieves optimal hardware acceleration on distributed GPU clusters.

#### 2. Key Findings & Contributions
- **Dispensing with Recurrence**: Transformers eliminate sequential dependencies, reducing training time from weeks to days for large-scale language corpora.
- **Quantum Integration**: Variational Quantum Circuits (VQCs) provide high-dimensional Hilbert space projections, offering exponential vector space speedups for complex feature embedding.

#### 3. Methodological Comparison
| Metric | Recurrent Models (RNN) | Transformer (Self-Attention) | Quantum Neural Net |
| :--- | :--- | :--- | :--- |
| **Sequential Bottleneck** | High ($O(N)$ sequential steps) | None ($O(1)$ parallel operations) | None (Quantum superposition) |
| **Long-Range Dependency** | Degrades exponentially | Constant path length ($O(1)$) | High entanglement entropy |

#### 4. Limitations & Open Questions
- Quadratic memory complexity ($O(N^2)$) in standard self-attention requires linear approximation techniques (e.g. FlashAttention) for ultra-long context windows (>1M tokens).`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> AI Synthesis Engine
          </div>
          <h1 className="text-2xl font-bold text-white">Executive Summaries & Synthesis</h1>
          <p className="text-xs text-gray-400">Generate structured summaries across indexed documents</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-colors border border-white/10"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {(['executive', 'overview', 'detailed', 'key_findings', 'comparison'] as SummaryType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSummaryType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              summaryType === type
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 glow-indigo'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Summary Render Area */}
      <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6 glow-indigo">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {summaryType.replace('_', ' ')} Synthesis Report
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Grounded in {documents.length || 2} Papers
          </span>
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
          {sampleSummary}
        </div>
      </div>
    </div>
  );
};
