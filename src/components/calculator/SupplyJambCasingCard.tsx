"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Layers, Plus, Trash2 } from "lucide-react"
import type { CustomMaterialItem } from "@/types/calculator"
import { UIWindowItem } from "@/hooks/useCalculatorWindows"
import { computeTotalLinearFeet } from "./supply-jc/supply-jc-calculator"
import { SupplyJambSelector } from "./supply-jc/SupplyJambSelector"
import { SupplyCasingSelector } from "./supply-jc/SupplyCasingSelector"

export interface SupplyJambCasingCardProps {
  windows: UIWindowItem[]
  isReadOnly?: boolean
  jambId: string
  setJambId: (val: string) => void
  jambName: string
  setJambName: (val: string) => void
  jambRate: string
  setJambRate: (val: string) => void
  casingId: string
  setCasingId: (val: string) => void
  casingName: string
  setCasingName: (val: string) => void
  casingRate: string
  setCasingRate: (val: string) => void
  customMaterials?: CustomMaterialItem[]
  setCustomMaterials?: (mats: CustomMaterialItem[]) => void
  onJCCalculated: (data: {
    linearFeet: number
    jambTotCents: number
    casingTotCents: number
    jcTotalCents: number
    selectedJamb: any
    selectedCasing: any
    customMaterials?: CustomMaterialItem[]
    customMaterialsTotalCents?: number
  }) => void
}

export function SupplyJambCasingCard({
  windows,
  isReadOnly = false,
  jambId,
  setJambId,
  jambName,
  setJambName,
  jambRate,
  setJambRate,
  casingId,
  setCasingId,
  casingName,
  setCasingName,
  casingRate,
  setCasingRate,
  customMaterials: customMaterialsProp,
  setCustomMaterials: setCustomMaterialsProp,
  onJCCalculated,
}: SupplyJambCasingCardProps) {
  const [internalMaterials, setInternalMaterials] = useState<
    CustomMaterialItem[]
  >([])
  const customMaterials = customMaterialsProp ?? internalMaterials
  const setCustomMaterials = setCustomMaterialsProp ?? setInternalMaterials

  const [dbJambs, setDbJambs] = useState<any[]>([])
  const [dbCasings, setDbCasings] = useState<any[]>([])
  const [extraLinPerWindow, setExtraLinPerWindow] = useState<number>(2.17)

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.jambs?.length) setDbJambs(d.jambs)
        if (d?.casings?.length) setDbCasings(d.casings)
      })
      .catch(console.error)

    fetch("/api/regions")
      .then((r) => r.json())
      .then((regions) => {
        if (Array.isArray(regions)) {
          const supply = regions.find(
            (r: any) =>
              r.isSupplyOnly || r.name?.toLowerCase().includes("supply")
          )
          if (supply && supply.extraLinPerWindow !== undefined) {
            setExtraLinPerWindow(Number(supply.extraLinPerWindow) || 2.17)
          }
        }
      })
      .catch(console.error)
  }, [])

  const linearFeet = useMemo(() => {
    return computeTotalLinearFeet(windows, extraLinPerWindow)
  }, [windows, extraLinPerWindow])

  const effectiveJambRate = useMemo(() => {
    if (jambId === "none") return 0
    if (jambId === "custom") return parseFloat(jambRate) || 0
    const found = dbJambs.find((j) => j.id === jambId)
    return found ? Number(found.rate ?? found.pricePerFoot ?? 0) : 0
  }, [jambId, jambRate, dbJambs])

  const effectiveCasingRate = useMemo(() => {
    if (casingId === "none") return 0
    if (casingId === "custom") return parseFloat(casingRate) || 0
    const found = dbCasings.find((c) => c.id === casingId)
    return found ? Number(found.rate ?? found.pricePerFoot ?? 0) : 0
  }, [casingId, casingRate, dbCasings])

  const jambTotCents = Math.round(linearFeet * effectiveJambRate * 100)
  const casingTotCents = Math.round(linearFeet * effectiveCasingRate * 100)
  const jcTotalCents = jambTotCents + casingTotCents

  const selectedJambLabel = useMemo(() => {
    if (jambId === "none") return "None"
    if (jambId === "custom") return jambName || "Custom"
    return dbJambs.find((j) => j.id === jambId)?.label || "None"
  }, [jambId, jambName, dbJambs])

  const selectedCasingLabel = useMemo(() => {
    if (casingId === "none") return "None"
    if (casingId === "custom") return casingName || "Custom"
    return dbCasings.find((c) => c.id === casingId)?.label || "None"
  }, [casingId, casingName, dbCasings])

  const selectedJambObj = useMemo(() => {
    if (jambId === "none") return null
    return {
      id: jambId,
      name:
        jambId === "custom"
          ? jambName || "Custom Jamb"
          : dbJambs.find((j) => j.id === jambId)?.label || "Jamb",
      rate: effectiveJambRate,
      total: jambTotCents / 100,
    }
  }, [jambId, jambName, effectiveJambRate, jambTotCents, dbJambs])

  const selectedCasingObj = useMemo(() => {
    if (casingId === "none") return null
    return {
      id: casingId,
      name:
        casingId === "custom"
          ? casingName || "Custom Casing"
          : dbCasings.find((c) => c.id === casingId)?.label || "Casing",
      rate: effectiveCasingRate,
      total: casingTotCents / 100,
    }
  }, [casingId, casingName, effectiveCasingRate, casingTotCents, dbCasings])

  const customMaterialsTotalCents = useMemo(() => {
    return Math.round(
      customMaterials.reduce((acc, m) => acc + (Number(m.amount) || 0), 0) * 100
    )
  }, [customMaterials])

  const lastEmittedSigRef = useRef<string>("")

  useEffect(() => {
    const signature = `${linearFeet.toFixed(2)}|${jambTotCents}|${casingTotCents}|${jcTotalCents}|${selectedJambObj?.id ?? "none"}|${selectedJambObj?.rate ?? 0}|${selectedCasingObj?.id ?? "none"}|${selectedCasingObj?.rate ?? 0}|${customMaterialsTotalCents}|${JSON.stringify(customMaterials)}`

    if (lastEmittedSigRef.current === signature) return
    lastEmittedSigRef.current = signature

    onJCCalculated({
      linearFeet,
      jambTotCents,
      casingTotCents,
      jcTotalCents,
      selectedJamb: selectedJambObj,
      selectedCasing: selectedCasingObj,
      customMaterials,
      customMaterialsTotalCents,
    })
  }, [
    linearFeet,
    jambTotCents,
    casingTotCents,
    jcTotalCents,
    selectedJambObj,
    selectedCasingObj,
    customMaterials,
    customMaterialsTotalCents,
    onJCCalculated,
  ])

  return (
    <Card className="animate-in gap-0 overflow-hidden border-primary/25 bg-card/70 py-0 shadow-md backdrop-blur-xl duration-150 [--card-spacing:0px] fade-in slide-in-from-top-2">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>Supply Jambs &amp; Casings (Optional)</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {linearFeet.toFixed(2)} lin ft total
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SupplyJambSelector
            isReadOnly={isReadOnly}
            jambId={jambId}
            setJambId={setJambId}
            jambName={jambName}
            setJambName={setJambName}
            jambRate={jambRate}
            setJambRate={setJambRate}
            dbJambs={dbJambs}
            selectedJambLabel={selectedJambLabel}
          />

          <SupplyCasingSelector
            isReadOnly={isReadOnly}
            casingId={casingId}
            setCasingId={setCasingId}
            casingName={casingName}
            setCasingName={setCasingName}
            casingRate={casingRate}
            setCasingRate={setCasingRate}
            dbCasings={dbCasings}
            selectedCasingLabel={selectedCasingLabel}
          />
        </div>

        {/* Additional Materials */}
        <div className="space-y-2 border-t border-border/40 pt-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground">
              Additional Materials
            </Label>
            <span className="font-mono text-[11px] text-muted-foreground">
              (Eligible for Material Exemption)
            </span>
          </div>

          {customMaterials.length > 0 && (
            <div className="space-y-2">
              {customMaterials.map((mat, index) => (
                <div key={mat.id} className="flex items-center gap-2">
                  <Input
                    disabled={isReadOnly}
                    placeholder="e.g. Jamb as stop"
                    className="h-8 flex-1 text-xs"
                    value={mat.label}
                    onChange={(e) => {
                      const updated = [...customMaterials]
                      updated[index] = {
                        ...updated[index],
                        label: e.target.value,
                      }
                      setCustomMaterials(updated)
                    }}
                  />
                  <div className="relative w-24 shrink-0">
                    <span className="absolute top-2 left-2 text-xs text-muted-foreground">
                      $
                    </span>
                    <Input
                      disabled={isReadOnly}
                      type="number"
                      placeholder="0.00"
                      className="h-8 pl-5 font-mono text-xs"
                      value={mat.amount || ""}
                      onChange={(e) => {
                        const updated = [...customMaterials]
                        updated[index] = {
                          ...updated[index],
                          amount: parseFloat(e.target.value) || 0,
                        }
                        setCustomMaterials(updated)
                      }}
                    />
                  </div>
                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive"
                      onClick={() => {
                        setCustomMaterials(
                          customMaterials.filter((m) => m.id !== mat.id)
                        )
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              className="mt-0.5 h-8 w-full border-dashed text-xs"
              onClick={() => {
                const newMat: CustomMaterialItem = {
                  id: "mat_" + Date.now(),
                  label: "",
                  amount: 0,
                }
                setCustomMaterials([...customMaterials, newMat])
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Material
            </Button>
          )}
        </div>

        {(jcTotalCents > 0 || customMaterialsTotalCents > 0) && (
          <div className="flex items-center justify-between border-t border-border/40 pt-2 font-mono text-xs font-bold text-foreground">
            <span className="font-sans text-[11px] font-medium text-muted-foreground">
              J&amp;C (${(jcTotalCents / 100).toFixed(2)})
              {customMaterialsTotalCents > 0 &&
                ` + Materials ($${(customMaterialsTotalCents / 100).toFixed(2)})`}
            </span>
            <span className="font-bold text-primary">
              Total: $
              {((jcTotalCents + customMaterialsTotalCents) / 100).toFixed(2)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
