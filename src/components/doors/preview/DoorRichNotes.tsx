'use client';

import React from 'react';

/**
 * Rich Formatted Notes Parser (Matching Sealed Units and Window proposal):
 * Supports bold (<b>, <strong>, **text**), bullet points (•, -, *), and line breaks.
 */
export function renderRichNotes(notes?: string) {
  if (!notes || !notes.trim()) return null;

  const lines = notes.split('\n');
  return (
    <div className="space-y-1 text-[8pt] text-slate-800 leading-snug">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1.5" />;
        const isBullet =
          line.trim().startsWith('•') ||
          line.trim().startsWith('- ') ||
          line.trim().startsWith('* ');
        const text = isBullet ? line.trim().replace(/^[•\-\*]\s*/, '') : line;

        const parts = text.split(/(\*\*.*?\*\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-slate-950">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5">
              <span className="text-slate-900 font-bold shrink-0">•</span>
              <span>{renderedLine}</span>
            </div>
          );
        }

        return <div key={idx}>{renderedLine}</div>;
      })}
    </div>
  );
}

export function DoorRichNotes({ notes }: { notes?: string }) {
  if (!notes || !notes.trim()) return null;

  return (
    <div className="border border-slate-300 rounded p-2.5 bg-slate-50/60 text-[7.5pt]">
      <div className="font-bold text-slate-700 uppercase text-[7pt] tracking-wider mb-1">
        Special Notes &amp; Site Instructions:
      </div>
      {renderRichNotes(notes)}
    </div>
  );
}

