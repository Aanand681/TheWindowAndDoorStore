export type QuotesSubTabType =
  | 'review'
  | 'odoo'
  | 'my'
  | 'all'
  | 'odoo_completed'
  | 'all_assigned';

export interface QuotesTabProps {
  currentUser: any;
  onOpenQuote: (quoteId: string, isEdit?: boolean, originSubTab?: QuotesSubTabType) => void;
  onQuotesCountChange?: (count: number) => void;
  initialSubTab?: QuotesSubTabType;
  initialPreviewQuoteId?: string;
}

export interface QuotePricingResult {
  basePrice: number;
  surcharge: number;
  promoDiscount: number;
  effectiveJC: number;
  effectiveMisc: number;
  effectiveLabour: number;
  includeJCInPromo: boolean;
  includeMiscInPromo: boolean;
  includeLabourInPromo: boolean;
  beforeTaxDiscount: number;
  afterDiscount: number;
  hstRate: number;
  hst: number;
  total: number;
  firstPayment: number;
  secondPayment: number;
}

