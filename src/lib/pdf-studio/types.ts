export interface StudioWindowItem {
  id: string; // e.g. "1", "1.1"
  name: string; // e.g. "150P3 Awning"
  qty: string; // e.g. "1"
  fr: string; // Frame size, e.g. "48 X 22"
  bm: string; // Brickmould size, if present
  ro: string; // Rough opening, e.g. "49 X 23"
  price: string; // Extended total or list, e.g. "823.84"
  options: string; // Description text/options
  child: boolean; // true if child unit (e.g. 1.1)
  image: string | null; // Data URL of the cropped CAD drawing
}

export interface StudioQuoteData {
  quoteNumber: string;
  customerName: string;
  companyName: string;
  address: string;
  logoDataUrl?: string | null;
  mode: 'supply' | 'install';
  items: StudioWindowItem[];
}
