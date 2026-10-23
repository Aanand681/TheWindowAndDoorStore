import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Component, Users, Tag, DollarSign, UserCircle, Map, Calculator, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';
import NotificationBell from '@/components/NotificationBell';
import UserProfileMenu from '@/components/UserProfileMenu';
import QuotesBinPill from '@/components/QuotesBinPill';

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
      
      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer group"
            title="Go to Calculator"
          >
            <Component className="w-6 h-6 transition-transform group-hover:scale-105" />
            <span className="text-xl font-semibold tracking-wider uppercase">Window & Door Store</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur hover:bg-primary/10 hover:text-primary transition-colors")}
            >
              <Calculator className="w-3.5 h-3.5 text-primary" />
              <span>Calculator</span>
            </Link>
            <QuotesBinPill />
            <NotificationBell />
            <ThemeToggle />
            <UserProfileMenu />
          </div>
        </header>


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

          {/* Quotes & Review Queue */}
          <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl hover:border-amber-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Quotes &amp; Review Bin
                </CardTitle>
              </div>
              <CardDescription>
                Review submitted quotes, approve price changes, and search historical customer quotes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/quotes" className="w-full block">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold">Open Review Bin</Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
