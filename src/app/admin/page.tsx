import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Tag, DollarSign, Map, Layers } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  const canAccessAdmin = (session.user as any).canAccessAdmin || role === 'SUPERADMIN' || role === 'ADMIN';

  if (!canAccessAdmin) {
    redirect('/login');
  }

  const isSuperAdmin = role === 'SUPERADMIN';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 relative z-10 space-y-8">
        <AppHeader currentPath="/admin" />


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Global Settings - Available to both SUPERADMIN and ADMIN */}
          <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Global Settings
              </CardTitle>
              <CardDescription>Update base pricing constants like the global surcharge percentage.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings" className="w-full block">
                <Button className="w-full">Edit Settings</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tax & Labour Settings */}
          <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Tax & Labour Pricing
              </CardTitle>
              <CardDescription>Update rates for jambs, casings, and extra labour addons.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/tax-settings" className="w-full block">
                <Button className="w-full">Edit Pricing</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Region Settings */}
          <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                Region Pricing & Defaults
              </CardTitle>
              <CardDescription>Update region-specific per-sqft rates, fixed setup fees, and map coordinates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/regions" className="w-full block">
                <Button className="w-full">Edit Regions</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Employees - Available to both SUPERADMIN and ADMIN */}
          <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Manage Staff
              </CardTitle>
              <CardDescription>Add new employees, manage passwords, and view staff activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/staff" className="w-full block">
                <Button className="w-full">View Staff Directory</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Promos & Formulas */}
          <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Promos & Sales
                </CardTitle>
              </div>
              <CardDescription>
                Toggle which promos are currently live. Contact developer to create new promo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/promos" className="w-full block">
                <Button className="w-full">Manage Promos</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Sealed Unit Pricing - Available to both SUPERADMIN and ADMIN */}
          <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Sealed Unit Pricing
                </CardTitle>
              </div>
              <CardDescription>
                Update glass rates (Annealed/Tempered), thickness ladders, formula multipliers, and installation labour rules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/sealed-units" className="w-full block">
                <Button className="w-full">Edit Sealed Unit Pricing</Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
