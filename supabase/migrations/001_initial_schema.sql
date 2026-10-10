-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Workspace Members
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (workspace_id, user_id)
);

-- 4. Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_color TEXT DEFAULT '#3b82f6',
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_name TEXT,
    file_type TEXT CHECK (file_type IN ('pdf', 'markdown', 'txt', 'url', 'youtube')) NOT NULL,
    file_size INTEGER DEFAULT 0,
    storage_path TEXT,
    source_url TEXT,
    mime_type TEXT,
    status TEXT CHECK (status IN ('uploaded', 'processing', 'indexed', 'failed')) DEFAULT 'uploaded' NOT NULL,
    error_message TEXT,
    page_count INTEGER DEFAULT 0,
    total_chunks INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Document Chunks (with Vector Embedding)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    page_number INTEGER,
    section_heading TEXT,
    char_start INTEGER,
    char_end INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vector similarity search index (Cosine distance)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- Full-text search index
CREATE INDEX IF NOT EXISTS document_chunks_content_fts_idx 
ON document_chunks USING gin (to_tsvector('english', content));

-- 7. Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation' NOT NULL,
    selected_document_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Message Citations
CREATE TABLE IF NOT EXISTS message_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    document_title TEXT NOT NULL,
    page_number INTEGER,
    char_start INTEGER,
    char_end INTEGER,
    excerpt TEXT NOT NULL,
    citation_index INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Knowledge Graph Nodes
CREATE TABLE IF NOT EXISTS graph_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    node_type TEXT CHECK (node_type IN ('concept', 'person', 'organization', 'technology', 'paper', 'topic')) DEFAULT 'concept' NOT NULL,
    description TEXT,
    importance_score FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Knowledge Graph Edges
CREATE TABLE IF NOT EXISTS graph_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
    relationship_type TEXT CHECK (relationship_type IN ('related_to', 'depends_on', 'contradicts', 'supports', 'is_example_of', 'part_of')) DEFAULT 'related_to' NOT NULL,
    evidence_text TEXT,
    source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    source_chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Summaries
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    summary_type TEXT CHECK (summary_type IN ('executive', 'overview', 'detailed', 'key_findings', 'comparison')) DEFAULT 'executive' NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. Flashcard Decks & Cards
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. Quizzes & Quiz Questions
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings e.g. ["A", "B", "C", "D"]
    correct_option_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. Document Processing Jobs
CREATE TABLE IF NOT EXISTS document_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending' NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Allow authenticated user access to their own data)
CREATE POLICY "Users can access own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can access own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own documents" ON documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own document_chunks" ON document_chunks FOR ALL USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_chunks.document_id AND documents.user_id = auth.uid())
);
CREATE POLICY "Users can access own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
