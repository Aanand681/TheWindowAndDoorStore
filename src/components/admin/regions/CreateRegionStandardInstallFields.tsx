'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { NewRegionFormState } from '@/hooks/admin/useAdminRegions';

interface CreateRegionStandardInstallFieldsProps {
  newRegion: NewRegionFormState;
  setNewRegion: React.Dispatch<React.SetStateAction<NewRegionFormState>>;
}

export function CreateRegionStandardInstallFields({
  newRegion,
  setNewRegion,
}: CreateRegionStandardInstallFieldsProps) {
  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Labour Per Sqft ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={newRegion.labourPerSqft}
            onChange={(e) =>
              setNewRegion((prev) => ({
                ...prev,
                labourPerSqft: Number(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <Label className="text-xs">Misc Per Sqft ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={newRegion.miscPerSqft}
            onChange={(e) =>
              setNewRegion((prev) => ({
                ...prev,
                miscPerSqft: Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Min Labour per Window ($)</Label>
          <Input
            type="number"
            value={newRegion.labourMin}
            onChange={(e) =>
              setNewRegion((prev) => ({
                ...prev,
                labourMin: Number(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <Label className="text-xs">Min Misc per Window ($)</Label>
          <Input
            type="number"
            value={newRegion.miscMin}
            onChange={(e) =>
              setNewRegion((prev) => ({
                ...prev,
                miscMin: Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Fixed Setup Fee / Job ($)</Label>
          <Input
            type="number"
            value={newRegion.fixedSetupFee}
            onChange={(e) =>
              setNewRegion((prev) => ({
                ...prev,
                fixedSetupFee: Number(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <Label className="text-xs">Extra Lin Per Window (ft)</Label>
          <Input
            type="number"
            step="0.01"
            value={newRegion.extraLinPerWindow}
            onChange={(e) =>
              setNewRegion((prev) => ({
                ...prev,
                extraLinPerWindow: Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Free Radius Cities (comma-separated)</Label>
        <Input
          placeholder="e.g. Fort Frances, Devlin, Emo"
          value={newRegion.freeCities}
          onChange={(e) =>
            setNewRegion((prev) => ({ ...prev, freeCities: e.target.value }))
          }
        />
      </div>

      {/* Dynamic Setup Fees */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dynamic Setup Fee Options
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-primary font-semibold flex items-center gap-1 cursor-pointer"
            onClick={() => {
              setNewRegion((prev) => ({
                ...prev,
                setupFeeOptions: [
                  ...prev.setupFeeOptions,
                  { label: '', value: 0 },
                ],
              }));
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Fee
          </Button>
        </div>
        <div className="space-y-2">
          {newRegion.setupFeeOptions.map((opt, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                className="flex-1 text-xs"
                placeholder="e.g. Standard Setup or Crane Fee"
                value={opt.label}
                onChange={(e) => {
                  const updated = [...newRegion.setupFeeOptions];
                  updated[idx] = { ...updated[idx], label: e.target.value };
                  setNewRegion((prev) => ({
                    ...prev,
                    setupFeeOptions: updated,
                  }));
                }}
              />
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  $
                </span>
                <Input
                  className="pl-6 text-xs"
                  type="number"
                  placeholder="0"
                  value={opt.value}
                  onChange={(e) => {
                    const updated = [...newRegion.setupFeeOptions];
                    updated[idx] = {
                      ...updated[idx],
                      value: Number(e.target.value),
                    };
                    setNewRegion((prev) => ({
                      ...prev,
                      setupFeeOptions: updated,
                    }));
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                onClick={() => {
                  setNewRegion((prev) => ({
                    ...prev,
                    setupFeeOptions: prev.setupFeeOptions.filter(
                      (_, i) => i !== idx
                    ),
                  }));
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

