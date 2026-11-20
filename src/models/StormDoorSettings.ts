import mongoose, { Schema, Document } from "mongoose"
import {
  StormDoorCatalogItem,
  StormDoorAddonOption,
  StormDoorGlobalRules,
} from "@/lib/doors/storm-door-types"
import {
  DEFAULT_STORM_DOOR_RULES,
  YORK_STORM_DOORS,
  YORK_STORM_ADDONS,
} from "@/lib/doors/storm-door-catalog"

export interface IStormDoorSettings extends Document {
  models: StormDoorCatalogItem[]
  addons: StormDoorAddonOption[]
  rules: StormDoorGlobalRules
}

const StormDoorSettingsSchema = new Schema<IStormDoorSettings>(
  {
    models: [
      {
        id: { type: String, required: true },
        style: { type: String, required: true },
        name: { type: String, required: true },
        profile: { type: String, required: true },
        standardPrice: { type: Number, required: true, default: 0 },
        hiddenVentPrice: { type: Number },
        screenOnlyPrice: { type: Number },
        inswingPrice: { type: Number },
        description: { type: String, default: "" },
        availableColors: [{ type: String }],
        active: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    addons: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
        applicableStyles: [{ type: String }],
        applicableSwings: [{ type: String }],
        description: { type: String, default: "" },
        active: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    rules: {
      surchargeRate: {
        type: Number,
        default: DEFAULT_STORM_DOOR_RULES.surchargeRate,
      },
      customPaintSinglePrice: {
        type: Number,
        default: DEFAULT_STORM_DOOR_RULES.customPaintSinglePrice,
      },
      customPaintDoublePrice: {
        type: Number,
        default: DEFAULT_STORM_DOOR_RULES.customPaintDoublePrice,
      },
      colors2Inch: [{ type: String }],
      colors2QuarterInch: [{ type: String }],
      colorsProject: [{ type: String }],
      papaizFinishes: [{ type: String }],
    },
  },
  { timestamps: true }
)

export default mongoose.models.StormDoorSettings ||
  mongoose.model<IStormDoorSettings>("StormDoorSettings", StormDoorSettingsSchema)
