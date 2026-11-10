export interface StudioDoorSpecItem {
  text: string;
  bold: boolean;
}

export type StudioDoorSpec = StudioDoorSpecItem;

export interface StudioDoorItem {
  number: string;
  name: string;
  price: string;
  glass: string;
  spec: StudioDoorSpecItem[];
  roWarn: boolean;
  rawCanvas: HTMLCanvasElement | null;
  raw?: HTMLCanvasElement | null;
  image: string | null; // data URL of trimmed drawing
  trimLeft: number;
  trimBottom: number;
  sourcePages: string;
  qty?: string;
}

export type StudioDoorLine = StudioDoorItem;

export interface StudioDoorQuoteData {
  quoteNumber: string;
  customerName: string;
  companyName?: string;
  address?: string;
  logoDataUrl?: string | null;
  makerLogo: string | null; // data URL
  mode: 'supply' | 'install';
  jobComments?: string;
  allName?: string;
  allPrice?: string;
  lines: StudioDoorItem[];
}
