import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPromo extends Document {
  name: string;
  type: 'BOGO' | 'FREE_PARTS' | 'PERCENTAGE' | 'COMBO';
  isActive: boolean;
  
  // BOGO Fields
  buyQty?: number;
  getQty?: number;
  
  // FREE_PARTS / COMBO Fields
  freeComponents?: string[]; // e.g., ['argon', 'solar', 'triple']
  
  // PERCENTAGE / COMBO Fields
  discountPercentage?: number;
  
  // Control math order for COMBO
  applyPercentageAfterFreeParts?: boolean;

  order?: number;

  createdAt: Date;
  updatedAt: Date;
}

const PromoSchema = new Schema<IPromo>(
  {
    name: {
      type: String,
      required: [true, 'Promo name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['BOGO', 'FREE_PARTS', 'PERCENTAGE', 'COMBO'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    buyQty: {
      type: Number,
      default: null,
    },
    getQty: {
      type: Number,
      default: null,
    },
    freeComponents: {
      type: [String],
      default: [],
    },
    discountPercentage: {
      type: Number,
      default: null,
    },
    applyPercentageAfterFreeParts: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models.Promo && !mongoose.models.Promo.schema.path('order')) {
  delete (mongoose.models as Record<string, unknown>).Promo;
}

const PromoModel: Model<IPromo> = (mongoose.models.Promo as Model<IPromo>) || mongoose.model<IPromo>('Promo', PromoSchema);
export default PromoModel;
