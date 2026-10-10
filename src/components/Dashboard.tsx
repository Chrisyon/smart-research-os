'use client';

import React from 'react';
import { 
  Sparkles, 
  FolderPlus, 
  Upload, 
  FileText, 
  Layers, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Database,
  Brain,
  Plus
} from 'lucide-react';
import { Project, Document } from '@/types';

interface DashboardProps {
  metrics: {
    totalDocs: number;
    totalIndexedPages: number;
    totalChunks: number;
    totalProjects: number;
  };
  projects: Project[];
  documents: Document[];
  onOpenNewProject: () => void;
  onOpenUpload: () => void;
  onSelectProject: (proj: Project) => void;
  onNavigateTab: (tab: string) => void;
  onOpenSearch: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  projects,
  documents,
  onOpenNewProject,
  onOpenUpload,
  onSelectProject,
  onNavigateTab,
  onOpenSearch,
}) => {
  return (
    <div className="p-6 space-y-7 max-w-7xl mx-auto select-none">
      {/* Prominent AI Search Command Bar */}
      <div className="relative">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 border panel-border hover:border-indigo-500/40 rounded-2xl px-5 py-3.5 text-slate-300 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200">
              Search research materials, vector chunks, citations, or concepts...
            </span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-slate-950 border panel-border rounded-md px-2 py-0.5 text-xs font-mono text-slate-400">
              Ctrl K
            </kbd>
          </div>
        </button>
      </div>

      {/* Hero Welcome & Quick CTAs */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/50 border panel-border overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Research OS Workspace
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Transform documents into an interactive <span className="text-indigo-400">Knowledge Network</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Ask questions across PDFs, Markdown notes, and web articles with verifiable clickable citations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewProject}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl bg-slate-900 border panel-border hover:bg-slate-800 text-slate-200 font-medium text-xs flex items-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-400" /> Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Live Store Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl surface-card space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Projects</span>
            <FolderPlus className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{metrics.totalProjects}</div>
          <p className="text-[11px] text-indigo-400 font-medium">Research workspaces</p>
        </div>

        <div className="p-4 rounded-xl surface-card space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Documents</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{metrics.totalDocs}</div>
          <p className="text-[11px] text-purple-400 font-medium">PDFs, MD & Web Links</p>
        </div>

        <div className="p-4 rounded-xl surface-card space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Indexed Pages</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{metrics.totalIndexedPages}</div>
          <p className="text-[11px] text-cyan-400 font-medium">Parsed & chunked</p>
        </div>

        <div className="p-4 rounded-xl surface-card space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vector Chunks</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{metrics.totalChunks}</div>
          <p className="text-[11px] text-emerald-400 font-medium">pgvector embeddings</p>
        </div>
      </div>

      {/* Projects & Documents Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Recent Research Projects</h2>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className="p-3.5 rounded-xl surface-card cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-3 h-8 rounded-md shrink-0"
                    style={{ backgroundColor: proj.cover_color }}
                  ></div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">{proj.description}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 shrink-0">
                  {proj.document_count || 0} docs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Ingested Documents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Recently Ingested Documents</h2>
            <button
              onClick={() => onNavigateTab('documents')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl surface-card flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                    {doc.file_type}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-xs font-bold text-slate-200 truncate">{doc.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{doc.page_count} pages</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Indexed
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('workspace')}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-300 transition-colors"
                >
                  Open Source
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
