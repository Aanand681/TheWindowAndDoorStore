# AI Quick Reference Card

## 🚫 NEVER DO
- ❌ Files > 300 lines, functions > 50 lines
- ❌ `any` types (use proper interfaces)
- ❌ Object/array in `useEffect` deps (use primitives)
- ❌ Duplicate calculation logic (extract to `lib/`)
- ❌ Client-side initial data fetch (use Server Components + ISR)
- ❌ Hardcoded magic numbers (use constants)
- ❌ Secrets in code (env vars only)
- ❌ Inline event handlers in render (use `useCallback`)
- ❌ Missing cleanup in `useEffect`
- ❌ Direct DOM manipulation
- ❌ `console.log` / `debugger` in committed code

## ✅ ALWAYS DO
- ✅ Pure functions in `lib/` (no React, no side effects)
- ✅ Money in **cents** (integers) using `toCents()`
- ✅ Zod validation on ALL API inputs
- ✅ Server Components by default, `'use client'` only when needed
- ✅ Dynamic imports for heavy deps (`pdfjs-dist`, `pdf-lib`, `leaflet`, `map`)
- ✅ `useMemo`/`useCallback` for stable references
- ✅ Primitive dependencies in `useEffect` (max 5)
- ✅ `useRef` for values that shouldn't trigger re-renders
- ✅ Accessible markup (labels, ARIA, keyboard nav)
- ✅ Mobile-first responsive (sm:/md:/lg:/xl:)
- ✅ Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`
- ✅ Tests for new `lib/` functions (90% coverage target)

## 📁 WHERE THINGS GO

| Code Type | Location |
|-----------|----------|
| Business logic (pure) | `src/lib/*.ts` |
| React hooks | `src/hooks/*.ts` |
| UI components | `src/components/*/` |
| Pages (thin) | `src/app/*/page.tsx` |
| API routes | `src/app/api/*/route.ts` |
| Types | `src/types/` or inline with lib |
| Constants | `src/lib/constants.ts` |
| Env validation | `src/env.ts` |
| Tests | `__tests__/` next to source |

## 🔑 KEY PATTERNS

### Component Template
```typescript
'use client'; // Only if needed
import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props { value: string; onChange: (v: string) => void; disabled?: boolean; }

export function MyComponent({ value, onChange, disabled = false }: Props) {
  const handleClick = useCallback(() => onChange(value), [onChange, value]);
  return <Button onClick={handleClick} disabled={disabled}>{value}</Button>;
}
```

### Effect Template
```typescript
const timerRef = useRef<NodeJS.Timeout>();
const initialLoadDone = useRef(false);

useEffect(() => {
  if (!initialLoadDone.current) return;
  timerRef.current = setTimeout(() => { /* logic */ }, 700);
  return () => { if (timerRef.current) clearTimeout(timerRef.current); };
}, [dep1, dep2, dep3]); // Max 5 PRIMITIVE deps
```

### Calculation Template (lib/)
```typescript
// src/lib/quote-calculations.ts
export function calculateSubtotal(items: WindowItem[]): number {
  return items.reduce((sum, item) => sum + item.base * item.qty, 0);
}
// Pure, testable, no side effects
```

### API Route Template
```typescript
// src/app/api/quotes/route.ts
import { CreateQuoteSchema } from '@/lib/validators';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();
  
  const body = await req.json();
  const validated = CreateQuoteSchema.parse(body); // Throws if invalid
  
  // Process...
}
```

## 📏 SIZE LIMITS
| Item | Max |
|------|-----|
| File | 300 lines |
| Function | 50 lines |
| Function params | 7 (use config object) |
| useEffect deps | 5 (primitives only) |
| Component props | 10 (group related) |

## 🧪 TEST COMMANDS
```bash
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier
npm run test:unit    # Vitest
npm run test         # All tests
```

## 🚀 DEPLOY CHECKLIST
- [ ] `npm run typecheck` → 0 errors
- [ ] `npm run lint` → 0 warnings  
- [ ] `npm run test:unit` → all pass
- [ ] No `any` types added
- [ ] No console.log/debugger
- [ ] Dynamic imports for heavy components
- [ ] ISR caching on read-heavy APIs (`next: { revalidate: 60 }`)

## 🎯 CURRENT REFACTOR TARGETS
1. `src/components/calculator/PromoCalculator.tsx` (2097 lines) → **SPLIT**
2. `src/components/calculator/QuoteSummaryCard.tsx` (1105 lines) → **SPLIT**
3. `src/hooks/useCalculatorReviewActions.ts` (714 lines) → **SPLIT**
4. Duplicate auto-save/save-draft logic → **EXTRACT to lib/quote-calculations.ts**

---

**When in doubt: Read AI_DEVELOPMENT_RULES.md • Ask questions • Follow existing patterns • Leave code better**