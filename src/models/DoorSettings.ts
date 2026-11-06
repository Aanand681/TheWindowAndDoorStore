import mongoose, { Schema, Document } from 'mongoose';
import {
  DoorPreset,
  DoorUpchargeConfig,
  DoorFormulaSettings,
  DoorLogisticsSettings,
} from '@/lib/doors/types';
import {
  DEFAULT_DOOR_PRESETS,
  DEFAULT_DOOR_UPCHARGES,
  DEFAULT_DOOR_FORMULA,
  DEFAULT_DOOR_LOGISTICS,
} from '@/lib/doors/constants';

export interface IDoorSettings extends Document {
  presets: DoorPreset[];
  upcharges: DoorUpchargeConfig[];
  formula: DoorFormulaSettings;
  logistics: DoorLogisticsSettings;
}

const DoorSettingsSchema = new Schema<IDoorSettings>(
  {
    presets: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        category: {
          type: String,
          enum: ['entry', 'patio', 'garden', 'storm', 'custom'],
          default: 'entry',
        },
        labour: { type: Number, required: true, default: 0 },
        misc: { type: Number, required: true, default: 0 },
        description: { type: String, default: '' },
        isCustom: { type: Boolean, default: false },
      },
    ],
    upcharges: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        rate: { type: Number, required: true, default: 0 },
        unit: { type: String, required: true, default: '1 Hour' },
        description: { type: String, default: '' },
      },
    ],
    formula: {
      surchargeRate: { type: Number, default: DEFAULT_DOOR_FORMULA.surchargeRate },
      doorDiscountPercent: { type: Number, default: DEFAULT_DOOR_FORMULA.doorDiscountPercent },
      locksetDeadboltPrice: { type: Number, default: DEFAULT_DOOR_FORMULA.locksetDeadboltPrice },
      customerSuppliedHardwareFee: {
        type: Number,
        default: DEFAULT_DOOR_FORMULA.customerSuppliedHardwareFee,
      },
    },
    logistics: {
      setupFeeDefault: { type: Number, default: DEFAULT_DOOR_LOGISTICS.setupFeeDefault },
      setupFeeFarStandard: {
        type: Number,
        default: DEFAULT_DOOR_LOGISTICS.setupFeeFarStandard,
      },
      setupFeeFarSmall: { type: Number, default: DEFAULT_DOOR_LOGISTICS.setupFeeFarSmall },
      vehicleRatePerKm: { type: Number, default: DEFAULT_DOOR_LOGISTICS.vehicleRatePerKm },
      crewHourly2Men: { type: Number, default: DEFAULT_DOOR_LOGISTICS.crewHourly2Men },
      crewHourly3Men: { type: Number, default: DEFAULT_DOOR_LOGISTICS.crewHourly3Men },
    },
  },
  { timestamps: true }
);

export default mongoose.models.DoorSettings ||
  mongoose.model<IDoorSettings>('DoorSettings', DoorSettingsSchema);

