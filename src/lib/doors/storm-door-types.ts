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

export type StormDoorProfile = '2"' | '2-1/4"' | '1-1/4"'

export type StormDoorVentType = "standard" | "hidden_vent" | "screen_only"

export type StormDoorSwing = "outswing" | "inswing"

export interface StormDoorAddonOption {
  id: string
  label: string
  price: number
  applicableStyles?: StormDoorStyle[]
  applicableSwings?: StormDoorSwing[]
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
}

export interface StormDoorSelection {
  style: StormDoorStyle
  name: string
  profile: StormDoorProfile
  ventType: StormDoorVentType
  swing: StormDoorSwing
  color: string
  isCustomPaint?: boolean
  addons: string[]
  totalPrice: number
  fullDescription: string
}
