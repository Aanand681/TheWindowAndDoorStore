# The Window & Door Store - Project Improvement Analysis

**Generated:** October 26, 2026  
**Project Type:** Next.js 16.3.6 + React 19 + MongoDB + NextAuth + Pusher + Vercel Deployment

---

## 🎯 Executive Summary

This is a **well-architected, feature-rich application** for a window/door company with:
- Promo calculator with complex pricing logic
- PDF extraction & generation studio
- Multi-role quote review workflow (Sales → Review → Odoo Entry)
- Real-time notifications via Pusher
- Admin dashboard for settings, staff, regions, promos, tax

**Key Strengths:** Clear separation of concerns, good TypeScript usage, sophisticated business logic, real-time features, role-based access control.

**Primary Concerns for Vercel Deployment:** Cold starts, bundle size, MongoDB connection management, client-side state bloat, missing optimizations.

---

## 🔴 CRITICAL - Must Fix Before Production

### 1. **MongoDB Connection Management (Vercel Cold Starts)**
**File:** `src/lib/mongodb.ts`
- Current: Global cache pattern works but may leak connections in serverless
- **Fix:** Use `mongoose.connection.readyState` check + proper connection pooling
- **Impact:** Prevents "too many connections" errors on Vercel

### 2. **No API Response Caching / ISR**
**Files:** All `src/app/api/*/route.ts`
- Current: `export const dynamic = 'force-dynamic'; export const revalidate = 0;`
- **Fix:** Add `next: { revalidate: 60 }` or use `unstable_cache` for read-heavy endpoints (promos, settings, regions)
- **Impact:** Reduces MongoDB load, improves response times, lowers Vercel function costs

### 3. **Massive Client Component (`page.tsx` = 1300+ lines)**
**File:** `src/app/page.tsx`
- Current: Single component handling calculator, review, quotes, tax, PDF import, modals
- **Fix:** Split into separate pages/routes:
  - `/` → Calculator only
  - `/quotes` → QuotesTab (already exists but embedded)
  - `/tax` → TaxCalculatorTab
  - `/review/[id]` → Review page
- **Impact:** Smaller bundles, faster initial load, better code splitting, easier maintenance

### 4. **Missing Environment Variable Validation**
**Files:** `.env.local` (not tracked), various lib files
- **Fix:** Add `src/env.ts` with Zod schema validation at build time
- **Impact:** Catches missing config at build, not runtime

### 5. **No Error Boundary / Global Error Handling**
- **Fix:** Add `app/error.tsx`, `app/global-error.tsx`, API error wrapper
- **Impact:** Prevents white screens, better debugging

---

## 🟠 HIGH PRIORITY - Performance & Scalability

### 6. **Bundle Size Optimization**
**Current Dependencies (Heavy):**
- `pdfjs-dist` (3.11MB+), `pdf-lib` (1.2MB), `framer-motion` (500KB), `leaflet` + `react-leaflet`, `xlsx`, `mongoose`
- **Fixes:**
  - Dynamic import `pdfjs-dist` only in Quote Studio page
  - Replace `framer-motion` with CSS animations where possible
  - Use `next/dynamic` for heavy components (Map, PDF Studio, Charts)
  - Consider `mongodb` driver instead of `mongoose` for lighter weight
  - Enable `next.config.ts` → `experimental: { optimizePackageImports: ['lucide-react', '@hugeicons/react'] }`

### 7. **Image Optimization**
**Files:** `public/images/logo.jpg`, PDF Studio generated images
- **Fix:** 
  - Add `next.config.ts` → `images: { formats: ['image/avif', 'image/webp'] }`
  - Use `next/image` for all static images
  - Convert logo to WebP/AVIF

### 8. **Client-Cache Improvements**
**File:** `src/lib/client-cache.ts`
- Current: In-memory Map, 2min TTL, no persistence
- **Fixes:**
  - Add `sessionStorage` persistence for auth/profile data
  - Add `stale-while-revalidate` pattern (return stale, fetch fresh)
  - Add cache invalidation on mutations (POST/PUT/DELETE)
  - Consider migrating to **TanStack Query (React Query)** for production-grade caching

### 9. **Database Indexes Missing**
**File:** `src/models/SavedQuote.ts`
- Current: Basic indexes on `quoteNumber`, `customerName`, `status`, `preparedBy`, `assignedTo`, `odooAssignedTo`, `odooStatus`, `isStarred`
- **Missing Compound Indexes:**
  ```javascript
  // For reviewer queries
  { status: 1, assignedTo: 1, createdAt: -1 }
  // For clerk Odoo queue
  { odooAssignedTo: 1, odooStatus: 1, createdAt: -1 }
  // For employee history
  { preparedBy: 1, status: 1, createdAt: -1 }
  // For search
  { quoteNumber: 'text', customerName: 'text', preparedBy: 'text' }
  ```

### 10. **API Route Consolidation / RESTful Design**
**Current:** Multiple similar routes
- `/api/quotes` (GET/POST)
- `/api/quotes/[id]` (GET/PUT/DELETE)
- `/api/quotes/reminders` (POST)
- `/api/quotes/flush` (GET/POST)
- **Fix:** Consider tRPC or single GraphQL endpoint for type-safe APIs, or at minimum consistent REST patterns

---

## 🟡 MEDIUM PRIORITY - Code Quality & Maintainability

### 11. **Extract Business Logic from Components**
**File:** `src/app/page.tsx` lines 1064-1105 (`calculateQuote`), 1106-1120 (pricing)
- **Fix:** Move all calculation logic to `src/lib/quote-calculations.ts` with pure functions
- **Benefit:** Testable, reusable, separates concerns

### 12. **TypeScript Strictness Gaps**
- Many `any` types in API routes, components
- **Fix:** Enable stricter TS config:
  ```json
  "strictNullChecks": true,
  "noImplicitAny": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true
  ```

### 13. **Component Duplication**
- Header/Navigation duplicated in `page.tsx`, `quote-studio/page.tsx`, `admin/page.tsx`
- **Fix:** Create `src/components/AppHeader.tsx` with shared navigation

### 14. **Hardcoded Values**
**Files:** Multiple
- Surcharge rate default (8%), HST (13%), upgrade thresholds
- **Fix:** Move to Settings collection + `src/lib/constants.ts`

### 15. **Missing Unit/Integration Tests**
- **Current:** 0 tests
- **Fix:** Add Vitest + React Testing Library
- **Priority tests:** `promo-logic.ts`, `quote-diff.ts`, `pdf-parser.ts`, API routes

### 16. **PDF Parser Fragility**
**File:** `src/lib/pdf-parser.ts`
- Relies on specific PDF text positions (x/y coordinates)
- **Fix:** Add fallback strategies, better error messages, logging for debugging failed imports

---

## 🟢 LOW PRIORITY - UX & Developer Experience

### 17. **Loading States & Skeletons**
- Many components show "Loading..." text
- **Fix:** Add skeleton loaders (shadcn/ui has patterns)

### 18. **Keyboard Shortcuts**
- Power users would benefit from: `Cmd+K` search, `Cmd+N` new quote, `Esc` close modals
- **Fix:** Add `use-hotkeys` or custom hook

### 19. **Accessibility (a11y)**
- Missing ARIA labels on custom dropdowns, modals
- Color contrast checks needed
- Focus management in modals

### 20. **Monitoring & Observability**
- **Add:** Vercel Analytics, Sentry (error tracking), Logtail/Papertrail (logs)
- **Custom:** Business metrics (quotes/day, conversion rate, avg quote value)

### 21. **Documentation**
- **Add:** API docs (OpenAPI/Swagger), component storybook, architecture decision records (ADRs)

---

## 🚀 VERCEL-SPECIFIC OPTIMIZATIONS

### 22. **Next.js Config Optimizations**
**File:** `next.config.ts`
```typescript
const nextConfig: NextConfig = {
  // Enable React Compiler (Next.js 16+)
  experimental: {
    reactCompiler: true,
    optimizePackageImports: ['lucide-react', '@hugeicons/react', 'sonner'],
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compression
  compress: true,
  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};
```

### 23. **Vercel Function Configuration**
**File:** `vercel.json` (create)
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "crons": [
    {
      "path": "/api/quotes/reminders",
      "schedule": "0 9 * * 1-5"
    }
  ]
}
```

### 24. **Edge Middleware for Auth**
**File:** `src/middleware.ts`
- Current: Uses `next-auth/middleware` (Node.js runtime)
- **Fix:** Move to Edge Runtime for faster auth checks:
  ```typescript
  export const runtime = 'edge';
  ```

### 25. **Static Generation Where Possible**
- Admin dashboard, settings pages, promo management → `export const dynamic = 'force-static'` + `revalidate`
- Quote Studio → Keep dynamic (user-generated content)

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: Pre-Production (Week 1-2)
| Task | Effort | Impact |
|------|--------|--------|
| Split `page.tsx` into route segments | High | Critical |
| Add env validation (Zod) | Low | Critical |
| Add error boundaries | Low | Critical |
| Database compound indexes | Low | High |
| API response caching (ISR) | Medium | High |
| Dynamic imports for heavy libs | Medium | High |

### Phase 2: Performance (Week 3-4)
| Task | Effort | Impact |
|------|--------|--------|
| Bundle analysis & optimization | Medium | High |
| TanStack Query migration | High | High |
| Image optimization | Low | Medium |
| Edge middleware for auth | Medium | Medium |
| Vercel config & monitoring | Low | Medium |

### Phase 3: Quality (Week 5-6)
| Task | Effort | Impact |
|------|--------|--------|
| Unit tests (core logic) | High | Medium |
| E2E tests (critical flows) | High | Medium |
| Accessibility audit | Medium | Low |
| Documentation | Medium | Low |

### Phase 4: Scale (Ongoing)
| Task | Effort | Impact |
|------|--------|--------|
| tRPC/GraphQL API layer | High | Low |
| Background jobs (Inngest/QStash) | Medium | Medium |
| Multi-region MongoDB | High | Low |
| Feature flags | Medium | Low |

---

## 🛠 QUICK WINS (Do This Week)

1. **Add `vercel.json`** with function config + cron for reminders
2. **Enable `reactCompiler: true`** in next.config.ts (Next.js 16+)
3. **Add `optimizePackageImports`** for lucide-react, hugeicons
4. **Convert logo.jpg → logo.webp** + use `next/image`
5. **Add compound MongoDB indexes** (run once in MongoDB shell)
6. **Create `src/env.ts`** with Zod validation
7. **Add `app/error.tsx`** and `app/global-error.tsx`
8. **Dynamic import PDF Studio** (`next/dynamic` with `ssr: false`)

---

## 📦 BUNDLE SIZE TARGETS

| Metric | Current (Est.) | Target |
|--------|----------------|--------|
| First Load JS (Main) | ~450 KB | < 200 KB |
| First Load JS (Quote Studio) | ~2.5 MB | < 500 KB (lazy) |
| Total JS (gzipped) | ~1.2 MB | < 500 KB |
| LCP (Calculator) | ~2.5s | < 1.5s |
| TTI (Calculator) | ~3.5s | < 2s |

---

## 🔐 SECURITY CHECKLIST

- [ ] Rate limiting on auth endpoints (partially done)
- [ ] CSRF protection (NextAuth handles)
- [ ] XSS prevention (React auto-escapes, but check `dangerouslySetInnerHTML`)
- [ ] SQL/NoSQL injection (Mongoose protects, but validate inputs)
- [ ] Secure headers (add via `next.config.ts` headers())
- [ ] Secrets rotation (Vercel env vars)
- [ ] Dependency scanning (`npm audit`, Snyk)
- [ ] Content Security Policy (CSP)

---

## 📊 MONITORING METRICS TO TRACK

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API p95 latency | < 500ms | > 2s |
| Error rate | < 0.1% | > 1% |
| Cold start % | < 10% | > 25% |
| MongoDB connections | < 50 | > 80 |
| Quote submission success | > 99% | < 95% |
| PDF generation time | < 5s | > 15s |

---

## 📝 NOTES FOR FUTURE MAINTENANCE

1. **Pusher:** Consider migrating to **Vercel Realtime** or **Supabase Realtime** to reduce external dependency
2. **MongoDB:** If data grows > 100k quotes, consider archiving old quotes to cold storage
3. **PDF Generation:** `pdf-lib` runs in browser - for heavy usage, move to serverless function
4. **NextAuth v5:** Migrate when stable (current v4 is maintenance mode)
5. **React 19:** Using `use` hook, `useOptimistic` - ensure compatibility with all libraries

---

*This document should be updated as improvements are made. Track progress in GitHub Issues or Linear.*