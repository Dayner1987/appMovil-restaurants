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
  restaurant: string;

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

  restaurantDocumentId?:
    string;

  categoryDocumentId?:
    string;
}

// =====================================================
// IMAGE UPLOAD
// =====================================================

export interface ProductImageUpload {
  uri: string;

  fileName?: string;

  mimeType?: string;

  /**
   * En Expo Web ImagePicker entrega
   * el File original.
   *
   * En Android/iOS normalmente
   * será undefined.
   */
  file?: File | null;
}

export interface ProductMediaResponse {
  data: Product;

  message?: string;
}
// types/product.types.ts

export interface ProductMediaFormat {
  name?: string;

  hash?: string;

  ext?: string;

  mime?: string;

  width?: number;

  height?: number;

  size?: number;

  sizeInBytes?: number;

  url?: string;

  path?:
    | string
    | null;
}

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

  formats?: {
    thumbnail?:
      ProductMediaFormat;

    small?:
      ProductMediaFormat;

    medium?:
      ProductMediaFormat;

    large?:
      ProductMediaFormat;
  } | null;

  createdAt?: string;

  updatedAt?: string;

  publishedAt?:
    | string
    | null;
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

  restaurant:
    string;

  category?:
    | string
    | null;
}



export interface ProductListResponse {
  data:
    Product[];

  meta: {
    pagination:
      ProductPagination;
  };
}

export interface ProductResponse {
  data:
    Product;

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

  restaurantDocumentId?:
    string;

  categoryDocumentId?:
    string;
}

export interface ProductImageUpload {
  uri: string;

  fileName?: string;

  mimeType?: string;

  file?:
    File
    | null;
}

export interface ProductMediaResponse {
  data:
    Product;

  message?: string;
}