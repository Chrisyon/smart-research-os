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
    <header className="border-b panel-border bg-slate-950/90 backdrop-blur-md px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20 shrink-0 select-none">
      {/* Brand & Workspace Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-tight">Smart Research OS</h1>
            <span className="text-[10px] text-indigo-400 font-mono font-semibold uppercase tracking-wider block">AI Research Assistant</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800"></div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <select
            value={activeProject?.id || ''}
            onChange={(e) => {
              const selected = projects.find((p) => p.id === e.target.value);
              setActiveProject(selected || null);
            }}
            className="bg-slate-900 border panel-border rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                📁 {p.title}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewProject}
            className="p-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold flex items-center gap-1 border border-indigo-500/30 transition-all"
            title="Create New Project"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {/* Center Navigation Pills */}
      <nav className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border panel-border">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-xl bg-slate-900 border panel-border text-slate-400 hover:text-slate-100 hover:bg-slate-850 transition-colors flex items-center gap-2 text-xs"
          title="Search (Ctrl + K)"
        >
          <Search className="w-4 h-4 text-indigo-400" />
          <span className="hidden md:inline font-medium">Search</span>
          <kbd className="hidden md:inline bg-slate-950 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 border panel-border">Ctrl K</kbd>
        </button>

        <button
          onClick={onOpenUpload}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>

        <button
          onClick={onOpenApiKey}
          className="p-2 rounded-xl bg-slate-900 border panel-border text-amber-400 hover:text-amber-300 hover:bg-slate-850 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Pengaturan AI Engine (Gemini / Groq / OpenAI Key)"
        >
          <Key className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">AI Key</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900 border panel-border text-slate-400 hover:text-slate-100 hover:bg-slate-850 transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
