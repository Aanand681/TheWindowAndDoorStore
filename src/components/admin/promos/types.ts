'use client';

export type PromoType = {
  _id: string;
  name: string;
  type: string;
  isActive: boolean;
  order?: number;
  buyQty?: number;
  getQty?: number;
  freeComponents?: string[];
  discountPercentage?: number;
  applyPercentageAfterFreeParts?: boolean;
};

