'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Bookmark, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Check, 
  Loader2, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { Document, Message, MessageCitation } from '@/types';
import { askRAGEngine } from '@/services/ragEngine';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface ChatPanelProps {
  documents: Document[];
  onCitationClick: (citation: MessageCitation) => void;
  onOpenDocumentViewer: (docId: string, citation?: MessageCitation) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  documents,
  onCitationClick,
  onOpenDocumentViewer,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      conversation_id: 'conv-default',
      role: 'assistant',
      content: `Hello! I am your **Smart Research AI Assistant**. Ask me questions across your indexed research papers, PDFs, and notes. 

All claims are grounded in your documents with **clickable citation chips** \`[1]\`. Try asking:
- *"What is the core innovation of the Transformer architecture?"*
- *"How do Quantum Neural Networks achieve feature mapping speedup?"*`,
      citations: [],
      created_at: new Date().toISOString(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      conversation_id: 'conv-default',
      role: 'user',
      content: inputQuery.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputQuery;
    setInputQuery('');
    setIsGenerating(true);

    try {
      const ragResult = await askRAGEngine(query, documents);

      const aiMessage: Message = {
        id: 'ai-' + Date.now(),
        conversation_id: 'conv-default',
        role: 'assistant',
        content: ragResult.content,
        citations: ragResult.citations,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950/80 rounded-2xl border border-white/10 glass-panel overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-white/10 px-5 flex items-center justify-between bg-gray-900/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Grounded RAG Chat</h3>
            <p className="text-[10px] text-gray-400">Grounded evidence retrieval across {documents.length} sources</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
            title="Clear Conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white glow-indigo'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`space-y-3 p-4 rounded-2xl text-sm leading-relaxed border ${
                  isUser
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-gray-100 rounded-tr-none'
                    : 'glass-card border-white/10 text-gray-200 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}

                {/* Citations Chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <Bookmark className="w-3 h-3" /> Grounded Source Citations ({msg.citations.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cit) => (
                        <button
                          key={cit.id}
                          onClick={() => {
                            onCitationClick(cit);
                            onOpenDocumentViewer(cit.document_id, cit);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/40 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition-all group"
                        >
                          <FileText className="w-3 h-3 text-indigo-400" />
                          <span>[{cit.citation_index}] {cit.document_title}</span>
                          <span className="text-[10px] font-mono text-gray-400">p.{cit.page_number || 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!isUser && (
                  <div className="flex items-center justify-end gap-2 pt-1 text-xs text-gray-400">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 hover:text-white transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 glow-indigo">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl glass-card border border-white/10 text-xs text-gray-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              Searching vector chunks & generating grounded RAG response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-gray-900/60 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask a question across your documents..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onBlur={() => {
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
              }
            }}
            disabled={isGenerating}
            className="w-full bg-gray-950 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-40 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
