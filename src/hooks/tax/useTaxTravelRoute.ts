"use client"

import { useState } from "react"
import { toast } from "sonner"

export function isPointInPolygon(
  point: { lat: number; lng: number },
  vs: { lat: number; lng: number }[]
): boolean {
  const x = point.lng
  const y = point.lat
  let inside = false
  if (!vs || vs.length < 3) return false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].lng
    const yi = vs[i].lat
    const xj = vs[j].lng
    const yj = vs[j].lat
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function useTaxTravelRoute(region: any) {
  const [coords, setCoords] = useState("")
  const [travelInfo, setTravelInfo] = useState<any>(null)
  const [manualKm, setManualKm] = useState("0")
  const [manualHours, setManualHours] = useState("0")
  const [setupFee, setSetupFee] = useState("0")

  const calculateTravelFromCoords = async (lat: number, lon: number) => {
    if (!region) return
    const pt = {
      lat,
      lon,
      city: "Custom Coordinates",
      label: `Coordinates ${lat}, ${lon}`,
    }

    try {
      let isFree = false
      let geofenced = false

      // Check geofence polygon
      if (
        region.polygon &&
        region.polygon.length > 2 &&
        isPointInPolygon({ lat, lng: lon }, region.polygon)
      ) {
        isFree = true
        geofenced = true
      } else if (
        region?.freeCities?.some(
          (c: string) => c.toLowerCase() === pt.city.toLowerCase()
        )
      ) {
        isFree = true
      }

      toast.info("Calculating route...")
      const rt = await fetch(
        `/api/route?lon=${pt.lon}&lat=${pt.lat}&officeLon=${region.officeLon}&officeLat=${region.officeLat}`
      )
      if (!rt.ok) throw new Error((await rt.json()).error)
      const rData = await rt.json()

      setTravelInfo({ ...pt, ...rData, isFree })

      if (
        region?.name?.toLowerCase().includes("dryden") ||
        region?.name?.toLowerCase().includes("sioux")
      ) {
        setSetupFee("727.5")
      }

      if (isFree) {
        setManualKm("0")
        setManualHours("0")
        if (geofenced)
          toast.success("Inside City Boundary (No extra travel fee)!")
      } else {
        const roundKm = rData.km * 2
        const roundHrs = Math.ceil(((rData.seconds * 2) / 3600) * 4) / 4
        setManualKm(roundKm.toFixed(1))
        setManualHours(roundHrs.toFixed(2))
        toast.success("Calculated extra route from city center!")
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return {
    coords,
    setCoords,
    travelInfo,
    setTravelInfo,
    manualKm,
    setManualKm,
    manualHours,
    setManualHours,
    setupFee,
    setSetupFee,
    calculateTravelFromCoords,
  }
}
