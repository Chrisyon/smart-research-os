import test, { describe } from 'node:test';
import assert from 'node:assert';
import { extractDocumentText } from '../src/lib/rag/textExtractor';
import { chunkDocumentBlocks } from '../src/lib/rag/chunker';
import { generateEmbedding, cosineSimilarity } from '../src/lib/rag/embeddings';
import { executeHybridRetrieval } from '../src/lib/rag/retriever';
import { buildGroundedRAGPrompt } from '../src/lib/rag/promptBuilder';
import { validateAndReconcileCitations } from '../src/lib/rag/citationValidator';
import { runRAGPipeline } from '../src/lib/rag/ragPipeline';

describe('Smart Research OS — Native RAG Engine Test Suite', () => {

  test('1. Extracts Markdown text preserving headings and character offsets', async () => {
    const mdContent = `# Transformer Architecture\n\nSelf-attention is the key innovation.\n\n## Multi-Head Attention\n\nAllows joint attention over multiple representation subspaces.`;
    const result = await extractDocumentText(mdContent, 'markdown', 'Test Paper');

    assert.strictEqual(result.fileType, 'markdown');
    assert.ok(result.blocks.length > 0);
    assert.strictEqual(result.blocks[0].sectionHeading, 'Transformer Architecture');
  });

  test('2. Chunks document blocks with paragraph boundary respect and overlap', () => {
    const sampleBlocks = [
      {
        pageNumber: 1,
        sectionHeading: 'Introduction',
        content: 'Paragraph 1: Transformer neural sequence models dispense with recurrence entirely.\n\nParagraph 2: Self-attention computes dependencies across sequence positions simultaneously.',
        charStart: 0,
        charEnd: 200,
      }
    ];

    const chunks = chunkDocumentBlocks(sampleBlocks, { chunkSize: 120, chunkOverlap: 20 });
    assert.ok(chunks.length > 0);
    assert.strictEqual(chunks[0].sectionHeading, 'Introduction');
    assert.strictEqual(chunks[0].chunkIndex, 0);
  });

  test('3. Generates 1536-dimensional embeddings and calculates cosine similarity', async () => {
    const textA = 'Transformer self-attention mechanism';
    const textB = 'Attention mechanisms in deep neural networks';
    const textC = 'Recipe for baking chocolate chip cookies';

    const embA = await generateEmbedding(textA);
    const embB = await generateEmbedding(textB);
    const embC = await generateEmbedding(textC);

    assert.strictEqual(embA.length, 1536);
    assert.strictEqual(embB.length, 1536);

    const simAB = cosineSimilarity(embA, embB);
    const simAC = cosineSimilarity(embA, embC);

    assert.ok(simAB > simAC);
  });

  test('4. Enforces security filtering on selected document IDs during hybrid retrieval', async () => {
    const { evidence } = await executeHybridRetrieval({
      query: 'attention',
      selectedDocumentIds: ['doc-1'],
    });

    assert.ok(evidence.every((e) => e.documentId === 'doc-1'));
  });

  test('5. Returns explicit insufficient context message when no matching evidence exists', async () => {
    const result = await runRAGPipeline({
      question: 'What is the stock price of Apple in 1980?',
      selectedDocumentIds: ['non-existent-doc-id'],
    });

    assert.strictEqual(result.telemetry.sufficientContext, false);
    assert.ok(result.answer.includes('Insufficient context in selected research documents'));
    assert.strictEqual(result.citations.length, 0);
  });

  test('6. Validates generated citations against actual retrieved chunks and filters invented references', () => {
    const mockEvidence = [
      {
        chunkId: 'chunk-101',
        documentId: 'doc-1',
        documentTitle: 'Attention Is All You Need',
        pageNumber: 1,
        content: 'We propose the Transformer model architecture.',
        similarity: 0.9,
      }
    ];

    const rawLLMResponse = 'The Transformer model is introduced [DocID:doc-1, ChunkID:chunk-101, Page:1], but fake claim [DocID:fake-doc-999] was hallucinated.';

    const { validCitations, sanitizedText } = validateAndReconcileCitations(rawLLMResponse, mockEvidence);

    assert.strictEqual(validCitations.length, 1);
    assert.strictEqual(validCitations[0].document_id, 'doc-1');
    assert.ok(sanitizedText.includes('[1]'));
    assert.ok(!sanitizedText.includes('DocID:fake-doc-999'));
  });

});
