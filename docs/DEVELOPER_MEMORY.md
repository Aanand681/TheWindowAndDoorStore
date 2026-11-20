# The Window & Door Store — Developer Knowledge Base & System Memory

**Version:** 2.0  
**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + MongoDB + Tailwind CSS v4 + Vitest  
**Maintainer:** AI Developer Brain  

---

## 🧭 1. Architectural Map & Domain Topology

| Domain | Page Route | Primary Orchestrator Hook | Left Column (Workspace) | Right Column (Summary) | Calculation Engine |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Windows** | `/calculator` | `usePromoCalculator` | `WindowConfigPanel` (Windows + Supply J&C) | `CalculatorSummaryPanel` | `src/lib/calculator/pricing-engine.ts` (Cents) |
| **Doors** | `/doors` | `useDoorCalculatorPage` | `DoorItemBuilder` + Table + Travel/Labour | `DoorQuoteSummaryCard` + Office Pricing | `src/lib/doors/totals-calculator.ts` (Dollars) |
| **Sealed Units** | `/sealed-units` | Page State + `useSealedUnitsDrafts` | `SealedUnitItemBuilder` + Table + Travel/Labour | `SealedUnitQuoteSummaryCard` + Office Pricing | `src/lib/sealed-units/calculations.ts` (Dollars) |
| **Review** | `/review/[id]` | `useReviewQuoteLoader` | Rendered based on `quoteType` | `ReviewWorkflowBar` + Revision Diff | `src/lib/format-quote-diff.ts` |
| **Quotes Queue**| `/quotes` | `QuotesTab` | Filter toolbar + Sub-tabs (All, Mine, Pending, etc.) | Interactive quote cards & actions | `src/components/quotes/tab/quote-pricing-helper.ts` |

---

## ⚡ 2. Non-Negotiable Development Rules & Patterns

1. **File Size Limit:** Maximum **300 lines per file** (components, hooks, utilities). Maximum **50 lines per function**.
2. **Strict Currency Accounting:**
   - Windows calculations use integer **Cents** (`Math.round(x * 100)`).
   - Doors & Sealed Units calculate in **Dollars** (`float`).
   - Boundary Rule: Whenever sending totals to `SavedQuote` or Review summaries, **always convert to cents** to prevent 1/100th display bugs.
3. **Tax & 8% Exemption Formula:**
   - Standard HST: $13\%$ on all.
   - 8% First Nation Material Exemption: `Tax = (13% on total pre-tax) - (8% on materials base)`.
   - **Crucial:** Factory surcharges ($8\%$) and travel/delivery are strictly categorized under services/handling, NOT materials.
4. **Session Storage Isolation:**
   - Always call `clearAllQuoteSessionState()` on PDF re-upload, quote reset, and quote switching to avoid cross-quote option contamination.
5. **Anti-Negative Input Hygiene:**
   - Numerical user inputs must use `blockNegativeKey` and `sanitizeNonNegativeNumber`. Calculations must be bounded with `Math.max(0, ...)`.
6. **Auto-Save & Fingerprinting:**
   - Auto-save payloads must include an `optionsHash` listening to `ATTACHED_INSTALL_CHANGE_EVENT` and `CUSTOM_OPTIONS_CHANGE_EVENT` so custom options are never lost on page refresh.

---

## 📜 3. Consolidated Historical Session Knowledge (Migrated from AI_MEMORY.md)

### Key Milestones & Fixes Preserved:
- **Unified Options Section on PDF Invoices:** Replaced 4 separate boxes with single `OPTIONS` block formatted as `[ ] {Title} {add/deduct}: {+$ / -$}`.
- **Bidirectional Supply vs. Install Direction:**
  - In Supply mode: badge & PDF show `"Option for Installation"` with `add: +$Delta`.
  - In Install mode: badge & PDF show `"Option for Supply Only"` with `deduct: -$Delta`.
- **Live Reactive Deltas:** Dynamically recalculates deltas when jambs, casing, labour, or line items change without needing to detach/re-attach.
- **Database-Backed Persistent Drafts (`/api/drafts`):** Migrated from brittle localStorage to multi-device MongoDB collection indexed by `userEmail, type, quoteNumber`.
- **Dryden & Remote Fee Sync ($727.50):** Automatically syncs `far_std` fee upon selecting Dryden / Sioux Lookout region.
- **Factory Surcharge Separation:** Excluded $8\%$ factory surcharge from materials base across Windows, Doors, and Sealed Units for tax compliance.
- **Dollar/Cent Normalization in Review:** Fixed 1/100th price display bug in review tab by converting Door & Sealed Unit totals to cents.

---

## 🔍 4. Current Work State & Feature Parity Roadmap

### A. Current Working Tree
- **Branch:** `main`
- **TypeScript:** Pass (`npx tsc --noEmit` $\rightarrow$ 0 errors)
- **Unit Tests:** Pass (`vitest run` $\rightarrow$ 172/172 tests passing across all 16 suites)
- **Active Accomplishments:**
  - Split `SupplyVsInstallCompareModal` into modular `src/components/shared/compare/`.
  - Added `UnsavedQuoteConflictModal.tsx` for draft collision defense.
  - Split door draft operations into `door-draft-applier.ts` and `door-draft-saver.ts`.
  - Implemented Polymorphic Quote Review Router in `src/app/review/[id]/page.tsx` for Windows, Doors, and Sealed Units.
  - Built modular review loaders, payload generators, and action handlers for Doors (`src/hooks/doors/door-review-*`) and Sealed Units (`src/hooks/sealed-units/sealed-units-review-*`).
  - Extracted standalone `<DoorCalculator>` and `<SealedUnitsCalculator>` with sticky `<ReviewWorkflowBar>`, revision notes, status banners, and workflow action modals.
  - Protected Doors and Sealed Units during View Quote (employee) & Review Quote (admin): `isReadOnly` disables inputs, presets, customer info, tables, and travel controls until "Edit Quote" is clicked.
  - Added robust fallback in `computeQuotePricing` for Doors & Sealed Units so quotes with legacy missing/zero `taxTotals.grandTotal` recover their real pricing from snapshots or line items.
  - Permanently healed Quote #1 (Debbie Miller) in MongoDB ($1,478.90).
  - Connected Dual Option Supply vs Install comparisons with reactive deltas in `SealedUnitQuoteSummaryCard.tsx`.
  - Fixed flaky timing issue in `pricing-history.test.ts` with monotonic counter IDs.
  - **Fixed "Save Changes" Odoo Clerk & Approve Trigger:** Removed premature `{ status: "MODIFIED" }` in `door-review-actions.ts` and `sealed-units-review-actions.ts`. Isolated `isEditMode` in `ReviewWorkflowActionButtons.tsx` and `SummaryPendingReviewButtons.tsx` so "Approve Quote" cannot be clicked while editing.
  - **Implemented Quote Recall / Withdraw Submission:** Added "Recall & Edit" on Quote Cards, "Recall Quote to Edit" in review bar for preparers, and safety intervention in `QuoteDeleteModal` to prevent destructive deletion of submitted quotes.
  - **Implemented "Needs Revision" Sub-Tab & Stats Ribbon:** Restored `<QuotesStatsRibbon>` in `QuotesTab.tsx`, added `"returned"` sub-tab and `employeeReturnedCount` in toolbar, ribbon, and backend badge counter (`quotes-badge-counter.ts`).
  - **Enforced Preparer Review-Mode Edit Lockout:** Preparers cannot edit a quote while in `PENDING_REVIEW` (neither via button nor via URL `?edit=true`). To edit, they must click **"Recall & Edit"** first.
  - **Sorted Quotes Queue by `updatedAt` Descending:** Updated `filterAndSortQuotes` so resubmitted and newly modified quotes immediately float to the top of the queue.
  - **Same Employee In-Place Update & Multi-User Isolation:** If the same employee prepares the same quote number again, it updates the existing record in-place across `DRAFT`, `PENDING_REVIEW`, and `RETURNED` with refreshed `updatedAt`. If prepared by a different employee, both quotes are preserved independently.
  - **Quote Card Product Domain Badges & Dynamic Item Count:** Quote cards display dedicated domain badges: Window = Green (`emerald`), Door = Orange (`amber`), Sealed Unit = Blue (`blue`/`sky`). Replaced hardcoded "X Windows" with exact sum of line item quantities: `${n} Door(s)`, `${n} Sealed Unit(s)`, `${n} Window(s)`, plus attached quote tags.
  - **Unified Stack-Based Routing (Browser History Parity):**
    - Sub-tab switching on `/quotes` pushes history state (`window.history.pushState({ sub: newTab }, "", "/quotes?sub=" + newTab)`).
    - `popstate` and `pageshow` listeners in `useQuotesTabState` synchronize the active tab and refresh quotes when the user presses Chrome Back/Forward or uses swipe gestures.
    - Opening a quote pushes `/review/[id]?sub=${originSubTab}&edit=true`.
    - Exiting review pops the history stack (`window.history.back()`) if prior history exists, or safely falls back to `/quotes?sub=${originSubTab || "review"}` for direct links.
    - Preserved `originSubTab` across `ReviewPage`, `DoorCalculator`, `SealedUnitsCalculator`, `PromoCalculator`, and their review loaders (`door-review-loader.ts`, `sealed-units-review-loader.ts`, `useReviewQuoteLoader.ts`).

### B. Implementation Roadmap for Next Steps:
1. **Stage 1 (Completed): Dynamic Review Routing (`/review/[id]`):** Polymorphic router inspects quote type and renders the native domain calculator.
2. **Stage 2 (Completed): Dual Option Parity & Read-Only Protection:** Connected `onToggleAttachOption`, dynamic deltas, and view/review read-only locks across all calculators.
3. **Stage 3 (Completed): Quote Recall & Needs Revision Queue:** Preparers can retract/revise `PENDING_REVIEW` quotes without hard deletion; dedicated "Needs Revision" tab and notification badges for returned quotes.
4. **Stage 4 (Next Up): Custom Additional Materials (`+ Add Material`) in Doors & Sealed Units:** Mirror Window `SupplyJambCasingCard` / `ExtrasAndJambsCard` to support custom line items in `DoorLabourTravelCard` and `SealedUnitLabourTravelCard`.
5. **Stage 5 (Next Up): Auto-Save Options Hash:** Ensure `useDoorAutoSave` and `useSealedUnitsAutoSave` hash custom options to prevent reload drop.

---

## 🎯 5. Architectural Initiative: Multi-Domain Quote Review & Handoff (COMPLETED)

### What Was Built:
1. **Polymorphic `/review/[id]` Router**:
   - Inspects quote metadata: `quoteType` (`"window" | "door" | "sealed_unit"`).
   - Dynamically mounts the native calculator workspace:
     - `door` $\rightarrow$ `<DoorCalculator initialReviewQuoteId={quoteId} initialIsEditMode={isEdit} />`
     - `sealed_unit` $\rightarrow$ `<SealedUnitsCalculator initialReviewQuoteId={quoteId} initialIsEditMode={isEdit} />`
     - `window` $\rightarrow$ `<PromoCalculator initialReviewQuoteId={quoteId} initialIsEditMode={isEdit} />`
2. **Review Workflow Bar Portability**:
   - Mounted `<ReviewWorkflowBar>` uniformly across `/doors` and `/sealed-units`.
   - Connected action handlers: "Edit Quote", "Cancel Edits", "Save Price Updates", "Approve Quote", "Return for Revision", "Reassign Reviewer", and "Complete in Odoo".
3. **Smart In-Tab Routing in `/calculator` & `/quotes` & Notifications**:
   - Quotes tab directs Window quotes to Tab 1 (`promo`) in-place, and Door/Sealed Unit quotes to `/review/[id]?type=door` or `/review/[id]?type=sealed_unit`.
   - Notifications route directly to `/review/[id]` so employee submissions and admin reviews open in their native calculators.
4. **Automated Verification**:
   - `src/lib/__tests__/polymorphic-quote-review.test.ts` validates mapping from `SavedQuote` to `DoorLineItem`, Door update payloads, and Sealed Unit update payloads.

---

## 🎯 6. Architectural Initiative: Universal Cents Standardization, Multi-Quote Rollup & Option B Materials (COMPLETED)

### What Was Built:
1. **Universal Integer Cents Standardization**:
   - Standardized all quote review submissions (`useDoorReviewSubmit`, `door-review-payload`, `useSealedUnitsReviewSubmit`, `sealed-units-review-payload`, `useCalculatorWorkflows`) to submit `quoteSummaryTotal` strictly in integer cents (`Math.round(total * 100)`).
   - Added server-side normalizers in `quote-create-service.ts` and `quote-update-payload.ts` ensuring all incoming quote totals are persisted as integer cents.
   - Refactored `quote-diff.ts` and `format-quote-diff.ts` using `normalizeDiffTotalCents` to recognize and normalize legacy raw-dollar snapshots, eliminating the false `$24.49 to $2,449.00` ghost diffs upon recall.
2. **Comparison Card Option B Additional Materials**:
   - Added "Option B Additional Materials" controls in `ComparisonOptionBOverrides.tsx` supporting:
     - "Same as Option A" (default inheritance from Option A's materials).
     - "None" (removes materials for Option B).
     - "Custom for Option B" (allows adding/editing custom materials specifically for Option B).
   - Updated `quote-comparison-calc.ts` to include materials in Option B's pre-tax subtotal and 8% First Nations material exemption calculation.
   - Added "Additional Materials" rows to `ComparisonOptionBCard.tsx`, `ComparisonOptionACard.tsx`, and `OptionCompareColumn.tsx` in `SupplyVsInstallCompareModal.tsx`.
3. **Attached Multi-Quote Financial Rollup**:
   - In `useAttachQuoteDrafts.ts`, ensured door and sealed unit draft/quote attachments reliably resolve financial metrics across both `totals` and `taxTotals`.
   - Combined common financial items across host and attached quotes:
     - Combined Labour: `Window Labour + Attached Door Labour + Attached SU Labour`
     - Combined Misc: `Window Misc + Attached Door Misc + Attached SU Misc`
     - Combined Surcharge: `Window Surcharge (8%) + Attached Door Surcharge (8%) + Attached SU Surcharge (8%)`
   - Preserved distinct individual discount lines in `CombinedLedgerSection.tsx` and `DoorSummaryLedger.tsx`:
     - Line 1: Window Promo Discount (e.g. `Promo discount (window only): -$300.00`)
     - Line 2: Attached Door Discount (e.g. `Door Discount: -$150.00`)

---

## 🎯 7. Architectural Initiative: Sealed Units Interactive Add-ons Labour, Remote Fee Defaults & Navigation Optimizations (COMPLETED)

### What Was Built:
1. **Interactive Add-ons / Extra Labour on Sealed Units**:
   - Built `SealedUnitAddOnsSection.tsx` with dynamic rows: customizable description label, dollar price input, trash delete icon, and `+ Add Labour` button.
   - Cleaned up screen space by removing the bulky `Installation Labour & Travel` banner card from `SealedUnitLabourTravelCard.tsx`.
   - Extracted `SealedUnitMileageSection.tsx` (142 lines) to keep `SealedUnitTravelCalculator.tsx` strictly within the $\le 300$ line limit (269 lines).
   - Summary card displays a clean `"Labour"` row (with add-on labour incorporated), while standalone and combined PDFs itemize each individual labour add-on label and dollar amount.
2. **Sioux Lookout & Dryden Default Small Job Fee**:
   - Selecting Dryden or Sioux Lookout in the Sealed Unit calculator defaults `travelFeeType` to `"far_small"` ($363.50 Small Job Fee) instead of `"far_std"` ($727.50 Standard Job Fee). Users can toggle back to standard fee if needed.
3. **Full Database & Review Pipeline Persistence**:
   - Extended MongoDB `SavedQuote` handling in `quote-create-service.ts` and `quote-update-payload.ts` to destructure and persist `extraLabour` and `globalUpcharges`.
   - Updated `useSealedUnitsDrafts.ts`, `useSealedUnitsReviewSubmit.ts`, `sealed-units-review-loader.ts`, and `sealed-units-review-payload.ts` to seamlessly persist and restore add-ons across drafts, review mode, and Odoo handoffs.
4. **Standalone & Combined Quote PDF Parity**:
   - Itemized add-on labour in `SealedUnitSummaryLedger.tsx` and `SealedUnitInvoiceUpchargesTable.tsx` across both `window_style` and `standard` templates.
   - In combined quotes, added *Sealed Unit Jobsite Labour & Add-ons* in `SealedUnitsScheduleTable.tsx` and rolled up totals via `useCombinedQuoteData.ts` and `invoice-pricing-rollup.ts`.
5. **Review Submission Pipeline Safety**:
   - Verified end-to-end review lifecycle for Sealed Units: preparer submission, reviewer queue, polymorphic router `/review/[id]`, reviewer actions (Approve $\rightarrow$ Odoo clerk, Return $\rightarrow$ Preparer revision, Reassign), and preparer recall. Zero blockers or data loss.
6. **PDF Invoice Scope Sequence & Pure Base Labour Isolation**:
   - Fixed calculation presentation bug in `invoice-labour.ts` where add-on labour ($30) was inadvertently inflating base window installation labour ($602 $\rightarrow$ $632). Now strictly isolates pure base unit labour (`taxTotals.wLab` = $602) from add-on labour (`taxTotals.aLab` = $30).
   - Standardized invoice left-column scope sequence in `InvoiceBreakdownTables.tsx`: (1) Installation Labour, (2) Extras & Add-ons, (3) Jamb & Casing Specifications, (4) Travel & Set-up Details, (5) Special Instructions & Notes, (6) Unified Options.
7. **Cross-Route Draft Loading Harmonization**:
   - Investigated and harmonized draft navigation between `/sealed-units` and `/doors?loadDraftId=...` to ensure instant page transitions by eliminating conflicting mount loops between auto-save restoration and draft ID loading.



