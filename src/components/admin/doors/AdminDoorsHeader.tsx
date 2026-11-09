'use client';

import React from 'react';
import { DoorClosed, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SmartBackButton from '@/components/shared/SmartBackButton';

export interface AdminDoorsHeaderProps {
  onResetDefaults: () => void;
  onSave: () => Promise<void>;
  saving: boolean;
  loading: boolean;
}

export function AdminDoorsHeader({
  onResetDefaults,
  onSave,
  saving,
  loading,
}: AdminDoorsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <SmartBackButton fallbackUrl="/admin" />
        <div>
          <div className="flex items-center gap-2">
            <DoorClosed className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Door Pricing &amp; Labour Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage door categories, presets, upcharges, surcharge %, 10% discount, and logistics rates.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onResetDefaults}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Defaults
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={saving || loading}
          className="gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-sm"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

