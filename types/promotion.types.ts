// types/promotion.types.ts

export type PromotionType =
  | 'PERCENTAGE'
  | 'FIXED_AMOUNT'
  | 'TWO_FOR_ONE'
  | string;

// =====================================================
// RESTAURANT
// =====================================================

export interface PromotionRestaurant {
  id: number;

  documentId?: string;

  name?: string;
}

// =====================================================
// PRODUCT
// =====================================================

export interface PromotionProduct {
  id: number;

  documentId?: string;

  name?: string;

  price?: number;

  stock?: number | null;

  isAvailable?: boolean;
}

// =====================================================
// PROMOTION
// =====================================================

export interface Promotion {
  id: number;

  documentId: string;

  name: string;

  description:
    | string
    | null;

  type:
    PromotionType;

  percentage: number;

  discountAmount:
    | number
    | null;

  buyQuantity:
    | number
    | null;

  payQuantity:
    | number
    | null;

  startAt:
    | string
    | null;

  endAt:
    | string
    | null;

  restaurant?:
    | PromotionRestaurant
    | null;

  products?:
    PromotionProduct[];

  createdAt: string;

  updatedAt: string;

  publishedAt:
    | string
    | null;
}

// =====================================================
// CREATE
// =====================================================

export interface CreatePromotionData {
  name: string;

  description?:
    | string
    | null;

  type:
    PromotionType;

  percentage: number;

  discountAmount?:
    | number
    | null;

  buyQuantity?:
    | number
    | null;

  payQuantity?:
    | number
    | null;

  startAt?:
    | string
    | null;

  endAt?:
    | string
    | null;

  restaurant?:
    | number
    | string
    | null;

  products?: number[];
}

// =====================================================
// UPDATE
// =====================================================

export type UpdatePromotionData =
  Partial<CreatePromotionData>;

// =====================================================
// PAGINACIÓN
// =====================================================

export interface PromotionPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface PromotionListResponse {
  data: Promotion[];

  meta: {
    pagination:
      PromotionPagination;
  };
}

export interface PromotionResponse {
  data: Promotion;

  meta?: Record<
    string,
    unknown
  >;
}

// =====================================================
// QUERY
// =====================================================

export interface PromotionQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  restaurantId?:
    | number
    | string;

  productId?:
    | number
    | string;

  type?:
    PromotionType;
}