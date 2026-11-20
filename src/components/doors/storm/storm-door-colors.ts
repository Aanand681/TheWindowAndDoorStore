export interface StormDoorColorStyle {
  outerFill: string
  outerStroke: string
  innerFill: string
  kickFill: string
  kickStroke: string
  handleColor: string
}

export function getStormDoorColorStyles(color?: string): StormDoorColorStyle {
  const norm = (color || "").toLowerCase().trim()

  switch (norm) {
    case "black":
      return {
        outerFill: "#1E1E1E",
        outerStroke: "#0A0A0A",
        innerFill: "#262626",
        kickFill: "#222222",
        kickStroke: "#0F0F0F",
        handleColor: "#D4D4D8",
      }
    case "chocolate brown":
      return {
        outerFill: "#3E2723",
        outerStroke: "#271815",
        innerFill: "#4E342E",
        kickFill: "#422822",
        kickStroke: "#2A1813",
        handleColor: "#E4D5B7",
      }
    case "commercial brown":
      return {
        outerFill: "#4A3728",
        outerStroke: "#2E2117",
        innerFill: "#5A4432",
        kickFill: "#4D382A",
        kickStroke: "#302219",
        handleColor: "#E4D5B7",
      }
    case "clay":
      return {
        outerFill: "#8D7B68",
        outerStroke: "#5C4F41",
        innerFill: "#9E8C78",
        kickFill: "#8F7D6A",
        kickStroke: "#635547",
        handleColor: "#27272A",
      }
    case "sandalwood":
      return {
        outerFill: "#C4B59D",
        outerStroke: "#94856E",
        innerFill: "#D2C5AF",
        kickFill: "#C6B7A0",
        kickStroke: "#9C8D76",
        handleColor: "#27272A",
      }
    case "iron ore":
      return {
        outerFill: "#353839",
        outerStroke: "#1F2122",
        innerFill: "#434749",
        kickFill: "#3A3D3F",
        kickStroke: "#242627",
        handleColor: "#F4F4F5",
      }
    case "mill finish":
      return {
        outerFill: "#B5B8BC",
        outerStroke: "#7E8286",
        innerFill: "#C6C9CD",
        kickFill: "#B8BBC0",
        kickStroke: "#878B90",
        handleColor: "#3F3F46",
      }
    case "white":
    default:
      return {
        outerFill: "#F8FAFC",
        outerStroke: "#CBD5E1",
        innerFill: "#FFFFFF",
        kickFill: "#EDF2F7",
        kickStroke: "#CBD5E1",
        handleColor: "#52525B",
      }
  }
}
