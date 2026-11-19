import { NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/mongodb"
import SavedQuote from "@/models/SavedQuote"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error"
import { formatWindowSummarySentence } from "@/lib/calculator/format-window-summary"
import { formatDoorSummarySentence } from "@/lib/doors/formatters"

export const dynamic = "force-dynamic"
export const revalidate = 0

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const username = (
      session?.user?.username ||
      session?.user?.name ||
      session?.user?.email?.split("@")[0] ||
      ""
    )
      .toLowerCase()
      .trim()
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    await dbConnect()

    // 1. Identify quote numbers that have already been submitted (non-DRAFT status),
    // including any attached child quotes that were absorbed into submitted quotes
    const submittedQuoteDocs = await SavedQuote.find({
      preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
      status: { $ne: "DRAFT" },
    })
      .select(
        "quoteNumber attachedDoorQuote.quoteNumber attachedWindowQuote.quoteNumber attachedSealedUnit.quoteNumber"
      )
      .lean()

    const submittedQuoteNumbersSet = new Set<string>()
    for (const q of submittedQuoteDocs as any[]) {
      if (q.quoteNumber) {
        const n = String(q.quoteNumber).trim().toLowerCase()
        if (n && n !== "untitled") submittedQuoteNumbersSet.add(n)
      }
      if (q.attachedDoorQuote?.quoteNumber) {
        const n = String(q.attachedDoorQuote.quoteNumber).trim().toLowerCase()
        if (n && n !== "untitled") submittedQuoteNumbersSet.add(n)
      }
      if (q.attachedWindowQuote?.quoteNumber) {
        const n = String(q.attachedWindowQuote.quoteNumber).trim().toLowerCase()
        if (n && n !== "untitled") submittedQuoteNumbersSet.add(n)
      }
      if (q.attachedSealedUnit?.quoteNumber) {
        const n = String(q.attachedSealedUnit.quoteNumber).trim().toLowerCase()
        if (n && n !== "untitled") submittedQuoteNumbersSet.add(n)
      }
    }

    const submittedQuoteNumbers = Array.from(submittedQuoteNumbersSet)

    // 2. Automatically purge any orphaned DRAFT records in MongoDB whose quote has been submitted
    if (submittedQuoteNumbers.length > 0) {
      await SavedQuote.deleteMany({
        preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
        status: "DRAFT",
        quoteNumber: {
          $in: submittedQuoteNumbers.map(
            (n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
          ),
        },
      })
    }

    const query: Record<string, unknown> = {
      preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
      status: "DRAFT",
    }
    if (submittedQuoteNumbers.length > 0) {
      query.quoteNumber = {
        $nin: submittedQuoteNumbers.map(
          (n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
        ),
      }
    }
    if (type && ["window", "door", "sealed_unit"].includes(type)) {
      query.quoteType = type
    }

    const quotes = await SavedQuote.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(100)
      .lean()

    const formattedDrafts = quotes.map((d: any) => {
      let resolvedSummary = (d.summaryLabel || "").trim()
      if (!resolvedSummary) {
        const quoteType = d.quoteType || "window"
        const items = Array.isArray(d.windows) ? d.windows : []
        if (quoteType === "door") {
          resolvedSummary = formatDoorSummarySentence(items)
        } else if (quoteType === "sealed_unit") {
          resolvedSummary =
            items.length > 0
              ? `${items.length} Sealed Unit${items.length > 1 ? "s" : ""}`
              : "Sealed Unit Quote"
        } else {
          resolvedSummary = formatWindowSummarySentence(items)
        }
      }

      return {
        _id: d._id,
        id: String(d._id),
        type: d.quoteType || "window",
        quoteNumber: d.quoteNumber,
        customerName: d.customerName,
        itemCount: Array.isArray(d.windows) ? d.windows.length : 0,
        subtotal: d.taxTotals?.subtotalPreTax || d.taxTotals?.subtotal || 0,
        grandTotal: d.quoteSummaryTotal || d.taxTotals?.grandTotal || 0,
        summaryLabel: resolvedSummary,
        data: {
          ...d,
          quoteNumber: d.quoteNumber,
          customerName: d.customerName,
          windows: d.windows,
          lineItems: d.windows,
          summaryLabel: resolvedSummary,
          taxTotals: d.taxTotals,
          totals: d.taxTotals,
          quoteResult: d.quoteResult,
          quoteNotes: d.quoteNotes,
          surchargeRate: d.surchargeRate,
          activePromoId: d.activePromoId,
          customJC: d.customJC,
          customMisc: d.customMisc,
          customLabour: d.customLabour,
          includeJCInPromo: d.includeJCInPromo,
          includeMiscInPromo: d.includeMiscInPromo,
          includeLabourInPromo: d.includeLabourInPromo,
          attachedUpgrade: d.attachedUpgrade,
          attachedDoorQuote: d.attachedDoorQuote,
          attachedSealedUnit: d.attachedSealedUnit,
          attachedWindowQuote: d.attachedWindowQuote,
          attachedInstallOption: d.attachedInstallOption ?? null,
          customOptions: Array.isArray(d.customOptions) ? d.customOptions : [],
          supplyJambId: d.supplyJambId,
          supplyJambRate: d.supplyJambRate,
          supplyCasingId: d.supplyCasingId,
          supplyCasingRate: d.supplyCasingRate,
          wantsUpgrade: d.wantsUpgrade,
          isSupplyOnly: d.isSupplyOnly,
          isServiceOnly: d.isServiceOnly,
          isInstallation: d.isInstallation,
          selectedRegionId:
            d.selectedRegionId || d.taxTotals?.selectedRegionId || "",
          regionName: d.regionName || d.taxTotals?.regionName || "",
          travelFeeType: d.travelFeeType,
          customTravelFee: d.customTravelFee,
          showOutTownTravel: d.showOutTownTravel,
          travelKm: d.travelKm,
          crewHours: d.crewHours,
          crewSize: d.crewSize,
          hstRate: d.hstRate ?? d.taxTotals?.hstRate,
          sealedUnitMode: d.sealedUnitMode,
          mode: d.mode,
          serviceSqftInput: d.serviceSqftInput,
          serviceLabourRateInput: d.serviceLabourRateInput,
          serviceMiscRateInput: d.serviceMiscRateInput,
          globalUpcharges: d.globalUpcharges,
          isFirstNation: d.isFirstNation,
          quoteSummaryTotal: d.quoteSummaryTotal,
          grandTotal: d.quoteSummaryTotal || d.taxTotals?.grandTotal || 0,
        },
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }
    })

    return NextResponse.json(formattedDrafts, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const username = (
      session?.user?.username ||
      session?.user?.name ||
      session?.user?.email?.split("@")[0] ||
      ""
    )
      .toLowerCase()
      .trim()
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, quoteNumber, customerName } = body

    if (!type || !["window", "door", "sealed_unit"].includes(type)) {
      return NextResponse.json({ error: "Invalid quote type" }, { status: 400 })
    }

    if (
      !quoteNumber ||
      typeof quoteNumber !== "string" ||
      !quoteNumber.trim()
    ) {
      return NextResponse.json(
        { error: "Quote number is required" },
        { status: 400 }
      )
    }

    if (
      !customerName ||
      typeof customerName !== "string" ||
      !customerName.trim()
    ) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      )
    }

    await dbConnect()

    const rawData = body.data || {}
    const windowsData =
      rawData.windows || rawData.lineItems || (Array.isArray(body.windows) ? body.windows : [])
    const totalAmount =
      Number(body.grandTotal) ||
      Number(rawData.grandTotal) ||
      Number(rawData.taxTotals?.grandTotal) ||
      0

    let effectiveSummaryLabel = (body.summaryLabel || rawData.summaryLabel || "").trim()
    if (!effectiveSummaryLabel && Array.isArray(windowsData) && windowsData.length > 0) {
      if (type === "door") {
        effectiveSummaryLabel = formatDoorSummarySentence(windowsData)
      } else if (type === "sealed_unit") {
        effectiveSummaryLabel = `${windowsData.length} Sealed Unit${windowsData.length > 1 ? "s" : ""}`
      } else {
        effectiveSummaryLabel = formatWindowSummarySentence(windowsData)
      }
    }

    const draft = await SavedQuote.findOneAndUpdate(
      {
        preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
        quoteNumber: quoteNumber.trim(),
        status: "DRAFT",
      },
      {
        $set: {
          quoteNumber: quoteNumber.trim(),
          customerName: customerName.trim(),
          quoteType: type,
          status: "DRAFT",
          preparedBy: username,
          preparedByEmail: session?.user?.email || "",
          assignedTo: "Admin",
          summaryLabel: effectiveSummaryLabel,
          windows: windowsData,
          taxTotals: rawData.taxTotals || rawData.totals || null,
          quoteResult: rawData.quoteResult || null,
          quoteNotes: rawData.quoteNotes || "",
          surchargeRate: rawData.surchargeRate ?? 8,
          activePromoId: rawData.activePromoId || "none",
          customJC: rawData.customJC,
          customMisc: rawData.customMisc,
          customLabour: rawData.customLabour,
          includeJCInPromo: rawData.includeJCInPromo ?? true,
          includeMiscInPromo: rawData.includeMiscInPromo ?? true,
          includeLabourInPromo: rawData.includeLabourInPromo ?? true,
          attachedUpgrade: rawData.attachedUpgrade,
          attachedDoorQuote: rawData.attachedDoorQuote,
          attachedSealedUnit: rawData.attachedSealedUnit,
          attachedWindowQuote: rawData.attachedWindowQuote,
          attachedInstallOption: rawData.attachedInstallOption ?? null,
          customOptions: Array.isArray(rawData.customOptions)
            ? rawData.customOptions
            : [],
          supplyJambId: rawData.supplyJambId,
          supplyJambRate: rawData.supplyJambRate,
          supplyCasingId: rawData.supplyCasingId,
          supplyCasingRate: rawData.supplyCasingRate,
          wantsUpgrade: rawData.wantsUpgrade,
          isSupplyOnly: rawData.isSupplyOnly,
          isServiceOnly: rawData.isServiceOnly,
          isInstallation: rawData.isInstallation,
          selectedRegionId:
            rawData.selectedRegionId || rawData.regionId || "",
          regionName: rawData.regionName || "",
          travelFeeType: rawData.travelFeeType,
          customTravelFee: rawData.customTravelFee,
          showOutTownTravel: rawData.showOutTownTravel,
          travelKm: rawData.travelKm,
          crewHours: rawData.crewHours,
          crewSize: rawData.crewSize,
          hstRate: rawData.hstRate,
          sealedUnitMode: rawData.sealedUnitMode,
          mode: rawData.mode,
          serviceSqftInput: rawData.serviceSqftInput,
          serviceLabourRateInput: rawData.serviceLabourRateInput,
          serviceMiscRateInput: rawData.serviceMiscRateInput,
          globalUpcharges: rawData.globalUpcharges,
          isFirstNation: rawData.isFirstNation,
          quoteSummaryTotal: totalAmount,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: false }
    )

    return NextResponse.json(
      { success: true, draft },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const username = (
      session?.user?.username ||
      session?.user?.name ||
      session?.user?.email?.split("@")[0] ||
      ""
    )
      .toLowerCase()
      .trim()
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const quoteNumber = searchParams.get("quoteNumber")
    const type = searchParams.get("type")
    const isAll =
      searchParams.get("all") === "true" ||
      searchParams.get("clearAll") === "true"

    await dbConnect()

    const baseFilter: Record<string, unknown> = {
      preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
      status: "DRAFT",
    }

    if (isAll) {
      if (type && ["window", "door", "sealed_unit"].includes(type)) {
        baseFilter.quoteType = type
      }
      await SavedQuote.deleteMany(baseFilter)
    } else if (id || (quoteNumber && type)) {
      const orConditions: any[] = []
      if (id && mongoose.Types.ObjectId.isValid(id)) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(id) })
      }
      if (quoteNumber && type) {
        orConditions.push({
          quoteNumber: quoteNumber.trim(),
          quoteType: type,
        })
      } else if (quoteNumber) {
        orConditions.push({ quoteNumber: quoteNumber.trim() })
      }
      if (orConditions.length > 0) {
        await SavedQuote.deleteMany({
          ...baseFilter,
          $or: orConditions,
        })
      }
    } else {
      return NextResponse.json(
        { error: "Missing draft identifier" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}
