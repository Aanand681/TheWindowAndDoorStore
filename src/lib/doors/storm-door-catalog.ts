import {
  StormDoorCatalogItem,
  StormDoorAddonOption,
  StormDoorGlobalRules,
  StormDoorSettingsData,
  StormDoorStyle,
  PapaizFinish,
} from "./storm-door-types"

export const COLORS_2_INCH = [
  "White", "Chocolate Brown", "Clay", "Sandalwood", "Black", "Commercial Brown", "Iron Ore",
]

export const COLORS_2_QUARTER_INCH = ["White", "Chocolate Brown", "Clay", "Black"]

export const COLORS_PROJECT = ["White", "Commercial Brown", "Mill Finish"]

export const PAPAIZ_FINISHES: PapaizFinish[] = ["Satin Chrome", "Brass", "Black"]

export const YORK_STORM_DOORS: StormDoorCatalogItem[] = [
  // 1. One-Lite
  {
    id: "one_lite_2_1_4", style: "one_lite", name: "One-Lite", profile: '2-1/4"',
    standardPrice: 706.0, screenOnlyPrice: 657.0, inswingPrice: 955.0,
    description: "Classic single full-lite storm door with interchangeable screen.",
    availableColors: COLORS_2_QUARTER_INCH, active: true, sortOrder: 1,
  },
  {
    id: "one_lite_2", style: "one_lite", name: "One-Lite", profile: '2"',
    standardPrice: 668.0, screenOnlyPrice: 620.0, inswingPrice: 955.0,
    description: "Classic single full-lite storm door with interchangeable screen.",
    availableColors: COLORS_2_INCH, active: true, sortOrder: 2,
  },

  // 2. Full-View
  {
    id: "full_view_2_1_4", style: "full_view", name: "Full-View", profile: '2-1/4"',
    standardPrice: 812.0, screenOnlyPrice: 762.0, inswingPrice: 1056.64,
    description: "Maximum glass view door with premium narrow sash sightlines.",
    availableColors: COLORS_2_QUARTER_INCH, active: true, sortOrder: 3,
  },
  {
    id: "full_view_2", style: "full_view", name: "Full-View", profile: '2"',
    standardPrice: 772.0, screenOnlyPrice: 721.0, inswingPrice: 1056.64,
    description: "Maximum glass view door with premium narrow sash sightlines.",
    availableColors: COLORS_2_INCH, active: true, sortOrder: 4,
  },

  // 3. Self-Storing
  {
    id: "self_storing_2_1_4", style: "self_storing", name: "Self-Storing", profile: '2-1/4"',
    standardPrice: 706.0, hiddenVentPrice: 844.0, inswingPrice: 940.0,
    description: "Traditional sliding glass ventilation with heavy-duty kick plate.",
    availableColors: COLORS_2_QUARTER_INCH, active: true, sortOrder: 5,
  },
  {
    id: "self_storing_2", style: "self_storing", name: "Self-Storing", profile: '2"',
    standardPrice: 665.0, hiddenVentPrice: 803.0, inswingPrice: 940.0,
    description: "Traditional sliding glass ventilation with heavy-duty kick plate.",
    availableColors: COLORS_2_INCH, active: true, sortOrder: 6,
  },

  // 4. Hi-View
  {
    id: "hi_view_2_1_4", style: "hi_view", name: "Hi-View", profile: '2-1/4"',
    standardPrice: 726.0, hiddenVentPrice: 858.0, inswingPrice: 975.0,
    description: "High kick plate protection with balanced glass/screen viewing.",
    availableColors: COLORS_2_QUARTER_INCH, active: true, sortOrder: 7,
  },
  {
    id: "hi_view_2", style: "hi_view", name: "Hi-View", profile: '2"',
    standardPrice: 686.0, hiddenVentPrice: 818.0, inswingPrice: 975.0,
    description: "High kick plate protection with balanced glass/screen viewing.",
    availableColors: COLORS_2_INCH, active: true, sortOrder: 8,
  },

  // 5. Extended-View
  {
    id: "extended_view_2_1_4", style: "extended_view", name: "Extended-View", profile: '2-1/4"',
    standardPrice: 795.0, hiddenVentPrice: 927.0, inswingPrice: 1046.0,
    description: "Tall glass design with low-profile bottom kick plate.",
    availableColors: COLORS_2_QUARTER_INCH, active: true, sortOrder: 9,
  },
  {
    id: "extended_view_2", style: "extended_view", name: "Extended-View", profile: '2"',
    standardPrice: 756.0, hiddenVentPrice: 889.0, inswingPrice: 1046.0,
    description: "Tall glass design with low-profile bottom kick plate.",
    availableColors: COLORS_2_INCH, active: true, sortOrder: 10,
  },

  // 6. Tri-Lite
  {
    id: "tri_lite_2", style: "tri_lite", name: "Tri-Lite", profile: '2"',
    standardPrice: 737.0, description: "Colonial 3-lite glass configuration.",
    availableColors: COLORS_2_INCH, active: true, sortOrder: 11,
  },

  // 7. True View 1/2 Lite
  {
    id: "true_view_half_2_1_4", style: "true_view_half", name: "True View 1/2 Lite", profile: '2-1/4"',
    standardPrice: 935.0, hiddenVentPrice: 935.0,
    description: "Modern architectural 1/2 lite with integrated hidden vent.",
    availableColors: COLORS_2_QUARTER_INCH, active: true, sortOrder: 12,
  },
  {
    id: "true_view_half_2", style: "true_view_half", name: "True View 1/2 Lite", profile: '2"',
    standardPrice: 894.0, hiddenVentPrice: 894.0,
    description: "Modern architectural 1/2 lite with integrated hidden vent.",
    availableColors: COLORS_2_INCH, active: true, sortOrder: 13,
  },

  // 8. True View 3/4 Lite
  {
    id: "true_view_three_quarter_2_1_4", style: "true_view_three_quarter", name: "True View 3/4 Lite", profile: '2-1/4"',
    standardPrice: 935.0, hiddenVentPrice: 935.0,
    description: "Modern architectural 3/4 lite with integrated hidden vent.",
    availableColors: COLORS_2_QUARTER_INCH, active: true, sortOrder: 14,
  },
  {
    id: "true_view_three_quarter_2", style: "true_view_three_quarter", name: "True View 3/4 Lite", profile: '2"',
    standardPrice: 894.0, hiddenVentPrice: 894.0,
    description: "Modern architectural 3/4 lite with integrated hidden vent.",
    availableColors: COLORS_2_INCH, active: true, sortOrder: 15,
  },

  // 9. 1-1/4" Self-Storing (Push Button)
  {
    id: "project_self_storing_1_1_4", style: "project_self_storing", name: "1 1/4\" Self Storing", profile: '1-1/4"',
    standardPrice: 589.0, description: "Economical push button self-storing door for project work.",
    availableColors: COLORS_PROJECT, active: true, sortOrder: 16,
  },
]

export const STYLE_STARTING_PRICES: Record<StormDoorStyle, number> = {
  one_lite: 620.0,
  full_view: 721.0,
  self_storing: 665.0,
  hi_view: 686.0,
  extended_view: 756.0,
  tri_lite: 737.0,
  true_view_half: 894.0,
  true_view_three_quarter: 894.0,
  project_self_storing: 559.0,
}

export const YORK_STORM_ADDONS: StormDoorAddonOption[] = [
  {
    id: "screen_interchangeable",
    label: "Interchangeable Screen Insert",
    price: 73.0,
    applicableStyles: ["one_lite", "full_view"],
    description: "Interchangeable screen panel insert for One-Lite and Full-View storm doors.",
    active: true, sortOrder: 1,
  },
  {
    id: "floral_glass_1lite",
    label: "Add for Floral Glass",
    price: 66.0,
    applicableStyles: ["one_lite"],
    description: "Decorative floral pattern glass for One-Lite storm doors.",
    active: true, sortOrder: 2,
  },
  {
    id: "tri_lite_floral",
    label: "Tri-Lite Floral Glass",
    price: 61.0,
    applicableStyles: ["tri_lite"],
    description: "Decorative floral glass upgrade for Tri-Lite storm doors ($798 total).",
    active: true, sortOrder: 3,
  },
  {
    id: "sandblast_designs",
    label: "Sandblast Design (Lotus, Rose, or Lilly)",
    price: 406.0,
    applicableStyles: ["one_lite", "full_view"],
    description: "Artistic frosted sandblast design (Lotus, Rose, or Lilly pattern).",
    active: true, sortOrder: 4,
  },
]

export const CUSTOM_PAINT_PRICE = 1113.0
export const CUSTOM_PAINT_DOUBLE_PRICE = 2184.0

export const DEFAULT_STORM_DOOR_RULES: StormDoorGlobalRules = {
  surchargeRate: 8.0,
  customPaintSinglePrice: 1113.0,
  customPaintDoublePrice: 2184.0,
  colors2Inch: COLORS_2_INCH,
  colors2QuarterInch: COLORS_2_QUARTER_INCH,
  colorsProject: COLORS_PROJECT,
  papaizFinishes: PAPAIZ_FINISHES,
}

export const DEFAULT_STORM_DOORS_DATA: StormDoorSettingsData = {
  models: YORK_STORM_DOORS,
  addons: YORK_STORM_ADDONS,
  rules: DEFAULT_STORM_DOOR_RULES,
}

export function computeStormDoorPrice(
  item: StormDoorCatalogItem,
  sel: {
    ventType: string
    swing: string
    color: string
    isCustomPaint?: boolean
    isDoubleDoorCustomPaint?: boolean
    selectedAddonIds: string[]
    availableAddons?: StormDoorAddonOption[]
  }
): { basePrice: number; addonsTotal: number; totalPrice: number } {
  let base = item.standardPrice

  if (sel.swing === "inswing" && item.inswingPrice) {
    base = item.inswingPrice
  } else if (sel.ventType === "hidden_vent" && item.hiddenVentPrice) {
    base = item.hiddenVentPrice
  } else if (sel.ventType === "screen_only" && item.screenOnlyPrice) {
    base = item.screenOnlyPrice
  }

  // Mill finish discount for 1-1/4" project door
  if (item.profile === '1-1/4"' && sel.color === "Mill Finish") {
    base = 559.0
  }

  let addonsTotal = 0
  if (sel.isCustomPaint) {
    addonsTotal += sel.isDoubleDoorCustomPaint
      ? CUSTOM_PAINT_DOUBLE_PRICE
      : CUSTOM_PAINT_PRICE
  }

  const addonCatalog = sel.availableAddons && sel.availableAddons.length > 0
    ? sel.availableAddons
    : YORK_STORM_ADDONS

  sel.selectedAddonIds.forEach((id) => {
    const found = addonCatalog.find((a) => a.id === id)
    if (found) addonsTotal += found.price
  })

  return {
    basePrice: base,
    addonsTotal,
    totalPrice: Math.round((base + addonsTotal) * 100) / 100,
  }
}

export function buildStormDoorDescription(
  item: StormDoorCatalogItem,
  sel: {
    ventType: string
    swing: string
    color: string
    isCustomPaint?: boolean
    isDoubleDoorCustomPaint?: boolean
    papaizFinish?: PapaizFinish
    selectedAddonIds: string[]
    availableAddons?: StormDoorAddonOption[]
  }
): string {
  const parts = [`York Aluminum ${item.profile} ${item.name}`]
  if (sel.swing === "inswing") {
    const finishLabel = sel.papaizFinish ? ` (${sel.papaizFinish})` : ""
    parts.push(`Inswing Papaiz Lever${finishLabel} & Sill`)
  } else if (sel.ventType === "hidden_vent") {
    parts.push("w/ Hidden Vent")
  } else if (sel.ventType === "screen_only") {
    parts.push("Screen Only")
  }

  if (sel.isCustomPaint) {
    const doubleLabel = sel.isDoubleDoorCustomPaint ? " (French Double Door)" : ""
    parts.push(`Custom Paint${doubleLabel} (${sel.color})`)
  } else {
    parts.push(sel.color)
  }

  const addonCatalog = sel.availableAddons && sel.availableAddons.length > 0
    ? sel.availableAddons
    : YORK_STORM_ADDONS

  const addonLabels = sel.selectedAddonIds
    .map((id) => addonCatalog.find((a) => a.id === id)?.label)
    .filter(Boolean)

  if (addonLabels.length > 0) {
    parts.push(`[${addonLabels.join(", ")}]`)
  }

  return parts.join(" - ")
}
