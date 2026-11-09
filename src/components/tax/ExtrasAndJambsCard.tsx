'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface ExtrasAndJambsCardProps {
  readOnly?: boolean;
  dbAddons: any[];
  setDbAddons: React.Dispatch<React.SetStateAction<any[]>>;
  addons: Record<string, string>;
  setAddons: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSupplyOnly: boolean;
  linearFt: number;
  dbJambs: any[];
  jambId: string;
  setJambId: (id: string) => void;
  jambName: string;
  setJambName: (name: string) => void;
  jambRate: string;
  setJambRate: (rate: string) => void;
  dbCasings: any[];
  casingId: string;
  setCasingId: (id: string) => void;
  casingName: string;
  setCasingName: (name: string) => void;
  casingRate: string;
  setCasingRate: (rate: string) => void;
}

export function ExtrasAndJambsCard({
  readOnly = false,
  dbAddons,
  setDbAddons,
  addons,
  setAddons,
  isSupplyOnly,
  linearFt,
  dbJambs,
  jambId,
  setJambId,
  jambName,
  setJambName,
  jambRate,
  setJambRate,
  dbCasings,
  casingId,
  setCasingId,
  casingName,
  setCasingName,
  casingRate,
  setCasingRate,
}: ExtrasAndJambsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {/* Extras Card */}
      <Card className="py-0 gap-0 [--card-spacing:0px] shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-5 !pb-3 border-b border-border/50">
          <CardTitle className="text-base">Extras</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {dbAddons.map((a: any, index: number) => (
            <div key={a.id} className="flex justify-between items-center gap-3">
              {a.isCustom ? (
                <div className="flex-1 space-y-1.5">
                  <Input
                    disabled={readOnly}
                    placeholder="Description"
                    className="h-8 text-xs"
                    value={a.label}
                    onChange={(e) => {
                      const newDb = [...dbAddons];
                      newDb[index].label = e.target.value;
                      setDbAddons(newDb);
                    }}
                  />
                  <div className="flex gap-2">
                    <Input
                      disabled={readOnly}
                      type="number"
                      placeholder="Lab $"
                      className="h-8 text-xs w-20 font-mono"
                      value={a.lab || ''}
                      onChange={(e) => {
                        const newDb = [...dbAddons];
                        newDb[index].lab = Number(e.target.value);
                        setDbAddons(newDb);
                        if (!addons[a.id] || addons[a.id] === '0') {
                          setAddons((prev) => ({ ...prev, [a.id]: '1' }));
                        }
                      }}
                    />
                    <Input
                      disabled={readOnly}
                      type="number"
                      placeholder="Misc $"
                      className="h-8 text-xs w-20 font-mono"
                      value={a.misc || ''}
                      onChange={(e) => {
                        const newDb = [...dbAddons];
                        newDb[index].misc = Number(e.target.value);
                        setDbAddons(newDb);
                        if (!addons[a.id] || addons[a.id] === '0') {
                          setAddons((prev) => ({ ...prev, [a.id]: '1' }));
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <Label className="text-xs flex-1 text-muted-foreground">{a.label}</Label>
              )}
              <div className="flex items-center gap-1.5">
                <Input
                  disabled={readOnly}
                  type="number"
                  className="w-16 h-8 text-xs font-mono"
                  placeholder={a.isCustom ? '1' : 'Qty'}
                  min="0"
                  value={addons[a.id] || ''}
                  onChange={(e) => setAddons({ ...addons, [a.id]: e.target.value })}
                />
                {!readOnly && a.isCustom && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    onClick={() => {
                      setDbAddons(dbAddons.filter((item) => item.id !== a.id));
                      const newAddonsMap = { ...addons };
                      delete newAddonsMap[a.id];
                      setAddons(newAddonsMap);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-1.5 h-8 text-xs border-dashed"
              onClick={() => {
                const newId = 'custom_' + Date.now();
                setDbAddons([
                  ...dbAddons,
                  { id: newId, label: '', lab: 0, misc: 0, isCustom: true },
                ]);
                setAddons((prev) => ({ ...prev, [newId]: '1' }));
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Custom Extra
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Jambs & Casing Card */}
      <Card className="py-0 gap-0 [--card-spacing:0px] shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-5 !pb-3 border-b border-border/50">
          <CardTitle className="text-base">Jambs &amp; Casing</CardTitle>
          <CardDescription className="text-xs">
            {isSupplyOnly
              ? `Perimeter linear ft: ${linearFt.toFixed(2)} ft (Supply-Only defaults to None)`
              : `Priced on total linear ft: ${linearFt.toFixed(2)} ft`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Jamb</Label>
            <Select disabled={readOnly} value={jambId} onValueChange={(val) => setJambId(val ?? '')}>
              <SelectTrigger className="w-full h-9 text-xs">
                <SelectValue>
                  {jambId === 'none'
                    ? 'None'
                    : jambId === 'custom'
                    ? 'Custom...'
                    : dbJambs.find((j) => j.id === jambId)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[280px]">
                <SelectItem value="none">None</SelectItem>
                {dbJambs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {jambId === 'custom' && (
              <div className="flex gap-2 mt-2">
                <Input
                  disabled={readOnly}
                  className="h-8 text-xs"
                  placeholder="Name"
                  value={jambName}
                  onChange={(e) => setJambName(e.target.value)}
                />
                <Input
                  disabled={readOnly}
                  className="h-8 text-xs font-mono"
                  placeholder="Rate/ft"
                  type="number"
                  value={jambRate}
                  onChange={(e) => setJambRate(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Casing</Label>
            <Select disabled={readOnly} value={casingId} onValueChange={(val) => setCasingId(val ?? '')}>
              <SelectTrigger className="w-full h-9 text-xs">
                <SelectValue>
                  {casingId === 'none'
                    ? 'None'
                    : casingId === 'custom'
                    ? 'Custom...'
                    : dbCasings.find((c) => c.id === casingId)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[280px]">
                <SelectItem value="none">None</SelectItem>
                {dbCasings.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {casingId === 'custom' && (
              <div className="flex gap-2 mt-2">
                <Input
                  disabled={readOnly}
                  className="h-8 text-xs"
                  placeholder="Name"
                  value={casingName}
                  onChange={(e) => setCasingName(e.target.value)}
                />
                <Input
                  disabled={readOnly}
                  className="h-8 text-xs font-mono"
                  placeholder="Rate/ft"
                  type="number"
                  value={casingRate}
                  onChange={(e) => setCasingRate(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

