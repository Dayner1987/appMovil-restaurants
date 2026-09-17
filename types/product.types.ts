export interface ProductImage {
  id: number;
  documentId?: string;
  name?: string;
  url?: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  mime?: string;
  size?: number;
}

export interface ProductRestaurant {
  id: number;
  documentId?: string;
  name?: string;
}

export interface ProductCategory {
  id: number;
  documentId?: string;
  name?: string;
}

export interface ProductPromotion {
  id: number;
  documentId?: string;
  name?: string;
}

export interface ProductOrderItem {
  id: number;
  documentId?: string;
  quantity?: number;
  subtotal?: number;
}


export interface Product {
  id: number;
  documentId: string;

  name: string;
  slug: string;
  sku: string;

  description: string;

  price: number;
  stock: number;

  isAvailable: boolean;

  mainImage?: ProductImage | null;
  gallery?: ProductImage[];

  restaurant?: ProductRestaurant | null;
  category?: ProductCategory | null;

  promotions?: ProductPromotion[];

  order_items?: ProductOrderItem[];

  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}


export interface CreateProductData {
  name: string;
  slug?: string;
  sku?: string;

  description?: string;

  price: number;
  stock?: number;

  isAvailable?: boolean;

  mainImage?: number | null;

  gallery?: number[];

  restaurant?: number | string | null;

  category?: number | string | null;

  promotions?: number[];

  order_items?: number[];
}


export type UpdateProductData = Partial<CreateProductData>;


export interface ProductPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}


export interface ProductListResponse {
  data: Product[];
  meta: {
    pagination: ProductPagination;
  };
}


export interface ProductResponse {
  data: Product;
  meta?: Record<string, unknown>;
}


export interface ProductQueryParams {
  page?: number;
  pageSize?: number;

  sort?: string | string[];

  restaurantId?: number | string;

  categoryId?: number | string;

  available?: boolean;
}