// types/category.types.ts

// =====================================================
// RELACIONES
// =====================================================

export interface CategoryRestaurant {
  id: number;

  documentId?: string;

  name?: string;
}

export interface CategoryProduct {
  id: number;

  documentId?: string;

  name?: string;

  price?: number;

  stock?: number;

  isAvailable?: boolean;
}

// =====================================================
// CATEGORY
// =====================================================

export interface Category {
  id: number;

  documentId: string;

  name: string;

  description:
    | string
    | null;

  isActive:
    | boolean
    | null;

  restaurant?:
    | CategoryRestaurant
    | null;

  products?:
    CategoryProduct[];

  createdAt: string;

  updatedAt: string;

  publishedAt:
    | string
    | null;
}

// =====================================================
// CREATE
// =====================================================

export interface CreateCategoryData {
  name: string;

  description?:
    | string
    | null;

  isActive?: boolean;

  restaurant?:
    | number
    | string
    | null;

  products?: number[];
}

// =====================================================
// UPDATE
// =====================================================

export type UpdateCategoryData =
  Partial<CreateCategoryData>;

// =====================================================
// PAGINACIÓN
// =====================================================

export interface CategoryPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface CategoryListResponse {
  data: Category[];

  meta: {
    pagination:
      CategoryPagination;
  };
}

export interface CategoryResponse {
  data: Category;

  meta?: Record<
    string,
    unknown
  >;
}

// =====================================================
// QUERY
// =====================================================

export interface CategoryQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  name?: string;

  isActive?: boolean;

  restaurantId?:
    | number
    | string;
}