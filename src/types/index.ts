import { z } from 'zod';

export type DocumentFileType = 'pdf' | 'markdown' | 'txt' | 'url' | 'youtube';
export type DocumentStatus = 'uploaded' | 'processing' | 'indexed' | 'failed';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  workspace_id?: string;
  user_id: string;
  title: string;
  description?: string;
  cover_color: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  document_count?: number;
}

export interface Document {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  file_name?: string;
  file_type: DocumentFileType;
  file_size: number;
  storage_path?: string;
  source_url?: string;
  mime_type?: string;
  status: DocumentStatus;
  error_message?: string;
  page_count: number;
  total_chunks: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  project_id: string;
  chunk_index: number;
  content: string;
  page_number?: number;
  section_heading?: string;
  char_start?: number;
  char_end?: number;
  similarity?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  selected_document_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface MessageCitation {
  id: string;
  message_id: string;
  document_id: string;
  chunk_id?: string;
  document_title: string;
  page_number?: number;
  char_start?: number;
  char_end?: number;
  excerpt: string;
  citation_index: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: MessageCitation[];
  created_at: string;
}

export type NodeType = 'concept' | 'person' | 'organization' | 'technology' | 'paper' | 'topic';
export type RelationshipType = 'related_to' | 'depends_on' | 'contradicts' | 'supports' | 'is_example_of' | 'part_of';

export interface GraphNode {
  id: string;
  project_id: string;
  label: string;
  node_type: NodeType;
  description?: string;
  importance_score: number;
  created_at: string;
}

export interface GraphEdge {
  id: string;
  project_id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: RelationshipType;
  evidence_text?: string;
  source_document_id?: string;
  source_chunk_id?: string;
  created_at: string;
}

export type SummaryType = 'executive' | 'overview' | 'detailed' | 'key_findings' | 'comparison';

export interface Summary {
  id: string;
  project_id: string;
  document_id?: string;
  summary_type: SummaryType;
  title: string;
  content: string;
  created_at: string;
}

export interface FlashcardDeck {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  cards?: Flashcard[];
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  document_id?: string;
  chunk_id?: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  document_id?: string;
  chunk_id?: string;
}

export interface Quiz {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  questions?: QuizQuestion[];
  created_at: string;
}

// Zod Validation Schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  cover_color: z.string().default('#3b82f6'),
});

export const documentUploadSchema = z.object({
  title: z.string().min(1),
  file_type: z.enum(['pdf', 'markdown', 'txt', 'url', 'youtube']),
  source_url: z.string().url().optional(),
  project_id: z.string().uuid(),
});

export const askQuestionSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  project_id: z.string().uuid(),
  question: z.string().min(1, 'Question cannot be empty'),
  selected_document_ids: z.array(z.string().uuid()).optional(),
});
