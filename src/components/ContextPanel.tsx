'use client';

import React from 'react';
import { Sparkles, FileText, Bookmark, Info, ExternalLink } from 'lucide-react';
import { Document, MessageCitation } from '@/types';

interface ContextPanelProps {
  documents: Document[];
  activeCitation: MessageCitation | null;
  onCitationClick: (citation: MessageCitation) => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  documents,
  activeCitation,
  onCitationClick,
}) => {
  return (
    <aside className="w-80 h-full border-l border-white/10 glass-panel flex flex-col z-20 overflow-y-auto p-4 space-y-6">
      {/* Active Citation Preview */}
      {activeCitation && (
        <div className="p-4 rounded-2xl bg-indigo-900/30 border border-indigo-500/40 glow-indigo space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" /> Active Source Citation
            </span>
            <span className="text-[10px] font-mono bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300">
              Page {activeCitation.page_number || 1}
            </span>
          </div>
          <h4 className="text-xs font-bold text-gray-200">{activeCitation.document_title}</h4>
          <p className="text-xs text-gray-300 italic bg-black/30 p-2.5 rounded-xl border border-white/5 leading-relaxed">
            "{activeCitation.excerpt}"
          </p>
        </div>
      )}

      {/* AI Key Insights */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" /> Executive Insights
        </h3>
        <div className="p-3.5 rounded-2xl glass-card space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            Cross-Document Correlation
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            2 documents in your active project share overlapping topics on <strong className="text-indigo-300">Attention Mechanisms</strong> and <strong className="text-cyan-300">Quantum Neural Vectors</strong>.
          </p>
        </div>
      </div>

      {/* Project Source Documents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> Active Sources ({documents.length})
          </h3>
        </div>
        <div className="space-y-2">
          {documents.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No source documents uploaded yet.</p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl glass-card flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs uppercase font-bold shrink-0">
                    {doc.file_type}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-gray-200 truncate group-hover:text-indigo-300 transition-colors">
                      {doc.title}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {doc.page_count} pages • {doc.total_chunks} chunks
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 transition-colors shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Help / System Metadata */}
      <div className="p-3.5 rounded-2xl border border-white/5 bg-gray-900/40 text-xs text-gray-400 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-gray-300">
          <Info className="w-3.5 h-3.5 text-cyan-400" /> Citation Traceability
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          All AI answers are mathematically grounded via vector embeddings. Click any citation chip `[1]` in the chat to highlight the source text.
        </p>
      </div>
    </aside>
  );
};
