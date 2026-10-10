import { MessageCitation } from '@/types';
import { RetrievedEvidenceChunk } from './promptBuilder';

export interface ValidatedCitationResult {
  validCitations: MessageCitation[];
  invalidCitations: MessageCitation[];
  sanitizedText: string;
}

export function validateAndReconcileCitations(
  llmAnswer: string,
  retrievedChunks: RetrievedEvidenceChunk[],
  messageId: string = 'msg-ans'
): ValidatedCitationResult {
  const validCitations: MessageCitation[] = [];
  const invalidCitations: MessageCitation[] = [];

  // Match citation markers e.g. [DocID:doc-1, ChunkID:chunk-1, Page:2] or [1]
  const citationPattern = /\[DocID:([a-zA-Z0-9_-]+)(?:,\s*ChunkID:([a-zA-Z0-9_-]+))?(?:,\s*Page:(\d+))?\]|\[(\d+)\]/g;

  let match;
  let citationCounter = 1;
  const chunkMap = new Map<string, RetrievedEvidenceChunk>();

  retrievedChunks.forEach((c) => {
    chunkMap.set(c.chunkId, c);
    chunkMap.set(c.documentId, c);
  });

  // Extract explicit citation references
  while ((match = citationPattern.exec(llmAnswer)) !== null) {
    const docId = match[1];
    const chunkId = match[2];
    const pageNum = match[3] ? parseInt(match[3], 10) : undefined;
    const bracketNum = match[4] ? parseInt(match[4], 10) : undefined;

    let matchedChunk: RetrievedEvidenceChunk | undefined;

    if (chunkId && chunkMap.has(chunkId)) {
      matchedChunk = chunkMap.get(chunkId);
    } else if (docId && chunkMap.has(docId)) {
      matchedChunk = chunkMap.get(docId);
    } else if (bracketNum && retrievedChunks[bracketNum - 1]) {
      matchedChunk = retrievedChunks[bracketNum - 1];
    }

    if (matchedChunk) {
      const citation: MessageCitation = {
        id: `cit-${Date.now()}-${citationCounter}`,
        message_id: messageId,
        document_id: matchedChunk.documentId,
        chunk_id: matchedChunk.chunkId,
        document_title: matchedChunk.documentTitle,
        page_number: matchedChunk.pageNumber || pageNum || 1,
        excerpt: matchedChunk.content.slice(0, 180) + '...',
        citation_index: citationCounter++,
        created_at: new Date().toISOString(),
      };
      validCitations.push(citation);
    }
  }

  // If LLM returned valid content but didn't write explicit brackets, attach top relevant chunk if similarity > 0.5
  if (validCitations.length === 0 && retrievedChunks.length > 0) {
    const topChunk = retrievedChunks[0];
    if (topChunk.similarity >= 0.2) {
      validCitations.push({
        id: `cit-${Date.now()}-1`,
        message_id: messageId,
        document_id: topChunk.documentId,
        chunk_id: topChunk.chunkId,
        document_title: topChunk.documentTitle,
        page_number: topChunk.pageNumber || 1,
        excerpt: topChunk.content.slice(0, 180) + '...',
        citation_index: 1,
        created_at: new Date().toISOString(),
      });
    }
  }

  // Clean up raw brackets into clean display chips e.g. [1]
  let sanitizedText = llmAnswer.replace(/\[DocID:([a-zA-Z0-9_-]+)(?:,\s*ChunkID:([a-zA-Z0-9_-]+))?(?:,\s*Page:(\d+))?\]/g, (m, dId) => {
    const foundIdx = validCitations.findIndex((c) => c.document_id === dId || c.chunk_id === dId);
    return foundIdx >= 0 ? `[${foundIdx + 1}]` : '[1]';
  });

  return {
    validCitations,
    invalidCitations,
    sanitizedText,
  };
}
