import mongoose, { Schema, Document } from 'mongoose';

export interface IRegionConfig extends Document {
  name: string;
  officeLat: number;
  officeLon: number;
  freeCities: string[];
  setupFeeOptions: { label: string; value: number }[];
  labourPerSqft: number;
  miscPerSqft: number;
  labourMin: number;
  miscMin: number;
  extraLinPerWindow: number;
  fixedSetupFee: number;
  baseTravelFee: number;
  isSupplyOnly?: boolean;
  polygon: { lat: number, lng: number }[];
}

const RegionConfigSchema = new Schema<IRegionConfig>(
  {
    name: { type: String, required: true, unique: true },
    officeLat: { type: Number, required: true },
    officeLon: { type: Number, required: true },
    freeCities: { type: [String], default: [] },
    setupFeeOptions: [
      {
        label: { type: String, required: true },
        value: { type: Number, required: true },
      }
    ],
    labourPerSqft: { type: Number, default: 19 },
    miscPerSqft: { type: Number, default: 8 },
    labourMin: { type: Number, default: 325 },
    miscMin: { type: Number, default: 74 },
    extraLinPerWindow: { type: Number, default: 2.17 },
    fixedSetupFee: { type: Number, default: 140 },
    baseTravelFee: { type: Number, default: 0 },
    isSupplyOnly: { type: Boolean, default: false },
    polygon: [{ lat: Number, lng: Number }],
  },
  { timestamps: true }
);

export default mongoose.models.RegionConfig || mongoose.model<IRegionConfig>('RegionConfig', RegionConfigSchema);
