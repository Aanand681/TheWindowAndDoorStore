"use client"

import React from "react"
import { Wrench, DollarSign, ChevronDown, ChevronUp } from "lucide-react"
import { SealedUnitLabourSettings } from "@/lib/sealed-units-logic"
import { SealedUnitTravelCalculator } from "./SealedUnitTravelCalculator"
import { SharedRegionOption } from "@/hooks/shared/useSharedRegions"

export type SealedUnitMode = "installation" | "supply_only" | "service_only"

export interface SealedUnitLabourTravelCardProps {
  mode?: SealedUnitMode
  setMode?: (val: SealedUnitMode) => void
  isInstallation: boolean
  setIsInstallation: (val: boolean) => void
  labour: SealedUnitLabourSettings
  regions?: SharedRegionOption[]
  selectedRegionId?: string
  onSelectRegion?: (regionId: string) => void
  travelFeeType: "none" | "local_std" | "far_std" | "far_small" | "custom"
  setTravelFeeType: (
    val: "none" | "local_std" | "far_std" | "far_small" | "custom"
  ) => void
  customTravelFee: string
  setCustomTravelFee: (val: string) => void
  showOutTownTravel: boolean
  setShowOutTownTravel: (val: boolean | ((prev: boolean) => boolean)) => void
  travelKm: string
  setTravelKm: (val: string) => void
  crewHours: string
  setCrewHours: (val: string) => void
  crewSize: "2" | "3"
  setCrewSize: (val: "2" | "3") => void
  serviceSqftInput?: string
  setServiceSqftInput?: (val: string) => void
  serviceLabourRateInput?: string
  setServiceLabourRateInput?: (val: string) => void
  serviceMiscRateInput?: string
  setServiceMiscRateInput?: (val: string) => void
  itemsSqft?: number
  totals: {
    totalSqft?: number
    itemsSqft?: number
    unitLabourSum: number
    baseSetupFee: number
    additionalFarFee: number
    vehicleTravelFee: number
    crewTravelFee: number
    totalAdditionalTravel: number
    totalTravelAndSetup: number
    combinedLabourTotal: number
    miscTotal: number
    serviceLabourTotal?: number
    subtotalPreTax?: number
    hstAmount?: number
    grandTotal?: number
    effectiveLabourRate?: number
    effectiveMiscRate?: number
  }
}

export function SealedUnitLabourTravelCard({
  mode = "installation",
  setMode,
  isInstallation,
  setIsInstallation: _setIsInstallation,
  labour,
  regions = [],
  selectedRegionId = "",
  onSelectRegion = () => {},
  travelFeeType,
  setTravelFeeType,
  customTravelFee,
  setCustomTravelFee,
  showOutTownTravel,
  setShowOutTownTravel,
  travelKm,
  setTravelKm,
  crewHours,
  setCrewHours,
  crewSize,
  setCrewSize,
  totals,
}: SealedUnitLabourTravelCardProps) {
  const currentMode = setMode
    ? mode
    : isInstallation
      ? "installation"
      : "supply_only"
  const [showLabourBreakdown, setShowLabourBreakdown] = React.useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-sm backdrop-blur-xl">
      {/* Header with Executive Segmented Control */}
      <div className="border-b border-border/50 bg-muted/20 px-3.5 py-2.5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Wrench className="h-4 w-4 text-primary" />
              <span>Job Scope &amp; Travel</span>
            </div>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              Select job scope and configure travel &amp; crew allowances.
            </p>
          </div>

          {/* Active Scope Badge (Controlled from Summary Card) */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="rounded-md border border-border/60 bg-muted px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {currentMode === "service_only"
                ? "Service Only Scope"
                : currentMode === "supply_only"
                  ? "Supply Only Scope"
                  : "Installation Scope"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-3 sm:p-3.5">
        {currentMode === "installation" ? (
          <>
            {/* Installation Labour Info Bar */}
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-2.5">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Installation Labour &amp; Travel
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Base unit labour (${totals.unitLabourSum.toFixed(2)}) + travel
                  setup (${totals.totalTravelAndSetup.toFixed(2)})
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-foreground">
                  ${totals.combinedLabourTotal.toFixed(2)}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  Total Labour
                </span>
              </div>
            </div>

            {/* Travel & Out-of-Town Calculator */}
            <SealedUnitTravelCalculator
              labour={labour}
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={onSelectRegion}
              travelFeeType={travelFeeType}
              setTravelFeeType={setTravelFeeType}
              customTravelFee={customTravelFee}
              setCustomTravelFee={setCustomTravelFee}
              showOutTownTravel={showOutTownTravel}
              setShowOutTownTravel={setShowOutTownTravel}
              travelKm={travelKm}
              setTravelKm={setTravelKm}
              crewHours={crewHours}
              setCrewHours={setCrewHours}
              crewSize={crewSize}
              setCrewSize={setCrewSize}
              baseSetupFee={totals.baseSetupFee}
              totalTravelAndSetup={totals.totalTravelAndSetup}
              contextMode="installation"
            />

            {/* Collapsible Fee Breakdown */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowLabourBreakdown(!showLabourBreakdown)}
                className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {showLabourBreakdown ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                <span>
                  {showLabourBreakdown
                    ? "Hide Fee Breakdown"
                    : "View Detailed Labour & Travel Breakdown"}
                </span>
              </button>

              {showLabourBreakdown && (
                <div className="mt-2 animate-in space-y-1 rounded-xl border border-border/40 bg-muted/15 p-2.5 text-xs duration-150 fade-in">
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span>Base Setup Fee (Local Standard):</span>
                    <span className="font-mono text-foreground">
                      ${totals.baseSetupFee.toFixed(2)}
                    </span>
                  </div>
                  {totals.additionalFarFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span>Far Area Setup Surcharge:</span>
                      <span className="font-mono text-foreground">
                        +${totals.additionalFarFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totals.vehicleTravelFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span>
                        Vehicle KM Travel ({travelKm} km @ $
                        {(labour.vehicleRatePerKm || 0.98).toFixed(2)}):
                      </span>
                      <span className="font-mono text-foreground">
                        +${totals.vehicleTravelFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totals.crewTravelFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span>
                        Crew Travel Labour ({crewHours} hrs @{" "}
                        {crewSize === "2"
                          ? `$${(labour.crewHourly2Men || 150).toFixed(0)}/hr`
                          : `$${(labour.crewHourly3Men || 200).toFixed(0)}/hr`}
                        ):
                      </span>
                      <span className="font-mono text-foreground">
                        +${totals.crewTravelFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span>Unit Glazing Labour:</span>
                    <span className="font-mono text-foreground">
                      ${totals.unitLabourSum.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/40 py-0.5 pt-1 font-semibold text-muted-foreground">
                    <span className="text-foreground">
                      Total Installation Labour:
                    </span>
                    <span className="font-mono text-foreground">
                      ${totals.combinedLabourTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : currentMode === "service_only" ? (
          <div className="space-y-3">
            {/* Travel Calculator for Service Work */}
            <SealedUnitTravelCalculator
              labour={labour}
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={onSelectRegion}
              travelFeeType={travelFeeType}
              setTravelFeeType={setTravelFeeType}
              customTravelFee={customTravelFee}
              setCustomTravelFee={setCustomTravelFee}
              showOutTownTravel={showOutTownTravel}
              setShowOutTownTravel={setShowOutTownTravel}
              travelKm={travelKm}
              setTravelKm={setTravelKm}
              crewHours={crewHours}
              setCrewHours={setCrewHours}
              crewSize={crewSize}
              setCrewSize={setCrewSize}
              baseSetupFee={totals.baseSetupFee}
              totalTravelAndSetup={totals.totalTravelAndSetup}
              contextMode="service_only"
            />
          </div>
        ) : (
          <div className="space-y-1.5 rounded-xl border border-border/50 bg-muted/15 p-4 text-center">
            <span className="inline-block rounded-full bg-muted/60 p-2 text-muted-foreground">
              <DollarSign className="h-5 w-5" />
            </span>
            <div className="text-xs font-semibold text-foreground">
              Supply Only Order
            </div>
            <p className="mx-auto max-w-sm text-[11px] text-muted-foreground">
              All on-site installation labour, setup fees ($140.00), and travel
              charges are waived.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
export default SealedUnitLabourTravelCard
