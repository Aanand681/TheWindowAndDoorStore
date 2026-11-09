import { DbSettingsItem } from '@/components/calculator/comparison/types';

export function resolveOptionALabel(
  id: string,
  fallbackName: string,
  items: DbSettingsItem[]
): string {
  if (!id || id === 'none') return 'None';
  const match = items.find((j) => j.id === id);
  return match?.label || match?.name || fallbackName || 'None';
}

export function resolveOverrideDisplay(
  overrideId: string,
  optionALabel: string,
  items: DbSettingsItem[],
  placeholder: string
): string {
  if (overrideId === 'inherit') {
    return `Same as Option A (${optionALabel})`;
  }
  if (overrideId === 'none') {
    return 'None';
  }
  const match = items.find((j) => j.id === overrideId);
  return match?.label || match?.name || placeholder;
}

export function resolveEffectiveRate(
  overrideId: string,
  overrideRate: string,
  optionAId: string,
  optionARate: string,
  items: DbSettingsItem[]
): number {
  const effectiveId = overrideId === 'inherit' ? optionAId : overrideId;
  if (effectiveId === 'none') return 0;
  if (effectiveId === 'custom') {
    return Number(overrideId === 'inherit' ? optionARate : overrideRate) || 0;
  }
  const match = items.find((item) => item.id === effectiveId);
  return match ? Number(match.rate ?? (match as any).pricePerFoot ?? 0) : 0;
}

