'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ResearchWorkspace } from '@/components/ResearchWorkspace';
import { UploadModal } from '@/components/UploadModal';
import { NewProjectModal } from '@/components/NewProjectModal';
import { SearchModal } from '@/components/SearchModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { DocumentViewer } from '@/components/DocumentViewer';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { FlashcardHub } from '@/components/FlashcardHub';
import { SummaryHub } from '@/components/SummaryHub';
import { store } from '@/services/store';
import { ThemeProvider } from '@/services/themeContext';
import { Project, Document, MessageCitation } from '@/types';
import { MessageSquare, BookOpen, Network, Layers, FileText } from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('workspace');

  // Store state
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [activeCitation, setActiveCitation] = useState<MessageCitation | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const p = store.getProjects();
      const d = store.getDocuments(activeProject?.id);
      setProjects(p);
      setDocuments(d);
      if (!activeProject && p.length > 0) {
        setActiveProject(p[0]);
      }
    };
    update();
    const unsubscribe = store.subscribe(update);
    return () => {
      unsubscribe();
    };
  }, [activeProject]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResetScroll = () => {
      if (window.scrollY !== 0) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('resize', handleResetScroll);
    window.addEventListener('orientationchange', handleResetScroll);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResetScroll);
    }

    return () => {
      window.removeEventListener('resize', handleResetScroll);
      window.removeEventListener('orientationchange', handleResetScroll);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResetScroll);
      }
    };
  }, []);

  const handleOpenViewer = (docId: string, citation?: MessageCitation) => {
    const doc = store.getDocument(docId) || documents[0] || null;
    setActiveDocument(doc);
    if (citation) setActiveCitation(citation);
    setCurrentTab('viewer');
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {/* Top Modern Header Bar */}
        <Header
          projects={projects}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenApiKey={() => setIsApiKeyOpen(true)}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 overflow-hidden p-2 sm:p-4 md:p-6 bg-slate-950 min-h-0">
          {currentTab === 'workspace' && (
            <ResearchWorkspace
              project={activeProject}
              documents={documents}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenViewer={handleOpenViewer}
            />
          )}

          {currentTab === 'viewer' && (
            <div className="h-full max-w-6xl mx-auto md:rounded-2xl md:border md:panel-border overflow-hidden">
              <DocumentViewer
                document={activeDocument || documents[0] || null}
                activeCitation={activeCitation}
                onClose={() => setCurrentTab('workspace')}
              />
            </div>
          )}

          {currentTab === 'graph' && (
            <div className="h-full max-w-6xl mx-auto">
              <KnowledgeGraph onSelectNodeDocument={(docId) => handleOpenViewer(docId)} />
            </div>
          )}

          {currentTab === 'flashcards' && (
            <div className="h-full max-w-4xl mx-auto">
              <FlashcardHub />
            </div>
          )}

          {currentTab === 'summaries' && (
            <div className="h-full max-w-5xl mx-auto">
              <SummaryHub documents={documents} />
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Ultra-responsive for mobile touch) */}
        <nav className="md:hidden border-t panel-border bg-slate-950/95 backdrop-blur-md px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shrink-0 z-40">
          {[
            { id: 'workspace', label: 'Chat AI', icon: MessageSquare },
            { id: 'viewer', label: 'Reader', icon: BookOpen },
            { id: 'graph', label: 'Graph', icon: Network },
            { id: 'flashcards', label: 'Flashcard', icon: Layers },
            { id: 'summaries', label: 'Ringkasan', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer touch-manipulation active:scale-90 ${
                  isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{ WebkitTapHighlightColor: 'rgba(99, 102, 241, 0.2)' }}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5 leading-none">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Modals */}
        <ApiKeyModal
          isOpen={isApiKeyOpen}
          onClose={() => setIsApiKeyOpen(false)}
        />

        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          projects={projects}
          activeProject={activeProject}
        />

        <NewProjectModal
          isOpen={isNewProjectOpen}
          onClose={() => setIsNewProjectOpen(false)}
          onProjectCreated={(proj) => setActiveProject(proj)}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          projects={projects}
          documents={documents}
          onSelectProject={(p) => {
            setActiveProject(p);
            setCurrentTab('workspace');
          }}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />
      </div>
    </ThemeProvider>
  );
}
