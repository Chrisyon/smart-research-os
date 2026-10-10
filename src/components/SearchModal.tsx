'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, FileText, FolderKanban, Network, Sparkles, ArrowRight } from 'lucide-react';
import { Project, Document } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  documents: Document[];
  onSelectProject: (p: Project) => void;
  onSelectTab: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  documents,
  onSelectProject,
  onSelectTab,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.description?.toLowerCase().includes(query.toLowerCase())
  );

  const matchedDocuments = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.file_type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel border border-white/10 rounded-3xl p-6 space-y-5 glow-indigo shadow-2xl">
        {/* Search Bar */}
        <div className="relative flex items-center border-b border-white/10 pb-4">
          <Search className="w-5 h-5 text-indigo-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search projects, documents, vector chunks, citations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent pl-11 pr-10 text-base text-white placeholder-gray-500 focus:outline-none font-medium"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto space-y-4">
          {/* Projects Section */}
          {matchedProjects.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold tracking-wider flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5" /> Projects ({matchedProjects.length})
              </span>
              <div className="space-y-1.5">
                {matchedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p);
                      onClose();
                    }}
                    className="p-3 rounded-xl glass-card cursor-pointer flex items-center justify-between hover:border-indigo-500/40 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.cover_color }}></div>
                      <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {p.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {matchedDocuments.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Documents ({matchedDocuments.length})
              </span>
              <div className="space-y-1.5">
                {matchedDocuments.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onSelectTab('chat');
                      onClose();
                    }}
                    className="p-3 rounded-xl glass-card cursor-pointer flex items-center justify-between hover:border-purple-500/40 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center uppercase">
                        {d.file_type}
                      </span>
                      <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {d.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{d.page_count} pages</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && matchedProjects.length === 0 && matchedDocuments.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-6">No matching documents or projects found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
