'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Network, 
  Layers, 
  Sparkles, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/services/themeContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onOpenNewProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  onOpenNewProject,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'Research Workspace', icon: Sparkles, badge: 'Core' },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'flashcards', label: 'Study & Flashcards', icon: Layers },
    { id: 'summaries', label: 'AI Synthesis', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col h-screen border-r panel-border bg-slate-950 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-3.5 border-b panel-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs tracking-tight text-slate-100 truncate">
                Smart Research OS
              </span>
              <span className="text-[9px] text-indigo-400 font-mono tracking-wider uppercase font-semibold">
                Enterprise AI
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="p-2.5">
        <button
          onClick={onOpenNewProject}
          className={`w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
            collapsed ? 'px-0' : ''
          }`}
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>New Project</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!collapsed && item.badge && (
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle & User Footer */}
      <div className="p-2.5 border-t panel-border space-y-2">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
        </button>

        <div className={`flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-md bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-semibold text-[11px] shrink-0">
            CR
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-slate-200 truncate">Researcher Chris</span>
              <span className="text-[9px] text-slate-400 truncate">Pro Workspace</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
