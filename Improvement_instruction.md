# Improvement Instructions - Step by Step Execution Guide

**Project:** The Window & Door Store  
**Target:** Vercel Production Deployment  
**Strategy:** Minimum file touches, maximum impact, logical dependency order  
**Generated:** October 26, 2026

---

## 🎯 Execution Philosophy

> **Golden Rule:** Complete each file edit in ONE pass. Plan all changes to a file before touching it.

### Dependency Graph (What Must Come First)
```
┌─────────────────────────────────────────────────────────────┐
│  1. ENV VALIDATION (src/env.ts)                             │
│     └─→ Required by: all API routes, middleware, lib files  │
├─────────────────────────────────────────────────────────────┤
│  2. NEXT.CONFIG.TS (React Compiler, package optimization)   │
│     └─→ Required by: all builds, bundle analysis            │
├─────────────────────────────────────────────────────────────┤
│  3. VERCEL.JSON (function config, crons)                    │
│     └─→ Independent, deploy-time config                     │
├─────────────────────────────────────────────────────────────┤
│  4. MONGODB INDEXES (run once in Atlas shell)               │
│     └─→ Independent, immediate query perf                   │
├─────────────────────────────────────────────────────────────┤
│  5. ERROR BOUNDARIES (app/error.tsx, global-error.tsx)      │
│     └─→ Required by: all pages before splitting             │
├─────────────────────────────────────────────────────────────┤
│  6. ROUTE STRUCTURE (create folder structure)               │
│     └─→ Required by: page.tsx split, dynamic imports        │
├─────────────────────────────────────────────────────────────┤
│  7. PAGE.TSX SPLIT (calculator, quotes, tax, review)        │
│     └─→ Single massive refactor - do ONCE                   │
├─────────────────────────────────────────────────────────────┤
│  8. API CACHING (ISR on read endpoints)                     │
│     └─→ After routes exist, before load testing             │
├─────────────────────────────────────────────────────────────┤
│  9. DYNAMIC IMPORTS (PDF Studio, Map, heavy components)     │
│     └─→ After components are in separate routes             │
├─────────────────────────────────────────────────────────────┤
│ 10. BUNDLE ANALYSIS & OPTIMIZATION                          │
│     └─→ Final verification                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 PHASE 1: FOUNDATION (Day 1 - 2 hours)
*Files touched: 3 new files, 1 modified*

### Task 1.1: Create Environment Validation (`src/env.ts`)
**Effort:** 15 min | **Files:** 1 new

```bash
# Create the file
touch src/env.ts
```

**Content for `src/env.ts`:**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().url().min(1),
  
  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(), // Auto-corrected on Vercel
  
  // Email
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  
  // Pusher
  PUSHER_APP_ID: z.string().min(1),
  PUSHER_KEY: z.string().min(1),
  PUSHER_SECRET: z.string().min(1),
  PUSHER_CLUSTER: z.string().min(1),
  NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

**Add to `package.json` dependencies:**
```json
"dependencies": {
  "zod": "^3.22.0"
}
```
Run: `npm install zod`

---

### Task 1.2: Update `next.config.ts` (Single Edit)
**Effort:** 10 min | **Files:** 1 modified

**Replace ENTIRE `next.config.ts`:**
```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // React Compiler (Next.js 16+) - reduces bundle ~20-30%
  experimental: {
    reactCompiler: true,
    optimizePackageImports: [
      'lucide-react', 
      '@hugeicons/react', 
      'sonner',
      'framer-motion',
      'pdf-lib'
    ],
  },
  
  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdn.jsdelivr.net' },
      { protocol: 'https', hostname: '**.googleapis.com' },
    ],
  },
  
  // Compression
  compress: true,
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.pdf',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ];
  },
  
  // Webpack: Remove canvas dependency (pdfjs-dist)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  
  // Allow dev origins for LAN testing
  allowedDevOrigins: ['10.0.0.194', '192.168.2.211'],
}

export default nextConfig
```

---

### Task 1.3: Create `vercel.json`
**Effort:** 5 min | **Files:** 1 new

```bash
touch vercel.json
```

**Content:**
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    },
    "src/app/api/quotes/route.ts": {
      "maxDuration": 60,
      "memory": 2048
    },
    "src/app/quote-studio/page.tsx": {
      "maxDuration": 60,
      "memory": 2048
    }
  },
  "crons": [
    {
      "path": "/api/quotes/reminders",
      "schedule": "0 9 * * 1-5"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

### Task 1.4: Run MongoDB Compound Indexes (One-time)
**Effort:** 5 min | **Files:** 0 (Atlas Shell)

**Run in MongoDB Atlas → Collections → `savedquotes` → Indexes → Create Index:**

```javascript
// Paste each in Atlas shell or Compass

// 1. Reviewer queries (most common)
db.savedquotes.createIndex({ status: 1, assignedTo: 1, createdAt: -1 }, { name: "reviewer_queue" })

// 2. Clerk Odoo queue
db.savedquotes.createIndex({ odooAssignedTo: 1, odooStatus: 1, createdAt: -1 }, { name: "clerk_odoo_queue" })

// 3. Employee history
db.savedquotes.createIndex({ preparedBy: 1, status: 1, createdAt: -1 }, { name: "employee_history" })

// 4. Text search
db.savedquotes.createIndex({ 
  quoteNumber: "text", 
  customerName: "text", 
  preparedBy: "text",
  odooOrderNumber: "text"
}, { name: "text_search" })

// 5. Admin dashboard (all quotes)
db.savedquotes.createIndex({ createdAt: -1 }, { name: "admin_archive" })

// 6. Notifications
db.notifications.createIndex({ recipientUsername: 1, isRead: 1, createdAt: -1 }, { name: "user_notifications" })
```

**Verify:** `db.savedquotes.getIndexes()`

---

## 📦 PHASE 2: ERROR HANDLING & MIDDLEWARE (Day 1 - 1 hour)
*Files touched: 3 new files, 1 modified*

### Task 2.1: Create Error Boundaries
**Effort:** 20 min | **Files:** 2 new

**`src/app/error.tsx`:**
```tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <AlertTriangle className="w-16 h-16 text-destructive/50 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**`src/app/global-error.tsx`:**
```tsx
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Critical Error</h2>
          <p className="text-muted-foreground">The application failed to initialize.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/login'} className="gap-2">
              <Home className="w-4 h-4" />
              Login Page
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

---

### Task 2.2: Update Middleware for Edge Runtime
**Effort:** 10 min | **Files:** 1 modified

**Replace `src/middleware.ts`:**
```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Enable Edge Runtime for faster auth checks
export const runtime = 'edge';

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string;
    const canAccessAdmin = Boolean(req.nextauth.token?.canAccessAdmin);
    
    if (
      req.nextUrl.pathname.startsWith('/admin') &&
      !['SUPERADMIN', 'ADMIN'].includes(role) &&
      !canAccessAdmin
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    pages: { signIn: '/login' },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login|forgot-password|reset-password|quote-studio).*)',
  ],
};
```

---

### Task 2.3: Create API Error Wrapper
**Effort:** 15 min | **Files:** 1 new

**`src/lib/api-error.ts`:**
```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: error.flatten() },
      { status: 400 }
    );
  }
  
  if (error instanceof Error) {
    // MongoDB duplicate key
    if (error.message.includes('E11000') || error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Record already exists', code: 'DUPLICATE_KEY' },
        { status: 409 }
      );
    }
    
    // MongoDB connection
    if (error.message.includes('ECONNREFUSED') || error.message.includes('MongoServerSelectionError')) {
      return NextResponse.json(
        { error: 'Database unavailable', code: 'DB_CONNECTION_ERROR' },
        { status: 503 }
      );
    }
  }
  
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

export function createApiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { 
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}
```

---

## 📦 PHASE 3: ROUTE STRUCTURE CREATION (Day 2 - 30 min)
*Files touched: 6 new folders/files (structure only, no logic yet)*

### Task 3.1: Create Route Folder Structure
**Effort:** 15 min | **Files:** 6 new directories + page.tsx files

```bash
# Create all route directories at once
mkdir -p src/app/calculator
mkdir -p src/app/quotes
mkdir -p src/app/tax
mkdir -p src/app/review/\[id\]
mkdir -p src/app/api/promos
mkdir -p src/app/api/settings
mkdir -p src/app/api/regions
```

**Create placeholder pages (will fill in Phase 4):**

```bash
# Calculator page (main landing)
touch src/app/calculator/page.tsx

# Quotes page (uses existing QuotesTab)
touch src/app/quotes/page.tsx

# Tax calculator page
touch src/app/tax/page.tsx

# Review page (dynamic route)
touch src/app/review/\[id\]/page.tsx
```

---

### Task 3.2: Create Shared Layout Components
**Effort:** 15 min | **Files:** 2 new

**`src/components/AppHeader.tsx`** (Extract from page.tsx, quote-studio, admin):
```tsx
'use client';

import Link from 'next/link';
import { Component, Calculator, Inbox, FileText, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/NotificationBell';
import UserProfileMenu from '@/components/UserProfileMenu';
import QuotesBinPill from '@/components/QuotesBinPill';
import { useSession } from 'next-auth/react';

interface AppHeaderProps {
  currentPath: string;
  showQuotesBin?: boolean;
}

export function AppHeader({ currentPath, showQuotesBin = true }: AppHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const canAccessAdmin = user?.canAccessAdmin || user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
      <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer group" title="Window & Door Store - Home">
        <Component className="w-6 h-6 transition-transform group-hover:scale-105" />
        <span className="text-xl font-semibold tracking-wider uppercase">Window & Door Store</span>
      </Link>
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
        <Link href="/calculator" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors", currentPath === '/calculator' ? "border-primary text-primary hover:bg-primary/10" : "border-border/60 hover:bg-muted/30 text-muted-foreground")}>
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculator</span>
        </Link>
        
        <Link href="/quotes" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors", currentPath === '/quotes' ? "border-amber-500/40 text-amber-500 hover:bg-amber-500/10" : "border-border/60 hover:bg-muted/30 text-muted-foreground")}>
          <Inbox className="w-3.5 h-3.5 text-amber-500" />
          <span>Quotes & Bin</span>
          {showQuotesBin && <QuotesBinPill />}
        </Link>
        
        <Link href="/quote-studio" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors cursor-pointer border-primary/50 text-primary hover:bg-primary/10", currentPath === '/quote-studio' ? "border-primary bg-primary/10" : "")}>
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>Quote PDF Studio</span>
        </Link>
        
        {canAccessAdmin && (
          <Link href="/admin" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full gap-1.5 text-xs font-semibold shadow-sm", currentPath === '/admin' ? "border-primary bg-primary/10" : "")}>
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Dashboard</span>
          </Link>
        )}
        
        <NotificationBell />
        <ThemeToggle />
        <UserProfileMenu user={user} />
      </div>
    </header>
  );
}
```

**`src/components/AppLayout.tsx`** (Wrapper for consistent page structure):
```tsx
import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  currentPath: string;
  showQuotesBin?: boolean;
  className?: string;
}

export function AppLayout({ children, currentPath, showQuotesBin = true, className }: AppLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground font-sans selection:bg-primary/30", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="max-w-[1650px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 relative z-10 space-y-6 sm:space-y-8">
        <AppHeader currentPath={currentPath} showQuotesBin={showQuotesBin} />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

---

## 📦 PHASE 4: PAGE.TSX MONOLITH SPLIT (Day 2-3 - 4 hours)
*Files touched: 1 MAJOR refactor, 4 new pages, 1 deleted*

### Task 4.1: Extract Calculator Logic to Hook
**Effort:** 60 min | **Files:** 1 new hook, 1 modified (page.tsx prep)

**Create `src/hooks/usePromoCalculator.ts`:**
```typescript
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  WindowItem, 
  DBPromo, 
  formatMoney, 
  toCents, 
  calculatePromo, 
  calculateUpgrade 
} from '@/lib/promo-logic';
import { detectQuoteChanges } from '@/lib/quote-diff';
import { cachedFetch, getCachedData, invalidateCache } from '@/lib/client-cache';
import { toast } from 'sonner';

export function usePromoCalculator(initialState?: any) {
  // ALL state from original page.tsx goes here
  // ... (copy all useState, useRef, useMemo, useEffect from page.tsx)
  
  // Return everything needed by components
  return {
    // State
    windows,
    setWindows,
    surchargeRate,
    setSurchargeRate,
    customerName,
    setCustomerName,
    quoteNumber,
    setQuoteNumber,
    availablePromos,
    activePromoId,
    lockedPromoId,
    setLockedPromoId,
    // ... all other state
    
    // Computed
    quoteResult,
    compareOptions,
    summaryWindowGroups,
    total,
    beforeTaxDiscount,
    afterDiscount,
    hst,
    firstPayment,
    secondPayment,
    
    // Actions
    handleAddWindow,
    handleRemoveWindow,
    handleWindowChange,
    handlePdfUpload,
    calculateQuote,
    handleSubmitForReview,
    // ... all handlers
  };
}
```

---

### Task 4.2: Create Calculator Page (Main Landing)
**Effort:** 60 min | **Files:** 1 new

**`src/app/calculator/page.tsx`:**
```tsx
'use client';

import { PromoCalculator } from '@/components/calculator/PromoCalculator';

export default function CalculatorPage() {
  return <PromoCalculator />;
}
```

**Create `src/components/calculator/PromoCalculator.tsx`** with the UI from original page.tsx (tab='promo' only)

---

### Task 4.3: Create Quotes Page
**Effort:** 20 min | **Files:** 1 new

**`src/app/quotes/page.tsx`:**
```tsx
'use client';

import { QuotesTab } from '@/components/QuotesTab';
import { AppLayout } from '@/components/AppLayout';
import { useSession } from 'next-auth/react';

export default function QuotesPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  
  const handleOpenQuote = (quoteId: string, isEdit?: boolean, originSubTab?: any) => {
    window.location.href = `/review/${quoteId}${isEdit ? '?edit=true' : ''}`;
  };

  return (
    <AppLayout currentPath="/quotes" showQuotesBin={false}>
      <QuotesTab 
        currentUser={currentUser} 
        onOpenQuote={handleOpenQuote} 
      />
    </AppLayout>
  );
}
```

---

### Task 4.4: Create Tax Page
**Effort:** 20 min | **Files:** 1 new

**`src/app/tax/page.tsx`:**
```tsx
'use client';

import { TaxCalculatorTab } from '@/components/TaxCalculatorTab';
import { AppLayout } from '@/components/AppLayout';
import { useSession } from 'next-auth/react';

export default function TaxPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;

  return (
    <AppLayout currentPath="/tax">
      <TaxCalculatorTab currentUser={currentUser} />
    </AppLayout>
  );
}
```

---

### Task 4.5: Create Review Page (Dynamic Route)
**Effort:** 60 min | **Files:** 1 new

**`src/app/review/[id]/page.tsx`:**
```tsx
'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { PromoCalculator } from '@/components/calculator/PromoCalculator';
import { AppLayout } from '@/components/AppLayout';
import { useEffect } from 'react';

export default function ReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteId = params.id as string;
  const isEdit = searchParams.get('edit') === 'true';

  // The PromoCalculator component will handle loading the quote via URL params
  // Just pass the quoteId and edit mode as initial props
  
  return (
    <AppLayout currentPath="/quotes">
      <PromoCalculator 
        initialReviewQuoteId={quoteId} 
        initialIsEditMode={isEdit} 
      />
    </AppLayout>
  );
}
```

---

### Task 4.6: Update Root Layout & Redirect
**Effort:** 10 min | **Files:** 2 modified

**`src/app/page.tsx`** (Replace with simple redirect):
```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/calculator');
}
```

**`src/app/layout.tsx`** (Add providers if needed):
```tsx
// Already good - keep as is, just ensure providers wrap everything
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

---

### Task 4.7: Delete Old Monolithic page.tsx
**Effort:** 5 min | **Files:** 1 deleted

```bash
# After verifying all routes work, delete the old file
rm src/app/page.tsx.backup  # if you backed it up
# The original page.tsx is now replaced by redirect above
```

---

## 📦 PHASE 5: API CACHING (ISR) (Day 3 - 1 hour)
*Files touched: 6 API routes (read-only endpoints)*

### Task 5.1: Add Caching to Read-Heavy Endpoints
**Effort:** 45 min | **Files:** 6 modified

**Pattern for each GET endpoint:**
```typescript
// BEFORE (in each route.ts):
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// AFTER - Add to GET functions:
export const dynamic = 'force-dynamic'; // Keep for auth
export const revalidate = 60; // Cache for 60 seconds

// OR use unstable_cache for more control:
import { unstable_cache } from 'next/cache';

const getCachedPromos = unstable_cache(
  async () => {
    await dbConnect();
    return Promo.find({ isActive: true }).sort({ order: 1 }).lean();
  },
  ['active-promos'],
  { revalidate: 60, tags: ['promos'] }
);

// In GET handler:
const promos = await getCachedPromos();
```

**Apply to these files:**
1. `src/app/api/promos/route.ts` - GET only
2. `src/app/api/settings/route.ts` - GET only
3. `src/app/api/regions/route.ts` - GET only
4. `src/app/api/departments/route.ts` - GET only
5. `src/app/api/users/route.ts` - GET only (with query params)
6. `src/app/api/profile/route.ts` - GET only

**Add cache invalidation on mutations:**
```typescript
// In POST/PUT/DELETE handlers after successful write:
import { revalidateTag } from 'next/cache';
revalidateTag('promos'); // or 'settings', 'regions', 'users'
```

---

## 📦 PHASE 6: DYNAMIC IMPORTS (Day 3 - 1 hour)
*Files touched: 4 page files, 1 component*

### Task 6.1: Dynamic Import Heavy Components
**Effort:** 30 min | **Files:** 4 modified

**`src/app/quote-studio/page.tsx`:**
```tsx
import dynamic from 'next/dynamic';

const QuotePdfStudioPage = dynamic(
  () => import('@/components/quote-studio/QuotePdfStudioClient').then(m => m.QuotePdfStudioClient),
  { 
    ssr: false,
    loading: () => <div className="flex h-96 items-center justify-center">Loading PDF Studio…</div>
  }
);

export default function QuoteStudioPage() {
  return <QuotePdfStudioPage />;
}
```

**Move client logic to `src/components/quote-studio/QuotePdfStudioClient.tsx`**

---

**`src/app/admin/page.tsx`** - Dynamic import AdminGeofenceMap:
```tsx
const AdminGeofenceMap = dynamic(
  () => import('@/components/AdminGeofenceMap'),
  { ssr: false }
);
```

---

**`src/components/MapComponent.tsx`** - Already client, wrap usage:
```tsx
const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false }
);
```

---

### Task 6.2: Dynamic Import PDF Parser (Client-side only)
**Effort:** 15 min | **Files:** 1 modified

**`src/lib/pdf-parser.ts`** - Already dynamic worker, but ensure:
```typescript
// In readPdfItems - workerSrc is already CDN, good
// Add dynamic import for pdfjs-dist in components that use it
```

---

### Task 6.3: Replace Framer Motion with CSS (Optional)
**Effort:** 30 min | **Files:** Multiple

**Only if bundle analysis shows framer-motion > 100KB:**
- Replace `motion.div` with CSS `@keyframes` + `animate-in` classes (Tailwind v4)
- Keep framer-motion only for complex gestures (drag, layout animations)

---

## 📦 PHASE 7: CLIENT CACHE UPGRADE (Day 4 - 2 hours)
*Files touched: 1 lib file, multiple component imports*

### Task 7.1: Install TanStack Query
**Effort:** 5 min
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

---

### Task 7.2: Create Query Provider
**Effort:** 15 min | **Files:** 1 new

**`src/components/QueryProvider.tsx`:**
```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // 1 minute
        gcTime: 5 * 60_000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Wrap in `src/app/providers.tsx`:**
```tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/components/QueryProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
```

**Update `src/app/layout.tsx`:**
```tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

### Task 7.3: Migrate Components to useQuery
**Effort:** 90 min | **Files:** 5-8 components

**Pattern for each component:**
```tsx
// BEFORE:
const [data, setData] = useState(null);
useEffect(() => { cachedFetch('/api/promos').then(setData) }, []);

// AFTER:
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['promos'],
    queryFn: () => fetch('/api/promos').then(r => r.json()),
  });
  
  if (isLoading) return <Skeleton />;
  // use data
}
```

**Migrate these components:**
1. `src/app/page.tsx` → PromoCalculator (promos, settings, profile)
2. `src/components/QuotesTab.tsx` (quotes list)
3. `src/components/NotificationBell.tsx` (notifications)
4. `src/components/UserProfileMenu.tsx` (user profile)
5. `src/app/quote-studio/page.tsx` (user profile)
6. `src/app/admin/page.tsx` (user profile)

---

## 📦 PHASE 8: BUNDLE ANALYSIS & FINAL TUNING (Day 4 - 1 hour)

### Task 8.1: Run Bundle Analysis
**Effort:** 10 min
```bash
ANALYZE=true npm run build
# Opens browser with bundle analyzer
```

**Check for:**
- [ ] `pdfjs-dist` only in quote-studio chunk
- [ ] `framer-motion` only where needed
- [ ] `mongoose` not in client bundles
- [ ] `lucide-react` tree-shaken (import specific icons)
- [ ] Main chunk < 200KB gzipped

---

### Task 8.2: Optimize Icon Imports
**Effort:** 15 min | **Files:** Multiple

**Replace all:**
```tsx
// BAD - imports all icons
import { Plus, Minus, ... } from 'lucide-react';

// GOOD - import only used
import { Plus } from 'lucide-react';
```

**Use script:**
```bash
# Find all lucide imports
grep -r "from 'lucide-react'" src/ --include="*.tsx" | head -20
```

---

### Task 8.3: Verify Performance Targets
**Effort:** 20 min

```bash
# Build production
npm run build

# Check output for:
# - First Load JS (main) < 200KB
# - First Load JS (calculator) < 250KB  
# - First Load JS (quote-studio) lazy loaded
```

**Lighthouse CI (optional):**
```bash
npm install -g @lhci/cli
lhci autorun
```

---

## 📦 PHASE 9: TESTING SETUP (Day 5 - 2 hours)

### Task 9.1: Install Test Dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

---

### Task 9.2: Configure Vitest
**`vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

**`vitest.setup.ts`:**
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));
```

---

### Task 9.3: Write Priority Unit Tests
**Effort:** 90 min | **Files:** 4 new test files

**`src/lib/promo-logic.test.ts`:**
```typescript
import { calculatePromo, calculateUpgrade, toCents, formatMoney } from './promo-logic';

describe('Promo Logic', () => {
  const baseItems = [
    { id: '1', qty: 1, base: 50000, argon: 0, solar: 0, triple: 0 },
    { id: '2', qty: 2, base: 30000, argon: 5000, solar: 0, triple: 0 },
  ];

  test('No promo returns base + surcharge', () => {
    const result = calculatePromo(null, baseItems, 8);
    expect(result.promoDiscount).toBe(0);
    expect(result.final).toBe(110000 + 8800); // base + surcharge
  });

  test('BOGO promo applies correctly', () => {
    const promo = { _id: 'bogo1', name: 'Buy 2 Get 1', type: 'BOGO', isActive: true, buyQty: 2, getQty: 1 };
    const result = calculatePromo(promo, baseItems, 8);
    expect(result.promoDiscount).toBeGreaterThan(0);
  });

  test('Percentage promo calculates correctly', () => {
    const promo = { _id: 'pct1', name: '10% Off', type: 'PERCENTAGE', isActive: true, discountPercentage: 10 };
    const result = calculatePromo(promo, baseItems, 8);
    expect(result.promoDiscount).toBe(11000); // 10% of 110000
  });

  test('toCents handles edge cases', () => {
    expect(toCents('100.50')).toBe(10050);
    expect(toCents('abc')).toBe(0);
    expect(toCents(-10)).toBe(0);
  });

  test('formatMoney formats CAD correctly', () => {
    expect(formatMoney(10050)).toBe('$100.50');
    expect(formatMoney(0)).toBe('$0.00');
  });
});
```

**`src/lib/quote-diff.test.ts`:**
```typescript
import { detectQuoteChanges } from './quote-diff';

describe('Quote Diff', () => {
  test('detects window changes', () => {
    const old = { windows: [{ id: '1', qty: 1, base: 10000 }] };
    const new_ = { windows: [{ id: '1', qty: 2, base: 10000 }] };
    const changes = detectQuoteChanges(old, new_);
    expect(changes.some(c => c.includes('quantity'))).toBe(true);
  });

  test('detects promo changes', () => {
    const old = { activePromoId: 'promo1' };
    const new_ = { activePromoId: 'promo2' };
    const changes = detectQuoteChanges(old, new_);
    expect(changes.some(c => c.includes('promo'))).toBe(true);
  });
});
```

---

### Task 9.4: Add Test Scripts
**`package.json`:**
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:e2e": "playwright test",
  "typecheck": "tsc --noEmit"
}
```

---

## 📦 PHASE 10: MONITORING & OBSERVABILITY (Day 5 - 30 min)

### Task 10.1: Add Sentry (Error Tracking)
**Effort:** 15 min

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Follow wizard, adds:**
- `sentry.client.config.ts`
- `sentry.server.config.ts` 
- `sentry.edge.config.ts`
- `next.config.ts` updates

---

### Task 10.2: Add Vercel Analytics
**Effort:** 5 min

```bash
npm install @vercel/analytics
```

**`src/app/layout.tsx`:**
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>...</html>
    <body>
      {children}
      <Analytics />
    </body>
  );
}
```

---

### Task 10.3: Custom Business Metrics
**Effort:** 10 min | **Files:** 1 new

**`src/lib/metrics.ts`:**
```typescript
// Simple event tracking for business metrics
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Send to analytics endpoint or console in dev
    console.log('[Metric]', event, properties);
    
    // Example: send to your own endpoint
    // fetch('/api/metrics', { method: 'POST', body: JSON.stringify({ event, properties }) });
  }
}

// Usage in components:
// trackEvent('quote_submitted', { quoteNumber, total, promoUsed: activePromoId });
// trackEvent('pdf_generated', { itemCount, mode });
// trackEvent('review_completed', { quoteId, action: 'approved' });
```

---

## ✅ VERIFICATION CHECKLIST

### After Each Phase, Verify:

**Phase 1-2 (Foundation):**
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] MongoDB indexes created in Atlas
- [ ] Error boundaries render on forced error

**Phase 3-4 (Routes):**
- [ ] `/calculator` loads promo calculator
- [ ] `/quotes` loads QuotesTab
- [ ] `/tax` loads TaxCalculatorTab
- [ ] `/review/:id` loads quote in review mode
- [ ] `/quote-studio` works (lazy loaded)
- [ ] `/admin` works
- [ ] Navigation between all routes works
- [ ] Browser back/forward works
- [ ] URL params sync with state

**Phase 5-6 (Performance):**
- [ ] API responses have `Cache-Control` headers
- [ ] Dynamic imports create separate chunks
- [ ] Bundle analyzer shows expected splits
- [ ] No `pdfjs-dist` in main chunk

**Phase 7 (Cache):**
- [ ] TanStack Query DevTools opens
- [ ] Cache hits visible in Network tab
- [ ] Mutations invalidate queries correctly

**Phase 8-9 (Quality):**
- [ ] `npm run test` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes

**Phase 10 (Monitoring):**
- [ ] Sentry captures test error
- [ ] Vercel Analytics shows page views
- [ ] Custom metrics log to console

---

## 🚀 DEPLOYMENT CHECKLIST (Pre-Production)

### Vercel Dashboard:
- [ ] All environment variables set
- [ ] `vercel.json` deployed
- [ ] Cron job for reminders active
- [ ] Function memory/duration configured
- [ ] Custom domain configured
- [ ] SSL certificate active

### MongoDB Atlas:
- [ ] IP Access List: `0.0.0.0/0` (Vercel) or VPC peering
- [ ] Compound indexes created
- [ ] Backup schedule enabled
- [ ] Alert on connection count > 80

### Code:
- [ ] No `console.log` in production code
- [ ] No `debugger` statements
- [ ] All `any` types resolved or justified
- [ ] Error boundaries tested
- [ ] 404 page exists (`app/not-found.tsx`)

### Performance:
- [ ] LCP < 1.5s on Vercel preview
- [ ] TTI < 2s on Vercel preview
- [ ] API p95 < 500ms
- [ ] Bundle sizes within targets

---

## 📋 COMMAND REFERENCE

```bash
# Development
npm run dev                 # Start dev server
npm run typecheck           # TypeScript check
npm run lint                # ESLint
npm run format              # Prettier

# Testing
npm run test                # Unit tests
npm run test:watch          # Watch mode
npm run test:ui             # Vitest UI
npm run test:e2e            # Playwright E2E

# Build & Analyze
npm run build               # Production build
ANALYZE=true npm run build  # Bundle analysis

# Database
npx tsx scripts/seed.ts     # Seed data (if created)
npx tsx scripts/indexes.ts  # Create indexes (alternative to Atlas)

# Deploy
vercel                      # Preview deploy
vercel --prod               # Production deploy
```

---

## 🎯 EFFORT SUMMARY

| Phase | Tasks | Est. Time | Files Touched |
|-------|-------|-----------|---------------|
| 1. Foundation | 4 | 35 min | 3 new, 1 mod |
| 2. Error Handling | 3 | 45 min | 3 new, 1 mod |
| 3. Route Structure | 2 | 30 min | 8 new (structure) |
| 4. Page Split | 7 | 4 hours | 1 major, 4 new, 1 del |
| 5. API Caching | 1 | 45 min | 6 mod |
| 6. Dynamic Imports | 3 | 1 hour | 5 mod |
| 7. TanStack Query | 3 | 2 hours | 3 new, 8 mod |
| 8. Bundle Analysis | 3 | 45 min | 0 (analysis) |
| 9. Testing | 4 | 2 hours | 5 new |
| 10. Monitoring | 3 | 30 min | 3 new |

**Total: ~12-14 hours over 3-5 days**

---

## 💡 PRO TIPS FOR MINIMUM EFFORT

1. **Use multi-cursor editing** in VS Code for repetitive changes (icon imports, cache patterns)
2. **Copy-paste pattern** for API caching - same 3 lines in 6 files
3. **Test each route immediately** after creating - catch issues early
4. **Commit after each phase** - easy rollback
5. **Run `npm run typecheck` frequently** - catches import errors early
6. **Use `git stash`** if you need to switch contexts mid-phase

---

## 🆘 ROLLBACK PLAN

If anything breaks:
```bash
# Quick rollback to working state
git stash                    # Save current changes
git checkout main            # Go to stable branch
npm run build                # Verify build works
vercel --prod                # Deploy known good version
```

---

*Follow this guide sequentially. Each phase builds on the previous. Do not skip phases.*