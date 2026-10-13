# Window Promo Quote Calculator - Logic Analysis

This document outlines the core business logic, promo tier calculations, and tax computation derived from the original `index.html` application. The logic will serve as the foundation for the React implementation.

## 1. Promo Types and Discount Formulas

The application supports five promo tiers. Each promo computes a total `promoDiscount` based on the items in the quote.

### A. No Promo (`none`)
*   **Discount**: $0.00.
*   **Notes**: The base price and surcharge carry into the tax calculation with no deductions.

### B. Buy 2, Get 2 (`b2g2`)
*   **Logic**: 
    1. Break down all line items by quantity into individual unit base prices.
    2. Sort the list of unit base prices in ascending order.
    3. Process the sorted array in chunks of 4.
    4. For each chunk of 4, the **two cheapest** items receive a 50% discount.
    5. If there are exactly 3 items left over at the end, the **single cheapest** item among those 3 receives a 50% discount.
*   **Discount**: Sum of the 50% deductions.

### C. Buy 3, Get 3 (`b3g3`)
*   **Logic**:
    1. Break down line items by quantity into individual unit base prices.
    2. Sort the array ascending.
    3. Process in chunks of 6.
    4. For each chunk of 6, the **three cheapest** items receive a 50% discount.
    5. If there are 5 items left over, the **two cheapest** items receive a 50% discount.
    6. If there are 4 items left over, the **single cheapest** item receives a 50% discount.
*   **Discount**: Sum of the 50% deductions.

### D. Free Triple Pane (`triple`)
*   **Logic**: The discount covers the entirety of the Triple Pane upgrade cost.
*   **Discount**: Sum of the Triple Pane (row total) amounts across all windows.

### E. Free Argon & Solar + 5% Off (`argonSolar5`)
*   **Logic**: The discount covers the entire cost of Argon and Solar upgrades. In addition, an extra 5% discount is applied to the remaining base price.
*   **Discount**: `(Argon + Solar) + max(0, Base - (Argon + Solar)) * 0.05`
    *   *Note*: The 5% is calculated on the base price *minus* the cost of the removed Argon and Solar (with a floor of $0).

## 2. Tax Calculation & Subtotals

The tax calculation combines the base window costs with additional manual line items to determine the total price and payment schedules.

**Inputs**:
1.  **Base price of windows**: Automatically carried over.
2.  **J & C (Joinery & Carpentry)**: Manual input.
3.  **Miscellaneous**: Manual input.
4.  **Labour**: Manual input.
5.  **Surcharge**: Automatically calculated from the base price of windows (`base * surchargeRate%`).
6.  **Discount (promo discount)**: Automatically calculated based on selected promo.

**Formulas**:
*   `Subtotal Before Discount = Base + J&C + Misc + Labour + Surcharge`
*   `After Discount = max(0, Subtotal Before Discount - Promo Discount)`
*   `HST = After Discount * 13%`
*   `Total incl. HST = After Discount + HST`
*   `First 50% Payment = floor(Total / 2)`
*   `Final 50% Payment = Total - First 50% Payment`

## 3. 5-Year Labour Upgrade Calculation

This is an optional upgrade price that is shown but **not** included in the total or HST. It is based on the `After Discount` price.

*   **Under $3,000**: Not available
*   **$3,000 to $4,999**: 6% (minimum charge of $260)
*   **$5,000 to $7,499**: 7%
*   **$7,500 to $9,999**: 8%
*   **$10,000 to $14,999**: 8.5%
*   **$15,000 to $19,999**: 9%
*   **$20,000 to $24,999**: 10%
*   **$25,000 and above**: 11%

## Implementation Notes for React Migration
1.  **Monetary Arithmetic**: All internal calculations should ideally convert to cents (integers) to avoid floating-point errors, converting back to display formats only when rendering UI.
2.  **State Management**: React state should track the list of window items (Qty, Base, Argon, Solar, Triple), the global Surcharge rate, the active Promo, and the manual tax fields (J&C, Misc, Labour).
3.  **Removed Features**: As per requirements, the "Import Excel Quote" logic will not be migrated.
