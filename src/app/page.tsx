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

  const handleOpenViewer = (docId: string, citation?: MessageCitation) => {
    const doc = store.getDocument(docId) || documents[0] || null;
    setActiveDocument(doc);
    if (citation) setActiveCitation(citation);
    setCurrentTab('viewer');
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
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
        <main className="flex-1 overflow-hidden p-4 md:p-6 bg-slate-950">
          {currentTab === 'workspace' && (
            <ResearchWorkspace
              project={activeProject}
              documents={documents}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenViewer={handleOpenViewer}
            />
          )}

          {currentTab === 'viewer' && (
            <div className="h-full max-w-6xl mx-auto rounded-2xl border panel-border overflow-hidden">
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

          {currentTab === 'flashcards' && <FlashcardHub />}

          {currentTab === 'summaries' && <SummaryHub documents={documents} />}
        </main>

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
