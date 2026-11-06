export type DoorCategory = 'entry' | 'patio' | 'garden' | 'storm' | 'custom';

export type DoorHardwareType = 'standard' | 'customer_supplied' | 'custom' | 'none';

export type DoorQuotingMode = 'installation' | 'supply_only' | 'office_reference';

export interface DoorUpgradeOption {
  enabled: boolean;
  title: string; // e.g. "Triple Pane Acid Etched Glass"
  inksterPrice: number;
  netOptionDoorPrice: number;
  subtotalDifference: number;
  totalWithTaxDifference: number;
  notes?: string;
}

export interface DoorPreset {
  id: string;
  label: string;
  category: DoorCategory;
  labour: number;
  misc: number;
  description?: string;
  isCustom?: boolean;
}

export interface DoorUpchargeConfig {
  id: string;
  label: string;
  rate: number;
  unit: string; // e.g. '1 Hour', '1.25 Hours', 'per each door'
  description?: string;
}

export interface DoorSelectedUpcharge {
  upchargeId: string;
  label: string;
  rate: number;
  qty: number;
  total: number;
}

export interface DoorLineItem {
  id: string;
  presetId: string;
  presetLabel: string;
  category: DoorCategory;
  customDescription?: string; // e.g. "1 Dual Pane White Steel Door"
  widthIn?: number;
  heightIn?: number;
  inksterBasePrice: number;
  surchargePercent: number;
  surchargeAmount: number;
  priceWithSurcharge: number;
  discountPercent: number;
  discountAmount: number;
  netDoorPrice: number;
  quantity: number;
  unitLabour: number;
  unitMisc: number;
  hardwareType: DoorHardwareType;
  hardwarePrice: number;
  customerHardwareFee?: number;
  customHardwareName?: string;
  customHardwarePrice?: number;
  upcharges: DoorSelectedUpcharge[];
  upchargesTotal: number;
  lineDoorSupplyTotal: number;
  lineLabourTotal: number;
  lineMiscTotal: number;
  lineHardwareTotal: number;
  lineSupplyTotal?: number;
  lineGrandTotal: number;
  upgradeOption?: DoorUpgradeOption;
  notes?: string;
}

export interface DoorFormulaSettings {
  surchargeRate: number; // default 8%
  doorDiscountPercent: number; // default 10%
  locksetDeadboltPrice: number; // default $147.00
  customerSuppliedHardwareFee: number; // default $80.00
}

export interface DoorLogisticsSettings {
  setupFeeDefault: number; // default $140.00
  setupFeeFarStandard: number; // default $727.50
  setupFeeFarSmall: number; // default $363.50
  vehicleRatePerKm: number; // default $0.98
  crewHourly2Men: number; // default $150.00
  crewHourly3Men: number; // default $200.00
}

export interface IDoorSettingsData {
  presets: DoorPreset[];
  upcharges: DoorUpchargeConfig[];
  formula: DoorFormulaSettings;
  logistics: DoorLogisticsSettings;
}

export interface DoorCalculationParams {
  lineItems: DoorLineItem[];
  mode: DoorQuotingMode;
  globalUpcharges?: DoorSelectedUpcharge[];
  travelFeeType: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
  customTravelFee: string;
  showOutTownTravel: boolean;
  travelKm: string;
  crewHours: string;
  crewSize: '2' | '3';
  hstRate: number;
  isFirstNation?: boolean;
  formula: DoorFormulaSettings;
  logistics: DoorLogisticsSettings;
}

export interface DoorQuoteTotals {
  totalDoors: number;
  totalStormDoors: number;
  totalUnits: number;
  rawDoorBaseTotal: number;
  surchargeTotal: number;
  doorWithSurchargeTotal: number;
  discountTotal: number;
  netDoorSupplyTotal: number;
  stormDoorTotal: number;
  hardwareTotal: number;
  unitLabourTotal: number;
  upchargesTotal: number;
  baseSetupFee: number;
  additionalFarFee: number;
  vehicleTravelFee: number;
  crewTravelFee: number;
  totalAdditionalTravel: number;
  totalTravelAndSetup: number;
  combinedLabourTotal: number;
  miscTotal: number;
  subtotalPreTax: number;
  hstAmount: number;
  grandTotal: number;
  depositAmount: number;
}

