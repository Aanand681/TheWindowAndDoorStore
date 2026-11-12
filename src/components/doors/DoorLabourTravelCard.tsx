"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  DoorLogisticsSettings,
  DoorQuotingMode,
  DoorUpchargeConfig,
  DoorSelectedUpcharge,
} from "@/lib/doors/types"
import { Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DoorSiteUpchargesSection,
  DoorSetupPresetsSection,
  DoorMileageSection,
} from "./labour"
import { SharedRegionOption } from "@/hooks/shared/useSharedRegions"

interface DoorLabourTravelCardProps {
  mode: DoorQuotingMode
  availableUpcharges: DoorUpchargeConfig[]
  globalUpcharges: DoorSelectedUpcharge[]
  onUpdateGlobalUpcharges: (upcharges: DoorSelectedUpcharge[]) => void
  regions?: SharedRegionOption[]
  selectedRegionId?: string
  onSelectRegion?: (regionId: string) => void
  travelFeeType: "none" | "local_std" | "far_std" | "far_small" | "custom"
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  logistics: DoorLogisticsSettings
  onUpdateParams: (updates: {
    selectedRegionId?: string
    travelFeeType?: "none" | "local_std" | "far_std" | "far_small" | "custom"
    customTravelFee?: string
    showOutTownTravel?: boolean
    travelKm?: string
    crewHours?: string
    crewSize?: "2" | "3"
  }) => void
  className?: string
}

export function DoorLabourTravelCard({
  mode,
  availableUpcharges,
  globalUpcharges,
  onUpdateGlobalUpcharges,
  regions = [],
  selectedRegionId = "",
  onSelectRegion = () => {},
  travelFeeType,
  customTravelFee,
  showOutTownTravel,
  travelKm,
  crewHours,
  crewSize,
  logistics,
  onUpdateParams,
  className,
}: DoorLabourTravelCardProps) {
  const isInstallation = mode === "installation"

  if (!isInstallation) {
    return (
      <Card
        className={cn(
          "gap-0 border-border/60 bg-card/40 py-0 opacity-60 [--card-spacing:0px]",
          className
        )}
      >
        <CardContent className="flex items-center justify-between py-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span>
              Setup & Logistics fees are excluded in Supply Only mode.
            </span>
          </div>
          <span className="font-mono font-semibold">$0.00</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "!gap-0 border-border bg-card/70 !py-0 shadow-md backdrop-blur-md [--card-spacing:0px]",
        className
      )}
    >
      <CardHeader className="border-b border-border/50 p-3.5 !pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">
                Site Setup, Upcharges &amp; Logistics
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5 p-3.5 !pt-3">
        <DoorSiteUpchargesSection
          availableUpcharges={availableUpcharges}
          globalUpcharges={globalUpcharges}
          onUpdateGlobalUpcharges={onUpdateGlobalUpcharges}
        />

        <DoorSetupPresetsSection
          regions={regions}
          selectedRegionId={selectedRegionId}
          onSelectRegion={onSelectRegion}
          travelFeeType={travelFeeType}
          customTravelFee={customTravelFee}
          logistics={logistics}
          onUpdateParams={onUpdateParams}
        />

        <DoorMileageSection
          showOutTownTravel={showOutTownTravel}
          travelKm={travelKm}
          crewHours={crewHours}
          crewSize={crewSize}
          logistics={logistics}
          onUpdateParams={onUpdateParams}
        />
      </CardContent>
    </Card>
  )
}
