import { ComboPricing } from './types';

// Default Annealed & Tempered combinations from July 14, 2025 Vitro pricing sheets
export const DEFAULT_SEALED_UNIT_COMBOS: ComboPricing[] = [
  // --- ANNEALED ---
  {
    id: 'ann_clear',
    name: 'Clear',
    treatment: 'annealed',
    prices: {
      3: { dual: 10.65, triple: 17.27 },
      4: { dual: 12.78, triple: 20.28 },
      5: { dual: 13.19, triple: 20.89 },
      6: { dual: 13.42, triple: 22.01 },
    },
  },
  {
    id: 'ann_sungate_1',
    name: 'Vitro Sungate 400 - 1 Lite (Hardcoat)',
    treatment: 'annealed',
    prices: {
      3: { dual: 14.00, triple: 19.70 },
      4: { dual: 15.82, triple: 22.69 },
      5: { dual: 16.51, triple: 25.19 },
      6: { dual: 16.95, triple: 26.61 },
    },
  },
  {
    id: 'ann_sungate_2',
    name: 'Vitro Sungate 400 - 2 Lites',
    treatment: 'annealed',
    prices: {
      3: { dual: null, triple: 22.09 },
      4: { dual: null, triple: 25.63 },
      5: { dual: null, triple: 28.71 },
      6: { dual: null, triple: 30.57 },
    },
  },
  {
    id: 'ann_solarban60_1',
    name: 'Vitro Solarban 60 - 1 Lite (Softcoat)',
    treatment: 'annealed',
    prices: {
      3: { dual: 14.00, triple: 20.39 },
      4: { dual: 16.82, triple: 24.00 },
      5: { dual: 18.31, triple: 27.44 },
      6: { dual: 19.21, triple: 28.10 },
    },
  },
  {
    id: 'ann_solarban60_2',
    name: 'Vitro Solarban 60 - 2 Lites',
    treatment: 'annealed',
    prices: {
      3: { dual: null, triple: 24.22 },
      4: { dual: null, triple: 28.17 },
      5: { dual: null, triple: 31.91 },
      6: { dual: null, triple: 34.00 },
    },
  },
  {
    id: 'ann_solarban70_1',
    name: 'Vitro Solarban 70 - 1 Lite (Softcoat)',
    treatment: 'annealed',
    prices: {
      3: { dual: 16.48, triple: 23.86 },
      4: { dual: 19.82, triple: 28.10 },
      5: { dual: 21.57, triple: 32.11 },
      6: { dual: 22.62, triple: 32.88 },
    },
  },
  {
    id: 'ann_solarban70_2',
    name: 'Vitro Solarban 70 - 2 Lites',
    treatment: 'annealed',
    prices: {
      3: { dual: null, triple: 28.17 },
      4: { dual: null, triple: 32.88 },
      5: { dual: null, triple: 37.28 },
      6: { dual: null, triple: 39.73 },
    },
  },

  // --- TEMPERED ---
  {
    id: 'temp_clear',
    name: 'Clear (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: 16.31, triple: 24.36 },
      4: { dual: 18.45, triple: 27.37 },
      5: { dual: 19.80, triple: 29.80 },
      6: { dual: 20.15, triple: 30.50 },
    },
  },
  {
    id: 'temp_sungate_1',
    name: 'Vitro Sungate 400 - 1 Lite (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: 19.67, triple: 26.79 },
      4: { dual: 21.48, triple: 29.78 },
      5: { dual: 23.12, triple: 34.11 },
      6: { dual: 23.68, triple: 35.10 },
    },
  },
  {
    id: 'temp_sungate_2',
    name: 'Vitro Sungate 400 - 2 Lites (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: null, triple: 29.18 },
      4: { dual: null, triple: 32.73 },
      5: { dual: null, triple: 37.62 },
      6: { dual: null, triple: 39.06 },
    },
  },
  {
    id: 'temp_solarban60_1',
    name: 'Vitro Solarban 60 - 1 Lite (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: 19.67, triple: 27.48 },
      4: { dual: 22.48, triple: 31.09 },
      5: { dual: 24.92, triple: 36.36 },
      6: { dual: 25.94, triple: 36.59 },
    },
  },
  {
    id: 'temp_solarban60_2',
    name: 'Vitro Solarban 60 - 2 Lites (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: null, triple: 30.64 },
      4: { dual: null, triple: 35.61 },
      5: { dual: null, triple: 38.22 },
      6: { dual: null, triple: 39.67 },
    },
  },
  {
    id: 'temp_solarban70_1',
    name: 'Vitro Solarban 70 - 1 Lite (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: 22.14, triple: 29.99 },
      4: { dual: null, triple: null },
      5: { dual: 28.20, triple: 39.41 },
      6: { dual: 28.91, triple: 40.37 },
    },
  },
  {
    id: 'temp_solarban70_2',
    name: 'Vitro Solarban 70 - 2 Lites (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: null, triple: 35.35 },
      4: { dual: null, triple: null },
      5: { dual: null, triple: 46.56 },
      6: { dual: null, triple: 47.71 },
    },
  },
];

