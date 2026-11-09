import { UIWindowItem } from '@/hooks/useCalculatorWindows';
import { DBPromo } from '@/lib/promo-logic';

export interface AttachedUpgradeOption {
  title: string;
  amountPreTaxCents: number;
}

export interface StagedOptionBData {
  windows: UIWindowItem[];
  quoteResult: any;
  afterDiscount: number;
  total: number;
  firstPayment: number;
  secondPayment: number;
  effectiveJC: number;
  effectiveMisc: number;
  effectiveLabour: number;
  activePromoId: string;
  supplyJambId?: string;
  supplyJambName?: string;
  supplyJambRate?: string;
  supplyCasingId?: string;
  supplyCasingName?: string;
  supplyCasingRate?: string;
  customerName?: string;
  quoteNumber?: string;
}

export interface ComparisonOverridesPayload {
  jambId?: string;
  jambRate?: string;
  casingId?: string;
  casingRate?: string;
  extraLabour?: string;
}

export interface QuoteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Option A (Base Quote)
  currentWindows: UIWindowItem[];
  customerName: string;
  quoteNumber: string;
  surchargeRate: number;
  isSupplyOnly: boolean;
  supplyJambId: string;
  supplyJambName: string;
  supplyJambRate: string;
  supplyCasingId: string;
  supplyCasingName: string;
  supplyCasingRate: string;
  effectiveJC: number;
  effectiveMisc: number;
  effectiveLabour: number;
  availablePromos: DBPromo[];
  activePromoId: string;
  hstRate: number;
  quoteResultA: any;
  afterDiscountA: number;
  totalA: number;
  firstPaymentA: number;
  secondPaymentA: number;
  // Two-way Option Swapping & Full Workspace Staging
  appliedOption: 'A' | 'B';
  isComparisonStaging?: boolean;
  stagedOptionB?: StagedOptionBData;
  onApplyOption: (
    target: 'A' | 'B',
    windows: UIWindowItem[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: ComparisonOverridesPayload
  ) => void;
  onApplyAndCustomize?: (
    windows: UIWindowItem[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: ComparisonOverridesPayload
  ) => void;
  onKeepOptionB?: () => void;
  // Attached Upgrade on PDF
  attachedUpgrade: AttachedUpgradeOption | null;
  onAttachUpgrade: (upgrade: AttachedUpgradeOption | null) => void;
}

export interface OptionBFinancials {
  validWindows: any[];
  base: number;
  surcharge: number;
  promoDiscount: number;
  jc: number;
  linearFeet: number;
  labour: number;
  misc: number;
  beforeTaxDiscount: number;
  afterDiscount: number;
  hst: number;
  total: number;
  firstPayment: number;
  secondPayment: number;
  promoResult: any;
}

export interface ComparisonDelta {
  preTax: number;
  tax: number;
  total: number;
  payment: number;
  isUpgrade: boolean;
  isSavings: boolean;
  isEqual: boolean;
}

export interface DbSettingsItem {
  id: string;
  name?: string;
  label?: string;
  rate?: number | string;
}

