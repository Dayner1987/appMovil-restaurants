// types/product.types.ts

export interface ProductImage {
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

// =====================================================
// RESTAURANT
// =====================================================

export interface ProductRestaurant {
  id: number;

  documentId?: string;

  name?: string;
}

// =====================================================
// CATEGORY
// =====================================================

export interface ProductCategory {
  id: number;

  documentId?: string;

  name?: string;
}

// =====================================================
// PROMOTION
// =====================================================

export interface ProductPromotion {
  id: number;

  documentId?: string;

  name?: string;
}

// =====================================================
// ORDER ITEM
// =====================================================

export interface ProductOrderItem {
  id: number;

  documentId?: string;

  quantity?: number;

  unitPrice?: number;

  discount?: number;

  subtotal?: number;

  productName?: string;
}

// =====================================================
// PRODUCT
// =====================================================

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

  isAvailable:
    boolean;

  mainImage:
    | ProductImage
    | null;

  gallery:
    ProductImage[];

  restaurant?:
    | ProductRestaurant
    | null;

  category?:
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

// =====================================================
// CREATE
// =====================================================

export interface CreateProductData {
  name: string;

  slug?:
    | string
    | null;

  description?:
    | string
    | null;

  price: number;

  stock?:
    | number
    | null;

  isAvailable?: boolean;

  /*
   * Se mantienen por compatibilidad
   * con las rutas nativas de Strapi.
   *
   * En la app usaremos preferentemente
   * nuestros endpoints personalizados
   * para las imágenes.
   */
  mainImage?:
    | number
    | null;

  gallery?: number[];

  restaurant?:
    | number
    | string
    | null;

  category?:
    | number
    | string
    | null;

  promotions?:
    number[];

  order_items?:
    number[];
}

// =====================================================
// UPDATE
// =====================================================

export type UpdateProductData =
  Partial<CreateProductData>;

// =====================================================
// ARCHIVO A SUBIR
// =====================================================

export interface ProductImageUpload {
  uri: string;

  fileName?: string;

  mimeType?: string;
}

// =====================================================
// PAGINACIÓN
// =====================================================

export interface ProductPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

// =====================================================
// RESPUESTAS
// =====================================================

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

export interface ProductMediaResponse {
  data: Product;

  message?: string;
}

// =====================================================
// QUERY PARAMS
// =====================================================

export interface ProductQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  restaurantId?:
    | number
    | string;

  categoryId?:
    | number
    | string;

  available?: boolean;

  name?: string;
}