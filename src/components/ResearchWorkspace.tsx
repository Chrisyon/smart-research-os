'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Bookmark, 
  Upload, 
  CheckSquare, 
  Square, 
  Bot, 
  User, 
  Send, 
  Loader2, 
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw
} from 'lucide-react';
import { Document, Message, MessageCitation, Project } from '@/types';
import { askRAGEngine } from '@/services/ragEngine';

interface ResearchWorkspaceProps {
  project: Project | null;
  documents: Document[];
  onOpenUpload: () => void;
  onOpenViewer: (docId: string, citation?: MessageCitation) => void;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  project,
  documents,
  onOpenUpload,
  onOpenViewer,
}) => {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(documents.map((d) => d.id));
  const [activeCitation, setActiveCitation] = useState<MessageCitation | null>(null);

  const getWelcomeMessage = (): Message => ({
    id: 'welcome-rag',
    conversation_id: 'conv-main',
    role: 'assistant',
    content: `Selamat datang di **Research Workspace**! Saya siap menganalisis dokumen riset yang Anda pilih.

Tanyakan apa saja seputar dokumen Anda (seperti *"ini file isinya apa"*, *"sebutkan 3 celah kerentanan"*, atau *"apa kesimpulannya"*). Setiap jawaban akan dilengkapi dengan **chip kutipan \\\`[1]\\\`** yang dapat diklik untuk membuka sumber teks aslinya secara langsung.`,
    citations: [
      {
        id: 'cit-init-1',
        message_id: 'welcome-rag',
        document_id: documents[0]?.id || 'doc-1',
        document_title: documents[0]?.title || 'Dokumen Riset',
        page_number: 1,
        excerpt: 'Analisis terstruktur terhadap dokumen riset terindeks.',
        citation_index: 1,
        created_at: '2026-10-10T00:00:00.000Z',
      },
    ],
    created_at: '2026-10-10T00:00:00.000Z',
  });

  // Chat state
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleResetChat = () => {
    setMessages([getWelcomeMessage()]);
    setActiveCitation(null);
  };

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      conversation_id: 'conv-main',
      role: 'user',
      content: inputQuery.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputQuery;
    setInputQuery('');
    setIsGenerating(true);

    try {
      const activeDocs = documents.filter((d) => selectedDocIds.includes(d.id));
      const ragResult = await askRAGEngine(query, activeDocs);

      const aiMessage: Message = {
        id: 'ai-' + Date.now(),
        conversation_id: 'conv-main',
        role: 'assistant',
        content: ragResult.content,
        citations: ragResult.citations,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (ragResult.citations && ragResult.citations.length > 0) {
        setActiveCitation(ragResult.citations[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full w-full max-w-7xl mx-auto gap-5 select-none">
      {/* LEFT PANEL: Source Documents (Width: 280px) */}
      <div className="w-72 flex flex-col bg-slate-900/90 rounded-2xl border panel-border p-4 space-y-4 shrink-0 shadow-lg">
        <div className="flex items-center justify-between border-b panel-border pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Dokumen Sumber ({documents.length})
            </h2>
          </div>
          <button
            onClick={onOpenUpload}
            className="p-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-all"
            title="Tambah Dokumen"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Source List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => onOpenViewer(doc.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/80 border-indigo-500/40 text-slate-100'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDocSelection(doc.id);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 shrink-0"
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                  </button>
                  <span className="text-xs font-semibold truncate flex-1">{doc.title}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pl-6 text-[10px] text-slate-400 font-mono">
                  <span className="uppercase font-bold text-indigo-300">{doc.file_type}</span>
                  <span>{doc.page_count} Halaman</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: AI RAG Discussion & Interactive Citation Inspector (Flex-1) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/90 rounded-2xl border panel-border overflow-hidden shadow-lg">
        {/* Workspace Title */}
        <div className="px-5 py-3 border-b panel-border flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-200">
              {project ? project.title : 'Global Research Workspace'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              title="Bersihkan Percakapan"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bersihkan Chat</span>
            </button>

            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              {selectedDocIds.length} Dokumen Aktif dalam Context
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isUser ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed border space-y-3 ${
                    isUser
                      ? 'bg-indigo-600/20 border-indigo-500/30 text-slate-100 rounded-tr-none'
                      : 'bg-slate-950/90 border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-sm">{msg.content}</div>

                  {/* Clickable Citations Chips */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-3 border-t panel-border flex flex-wrap gap-2">
                      {msg.citations.map((cit) => (
                        <button
                          key={cit.id}
                          onClick={() => {
                            setActiveCitation(cit);
                            onOpenViewer(cit.document_id, cit);
                          }}
                          className="px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm group"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <span>[{cit.citation_index}] {cit.document_title}</span>
                          <span className="text-[10px] font-mono text-slate-400">hal.{cit.page_number || 1}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-300" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono p-3 bg-slate-950/60 rounded-xl border panel-border w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Menganalisis dokumen & menyusun jawaban terverifikasi...</span>
            </div>
          )}
        </div>

        {/* Highlighted Citation Preview Drawer (If citation active) */}
        {activeCitation && (
          <div className="p-3 bg-indigo-950/70 border-t border-indigo-500/40 flex items-center justify-between text-xs text-indigo-200">
            <div className="flex items-center gap-2 min-w-0">
              <Bookmark className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-semibold truncate">
                Teks Sumber Terverifikasi [{activeCitation.citation_index}]: "{activeCitation.excerpt}"
              </span>
            </div>
            <button
              onClick={() => onOpenViewer(activeCitation.document_id, activeCitation)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shrink-0 ml-3"
            >
              Buka Reader
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t panel-border bg-slate-950/80 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Tanyakan sesuatu dari dokumen yang Anda pilih..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isGenerating}
              className="w-full bg-slate-900 border panel-border rounded-xl pl-4 pr-12 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
