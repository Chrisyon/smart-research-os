import { ExtractedBlock } from './textExtractor';

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  preserveSectionHeadings?: boolean;
}

export interface GeneratedChunk {
  chunkIndex: number;
  content: string;
  pageNumber?: number;
  sectionHeading?: string;
  charStart: number;
  charEnd: number;
  metadata?: Record<string, unknown>;
}

export function chunkDocumentBlocks(
  blocks: ExtractedBlock[],
  options: ChunkOptions = {}
): GeneratedChunk[] {
  const chunkSize = options.chunkSize || 500;
  const chunkOverlap = options.chunkOverlap || 100;

  const chunks: GeneratedChunk[] = [];
  let globalChunkIndex = 0;

  for (const block of blocks) {
    const text = block.content;
    const pageNum = block.pageNumber || 1;
    const heading = block.sectionHeading || 'General';

    if (text.length <= chunkSize) {
      chunks.push({
        chunkIndex: globalChunkIndex++,
        content: text,
        pageNumber: pageNum,
        sectionHeading: heading,
        charStart: block.charStart,
        charEnd: block.charEnd,
      });
      continue;
    }

    // Paragraph-aware split
    const paragraphs = text.split(/\n\n+/);
    let currentChunkText = '';
    let currentStartOffset = block.charStart;

    for (const paragraph of paragraphs) {
      if ((currentChunkText + '\n\n' + paragraph).length <= chunkSize) {
        currentChunkText = currentChunkText ? `${currentChunkText}\n\n${paragraph}` : paragraph;
      } else {
        if (currentChunkText.trim()) {
          chunks.push({
            chunkIndex: globalChunkIndex++,
            content: currentChunkText.trim(),
            pageNumber: pageNum,
            sectionHeading: heading,
            charStart: currentStartOffset,
            charEnd: currentStartOffset + currentChunkText.length,
          });

          // Overlap window
          const overlapText = currentChunkText.slice(Math.max(0, currentChunkText.length - chunkOverlap));
          currentStartOffset = currentStartOffset + (currentChunkText.length - overlapText.length);
          currentChunkText = `${overlapText}\n\n${paragraph}`;
        } else {
          // Paragraph itself is larger than chunkSize: sliding window character split
          let start = 0;
          while (start < paragraph.length) {
            const end = Math.min(start + chunkSize, paragraph.length);
            const slice = paragraph.slice(start, end);

            chunks.push({
              chunkIndex: globalChunkIndex++,
              content: slice,
              pageNumber: pageNum,
              sectionHeading: heading,
              charStart: block.charStart + start,
              charEnd: block.charStart + end,
            });

            start += (chunkSize - chunkOverlap);
          }
          currentChunkText = '';
        }
      }
    }

    if (currentChunkText.trim()) {
      chunks.push({
        chunkIndex: globalChunkIndex++,
        content: currentChunkText.trim(),
        pageNumber: pageNum,
        sectionHeading: heading,
        charStart: currentStartOffset,
        charEnd: currentStartOffset + currentChunkText.length,
      });
    }
  }

  return chunks;
}
