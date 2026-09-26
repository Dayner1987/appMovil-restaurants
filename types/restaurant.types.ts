// types/restaurant.types.ts

export type RestaurantStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'REJECTED'
  | string;

// =====================================================
// IMAGE
// =====================================================

export interface RestaurantImage {
  id: number;

  documentId?: string;

  name?: string;

  url?: string;

  alternativeText?:
    | string
    | null;

  caption?:
    | string
    | null;

  width?: number | null;

  height?: number | null;

  mime?: string | null;

  size?: number | null;

  createdAt?: string;

  updatedAt?: string;
}

// =====================================================
// USER
// =====================================================

export interface RestaurantUser {
  id: number;

  documentId?: string;

  username?: string;

  email?: string;

  firstName?:
    | string
    | null;

  lastName?:
    | string
    | null;
}

// =====================================================
// CATEGORY
// =====================================================

export interface RestaurantCategory {
  id: number;

  documentId?: string;

  name?: string;

  slug?: string;
}

// =====================================================
// PRODUCT
// =====================================================

export interface RestaurantProduct {
  id: number;

  documentId?: string;

  name?: string;

  price?: number;

  stock?: number;

  isAvailable?: boolean;
}

// =====================================================
// PROMOTION
// =====================================================

export interface RestaurantPromotion {
  id: number;

  documentId?: string;

  name?: string;
}

// =====================================================
// PUBLICATION
// =====================================================

export interface RestaurantPublication {
  id: number;

  documentId?: string;

  title?: string;

  featured?:
    | boolean
    | null;
}

// =====================================================
// ORDER
// =====================================================

export interface RestaurantOrder {
  id: number;

  documentId?: string;

  orderCode?: string;

  total?: number;

  statusOrder?: string;
}

// =====================================================
// RESTAURANT
// =====================================================

export interface Restaurant {
  id: number;

  documentId: string;

  name: string;

  slug:
    | string
    | null;

  description:
    | string
    | null;

  email: string;

  address:
    | string
    | null;

  phone:
    | string
    | null;

  nit:
    | string
    | null;

  statusRes:
    RestaurantStatus;

  logo:
    | RestaurantImage
    | null;

  /*
   * CAMPO REAL DE STRAPI
   *
   * Antes tenías coverImage,
   * pero el backend utiliza QRImage.
   */
  QRImage:
    | RestaurantImage
    | null;

  users?:
    RestaurantUser[];

  categories?:
    RestaurantCategory[];

  products?:
    RestaurantProduct[];

  promotions?:
    RestaurantPromotion[];

  publications?:
    RestaurantPublication[];

  orders?:
    RestaurantOrder[];

  createdAt: string;

  updatedAt: string;

  publishedAt:
    | string
    | null;
}

// =====================================================
// CREATE
// =====================================================

export interface CreateRestaurantData {
  name: string;

  slug?:
    | string
    | null;

  description?:
    | string
    | null;

  email: string;

  address?:
    | string
    | null;

  phone?:
    | string
    | null;

  nit?:
    | string
    | null;

  statusRes?:
    RestaurantStatus;

  /*
   * Estos campos todavía pueden
   * usarse con los endpoints nativos
   * enviando IDs de media.
   */
  logo?:
    | number
    | null;

  QRImage?:
    | number
    | null;

  users?: number[];

  categories?: number[];

  products?: number[];

  promotions?: number[];

  publications?: number[];

  orders?: number[];
}

// =====================================================
// UPDATE
// =====================================================

export type UpdateRestaurantData =
  Partial<CreateRestaurantData>;

// =====================================================
// PAGINATION
// =====================================================

export interface RestaurantPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface RestaurantListResponse {
  data: Restaurant[];

  meta: {
    pagination:
      RestaurantPagination;
  };
}

export interface RestaurantResponse {
  data: Restaurant;

  meta?: Record<
    string,
    unknown
  >;
}

// =====================================================
// MEDIA RESPONSE
// =====================================================

export interface RestaurantMediaResponse {
  data: Restaurant;

  message?: string;
}

// =====================================================
// QUERY
// =====================================================

export interface RestaurantQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  statusRes?:
    RestaurantStatus;

  name?: string;

  email?: string;
}