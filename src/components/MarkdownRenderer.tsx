'use client';

import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Configure marked for smooth GFM rendering with auto line breaks
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    try {
      const rawHtml = marked.parse(content) as string;
      return rawHtml;
    } catch (e) {
      console.warn('Markdown parsing error:', e);
      return content;
    }
  }, [content]);

  return (
    <div
      className={`markdown-content text-slate-100 text-xs sm:text-sm leading-relaxed space-y-2.5 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
