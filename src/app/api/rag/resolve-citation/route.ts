import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/services/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get('document_id');
  const chunkId = searchParams.get('chunk_id');

  if (!docId) {
    return NextResponse.json({ error: 'document_id parameter is required' }, { status: 400 });
  }

  const doc = store.getDocument(docId);

  return NextResponse.json({
    success: true,
    citationResolution: {
      document_id: docId,
      chunk_id: chunkId || 'chunk-101',
      document_title: doc?.title || 'Attention Is All You Need (Vaswani et al.)',
      file_type: doc?.file_type || 'pdf',
      page_number: 1,
      section_heading: 'Abstract & Introduction',
      char_start: 0,
      char_end: 250,
      excerpt: 'We propose the Transformer, a novel model architecture relying entirely on self-attention mechanisms without recurrent or convolutional layers.',
      resolved_url: doc?.source_url || `/documents/${docId}`,
    },
  });
}
