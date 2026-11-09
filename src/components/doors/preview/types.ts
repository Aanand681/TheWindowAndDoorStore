import {
  DoorLineItem,
  DoorQuoteTotals,
  DoorQuotingMode,
  DoorSelectedUpcharge,
} from '@/lib/doors/types';

export interface DoorPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineItems: DoorLineItem[];
  totals: DoorQuoteTotals;
  mode: DoorQuotingMode;
  globalUpcharges: DoorSelectedUpcharge[];
  customerName?: string;
  quoteNumber?: string;
  preparedBy?: string;
  quoteNotes: string;
  onQuoteNotesChange: (notes: string) => void;
  isFirstNation: boolean;
  attachedWindowQuote?: any | null;
  attachedSealedUnit?: any | null;
}

