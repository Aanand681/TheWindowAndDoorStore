# Window Promo Quote Calculator - PDF Import Feature

## Analysis of `index.html` Logic

The original `index.html` implements a sophisticated parsing logic to extract structured window quote data from manufacturer PDF files. Here is a breakdown of how it works:

1. **PDF Reading (`readPdfItems`)**:
   - Uses `pdfjs-dist` to load the PDF file.
   - Iterates through each page and extracts text content items.
   - For each text item, it calculates its `x` and `y` coordinates and normalizes the page layout.

2. **Row Grouping (`pdfItemsToRows`)**:
   - Sorts text items by page, then by `y` coordinate, then by `x` coordinate.
   - Groups text items into rows based on a vertical tolerance (`Math.abs(it.y - cur.y) > 3`).
   - Maps each grouped row into a standard schema looking for item numbers (`no`), quantities (`qty`), string labels (`label`), list prices, and total prices.

3. **Data Extraction (`parseManufacturerPdfItems`)**:
   - Searches for main window entries that start with an integer ID (e.g., `1`, `2`) and contain a quantity.
   - Searches for sub-items associated with the parent ID (e.g., `1.1`, `1.2`).
   - Extracts the "LINE ITEM TOTAL" for the base cost.
   - Scans sub-items for promotional upgrade costs: "ARGON", "SOLAR GAIN", "TRIPLE GLAZED", and "TRIPLE PANE".
   - Converts the parsed dollar values into a structured object representing a window item.

4. **Promo Calculation (`promo-logic.ts` / `quote()`)**:
   - **Buy 2 Get 2 (B2G2) / Buy 3 Get 3 (B3G3)**: Groups individual units and discounts the cheapest ones within each group.
   - **Free Triple Pane**: Directly discounts the sum of all triple pane upgrade costs.
   - **Free Low E and Argon + 5%**: Discounts the cost of argon and solar upgrades, plus gives an additional 5% off the remaining base cost.
   - **Surcharge**: A baseline percentage markup applied to the original base price.

## Implementation in React (Next.js)

To implement this into the Next.js program, the following changes were made:

1. **Installed Dependency**:
   - Installed `pdfjs-dist@3.11.174` via npm to parse PDFs in the browser.

2. **Created `lib/pdf-parser.ts`**:
   - Migrated the raw JavaScript parsing logic into strongly-typed TypeScript.
   - Configured `pdfjsLib.GlobalWorkerOptions.workerSrc` to use the CDN worker to prevent Next.js Webpack bundling issues.
   - Adapted the data mapper to convert dollar amounts into the internal `cents` representation utilized by `promo-logic.ts`.

3. **Updated `app/page.tsx`**:
   - Added a new "Import PDF" button using `lucide-react` icons.
   - Attached a hidden file input element linked via `useRef`.
   - Implemented `handlePdfUpload` which dynamically reads the PDF file, parses its contents, and updates the `windows` state array.
   - Integrated status messages (Success, Info, Error) using modern Tailwind UI components to show the user exactly what happened during parsing.

The resulting program now natively extracts data straight from the manufacturer's PDFs and automatically runs the pricing engine across all window promotional variants.
