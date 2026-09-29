// types/product.types.ts

export interface ProductMedia {
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

  width?:
    | number
    | null;

  height?:
    | number
    | null;

  mime?:
    | string
    | null;

  size?:
    | number
    | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRestaurant {
  id: number;

  documentId: string;

  name: string;

  slug?:
    | string
    | null;

  description?:
    | string
    | null;

  email?: string;

  statusRes?: string;
}

export interface ProductCategory {
  id: number;

  documentId: string;

  name: string;

  description?:
    | string
    | null;

  isActive?: boolean;
}

export interface ProductPromotion {
  id: number;

  documentId: string;

  name: string;

  type?: string;

  percentage?:
    | number
    | null;

  discountAmount?:
    | number
    | null;
}

export interface ProductOrderItem {
  id: number;

  documentId?: string;

  quantity?: number;

  unitPrice?: number;

  subtotal?: number;
}

export interface Product {
  id: number;

  documentId: string;

  name: string;

  slug:
    | string
    | null;

  description:
    | string
    | null;

  price: number;

  stock:
    | number
    | null;

  isAvailable: boolean;

  mainImage:
    | ProductMedia
    | null;

  gallery:
    ProductMedia[];

  restaurant:
    | ProductRestaurant
    | null;

  category:
    | ProductCategory
    | null;

  promotions?:
    ProductPromotion[];

  order_items?:
    ProductOrderItem[];

  createdAt: string;

  updatedAt: string;

  publishedAt:
    | string
    | null;
}

export interface CreateProductData {
  name: string;

  slug?:
    | string
    | null;

  description?:
    | string
    | null;

  price: number;

  stock?: number;

  isAvailable?: boolean;

  // documentId del Restaurant
  restaurant:
    string;

  // documentId de Category
  category?:
    | string
    | null;
}

export type UpdateProductData =
  Partial<CreateProductData>;

export interface ProductPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface ProductListResponse {
  data: Product[];

  meta: {
    pagination:
      ProductPagination;
  };
}

export interface ProductResponse {
  data: Product;

  meta?: Record<
    string,
    unknown
  >;
}

export interface ProductQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  name?: string;

  available?: boolean;

  /**
   * documentId de Restaurant.
   *
   * Ej:
   * j5i99kvw5279j3636agc8oyn
   */
  restaurantDocumentId?:
    string;

  /**
   * documentId de Category.
   */
  categoryDocumentId?:
    string;
}

export interface ProductImageUpload {
  uri: string;

  fileName?: string;

  mimeType?: string;
}

export interface ProductMediaResponse {
  data: Product;

  message?: string;
}