import { NextRequest, NextResponse } from 'next/server';
import { extractDocumentText } from '@/lib/rag/textExtractor';
import { chunkDocumentBlocks } from '@/lib/rag/chunker';
import { generateEmbedding } from '@/lib/rag/embeddings';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, file_type, project_id, user_id } = body;

    if (!title || !file_type || !project_id) {
      return NextResponse.json({ error: 'Missing required parameters (title, file_type, project_id)' }, { status: 400 });
    }

    // Step 1: Text extraction with page & heading mapping
    const extractionResult = await extractDocumentText(content || title, file_type, title);

    // Step 2: Heading & paragraph-aware chunking
    const chunks = chunkDocumentBlocks(extractionResult.blocks, {
      chunkSize: 500,
      chunkOverlap: 100,
    });

    // Step 3: Embeddings generation
    const embeddedChunks = await Promise.all(
      chunks.map(async (c) => ({
        ...c,
        embedding: await generateEmbedding(c.content),
      }))
    );

    return NextResponse.json({
      success: true,
      document: {
        title: extractionResult.title,
        file_type,
        project_id,
        page_count: extractionResult.totalPages,
        total_chunks: embeddedChunks.length,
        status: 'indexed',
      },
      chunks: embeddedChunks.map((c) => ({
        chunk_index: c.chunkIndex,
        content: c.content,
        page_number: c.pageNumber,
        section_heading: c.sectionHeading,
        char_start: c.charStart,
        char_end: c.charEnd,
      })),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown ingestion error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
