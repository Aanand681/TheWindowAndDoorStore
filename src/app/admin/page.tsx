import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Tag, DollarSign, Map, Layers, DoorClosed } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/layout/AppHeader"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role
  const canAccessAdmin =
    session.user.canAccessAdmin || role === "SUPERADMIN" || role === "ADMIN"

  if (!canAccessAdmin) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-8 px-4 pt-5 pb-10 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath="/admin" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Global Settings - Available to both SUPERADMIN and ADMIN */}
          <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-5 w-5 text-primary" />
                Global Settings
              </CardTitle>
              <CardDescription>
                Update base pricing constants like the global surcharge
                percentage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings" className="block w-full">
                <Button className="w-full">Edit Settings</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tax & Labour Settings */}
          <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-5 w-5 text-primary" />
                Tax & Labour Pricing
              </CardTitle>
              <CardDescription>
                Update rates for jambs, casings, and extra labour addons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/tax-settings" className="block w-full">
                <Button className="w-full">Edit Pricing</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Region Settings */}
          <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Map className="h-5 w-5 text-primary" />
                Region Pricing & Defaults
              </CardTitle>
              <CardDescription>
                Update region-specific per-sqft rates, fixed setup fees, and map
                coordinates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/regions" className="block w-full">
                <Button className="w-full">Edit Regions</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Employees - Available to both SUPERADMIN and ADMIN */}
          <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-primary" />
                Manage Staff
              </CardTitle>
              <CardDescription>
                Add new employees, manage passwords, and view staff activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/staff" className="block w-full">
                <Button className="w-full">View Staff Directory</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Promos & Formulas */}
          <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl transition-colors hover:border-primary/50">
            <CardHeader>
              <div className="mb-1 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Tag className="h-5 w-5 text-primary" />
                  Promos & Sales
                </CardTitle>
              </div>
              <CardDescription>
                Toggle which promos are currently live. Contact developer to
                create new promo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/promos" className="block w-full">
                <Button className="w-full">Manage Promos</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Sealed Unit Pricing - Available to both SUPERADMIN and ADMIN */}
          <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl transition-colors hover:border-primary/50">
            <CardHeader>
              <div className="mb-1 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Layers className="h-5 w-5 text-primary" />
                  Sealed Unit Pricing
                </CardTitle>
              </div>
              <CardDescription>
                Update glass rates (Annealed/Tempered), thickness ladders,
                formula multipliers, and installation labour rules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/sealed-units" className="block w-full">
                <Button className="w-full">Edit Sealed Unit Pricing</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Door Pricing & Labour - Available to both SUPERADMIN and ADMIN */}
          <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl transition-colors hover:border-primary/50">
            <CardHeader>
              <div className="mb-1 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <DoorClosed className="h-5 w-5 text-primary" />
                  Door Pricing &amp; Labour
                </CardTitle>
              </div>
              <CardDescription>
                Update door presets, base labour, misc materials, site
                upcharges, surcharge %, and travel rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/doors" className="block w-full">
                <Button className="w-full">Edit Door Pricing</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
