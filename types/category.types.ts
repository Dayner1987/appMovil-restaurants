export interface Category {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CreateCategoryData {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

export interface CategoryPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface CategoryListResponse {
  data: Category[];
  meta: {
    pagination: CategoryPagination;
  };
}

export interface CategoryResponse {
  data: Category;
  meta?: Record<string, unknown>;
}

export interface CategoryQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
  name?: string;
  isActive?: boolean;
}