import React from 'react';

export interface QuoteInvoiceNotesProps {
  notes?: string;
  noteFs?: number;
}

export function QuoteInvoiceNotes({ notes, noteFs = 9.5 }: QuoteInvoiceNotesProps) {
  if (!notes || !notes.trim()) return null;

  // 1. Normalize line breaks across HTML tags:
  const cleaned = notes
    .replace(/<br\s*\/?>\s*<\/(div|p|li)>/gi, '</$1>')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|li)>/gi, '\n')
    .replace(/([^\n])<(div|p|li)[^>]*>/gi, '$1\n')
    .replace(/<(div|p|li)[^>]*>/gi, '')
    .replace(/&nbsp;/gi, ' ');

  // 2. Split by newlines and preserve intentional blank lines (spacing between paragraphs)
  const rawLines = cleaned.split('\n');

  // Strip leading and trailing blank lines
  let start = 0;
  while (start < rawLines.length && !rawLines[start].trim()) {
    start++;
  }
  let end = rawLines.length - 1;
  while (end >= 0 && !rawLines[end].trim()) {
    end--;
  }

  const lines: string[] = [];
  for (let i = start; i <= end; i++) {
    lines.push(rawLines[i].trim());
  }

  if (lines.length === 0) return null;

  return (
    <div className="space-y-0.5 text-[#0f172a] leading-snug font-sans" style={{ fontSize: `${noteFs}px` }}>
      {lines.map((line, idx) => {
        if (!line) {
          return <div key={idx} className="h-1.5" />;
        }

        // Strip any lingering HTML tags except <b> and <strong>
        const stripped = line.replace(/<(?!\/?(b|strong)\b)[^>]+>/gi, '').trim();
        if (!stripped) return null;

        // Check for bullet point at the start (even if wrapped in <b> or <strong>)
        const isBullet = /^(<b>|<strong>)?\s*(•|-|\*)\s*/i.test(stripped);
        let cleanText = stripped;
        if (isBullet) {
          cleanText = cleanText.replace(/^(<b>|<strong>)\s*(•|-|\*)\s*/i, '$1');
          cleanText = cleanText.replace(/^(•|-|\*)\s*/, '');
        }

        // Parse **bold text**, <b>bold text</b>, and <strong>bold text</strong>
        const parts = cleanText.split(/(\*\*[^*]+\*\*|<b>.*?<\/b>|<strong>.*?<\/strong>)/gi);
        const parsedContent = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-[#0f172a] print:text-black">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.toLowerCase().startsWith('<b>') && part.toLowerCase().endsWith('</b>')) {
            return (
              <strong key={pIdx} className="font-bold text-[#0f172a] print:text-black">
                {part.slice(3, -4)}
              </strong>
            );
          }
          if (part.toLowerCase().startsWith('<strong>') && part.toLowerCase().endsWith('</strong>')) {
            return (
              <strong key={pIdx} className="font-bold text-[#0f172a] print:text-black">
                {part.slice(8, -9)}
              </strong>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5 leading-snug">
              <span className="text-[#0f172a] print:text-black font-bold select-none">•</span>
              <div className="flex-1 leading-snug">{parsedContent}</div>
            </div>
          );
        }

        return <div key={idx} className="leading-snug">{parsedContent}</div>;
      })}
    </div>
  );
}

export default QuoteInvoiceNotes;

