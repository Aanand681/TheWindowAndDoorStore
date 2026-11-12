"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Save,
  Wrench,
  PackagePlus,
  Layers,
  Truck,
} from "lucide-react"
import SmartBackButton from "@/components/shared/SmartBackButton"
import { AppHeader } from "@/components/layout/AppHeader"
import {
  AdminWindowLabourTab,
  AdminAddonsTab,
  AdminJambsCasingsTab,
  AdminTravelRatesTab,
} from "@/components/admin/tax-settings"

export default function TaxSettingsDashboard() {
  const [activeTab, setActiveTab] = useState<
    "labour" | "addons" | "jambs" | "travel"
  >("labour")

  // Window Labour Rates
  const [windowLabourPerSqft, setWindowLabourPerSqft] = useState<number>(19)
  const [windowMiscPerSqft, setWindowMiscPerSqft] = useState<number>(8)
  const [windowLabourMin, setWindowLabourMin] = useState<number>(325)
  const [windowMiscMin, setWindowMiscMin] = useState<number>(74)
  const [extraLinPerWindow, setExtraLinPerWindow] = useState<number>(2.17)

  // Addons, Jambs, Casings, Travel
  const [addons, setAddons] = useState<any[]>([])
  const [jambs, setJambs] = useState<any[]>([])
  const [casings, setCasings] = useState<any[]>([])
  const [vehicleRate, setVehicleRate] = useState<number>(0.98)
  const [crewRates, setCrewRates] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.windowLabourPerSqft !== undefined)
          setWindowLabourPerSqft(data.windowLabourPerSqft)
        if (data.windowMiscPerSqft !== undefined)
          setWindowMiscPerSqft(data.windowMiscPerSqft)
        if (data.windowLabourMin !== undefined)
          setWindowLabourMin(data.windowLabourMin)
        if (data.windowMiscMin !== undefined)
          setWindowMiscMin(data.windowMiscMin)
        if (data.extraLinPerWindow !== undefined)
          setExtraLinPerWindow(data.extraLinPerWindow)

        setAddons(data.addons || [])
        setJambs(data.jambs || [])
        setCasings(data.casings || [])
        if (data.vehicleRate !== undefined) setVehicleRate(data.vehicleRate)
        setCrewRates(data.crewRates || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage({ text: "", type: "" })

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          windowLabourPerSqft,
          windowMiscPerSqft,
          windowLabourMin,
          windowMiscMin,
          extraLinPerWindow,
          addons,
          jambs,
          casings,
          vehicleRate,
          crewRates,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage({
        text: "Tax and Labour settings updated successfully!",
        type: "success",
      })
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleAddAddon = () => {
    setAddons([
      ...addons,
      { id: `ext_${Date.now()}`, label: "", lab: 0, misc: 0 },
    ])
  }
  const handleAddJamb = () => {
    setJambs([...jambs, { id: `j_${Date.now()}`, label: "", rate: 0 }])
  }
  const handleAddCasing = () => {
    setCasings([...casings, { id: `c_${Date.now()}`, label: "", rate: 0 }])
  }
  const handleAddCrew = () => {
    setCrewRates([...crewRates, { crewSize: "5", hourlyRate: 0 }])
  }

  const updateItem = (
    setter: any,
    index: number,
    field: string,
    value: any
  ) => {
    setter((prev: any[]) => {
      const next = [...prev]
      next[index][field] = value
      return next
    })
  }

  const removeItem = (setter: any, index: number) => {
    setter((prev: any[]) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-6 px-4 pt-5 pb-12 sm:space-y-8 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath="/admin/tax-settings" />

        <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
            <div className="inline-flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <Settings className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Window Tax &amp; Labour Settings
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Configure window labour formulas, jobsite upcharges, extension
                  jambs, casings, and travel fleet rates.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="cursor-pointer gap-1.5 shadow-md"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </Button>
          </div>
        </div>

        {message.text && (
          <div
            className={`rounded-xl px-4 py-2.5 text-xs font-medium sm:text-sm ${
              message.type === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center text-muted-foreground">
            Loading settings...
          </p>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-3xl grid-cols-2 bg-muted/50 p-1 md:grid-cols-4">
              <TabsTrigger value="labour" className="gap-2 text-xs sm:text-sm">
                <Wrench className="h-4 w-4" />
                <span>Labour Base</span>
              </TabsTrigger>
              <TabsTrigger value="addons" className="gap-2 text-xs sm:text-sm">
                <PackagePlus className="h-4 w-4" />
                <span>Extras &amp; Addons ({addons.length})</span>
              </TabsTrigger>
              <TabsTrigger value="jambs" className="gap-2 text-xs sm:text-sm">
                <Layers className="h-4 w-4" />
                <span>Jambs &amp; Casings</span>
              </TabsTrigger>
              <TabsTrigger value="travel" className="gap-2 text-xs sm:text-sm">
                <Truck className="h-4 w-4" />
                <span>Travel &amp; Logistics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="labour">
              <AdminWindowLabourTab
                windowLabourPerSqft={windowLabourPerSqft}
                setWindowLabourPerSqft={setWindowLabourPerSqft}
                windowMiscPerSqft={windowMiscPerSqft}
                setWindowMiscPerSqft={setWindowMiscPerSqft}
                windowLabourMin={windowLabourMin}
                setWindowLabourMin={setWindowLabourMin}
                windowMiscMin={windowMiscMin}
                setWindowMiscMin={setWindowMiscMin}
                extraLinPerWindow={extraLinPerWindow}
                setExtraLinPerWindow={setExtraLinPerWindow}
              />
            </TabsContent>

            <TabsContent value="addons">
              <AdminAddonsTab
                addons={addons}
                setAddons={setAddons}
                updateItem={updateItem}
                removeItem={removeItem}
                onAddAddon={handleAddAddon}
              />
            </TabsContent>

            <TabsContent value="jambs">
              <AdminJambsCasingsTab
                jambs={jambs}
                setJambs={setJambs}
                casings={casings}
                setCasings={setCasings}
                updateItem={updateItem}
                removeItem={removeItem}
                onAddJamb={handleAddJamb}
                onAddCasing={handleAddCasing}
              />
            </TabsContent>

            <TabsContent value="travel">
              <AdminTravelRatesTab
                vehicleRate={vehicleRate}
                setVehicleRate={setVehicleRate}
                crewRates={crewRates}
                setCrewRates={setCrewRates}
                updateItem={updateItem}
                removeItem={removeItem}
                onAddCrew={handleAddCrew}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
