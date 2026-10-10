import { NextRequest, NextResponse } from 'next/server';
import { runRAGPipeline } from '@/lib/rag/ragPipeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, project_id, user_id, selected_document_ids, conversation_id } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Valid question is required' }, { status: 400 });
    }

    const pipelineResult = await runRAGPipeline({
      question,
      projectId: project_id,
      userId: user_id,
      selectedDocumentIds: selected_document_ids,
      conversationId: conversation_id,
    });

    return NextResponse.json({
      success: true,
      answer: pipelineResult.answer,
      citations: pipelineResult.citations,
      telemetry: pipelineResult.telemetry,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown RAG query error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
