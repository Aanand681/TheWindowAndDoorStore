import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  surchargeRate: number;
  addons: { id: string, label: string, lab: number, misc: number }[];
  jambs: { id: string, label: string, rate: number }[];
  casings: { id: string, label: string, rate: number }[];
  vehicleRate: number;
  crewRates: { crewSize: string, hourlyRate: number }[];
}

const SettingsSchema = new Schema<ISettings>(
  {
    surchargeRate: { type: Number, required: true, default: 8 },
    addons: [{ id: String, label: String, lab: Number, misc: Number }],
    jambs: [{ id: String, label: String, rate: Number }],
    casings: [{ id: String, label: String, rate: Number }],
    vehicleRate: { type: Number, default: 0.98 },
    crewRates: [{ crewSize: String, hourlyRate: Number }],
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
