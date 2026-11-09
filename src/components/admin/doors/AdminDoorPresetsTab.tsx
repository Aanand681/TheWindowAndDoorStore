'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { DoorPreset, DoorCategory } from '@/lib/doors/types';

export interface AdminDoorPresetsTabProps {
  presets: DoorPreset[];
  onAddPreset: () => void;
  onUpdatePreset: (index: number, field: keyof DoorPreset, value: any) => void;
  onDeletePreset: (index: number) => void;
}

export function AdminDoorPresetsTab({
  presets,
  onAddPreset,
  onUpdatePreset,
  onDeletePreset,
}: AdminDoorPresetsTabProps) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/80">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg">Standard Door Presets</CardTitle>
          <CardDescription>
            Base installation labour and miscellaneous materials from the shop price sheet.
          </CardDescription>
        </div>
        <Button size="sm" onClick={onAddPreset} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Preset
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                <th className="py-2.5 px-3">Preset Name</th>
                <th className="py-2.5 px-3 w-36">Category</th>
                <th className="py-2.5 px-3 w-32">Labour ($)</th>
                <th className="py-2.5 px-3 w-32">Misc Mat ($)</th>
                <th className="py-2.5 px-3">Description / Notes</th>
                <th className="py-2.5 px-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {presets.map((preset, idx) => (
                <tr key={preset.id || idx} className="hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3">
                    <Input
                      value={preset.label}
                      onChange={(e) => onUpdatePreset(idx, 'label', e.target.value)}
                      className="h-8 font-medium"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={preset.category}
                      onChange={(e) => onUpdatePreset(idx, 'category', e.target.value as DoorCategory)}
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                    >
                      <option value="entry">Entry Door</option>
                      <option value="patio">Patio Door</option>
                      <option value="garden">Garden/Terrace</option>
                      <option value="storm">Storm Door</option>
                      <option value="custom">Custom</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={preset.labour}
                        onChange={(e) =>
                          onUpdatePreset(idx, 'labour', parseFloat(e.target.value) || 0)
                        }
                        className="h-8 pl-6 text-right font-mono"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={preset.misc}
                        onChange={(e) =>
                          onUpdatePreset(idx, 'misc', parseFloat(e.target.value) || 0)
                        }
                        className="h-8 pl-6 text-right font-mono"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      value={preset.description || ''}
                      onChange={(e) => onUpdatePreset(idx, 'description', e.target.value)}
                      placeholder="Notes or door specs..."
                      className="h-8 text-xs text-muted-foreground"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeletePreset(idx)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      title="Delete preset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

