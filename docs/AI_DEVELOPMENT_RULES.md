# AI Development Rules for The Window & Door Store

**Version:** 1.0  
**Project:** Next.js 16 + React 19 + TypeScript + MongoDB + Vercel  
**Purpose:** Mandatory rules for any AI (or developer) working on this codebase.  
**Enforcement:** These rules are non-negotiable. Violations must be fixed before merge.

---

## 🏗️ 1. ARCHITECTURE & FILE ORGANIZATION

### 1.1 Single Responsibility Principle (SRP)
- **MAX 300 lines per file** (components, hooks, utilities)
- **MAX 50 lines per function**
- **MAX 7 parameters per function** (use config objects)
- One component = one UI concern
- One hook = one state/logic concern
- One lib file = one domain logic area

### 1.2 Directory Structure (MANDATORY)
```
src/
├── app/                    # Next.js App Router pages (thin, route-level only)
│   ├── calculator/         # Feature routes grouped by domain
│   ├── quotes/
│   ├── sealed-units/
│   ├── doors/
│   ├── admin/
│   └── api/               # API routes (thin controllers only)
├── components/
│   ├── ui/                # shadcn/ui primitives (Button, Input, Card, etc.)
│   ├── layout/            # AppHeader, AppLayout, Providers
│   ├── calculator/        # Calculator-specific components
│   ├── quotes/            # Quote-related components
│   ├── sealed-units/      # Sealed unit components
│   ├── doors/             # Door components
│   ├── admin/             # Admin components
│   └── shared/            # Cross-feature components (NotificationBell, UserProfileMenu)
├── hooks/                 # Custom React hooks (one per file, domain-specific)
│   ├── useCalculatorWindows.ts
│   ├── useCalculatorPricing.ts
│   ├── useCalculatorReviewActions.ts
│   └── useViewport.ts
├── lib/                   # Pure business logic (NO React, NO side effects)
│   ├── promo-logic.ts     # Promo calculations
│   ├── quote-calculations.ts  # Quote math (extracted from components)
│   ├── tax-calculations.ts    # Tax/HST logic
│   ├── sealed-units-logic.ts  # Sealed unit math
│   ├── doors/calculations.ts  # Door pricing
│   ├── pdf-parser.ts      # PDF extraction
│   ├── quote-diff.ts      # Quote comparison
│   ├── quote-drafts-storage.ts # LocalStorage draft management
│   ├── client-cache.ts    # In-memory cache
│   ├── mongodb.ts         # DB connection
│   ├── redis.ts           # Redis connection
│   ├── email.ts           # Email sending
│   ├── auth.ts            # Auth utilities
│   ├── api-error.ts       # API error classes
│   ├── promo-logic.ts     # Promo calculations
│   └── utils.ts           # Generic utilities (cn, formatMoney, etc.)
├── models/                # Mongoose models (one per file)
├── types/                 # Shared TypeScript interfaces (global.d.ts or types/index.ts)
└── env.ts                 # Zod-validated environment config
```

### 1.3 Import Rules
```typescript
// ✅ GOOD: Absolute imports from @/
import { cn } from '@/lib/utils';
import { calculatePromo } from '@/lib/promo-logic';
import { Button } from '@/components/ui/button';

// ❌ BAD: Relative imports crossing boundaries
import { something } from '../../../lib/utils';
import { something } from '../components/something';
```

### 1.4 Barrel Exports (index.ts)
- Every component directory MUST have `index.ts` exporting public API
- Internal components prefixed with `_` or in `_internal/` subdirectory

---

## 📝 2. TYPESCRIPT STANDARDS

### 2.1 Strict Mode (NON-NEGOTIABLE)
```json
// tsconfig.json - MUST have these enabled
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2.2 Type Definitions
```typescript
// ✅ GOOD: Explicit interfaces, no any
interface WindowItem {
  id: string;
  qty: number;
  base: number;
  argon: number;
  solar: number;
  triple: number;
  w?: string;
  h?: string;
  color: 'White' | 'Painted';
}

// ❌ BAD: any, implicit any, loose types
const process = (data: any) => { ... }
const handleChange = (e) => { ... }  // e is implicit any
```

### 2.3 Generic Constraints
```typescript
// ✅ GOOD: Proper generics with constraints
function calculateTotal<T extends { price: number; qty: number }>(items: T[]): number

// ❌ BAD: Unconstrained generics or any[]
function calculateTotal(items: any[]): number
```

### 2.4 Discriminated Unions over Optional Fields
```typescript
// ✅ GOOD: Discriminated union
type QuoteStatus = 
  | { status: 'DRAFT'; preparedBy: string }
  | { status: 'PENDING_REVIEW'; assignedTo: string; preparedBy: string }
  | { status: 'APPROVED'; approvedBy: string; approvedAt: Date };

// ❌ BAD: All optional fields
interface Quote {
  status?: string;
  assignedTo?: string;
  approvedBy?: string;
  approvedAt?: Date;
}
```

---

## ⚛️ 3. REACT & NEXT.js PATTERNS

### 3.1 Component Structure
```typescript
// ✅ MANDATORY component template
'use client';  // Only if actually needed (useState, useEffect, browser APIs)

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SomeIcon } from 'lucide-react';

interface ComponentProps {
  // Required props first
  value: string;
  onChange: (value: string) => void;
  // Optional props with defaults
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function ComponentName({ 
  value, 
  onChange, 
  disabled = false, 
  variant = 'primary' 
}: ComponentProps) {
  // 1. Hooks at top
  const [internalState, setInternalState] = useState('');
  
  // 2. Memoized computations
  const computedValue = useMemo(() => expensiveCalculation(value), [value]);
  
  // 3. Stable callbacks
  const handleClick = useCallback(() => {
    onChange(computedValue);
  }, [onChange, computedValue]);
  
  // 4. Early returns
  if (!value) return null;
  
  // 5. Render
  return (
    <div className={cn('base-styles', variant === 'primary' && 'primary-styles')}>
      <Button onClick={handleClick} disabled={disabled}>
        <SomeIcon className="w-4 h-4 mr-2" />
        {value}
      </Button>
    </div>
  );
}
```

### 3.2 State Management Rules
```typescript
// ✅ GOOD: Colocate state, minimize scope
function Parent() {
  const [windows, setWindows] = useState<WindowItem[]>([]);
  // Pass DOWN only what children need
  return <Child windows={windows} onAdd={handleAdd} />;
}

// ✅ GOOD: Extract complex state to custom hook
function useCalculatorState() {
  const [windows, setWindows] = useState<WindowItem[]>([...]);
  const [promos, setPromos] = useState<Promo[]>([]);
  // ... related state & logic
  return { windows, setWindows, promos, setPromos, calculateQuote };
}

// ❌ BAD: God component with 50+ useState
function PromoCalculator() {
  const [a, setA] = useState();
  const [b, setB] = useState();
  // ... 50 more
}
```

### 3.3 Effect Rules
```typescript
// ✅ GOOD: Minimal dependencies, stable references
useEffect(() => {
  if (!initialLoadDone.current) return;
  // logic
}, [specificPrimitiveDep1, specificPrimitiveDep2]); // Max 5 deps

// ✅ GOOD: Use refs for values that shouldn't trigger re-renders
const lastSavedSnapshotRef = useRef<string>('');
const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

// ❌ BAD: Object/array dependencies causing infinite loops
useEffect(() => {
  // ...
}, [taxTotals, quoteResult, attachedSealedUnit]); // Objects change every render!

// ❌ BAD: Missing cleanup
useEffect(() => {
  const timer = setInterval(fn, 1000);
  // Missing return () => clearInterval(timer);
}, []);
```

### 3.4 Server vs Client Components
```typescript
// ✅ DEFAULT: Server Component (no 'use client')
// app/calculator/page.tsx
import { PromoCalculator } from '@/components/calculator/PromoCalculator';

export default function CalculatorPage() {
  return <PromoCalculator />; // Client component imported here
}

// ✅ Client Component ONLY when needed
// components/calculator/PromoCalculator.tsx
'use client';
export function PromoCalculator() {
  const [state, setState] = useState();
  // useState, useEffect, onClick, etc.
}
```

### 3.5 Data Fetching
```typescript
// ✅ GOOD: Server Components for data fetching
// app/calculator/page.tsx (Server Component)
async function getPromos() {
  const res = await fetch(`${process.env.API_URL}/promos`, { 
    next: { revalidate: 60 } // ISR caching
  });
  return res.json();
}

export default async function CalculatorPage() {
  const promos = await getPromos();
  return <PromoCalculator initialPromos={promos} />;
}

// ❌ BAD: Client-side fetching for initial data
'use client';
useEffect(() => { fetch('/api/promos').then(...) }, []);
```

---

## 🧮 4. BUSINESS LOGIC RULES

### 4.1 Pure Functions Only in `lib/`
```typescript
// ✅ GOOD: Pure, testable, no side effects
// lib/quote-calculations.ts
export function calculateWindowSubtotal(windows: WindowItem[]): number {
  return windows.reduce((sum, w) => sum + w.base * w.qty, 0);
}

export function calculatePromoDiscount(
  promo: Promo, 
  windows: WindowItem[], 
  surchargeRate: number
): PromoResult {
  // Pure calculation
}

// ❌ BAD: Side effects in lib
export function calculateAndSave(windows: WindowItem[]) {
  const total = calculate(windows);
  await db.quotes.update(...); // SIDE EFFECT!
  return total;
}
```

### 4.2 Calculation Precision
```typescript
// ✅ MANDATORY: All money in cents (integers)
export const toCents = (val: number | string): number => {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
};

// ✅ GOOD: Calculate in cents, format for display
const subtotalCents = calculateSubtotal(items); // returns number (cents)
const display = formatMoney(subtotalCents); // "$1,234.56"

// ❌ BAD: Floating point math for money
const total = price * qty * (1 + taxRate); // Floating point errors!
```

### 4.3 Constants over Magic Numbers
```typescript
// ✅ GOOD: Named constants in lib/constants.ts
export const DEFAULT_SURCHARGE_RATE = 8;
export const DEFAULT_HST_RATE = 13;
export const FIRST_NATIONS_HST_RATE = 8;
export const MIN_QUOTE_AMOUNT = 0;

// ❌ BAD: Magic numbers scattered
if (rate === 8) { ... }
if (hst === 13) { ... }
```

---

## 🎨 5. UI & STYLING STANDARDS

### 5.1 Tailwind + shadcn/ui Only
```typescript
// ✅ GOOD: Use shadcn/ui primitives, compose with Tailwind
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl">
  <CardHeader className="p-3.5 pb-2.5 border-b border-border/50">
    <CardTitle className="text-base font-bold">Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4 pt-3.5 px-5 pb-5">
    <Button variant="default" size="sm" className="w-full h-11">
      Action
    </Button>
  </CardContent>
</Card>

// ❌ BAD: Custom CSS, inline styles, or non-shadcn components
<div style={{ background: 'white', padding: '20px' }}>
  <button className="my-custom-btn">Click</button>
</div>
```

### 5.2 Responsive Design
```typescript
// ✅ GOOD: Mobile-first, consistent breakpoints
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
  <div className="text-xs sm:text-sm lg:text-base">Content</div>
</div>

// Standard breakpoints: sm: (640px), md: (768px), lg: (1024px), xl: (1280px)
```

### 5.3 Accessibility (a11y)
```typescript
// ✅ MANDATORY: Proper labels, roles, keyboard navigation
<label htmlFor="quote-number" className="sr-only">Quote Number</label>
<input 
  id="quote-number" 
  type="text" 
  aria-describedby="quote-number-help"
  aria-invalid={hasError}
/>
<span id="quote-number-help" className="sr-only">Enter your quote number</span>

<button 
  aria-label="Close modal" 
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <X className="w-4 h-4" aria-hidden="true" />
</button>
```

---

## ⚡ 6. PERFORMANCE RULES

### 6.1 Code Splitting (MANDATORY)
```typescript
// ✅ GOOD: Dynamic imports for heavy components
import { dynamic } from 'next/dynamic';

const PDFStudio = dynamic(() => import('@/components/quotes/QuotePdfStudioClient'), {
  ssr: false,
  loading: () => <SkeletonLoader />,
});

const MapComponent = dynamic(() => import('@/components/admin/MapComponent'), {
  ssr: false,
});

// ❌ BAD: Importing heavy libs in main bundle
import * as pdfjs from 'pdfjs-dist'; // 3MB in main bundle!
```

### 6.2 Bundle Optimization
```typescript
// next.config.ts - MANDATORY
const nextConfig = {
  experimental: {
    reactCompiler: true, // Next.js 16+
    optimizePackageImports: [
      'lucide-react',
      '@hugeicons/react', 
      'sonner',
      'date-fns',
      'clsx'
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

### 6.3 Memoization
```typescript
// ✅ GOOD: Memoize expensive computations
const summaryGroups = useMemo(() => 
  groupWindows(windows), 
  [windows]
);

const handleClick = useCallback((id: string) => {
  doSomething(id);
}, [dependency]);

// ❌ BAD: Inline functions in render creating new references
<Child onClick={() => handleClick(item.id)} /> // New function every render!

// ✅ GOOD: Stable reference
<Child onClick={handleClick} /> // handleClick is useCallback'd
```

### 6.4 Virtualization for Lists
```typescript
// ✅ GOOD: Use react-window for large lists (>50 items)
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={items.length}
  itemSize={50}
  itemData={items}
>
  {Row}
</List>
```

---

## 🧪 7. TESTING STANDARDS

### 7.1 Test Structure
```
src/
├── lib/__tests__/
│   ├── promo-logic.test.ts
│   ├── quote-calculations.test.ts
│   ├── tax-calculations.test.ts
│   └── pdf-parser.test.ts
├── components/__tests__/
│   ├── calculator/
│   └── quotes/
└── hooks/__tests__/
    ├── useCalculatorPricing.test.ts
    └── useCalculatorWindows.test.ts
```

### 7.2 Test Requirements
```typescript
// ✅ MANDATORY: Test pure functions exhaustively
// lib/__tests__/promo-logic.test.ts
import { calculatePromo, calculateUpgrade, toCents } from '@/lib/promo-logic';

describe('promo-logic', () => {
  describe('toCents', () => {
    it('converts dollars to cents', () => {
      expect(toCents('10.50')).toBe(1050);
      expect(toCents(10.50)).toBe(1050);
    });
    it('handles edge cases', () => {
      expect(toCents('')).toBe(0);
      expect(toCents('invalid')).toBe(0);
      expect(toCents(-5)).toBe(0);
    });
  });

  describe('calculatePromo', () => {
    it('applies BOGO correctly', () => {
      const promo = { type: 'BOGO', buyQty: 2, getQty: 1, ... };
      const windows = [{ qty: 3, base: 10000, ... }];
      const result = calculatePromo(promo, windows, 8);
      expect(result.promoDiscount).toBe(5000); // 50% off cheapest
    });
  });
});
```

### 7.3 Coverage Targets
- **Business logic (`lib/`)**: 90%+ coverage
- **Hooks**: 80%+ coverage  
- **Components**: 70%+ coverage (focus on behavior)
- **API routes**: Integration tests for critical paths

---

## 🔒 8. SECURITY RULES

### 8.1 Input Validation
```typescript
// ✅ MANDATORY: Zod schemas for all API inputs
// lib/validators.ts
import { z } from 'zod';

export const CreateQuoteSchema = z.object({
  quoteNumber: z.string().min(1).max(20),
  customerName: z.string().min(1).max(100),
  windows: z.array(WindowItemSchema).min(1).max(100),
  surchargeRate: z.number().min(0).max(100),
  hstRate: z.enum([8, 13]),
});

// API route
export async function POST(req: Request) {
  const body = await req.json();
  const validated = CreateQuoteSchema.parse(body); // Throws on invalid
  // ... process
}
```

### 8.2 Authentication & Authorization
```typescript
// ✅ MANDATORY: Check permissions in API routes
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();
  
  const quote = await Quote.findById(params.id);
  if (!quote) return notFound();
  
  // Check ownership or admin
  const canEdit = quote.preparedBy === session.user.username 
    || session.user.role === 'ADMIN';
  if (!canEdit) return forbidden();
  
  // ... proceed
}
```

### 8.3 Secrets Management
```typescript
// ✅ GOOD: Environment variables only
// src/env.ts (validated at build)
import { z } from 'zod';

const EnvSchema = z.object({
  MONGODB_URI: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  PUSHER_SECRET_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().startsWith('re_'),
});

// ❌ BAD: Hardcoded secrets
const apiKey = 'sk_live_abc123'; // NEVER!
```

---

## 📦 9. GIT & DEPLOYMENT RULES

### 9.1 Commit Messages (Conventional Commits)
```bash
# ✅ GOOD
feat(calculator): add supply-only mode toggle
fix(promo): correct BOGO calculation for partial groups
refactor(lib): extract quote calculations to pure functions
test(promo-logic): add BOGO edge case tests
chore(deps): update next.js to 16.3.6
docs: update AI_DEVELOPMENT_RULES.md

# ❌ BAD
fixed stuff
update
WIP
changes
```

### 9.2 Branch Strategy
```
main (protected)
├── develop (integration)
│   ├── feature/calculator-supply-only
│   ├── feature/pdf-studio-branding
│   └── fix/auto-save-loop
├── release/v1.2.0
└── hotfix/production-bug
```

### 9.3 Pre-commit Checks (Husky)
```json
// .husky/pre-commit
#!/bin/bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test:unit   # Vitest unit tests
npm run format      # Prettier
```

### 9.4 Vercel Deployment
```json
// vercel.json - MANDATORY
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "crons": [
    { "path": "/api/quotes/reminders", "schedule": "0 9 * * 1-5" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

---

## 📚 10. DOCUMENTATION STANDARDS

### 10.1 Code Comments
```typescript
// ✅ GOOD: JSDoc for public APIs, complex logic
/**
 * Calculates BOGO (Buy X Get Y) discount for window items.
 * Sorts items by price ascending, applies discount to cheapest Y items per group.
 * 
 * @param prices - Array of unit prices in cents (already expanded by qty)
 * @param buyQty - Number of items to buy
 * @param getQty - Number of items to get free (50% off)
 * @returns Discount amount in cents
 */
export function calcBOGO(prices: number[], buyQty: number, getQty: number): number {
  // Implementation
}

// ✅ GOOD: Inline comments for non-obvious business logic
// 8% Provincial Point-of-Sale Exemption (First Nations):
// 5% GST on materials (8% provincial exempt), 13% HST on labour and services
const materialTax = Math.round(materialsCents * 0.05);
const serviceTax = Math.round(servicesCents * 0.13);
```

### 10.2 README per Feature
```markdown
# Calculator Feature

## Overview
Interactive pricing calculator with promo comparison, tax calculation, and quote management.

## Key Components
- `PromoCalculator` - Main orchestrator
- `useCalculatorWindows` - Window state management
- `useCalculatorPricing` - Pricing logic
- `QuoteSummaryCard` - Financial ledger display

## Business Rules
- Surcharge: 8% on window base price
- HST: 13% standard, 8% First Nations (5% GST materials + 13% HST labour)
- Promos: BOGO, Free Parts, Percentage, Combo
- Upgrade: 5-year labour based on tiered percentages

## Testing
Run `npm test -- --filter=calculator`
```

---

## 🚫 11. ANTI-PATTERNS (NEVER DO THESE)

| Anti-Pattern | Why | Alternative |
|-------------|-----|-------------|
| God components (>300 lines) | Unmaintainable, untestable | Split into smaller components |
| Duplicate calculation logic | Bugs when one copy updated | Extract to `lib/` pure functions |
| `any` types | Defeats TypeScript | Proper interfaces, generics |
| Object/array in useEffect deps | Infinite loops, performance | Primitive deps, useRef, useMemo |
| Client-side initial data fetch | Slow, SEO issues, hydration mismatch | Server Component + ISR |
| Hardcoded magic numbers | Unmaintainable, error-prone | Named constants in `lib/constants.ts` |
| Missing error boundaries | White screens on errors | `error.tsx` per route segment |
| No input validation | Security vulnerabilities | Zod schemas on all API inputs |
| Secrets in code | Security breach | Environment variables only |
| Inline event handlers in render | New function every render | `useCallback` stable references |
| Missing cleanup in useEffect | Memory leaks, stale timers | Return cleanup function |
| Direct DOM manipulation | Breaks React, SSR issues | Refs only for focus/measurements |

---

## ✅ 12. DEFINITION OF DONE

A task is **NOT DONE** until:

- [ ] Code follows all rules in this document
- [ ] TypeScript compiles with zero errors (`npm run typecheck`)
- [ ] ESLint passes with zero warnings (`npm run lint`)
- [ ] Prettier formats code (`npm run format`)
- [ ] Unit tests pass (`npm run test:unit`)
- [ ] New business logic has ≥90% test coverage
- [ ] No `any` types introduced (unless explicit `// @ts-expect-error` with comment)
- [ ] No console.log/debugger left in code
- [ ] Component ≤300 lines, function ≤50 lines
- [ ] No duplicate logic (DRY)
- [ ] Accessible (keyboard nav, ARIA labels, color contrast)
- [ ] Responsive (mobile-first, tested at breakpoints)
- [ ] Performance: no unnecessary re-renders, dynamic imports for heavy deps
- [ ] Documentation updated (JSDoc, README if new feature)
- [ ] Conventional commit message
- [ ] Pre-commit hooks pass

---

## 🔄 13. REFACTORING PRIORITIES (Current Tech Debt)

### Immediate (Do First)
1. **Extract `lib/quote-calculations.ts`** - Remove duplicate logic from PromoCalculator + QuoteSummaryCard
2. **Split `PromoCalculator.tsx`** (2097 lines) → 8-10 components + 3 hooks
3. **Split `QuoteSummaryCard.tsx`** (1105 lines) → 6-7 components
4. **Split `useCalculatorReviewActions.ts`** (714 lines) → 3-4 focused hooks
5. **Add `src/env.ts`** with Zod validation
6. **Add `app/error.tsx`** and `app/global-error.tsx`

### Short-term (Next Sprint)
7. **Add ISR caching** to read-heavy API routes (promos, settings, regions)
8. **Dynamic imports** for PDF Studio, Map, Charts
9. **Compound MongoDB indexes** for query performance
10. **Unit tests** for `promo-logic.ts`, `quote-diff.ts`, `pdf-parser.ts`

### Ongoing
11. **Migrate client-cache → TanStack Query**
12. **Add E2E tests** for critical flows (quote create → review → approve)
13. **Accessibility audit** and fixes
14. **Bundle analysis** and optimization

---

## 📋 14. AI-SPECIFIC INSTRUCTIONS

When working on this codebase, you MUST:

1. **Read this file first** - Understand all rules before writing code
2. **Check existing patterns** - Follow the established conventions in the codebase
3. **Ask before assuming** - If requirements are ambiguous, ask clarifying questions
4. **Prefer editing over creating** - Extend existing components/hooks/libs before making new ones
5. **Extract don't duplicate** - If you see similar logic, extract to shared location
6. **Think in primitives** - Use `number`, `string`, `boolean` in useEffect deps, not objects
7. **Default to server components** - Only add `'use client'` when actually needed
8. **Validate at boundaries** - Zod schemas on all API inputs, TypeScript everywhere else
9. **Test pure logic** - Write tests for every new function in `lib/`
10. **Leave code better** - Fix nearby issues while you're there (boy scout rule)

---

## 🎯 QUICK REFERENCE: FILE NAMING CONVENTIONS

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase.tsx | `QuoteSummaryCard.tsx` |
| Hook | camelCase.ts + `use` prefix | `useCalculatorWindows.ts` |
| Lib/Util | kebab-case.ts | `quote-calculations.ts` |
| Type/Interface | PascalCase | `WindowItem`, `PromoResult` |
| Constant | UPPER_SNAKE_CASE | `DEFAULT_SURCHARGE_RATE` |
| Test | `.test.ts` or `.spec.ts` | `promo-logic.test.ts` |
| API Route | `route.ts` in folder | `app/api/quotes/route.ts` |
| Page | `page.tsx` in folder | `app/calculator/page.tsx` |
| Layout | `layout.tsx` | `app/layout.tsx` |
| Error | `error.tsx` | `app/calculator/error.tsx` |

---

**This document is the source of truth for code quality. Update it as patterns evolve.**
**All contributors (human and AI) are bound by these rules.**