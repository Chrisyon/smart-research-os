# Smart Research OS — AI-Powered Research Workspace

**Smart Research OS** is a production-grade, AI-powered workspace designed for researching, analyzing, connecting, and learning from multi-format documents (PDFs, Markdown notes, Plain Text, Web URLs, and YouTube videos).

Combined features inspired by **NotebookLM**, **Notion**, **Obsidian**, and modern RAG platforms.

---

## 🌟 Key Features

1. **Desktop-First 3-Column Workspace**:
   - **Left Sidebar**: Workspace switcher, Project Manager, Document Library, Knowledge Graph, Flashcards, AI Summaries, Settings.
   - **Main Workspace**: Dynamic view switching between Dashboard, Multi-Doc RAG Chat, PDF/Document Reader, Knowledge Canvas, and Flashcards.
   - **Right Context Panel**: Real-time AI key insights, active source documents list, and active citation preview.

2. **Multi-Format Document Ingestion**:
   - Supports **PDF**, **Markdown (.md)**, **Plain Text (.txt)**, **Web Article URLs**, and **YouTube Video URLs**.
   - Automated text chunking, heading hierarchy preservation, page-level mapping, and vector embedding index (`pgvector`).

3. **Grounded AI RAG Chat with Clickable Citations**:
   - Ask complex questions across selected documents or entire research projects.
   - Every factual claim generates a structured **Citation Chip** `[1]`.
   - **Clicking a citation chip** opens the Document Viewer, auto-scrolls to the cited page/section, and highlights the exact passage with a glowing neon accent.

4. **Interactive Knowledge Graph**:
   - Concept & Entity extraction pipeline.
   - HTML5 Canvas concept map with draggable nodes, zoom/pan controls, concept inspector, relationship evidence text, and source document navigation.

5. **AI Flashcards & Executive Summaries**:
   - Auto-generate executive summaries, key findings, and comparison tables.
   - 3D flip card study decks with SM-2 self-assessment difficulty ratings (Easy, Medium, Hard).

6. **Global Hybrid Search (`Ctrl + K`)**:
   - Search across document titles, vector chunks, project titles, and concepts.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS, CSS Glassmorphism Design System
- **Icons**: Lucide React
- **Database & Vector Search**: PostgreSQL with `pgvector` extension on Supabase
- **State & Storage**: Reactive Client-side Store with `localStorage` persistence and fallback mock engine
- **Schema Validation**: Zod

---

## 📁 Project Structure

```
smart-research-os/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema with pgvector & RLS policies
├── src/
│   ├── app/
│   │   ├── globals.css            # Design tokens & glassmorphism utilities
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Main application container & view manager
│   ├── components/
│   │   ├── Sidebar.tsx            # Left navigation sidebar
│   │   ├── Header.tsx             # Top navigation & global search trigger
│   │   ├── ContextPanel.tsx       # Right insights & source context panel
│   │   ├── Dashboard.tsx          # Live metrics & recent research activity
│   │   ├── UploadModal.tsx        # Multi-format document ingestion modal
│   │   ├── DocumentViewer.tsx     # PDF & text reader with citation highlighting
│   │   ├── ChatPanel.tsx          # RAG AI Chatbot with clickable citations
│   │   ├── KnowledgeGraph.tsx     # Canvas concept node map & inspector
│   │   ├── FlashcardHub.tsx       # 3D flip card study deck
│   │   ├── SummaryHub.tsx         # Executive summary generator
│   │   ├── SearchModal.tsx        # Global hybrid search modal (Ctrl + K)
│   │   └── NewProjectModal.tsx    # Research project creation modal
│   ├── services/
│   │   ├── store.ts               # Reactive client-side persistent database store
│   │   └── ragEngine.ts           # RAG LLM engine & vector search provider
│   └── types/
│       └── index.ts               # TypeScript domain models & Zod schemas
├── .env.example                    # Environment variables template
└── README.md                       # Documentation
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisite
Ensure you have Node.js (v18+) installed.

### 2. Set Workspace Directory
Set your working directory to:
`C:\Users\chris\.gemini\antigravity\scratch\smart-research-os`

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔒 Security & Data Isolation
- Supabase Row Level Security (RLS) policies enforce workspace-level authorization.
- Server-side API key abstraction keeps AI provider secrets secure.
