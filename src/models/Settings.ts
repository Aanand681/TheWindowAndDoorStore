import mongoose, { Schema, Document } from 'mongoose';

export interface ILabourUpgradeTier {
  id: string;
  minAmount: number; // in dollars (e.g. 0, 3000, 5000, etc.)
  maxAmount: number | null; // in dollars (null for unlimited)
  ratePercent: number; // percent e.g. 6, 7, 8, 8.5, 9, 10, 11
  minFee: number; // in dollars, e.g. 260
  isAvailable: boolean;
  label?: string;
}

export interface ISettings extends Document {
  surchargeRate: number;
  addons: { id: string, label: string, lab: number, misc: number }[];
  jambs: { id: string, label: string, rate: number }[];
  casings: { id: string, label: string, rate: number }[];
  vehicleRate: number;
  crewRates: { crewSize: string, hourlyRate: number }[];
  labourUpgradeTiers?: ILabourUpgradeTier[];
}

const SettingsSchema = new Schema<ISettings>(
  {
    surchargeRate: { type: Number, required: true, default: 8 },
    addons: [{ id: String, label: String, lab: Number, misc: Number }],
    jambs: [{ id: String, label: String, rate: Number }],
    casings: [{ id: String, label: String, rate: Number }],
    vehicleRate: { type: Number, default: 0.98 },
    crewRates: [{ crewSize: String, hourlyRate: Number }],
    labourUpgradeTiers: [
      {
        id: String,
        minAmount: Number,
        maxAmount: { type: Schema.Types.Mixed, default: null },
        ratePercent: Number,
        minFee: Number,
        isAvailable: Boolean,
        label: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
