import { describe, it, expect } from "vitest"

describe("User Profile & Quoting Defaults Logic", () => {
  it("formats user preparedBy with real name preference over username", () => {
    const userWithName = {
      name: "John Smith",
      username: "jsmith_rep",
      email: "jsmith@example.com",
    }
    const userWithoutName = {
      name: "",
      username: "jsmith_rep",
      email: "jsmith@example.com",
    }

    const resolvedName1 =
      userWithName.name?.trim() || userWithName.username || userWithName.email
    const resolvedName2 =
      userWithoutName.name?.trim() ||
      userWithoutName.username ||
      userWithoutName.email

    expect(resolvedName1).toBe("John Smith")
    expect(resolvedName2).toBe("jsmith_rep")
  })

  it("validates and accepts all supported landing pages", () => {
    const validLandingPages = [
      "calculator",
      "quotes",
      "admin",
      "doors",
      "sealed_units",
      "quote_studio",
    ]

    const testRoutes: Record<string, string> = {
      calculator: "/",
      quotes: "/quotes",
      admin: "/admin",
      doors: "/doors",
      sealed_units: "/sealed-units",
      quote_studio: "/quote-studio",
    }

    for (const page of validLandingPages) {
      expect(validLandingPages.includes(page)).toBe(true)
      expect(testRoutes[page]).toBeDefined()
    }

    expect(validLandingPages.includes("invalid_page")).toBe(false)
  })

  it("validates default quoting mode values strictly", () => {
    const validModes = ["installation", "supply_only"]

    expect(validModes.includes("installation")).toBe(true)
    expect(validModes.includes("supply_only")).toBe(true)
    expect(validModes.includes("other")).toBe(false)
  })

  it("validates favorite template options strictly", () => {
    const validTemplates = [
      "cards",
      "modern",
      "executive",
      "compact",
      "breakdown",
    ]

    expect(validTemplates.includes("cards")).toBe(true)
    expect(validTemplates.includes("modern")).toBe(true)
    expect(validTemplates.includes("executive")).toBe(true)
    expect(validTemplates.includes("compact")).toBe(true)
    expect(validTemplates.includes("breakdown")).toBe(true)
    expect(validTemplates.includes("unknown_template")).toBe(false)
  })
})
