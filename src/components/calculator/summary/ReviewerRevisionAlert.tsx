import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ReviewerRevisionAlert({ notes }: { notes?: string }) {
  if (!notes) return null;
  return (
    <div className="mt-3 text-xs bg-amber-500/15 border border-amber-500/35 text-amber-950 dark:text-amber-200 p-3 rounded-xl font-medium flex items-start gap-2 shadow-xs animate-in fade-in">
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div>
        <strong className="text-amber-900 dark:text-amber-300">
          Reviewer Revision Instructions:
        </strong>
        <p className="mt-0.5 italic text-foreground/90 font-normal">&quot;{notes}&quot;</p>
      </div>
    </div>
  );
}

