'use client';

import React from 'react';
import {
  Check,
  FileText,
  Sparkles,
  AlertTriangle,
  Send,
  ClipboardCheck,
  CheckSquare,
} from 'lucide-react';
import { NotificationItem } from './types';

interface NotificationItemRowProps {
  notification: NotificationItem;
  onClick: () => void;
}

function formatTime(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationItemRow({ notification: n, onClick }: NotificationItemRowProps) {
  const isModified = n.type === 'QUOTE_MODIFIED';
  const isReturned = n.type === 'QUOTE_RETURNED';
  const isApproved = n.type === 'QUOTE_APPROVED';
  const isSubmission = n.type === 'QUOTE_SUBMITTED' || n.type === 'QUOTE_ASSIGNED';
  const isOdoo = n.type === 'QUOTE_ODOO_ASSIGNED';
  const isOdooDone = n.type === 'ODOO_ENTRY_COMPLETED';

  return (
    <div
      onClick={onClick}
      className={`p-3 text-left transition-colors cursor-pointer flex gap-3 hover:bg-muted/50 ${
        !n.isRead ? 'bg-primary/5 font-medium' : 'opacity-85'
      }`}
    >
      <div className="pt-0.5 shrink-0">
        {isOdoo && (
          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-500">
            <ClipboardCheck className="w-4 h-4" />
          </div>
        )}
        {isOdooDone && (
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
            <CheckSquare className="w-4 h-4" />
          </div>
        )}
        {isModified && (
          <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-500">
            <Sparkles className="w-4 h-4" />
          </div>
        )}
        {isReturned && (
          <div className="p-1.5 rounded-lg bg-destructive/15 text-destructive">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
        {isApproved && (
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
            <Check className="w-4 h-4" />
          </div>
        )}
        {isSubmission && (
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
            <Send className="w-4 h-4" />
          </div>
        )}
        {!isModified && !isReturned && !isApproved && !isSubmission && !isOdoo && !isOdooDone && (
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
            <FileText className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-bold text-foreground truncate">
            {n.title}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatTime(n.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {n.message}
        </p>

        {n.reviewChanges && n.reviewChanges.length > 0 && (
          <div className="mt-1.5 p-1.5 rounded bg-muted/60 text-[11px] text-muted-foreground border border-border/30">
            <span className="font-semibold text-foreground/80">Revisions:</span>
            <ul className="list-disc list-inside mt-0.5 space-y-0.5">
              {n.reviewChanges.slice(0, 2).map((c, i) => (
                <li key={i} className="truncate">{c}</li>
              ))}
              {n.reviewChanges.length > 2 && (
                <li className="text-[10px] italic">+{n.reviewChanges.length - 2} more changes</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {!n.isRead && (
        <div className="shrink-0 self-center">
          <span className="w-2 h-2 rounded-full bg-primary block" />
        </div>
      )}
    </div>
  );
}

