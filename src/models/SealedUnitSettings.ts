import mongoose, { Schema, Document } from 'mongoose';
import {
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  ThicknessBreak,
  SealedUnitGrillSettings,
  DEFAULT_SEALED_UNIT_COMBOS,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  DEFAULT_GRILL_SETTINGS,
} from '@/lib/sealed-units-logic';

export interface ISealedUnitSettings extends Document {
  combos: ComboPricing[];
  formula: SealedUnitFormulaConstants;
  labour: SealedUnitLabourSettings;
  thicknessBreaks: ThicknessBreak[];
  grills?: SealedUnitGrillSettings;
}

const SealedUnitSettingsSchema = new Schema<ISealedUnitSettings>(
  {
    combos: [
      {
        id: String,
        name: String,
        treatment: { type: String, enum: ['annealed', 'tempered'], default: 'annealed' },
        prices: { type: Schema.Types.Mixed, default: {} },
      },
    ],
    formula: {
      argonPerSqft: { type: Number, default: DEFAULT_FORMULA_CONSTANTS.argonPerSqft },
      surchargeRate: { type: Number, default: DEFAULT_FORMULA_CONSTANTS.surchargeRate },
      stepMultiplier: { type: Number, default: DEFAULT_FORMULA_CONSTANTS.stepMultiplier },
      finalAddonRate: { type: Number, default: DEFAULT_FORMULA_CONSTANTS.finalAddonRate },
      minSqft: { type: Number, default: DEFAULT_FORMULA_CONSTANTS.minSqft },
    },
    labour: {
      labourRatePerSqft: { type: Number, default: DEFAULT_LABOUR_SETTINGS.labourRatePerSqft },
      labourMinPerUnit: { type: Number, default: DEFAULT_LABOUR_SETTINGS.labourMinPerUnit },
      miscRatePerSqft: { type: Number, default: DEFAULT_LABOUR_SETTINGS.miscRatePerSqft },
      setupFeeDefault: { type: Number, default: DEFAULT_LABOUR_SETTINGS.setupFeeDefault },
      setupFeeFarStandard: { type: Number, default: DEFAULT_LABOUR_SETTINGS.setupFeeFarStandard },
      setupFeeFarSmall: { type: Number, default: DEFAULT_LABOUR_SETTINGS.setupFeeFarSmall },
      vehicleRatePerKm: { type: Number, default: DEFAULT_LABOUR_SETTINGS.vehicleRatePerKm },
      crewHourly2Men: { type: Number, default: DEFAULT_LABOUR_SETTINGS.crewHourly2Men },
      crewHourly3Men: { type: Number, default: DEFAULT_LABOUR_SETTINGS.crewHourly3Men },
    },
    thicknessBreaks: [
      {
        upperBoundExclusive: Number,
        thicknessMm: Number,
      },
    ],
    grills: {
      type: Schema.Types.Mixed,
      default: DEFAULT_GRILL_SETTINGS,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SealedUnitSettings ||
  mongoose.model<ISealedUnitSettings>('SealedUnitSettings', SealedUnitSettingsSchema);
