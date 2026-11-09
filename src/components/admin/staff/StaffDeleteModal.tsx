'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { UserType } from './types';

export interface StaffDeleteModalProps {
  userToDelete: string | null;
  users: UserType[];
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function StaffDeleteModal({
  userToDelete,
  users,
  onCancel,
  onConfirm,
}: StaffDeleteModalProps) {
  if (!userToDelete) return null;

  const targetUser = users.find((u) => u._id === userToDelete);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border animate-in fade-in zoom-in-95 duration-200 space-y-4">
        <div className="flex items-center gap-3 text-destructive">
          <Trash2 className="w-6 h-6" />
          <h3 className="text-lg font-bold">Delete Staff Member?</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{' '}
          <strong className="text-foreground">{targetUser?.username}</strong>? This action cannot be
          undone and all associated permissions will be permanently removed.
        </p>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Staff
          </Button>
        </div>
      </div>
    </div>
  );
}

