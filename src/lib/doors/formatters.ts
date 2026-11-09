import { DoorLineItem } from './types';

/**
 * Formats a single door line item heading using its quantity and description.
 * e.g. quantity = 2, desc = "Steel Entry Door" => "2 Steel Entry Door"
 * e.g. quantity = 1, desc = "garden door" => "1 garden door"
 * Avoids duplicate quantity if desc already starts with a number matching qty.
 */
export function formatDoorItemHeading(item: {
  quantity?: number;
  customDescription?: string;
  presetLabel?: string;
}): string {
  const qty = Math.max(1, Number(item?.quantity) || 1);
  const rawDesc =
    (item?.customDescription && item.customDescription.trim()) ||
    item?.presetLabel ||
    'Door';

  // If description already starts with a number (e.g. "2 Steel Entry Door")
  if (/^\d+\s+/.test(rawDesc)) {
    return rawDesc;
  }
  return `${qty} ${rawDesc}`;
}

/**
 * Natural language sentence formatter for door line items.
 * e.g. "2 Steel Entry Door and 1 garden door"
 */
export function formatDoorSummarySentence(lineItems: DoorLineItem[]): string {
  if (!lineItems || lineItems.length === 0) return 'Doors & Systems';

  const parts = lineItems.map((item) => formatDoorItemHeading(item));

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

