import {
  StormDoorCatalogItem,
  StormDoorAddonOption,
  StormDoorSelection,
  StormDoorProfile,
  StormDoorStyle,
} from "./storm-door-types"

export const COLORS_2_INCH = [
  "White", "Chocolate Brown", "Clay", "Sandalwood", "Black", "Commercial Brown", "Iron Ore",
]

export const COLORS_2_QUARTER_INCH = ["White", "Chocolate Brown", "Clay", "Black"]

export const COLORS_PROJECT = ["White", "Commercial Brown", "Mill Finish"]

export const YORK_STORM_DOORS: StormDoorCatalogItem[] = [
  // 1. One-Lite
  {
    id: "one_lite_2_1_4", style: "one_lite", name: "One-Lite", profile: '2-1/4"',
    standardPrice: 706.0, screenOnlyPrice: 657.0, inswingPrice: 955.0,
    description: "Classic single full-lite storm door with interchangeable screen.",
    availableColors: COLORS_2_QUARTER_INCH,
  },
  {
    id: "one_lite_2", style: "one_lite", name: "One-Lite", profile: '2"',
    standardPrice: 668.0, screenOnlyPrice: 620.0, inswingPrice: 955.0,
    description: "Classic single full-lite storm door with interchangeable screen.",
    availableColors: COLORS_2_INCH,
  },

  // 2. Full-View
  {
    id: "full_view_2_1_4", style: "full_view", name: "Full-View", profile: '2-1/4"',
    standardPrice: 812.0, screenOnlyPrice: 762.0, inswingPrice: 1056.64,
    description: "Maximum glass view door with premium narrow sash sightlines.",
    availableColors: COLORS_2_QUARTER_INCH,
  },
  {
    id: "full_view_2", style: "full_view", name: "Full-View", profile: '2"',
    standardPrice: 772.0, screenOnlyPrice: 721.0, inswingPrice: 1056.64,
    description: "Maximum glass view door with premium narrow sash sightlines.",
    availableColors: COLORS_2_INCH,
  },

  // 3. Self-Storing
  {
    id: "self_storing_2_1_4", style: "self_storing", name: "Self-Storing", profile: '2-1/4"',
    standardPrice: 706.0, hiddenVentPrice: 844.0, inswingPrice: 940.0,
    description: "Traditional sliding glass ventilation with heavy-duty kick plate.",
    availableColors: COLORS_2_QUARTER_INCH,
  },
  {
    id: "self_storing_2", style: "self_storing", name: "Self-Storing", profile: '2"',
    standardPrice: 665.0, hiddenVentPrice: 803.0, inswingPrice: 940.0,
    description: "Traditional sliding glass ventilation with heavy-duty kick plate.",
    availableColors: COLORS_2_INCH,
  },

  // 4. Hi-View
  {
    id: "hi_view_2_1_4", style: "hi_view", name: "Hi-View", profile: '2-1/4"',
    standardPrice: 726.0, hiddenVentPrice: 858.0, inswingPrice: 975.0,
    description: "High kick plate protection with balanced glass/screen viewing.",
    availableColors: COLORS_2_QUARTER_INCH,
  },
  {
    id: "hi_view_2", style: "hi_view", name: "Hi-View", profile: '2"',
    standardPrice: 686.0, hiddenVentPrice: 818.0, inswingPrice: 975.0,
    description: "High kick plate protection with balanced glass/screen viewing.",
    availableColors: COLORS_2_INCH,
  },

  // 5. Extended-View
  {
    id: "extended_view_2_1_4", style: "extended_view", name: "Extended-View", profile: '2-1/4"',
    standardPrice: 795.0, hiddenVentPrice: 927.0, inswingPrice: 1046.0,
    description: "Tall glass design with low-profile bottom kick plate.",
    availableColors: COLORS_2_QUARTER_INCH,
  },
  {
    id: "extended_view_2", style: "extended_view", name: "Extended-View", profile: '2"',
    standardPrice: 756.0, hiddenVentPrice: 889.0, inswingPrice: 1046.0,
    description: "Tall glass design with low-profile bottom kick plate.",
    availableColors: COLORS_2_INCH,
  },

  // 6. Tri-Lite
  {
    id: "tri_lite_2", style: "tri_lite", name: "Tri-Lite", profile: '2"',
    standardPrice: 737.0, description: "Colonial 3-lite glass configuration.",
    availableColors: COLORS_2_INCH,
  },

  // 7. True View 1/2 Lite
  {
    id: "true_view_half_2_1_4", style: "true_view_half", name: "True View 1/2 Lite", profile: '2-1/4"',
    standardPrice: 935.0, hiddenVentPrice: 935.0,
    description: "Modern architectural 1/2 lite with integrated hidden vent.",
    availableColors: COLORS_2_QUARTER_INCH,
  },
  {
    id: "true_view_half_2", style: "true_view_half", name: "True View 1/2 Lite", profile: '2"',
    standardPrice: 894.0, hiddenVentPrice: 894.0,
    description: "Modern architectural 1/2 lite with integrated hidden vent.",
    availableColors: COLORS_2_INCH,
  },

  // 8. True View 3/4 Lite
  {
    id: "true_view_three_quarter_2_1_4", style: "true_view_three_quarter", name: "True View 3/4 Lite", profile: '2-1/4"',
    standardPrice: 935.0, hiddenVentPrice: 935.0,
    description: "Modern architectural 3/4 lite with integrated hidden vent.",
    availableColors: COLORS_2_QUARTER_INCH,
  },
  {
    id: "true_view_three_quarter_2", style: "true_view_three_quarter", name: "True View 3/4 Lite", profile: '2"',
    standardPrice: 894.0, hiddenVentPrice: 894.0,
    description: "Modern architectural 3/4 lite with integrated hidden vent.",
    availableColors: COLORS_2_INCH,
  },

  // 9. 1-1/4" Self-Storing (Push Button)
  {
    id: "project_self_storing_1_1_4", style: "project_self_storing", name: "1 1/4\" Self Storing", profile: '1-1/4"',
    standardPrice: 589.0, description: "Economical push button self-storing door for project work.",
    availableColors: COLORS_PROJECT,
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
    id: "floral_glass_1lite",
    label: "Add for Floral Glass",
    price: 66.0,
    applicableStyles: ["one_lite"],
  },
  {
    id: "tri_lite_floral",
    label: "Tri-Lite Floral Glass",
    price: 61.0, // $798 - $737 = $61
    applicableStyles: ["tri_lite"],
  },
  {
    id: "sandblast_designs",
    label: "Sandblast Design (Lotus, Rose, or Lilly)",
    price: 406.0,
    applicableStyles: ["one_lite", "full_view"],
  },
  {
    id: "inswing_screen_add",
    label: "Optional Screen Add (Inswing Doors)",
    price: 73.0,
    applicableSwings: ["inswing"],
  },
]

export const CUSTOM_PAINT_PRICE = 1113.0

export function computeStormDoorPrice(
  item: StormDoorCatalogItem,
  sel: {
    ventType: string
    swing: string
    color: string
    isCustomPaint?: boolean
    selectedAddonIds: string[]
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
  if (sel.isCustomPaint) addonsTotal += CUSTOM_PAINT_PRICE

  sel.selectedAddonIds.forEach((id) => {
    const found = YORK_STORM_ADDONS.find((a) => a.id === id)
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
    selectedAddonIds: string[]
  }
): string {
  const parts = [`York Aluminum ${item.profile} ${item.name}`]
  if (sel.swing === "inswing") parts.push("Inswing (Papaiz Lever & Threshold)")
  else if (sel.ventType === "hidden_vent") parts.push("w/ Hidden Vent")
  else if (sel.ventType === "screen_only") parts.push("Screen Only")

  parts.push(sel.isCustomPaint ? `Custom Paint (${sel.color})` : sel.color)

  const addonLabels = sel.selectedAddonIds
    .map((id) => YORK_STORM_ADDONS.find((a) => a.id === id)?.label)
    .filter(Boolean)

  if (addonLabels.length > 0) {
    parts.push(`[${addonLabels.join(", ")}]`)
  }

  return parts.join(" - ")
}
