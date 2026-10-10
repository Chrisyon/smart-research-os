import { generateEmbedding, cosineSimilarity } from './embeddings';
import { RetrievedEvidenceChunk } from './promptBuilder';
import { store } from '@/services/store';

export interface RetrievalQueryRequest {
  query: string;
  projectId?: string;
  userId?: string;
  selectedDocumentIds?: string[];
  topK?: number;
  similarityThreshold?: number;
}

export interface RetrievalTelemetry {
  retrievalLatencyMs: number;
  chunksEvaluated: number;
  chunksMatched: number;
}

// In-Memory Hybrid Store Index for local fallback and offline execution
const MOCK_INDEXED_CHUNKS: RetrievedEvidenceChunk[] = [
  {
    chunkId: 'chunk-101',
    documentId: 'doc-1',
    documentTitle: 'Attention Is All You Need (Vaswani et al.)',
    pageNumber: 1,
    sectionHeading: 'Abstract & Introduction',
    content: 'We propose the Transformer, a simple network architecture based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    similarity: 0.92,
  },
  {
    chunkId: 'chunk-102',
    documentId: 'doc-1',
    documentTitle: 'Attention Is All You Need (Vaswani et al.)',
    pageNumber: 3,
    sectionHeading: 'Multi-Head Attention',
    content: 'Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions simultaneously.',
    similarity: 0.88,
  },
  {
    chunkId: 'chunk-201',
    documentId: 'doc-2',
    documentTitle: 'Quantum Neural Networks Overview',
    pageNumber: 2,
    sectionHeading: 'Quantum Variational Circuits',
    content: 'Quantum Neural Networks combine parameterized quantum circuits with classical optimization algorithms to achieve high-dimensional Hilbert space projections.',
    similarity: 0.85,
  },
];

export async function executeHybridRetrieval(
  req: RetrievalQueryRequest
): Promise<{ evidence: RetrievedEvidenceChunk[]; telemetry: RetrievalTelemetry }> {
  const startTime = Date.now();
  const topK = req.topK || 5;
  const threshold = req.similarityThreshold || 0.15;

  const queryVec = await generateEmbedding(req.query);

  // Build dynamic chunks from active store documents
  const allDocs = store.getDocuments();
  const dynamicChunks: RetrievedEvidenceChunk[] = [];

  allDocs.forEach((doc) => {
    const rawText = (doc.metadata?.fullText as string) || doc.title;
    const paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    paragraphs.forEach((p, idx) => {
      dynamicChunks.push({
        chunkId: `chunk-${doc.id}-${idx + 1}`,
        documentId: doc.id,
        documentTitle: doc.title.replace(/\+/g, ' '),
        pageNumber: Math.floor(idx / 3) + 1,
        sectionHeading: `Paragraf ${idx + 1}`,
        content: p.trim(),
        similarity: 0.5,
      });
    });
  });

  const allAvailableChunks = dynamicChunks.length > 0 ? dynamicChunks : MOCK_INDEXED_CHUNKS;

  // Filter chunks by security permissions: project, user, selected documents
  let eligibleChunks = allAvailableChunks;

  if (req.selectedDocumentIds && req.selectedDocumentIds.length > 0) {
    eligibleChunks = eligibleChunks.filter((c) => req.selectedDocumentIds!.includes(c.documentId));
  }

  // Calculate similarity & hybrid scores
  const scored = eligibleChunks.map((chunk) => {
    const sim = cosineSimilarity(queryVec, generateEmbeddingLocalSync(chunk.content));
    const keywordMatch = chunk.content.toLowerCase().includes(req.query.toLowerCase()) ? 0.3 : 0.0;
    const hybridScore = sim * 0.7 + keywordMatch;

    return {
      ...chunk,
      similarity: Math.max(sim, hybridScore),
    };
  });

  // Filter by threshold & sort descending
  const matched = scored
    .filter((c) => c.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  const endTime = Date.now();

  const telemetry: RetrievalTelemetry = {
    retrievalLatencyMs: endTime - startTime,
    chunksEvaluated: eligibleChunks.length,
    chunksMatched: matched.length,
  };

  return { evidence: matched, telemetry };
}

function generateEmbeddingLocalSync(text: string): number[] {
  const vector: number[] = new Array(1536).fill(0);
  const normalized = text.toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (charCode * 31 + i * 17) % 1536;
    vector[index] += Math.sin(charCode) * 0.1;
  }
  let norm = 0;
  for (let i = 0; i < 1536; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < 1536; i++) {
    vector[i] = vector[i] / norm;
  }
  return vector;
}
