export type StormDoorStyle =
  | "one_lite"
  | "full_view"
  | "self_storing"
  | "hi_view"
  | "extended_view"
  | "tri_lite"
  | "true_view_half"
  | "true_view_three_quarter"
  | "project_self_storing"
  | string

export type StormDoorProfile = '2"' | '2-1/4"' | '1-1/4"' | string

export type StormDoorVentType = "standard" | "hidden_vent" | "screen_only"

export type StormDoorSwing = "outswing" | "inswing"

export type PapaizFinish = "Satin Chrome" | "Brass" | "Black"

export interface StormDoorAddonOption {
  id: string
  label: string
  price: number
  applicableStyles?: string[]
  applicableSwings?: StormDoorSwing[]
  description?: string
  active?: boolean
  sortOrder?: number
}

export interface StormDoorCatalogItem {
  id: string
  style: StormDoorStyle
  name: string
  profile: StormDoorProfile
  standardPrice: number
  hiddenVentPrice?: number
  screenOnlyPrice?: number
  inswingPrice?: number
  description: string
  availableColors: string[]
  active?: boolean
  sortOrder?: number
}

export interface StormDoorGlobalRules {
  surchargeRate: number
  customPaintSinglePrice: number
  customPaintDoublePrice: number
  colors2Inch: string[]
  colors2QuarterInch: string[]
  colorsProject: string[]
  papaizFinishes: PapaizFinish[]
}

export interface StormDoorSettingsData {
  models: StormDoorCatalogItem[]
  addons: StormDoorAddonOption[]
  rules: StormDoorGlobalRules
}

export interface StormDoorSelection {
  style: StormDoorStyle
  name: string
  profile: StormDoorProfile
  ventType: StormDoorVentType
  swing: StormDoorSwing
  color: string
  isCustomPaint?: boolean
  isDoubleDoorCustomPaint?: boolean
  papaizFinish?: PapaizFinish
  addons: string[]
  addonModes?: Record<string, "included" | "option">
  totalPrice: number
  fullDescription: string
}
