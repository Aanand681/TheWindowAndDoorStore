import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { cachedFetch } from "@/lib/client-cache"
import { toast } from "sonner"
import { DBPromo, ILabourUpgradeTier } from "@/lib/promo-logic"
import { QuoteTemplateType } from "@/components/quotes/QuoteInvoice"

export interface UseCalculatorDataSyncProps {
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  reviewQuoteId: string | null
  setAvailablePromos: (promos: DBPromo[]) => void
  setSurchargeRate: (rate: number) => void
  setDbLabourUpgradeTiers: (tiers: ILabourUpgradeTier[]) => void
  setUser: (user: any) => void
  setQuoteTemplate: (tpl: QuoteTemplateType) => void
  setStaffList: (staff: any[]) => void
  setAssignedReviewer: (reviewer: string) => void
  setReassignTo: (user: string) => void
  setClerkList: (clerks: any[]) => void
  setSelectedOdooClerk: (clerk: string) => void
  setPendingReviewCount: (count: number) => void
  handleOpenQuoteFromTab: (quoteId: string, isEdit?: boolean) => void
  handleExitReview: () => void
}

export function useCalculatorDataSync({
  initialReviewQuoteId,
  initialIsEditMode,
  reviewQuoteId,
  setAvailablePromos,
  setSurchargeRate,
  setDbLabourUpgradeTiers,
  setUser,
  setQuoteTemplate,
  setStaffList,
  setAssignedReviewer,
  setReassignTo,
  setClerkList,
  setSelectedOdooClerk,
  setPendingReviewCount,
  handleOpenQuoteFromTab,
  handleExitReview,
}: UseCalculatorDataSyncProps) {
  const router = useRouter()

  // TanStack Query for Promos
  const { data: promosData } = useQuery<DBPromo[]>({
    queryKey: ["promos", "active"],
    queryFn: async () => {
      const res = await fetch("/api/promos?active=true")
      if (!res.ok) return []
      return res.json()
    },
    staleTime: 60 * 1000,
  })

  // TanStack Query for Global Settings
  const { data: settingsData } = useQuery<{
    surchargeRate?: number
    labourUpgradeTiers?: ILabourUpgradeTier[]
  }>({
    queryKey: ["settings", "global"],
    queryFn: async () => {
      const res = await fetch("/api/settings")
      if (!res.ok) return {}
      return res.json()
    },
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (Array.isArray(promosData) && promosData.length > 0) {
      setAvailablePromos(promosData)
    }
  }, [promosData, setAvailablePromos])

  useEffect(() => {
    if (settingsData) {
      if (settingsData.surchargeRate !== undefined) {
        setSurchargeRate(settingsData.surchargeRate)
      }
      if (
        Array.isArray(settingsData.labourUpgradeTiers) &&
        settingsData.labourUpgradeTiers.length > 0
      ) {
        setDbLabourUpgradeTiers(settingsData.labourUpgradeTiers)
      }
    }
  }, [settingsData, setSurchargeRate, setDbLabourUpgradeTiers])

  // Initial Data Fetching (User Profile & Reviewer/Clerk lists)
  useEffect(() => {
    cachedFetch<any>("/api/profile")
      .then((data) => {
        if (data) {
          setUser(data)
          if (
            data.favoriteTemplate &&
            ["modern", "executive", "cards"].includes(data.favoriteTemplate)
          ) {
            setQuoteTemplate(data.favoriteTemplate)
          }
        }
      })
      .catch((err) => {
        if (err?.message?.includes("401")) router.replace("/login")
      })

    Promise.all([
      fetch(`/api/users?t=${Date.now()}`, { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`/api/users?assignees=true&t=${Date.now()}`, {
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([allUsers, assignees]) => {
        const eligible = Array.isArray(allUsers)
          ? allUsers.filter(
              (d: any) =>
                d.role !== "SUPERADMIN" &&
                d.role !== "superadmin" &&
                !d.username?.toLowerCase().includes("superadmin")
            )
          : []
        setStaffList(eligible)
        if (eligible.length > 0) {
          setAssignedReviewer(eligible[0].username)
          setReassignTo(eligible[0].username)
        }
        if (Array.isArray(assignees)) {
          const eligibleClerks = assignees.filter(
            (d: any) =>
              d.role !== "SUPERADMIN" &&
              d.role !== "superadmin" &&
              !d.username?.toLowerCase().includes("superadmin")
          )
          setClerkList(eligibleClerks)
          const defaultClerk =
            eligibleClerks.find((c: any) => c.department === "CLERK") ||
            eligibleClerks[0]
          if (defaultClerk) setSelectedOdooClerk(defaultClerk.username)
        }
      })
      .catch(console.error)

    if (initialReviewQuoteId) {
      handleOpenQuoteFromTab(initialReviewQuoteId, initialIsEditMode)
    }

    const handleQuoteDeleted = (e: any) => {
      if (e.detail?.quoteId && reviewQuoteId === e.detail.quoteId) {
        toast.warning(`Quote #${e.detail?.quoteNumber || ""} was deleted.`)
        handleExitReview()
      }
    }
    window.addEventListener("quote-deleted", handleQuoteDeleted)

    const refreshPendingCount = () => {
      fetch("/api/quotes?countOnly=true")
        .then((res) => res.json())
        .then((data) => {
          const count = data.totalActionableCount ?? data.pendingReviewCount
          if (count !== undefined) setPendingReviewCount(count)
        })
        .catch(console.error)
    }
    window.addEventListener("quote-count-updated", refreshPendingCount)
    window.addEventListener("focus", refreshPendingCount)
    refreshPendingCount()

    return () => {
      window.removeEventListener("quote-deleted", handleQuoteDeleted)
      window.removeEventListener("quote-count-updated", refreshPendingCount)
      window.removeEventListener("focus", refreshPendingCount)
    }
  }, [])
}
