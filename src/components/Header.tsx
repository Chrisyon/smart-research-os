'use client';

import React from 'react';
import { 
  Sparkles, 
  Search, 
  Upload, 
  MessageSquare, 
  BookOpen, 
  Network, 
  Layers, 
  FileText, 
  Sun, 
  Moon, 
  Plus, 
  Key 
} from 'lucide-react';
import { Project } from '@/types';
import { useTheme } from '@/services/themeContext';

interface HeaderProps {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (proj: Project | null) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onOpenNewProject: () => void;
  onOpenApiKey: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  activeProject,
  setActiveProject,
  currentTab,
  setCurrentTab,
  onOpenUpload,
  onOpenSearch,
  onOpenNewProject,
  onOpenApiKey,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navTabs = [
    { id: 'workspace', label: 'AI Workspace', icon: MessageSquare },
    { id: 'viewer', label: 'Document Reader', icon: BookOpen },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'summaries', label: 'AI Summaries', icon: FileText },
  ];

  return (
    <header className="bg-slate-950/95 backdrop-blur-md z-20 shrink-0 select-none border-b panel-border">
      {/* Top Bar: Brand, Project Selector, Quick Action Buttons */}
      <div className="px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Project Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="hidden xs:block">
              <h1 className="font-bold text-xs sm:text-sm text-slate-100 tracking-tight leading-none">Ainya</h1>
              <span className="text-[9px] text-indigo-400 font-mono font-semibold uppercase tracking-wider block">Research OS</span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 shrink-0"></div>

          {/* Project Selector */}
          <div className="flex items-center gap-1.5 min-w-0">
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const selected = projects.find((p) => p.id === e.target.value);
                setActiveProject(selected || null);
              }}
              className="bg-slate-900 border panel-border rounded-xl px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors max-w-[120px] sm:max-w-[180px] truncate"
            >
              <option value="">Semua Proyek</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.title}
                </option>
              ))}
            </select>

            <button
              onClick={onOpenNewProject}
              className="p-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold flex items-center gap-1 border border-indigo-500/30 transition-all shrink-0"
              title="Buat Proyek Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Proyek Baru</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenSearch}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border panel-border text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs"
            title="Cari Dokumen (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            <span className="hidden md:inline font-medium">Cari</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0"
            title="Unggah Dokumen"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <button
            onClick={onOpenApiKey}
            className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
            title="Pengaturan AI Engine (Gemini Key)"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">AI Key</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border panel-border text-slate-400 hover:text-slate-100 transition-colors shrink-0"
            title="Ganti Tema"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Horizontal Nav Bar (Mobile-friendly smooth horizontal scroll) */}
      <div className="px-2 sm:px-6 py-1 bg-slate-950/80 border-t panel-border flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
