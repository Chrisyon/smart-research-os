-- RPC Function: Hybrid Vector & Full-Text Search for RAG Retrieval
CREATE OR REPLACE FUNCTION match_document_chunks_hybrid(
  query_text TEXT,
  query_embedding vector(1536),
  match_count INT DEFAULT 5,
  p_project_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_selected_doc_ids UUID[] DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.2
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  project_id UUID,
  chunk_index INT,
  content TEXT,
  page_number INT,
  section_heading TEXT,
  char_start INT,
  char_end INT,
  metadata JSONB,
  similarity FLOAT,
  fts_rank FLOAT,
  hybrid_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH vector_matches AS (
    SELECT 
      c.id,
      c.document_id,
      c.project_id,
      c.chunk_index,
      c.content,
      c.page_number,
      c.section_heading,
      c.char_start,
      c.char_end,
      c.metadata,
      1 - (c.embedding <=> query_embedding) AS similarity
    FROM document_chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE (p_project_id IS NULL OR c.project_id = p_project_id)
      AND (p_user_id IS NULL OR d.user_id = p_user_id)
      AND (p_selected_doc_ids IS NULL OR cardinality(p_selected_doc_ids) = 0 OR c.document_id = ANY(p_selected_doc_ids))
      AND (1 - (c.embedding <=> query_embedding)) >= similarity_threshold
  ),
  fts_matches AS (
    SELECT 
      c.id,
      ts_rank_cd(to_tsvector('english', c.content), plainto_tsquery('english', query_text)) AS fts_rank
    FROM document_chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE (p_project_id IS NULL OR c.project_id = p_project_id)
      AND (p_user_id IS NULL OR d.user_id = p_user_id)
      AND (p_selected_doc_ids IS NULL OR cardinality(p_selected_doc_ids) = 0 OR c.document_id = ANY(p_selected_doc_ids))
  )
  SELECT 
    v.id,
    v.document_id,
    v.project_id,
    v.chunk_index,
    v.content,
    v.page_number,
    v.section_heading,
    v.char_start,
    v.char_end,
    v.metadata,
    v.similarity,
    COALESCE(f.fts_rank, 0.0) AS fts_rank,
    (v.similarity * 0.7 + COALESCE(f.fts_rank, 0.0) * 0.3) AS hybrid_score
  FROM vector_matches v
  LEFT JOIN fts_matches f ON v.id = f.id
  ORDER BY hybrid_score DESC
  LIMIT match_count;
END;
$$;
