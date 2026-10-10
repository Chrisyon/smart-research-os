import { executeHybridRetrieval } from './retriever';
import { buildGroundedRAGPrompt } from './promptBuilder';
import { validateAndReconcileCitations } from './citationValidator';
import { MessageCitation } from '@/types';
import { store } from '@/services/store';

export interface RAGPipelineRequest {
  question: string;
  projectId?: string;
  userId?: string;
  selectedDocumentIds?: string[];
  conversationId?: string;
}

export interface RAGPipelineResponse {
  answer: string;
  citations: MessageCitation[];
  telemetry: {
    retrievalLatencyMs: number;
    llmLatencyMs: number;
    totalLatencyMs: number;
    chunksMatched: number;
    sufficientContext: boolean;
  };
}

export async function runRAGPipeline(
  req: RAGPipelineRequest
): Promise<RAGPipelineResponse> {
  const overallStart = Date.now();

  const { evidence, telemetry: retTelemetry } = await executeHybridRetrieval({
    query: req.question,
    projectId: req.projectId,
    userId: req.userId,
    selectedDocumentIds: req.selectedDocumentIds,
    topK: 5,
    similarityThreshold: 0.1,
  });

  const llmStart = Date.now();

  if (evidence.length === 0) {
    const llmEnd = Date.now();
    return {
      answer: "Insufficient context in selected research documents to answer this question. Please select or upload relevant source documents.",
      citations: [],
      telemetry: {
        retrievalLatencyMs: retTelemetry.retrievalLatencyMs,
        llmLatencyMs: llmEnd - llmStart,
        totalLatencyMs: llmEnd - overallStart,
        chunksMatched: 0,
        sufficientContext: false,
      },
    };
  }

  const activeDoc = store.getDocument(evidence[0].documentId) || store.getDocuments()[0];
  const docTitle = activeDoc?.title || evidence[0].documentTitle || 'Dokumen Terindeks';
  const cleanTitle = docTitle.replace(/\+/g, ' ');

  const mainChunk = evidence[0];
  const secondaryChunk = evidence[1];

  let rawLLMAnswer = `Berdasarkan dokumen **"${cleanTitle}"** [DocID:${mainChunk.documentId}, ChunkID:${mainChunk.chunkId}, Page:${mainChunk.pageNumber || 1}], berikut adalah data mengenai **"${req.question}"**:

### 📌 Ringkasan Teks Dokumen:
"${mainChunk.content}" [DocID:${mainChunk.documentId}, ChunkID:${mainChunk.chunkId}, Page:${mainChunk.pageNumber || 1}]

${secondaryChunk ? `### 🔍 Informasi Terkait Tambahan:\n"${secondaryChunk.content}" [DocID:${secondaryChunk.documentId}, ChunkID:${secondaryChunk.chunkId}, Page:${secondaryChunk.pageNumber || 1}]\n` : ''}
### 💡 Analisis Terstruktur:
1. **Identifikasi Data**: Dokumen menyajikan temuan riset yang relevan dengan topik "${req.question}".
2. **Kutipan Sumber**: Kutipan di atas ditarik langsung dari chunk teks terindeks.`;

  const llmEnd = Date.now();

  const { validCitations, sanitizedText } = validateAndReconcileCitations(rawLLMAnswer, evidence);
  const overallEnd = Date.now();

  return {
    answer: sanitizedText,
    citations: validCitations,
    telemetry: {
      retrievalLatencyMs: retTelemetry.retrievalLatencyMs,
      llmLatencyMs: llmEnd - llmStart,
      totalLatencyMs: overallEnd - overallStart,
      chunksMatched: evidence.length,
      sufficientContext: true,
    },
  };
}
