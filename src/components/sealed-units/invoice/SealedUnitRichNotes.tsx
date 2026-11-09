import React from 'react';

/**
 * Rich Formatted Notes Parser:
 * Supports bold (<b>, <strong>, **text**), bullet points (•, -, *), and paragraph breaks cleanly.
 */
export function renderRichNotes(notes?: string, baseFs: number = 7.5) {
  if (!notes || !notes.trim()) return null;

  const cleaned = notes
    .replace(/<br\s*\/?>\s*<\/(div|p|li)>/gi, '</$1>')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|li)>/gi, '\n')
    .replace(/([^\n])<(div|p|li)[^>]*>/gi, '$1\n')
    .replace(/&nbsp;/gi, ' ');

  const rawLines = cleaned.split('\n');
  const lines: string[] = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed) lines.push(trimmed);
  }

  if (lines.length === 0) return null;

  return (
    <div className="space-y-1 text-gray-800 leading-snug font-sans" style={{ fontSize: `${baseFs}pt` }}>
      {lines.map((line, idx) => {
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        const textContent = isBullet ? line.replace(/^[•\-*]\s*/, '') : line;

        return (
          <div key={idx} className={isBullet ? 'flex items-start gap-1.5 pl-1' : ''}>
            {isBullet && <span className="text-gray-900 font-bold select-none shrink-0">•</span>}
            <div
              className={isBullet ? 'flex-1' : ''}
              dangerouslySetInnerHTML={{
                __html: textContent
                  .replace(/<(?!\/?(b|strong|i|em)\b)[^>]+>/gi, '')
                  .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                  .replace(/\*(.*?)\*/g, '<i>$1</i>'),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

