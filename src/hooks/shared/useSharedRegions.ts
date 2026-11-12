"use client"

import { useState, useEffect } from "react"

export interface SharedRegionOption {
  _id: string
  name: string
  fixedSetupFee: number
  setupFeeOptions: { label: string; value: number }[]
  freeCities: string[]
  officeLat: number
  officeLon: number
}

export function useSharedRegions(defaultRegionName = "Fort Frances") {
  const [regions, setRegions] = useState<SharedRegionOption[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/regions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const valid = data.filter(
            (r: any) =>
              !r.isSupplyOnly && !r.name?.toLowerCase().includes("supply")
          )
          setRegions(valid)
          if (valid.length > 0) {
            const defaultReg =
              valid.find((r: any) =>
                r.name.toLowerCase().includes(defaultRegionName.toLowerCase())
              ) || valid[0]
            setSelectedRegionId(defaultReg._id)
          }
        }
      })
      .catch((err) => console.error("Failed to load regions:", err))
      .finally(() => setLoading(false))
  }, [defaultRegionName])

  const selectedRegion = regions.find((r) => r._id === selectedRegionId)

  return {
    regions,
    selectedRegionId,
    setSelectedRegionId,
    selectedRegion,
    loading,
  }
}
