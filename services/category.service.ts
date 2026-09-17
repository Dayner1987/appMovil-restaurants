import { api } from './api';

import type {
  CategoryListResponse,
  CategoryQueryParams,
  CategoryResponse,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/types/category.types';

const CATEGORY_URL = '/api/categories';

export const categoryService = {
  async findAll(
    params: CategoryQueryParams = {}
  ): Promise<CategoryListResponse> {
    const response = await api.get<CategoryListResponse>(
      CATEGORY_URL,
      {
        params: {
          'pagination[page]': params.page ?? 1,
          'pagination[pageSize]': params.pageSize ?? 25,
          sort: params.sort ?? 'name:asc',
          'filters[name][$containsi]': params.name,
          'filters[isActive][$eq]': params.isActive,
        },
      }
    );

    return response.data;
  },

  async findOne(documentId: string): Promise<CategoryResponse> {
    const response = await api.get<CategoryResponse>(
      `${CATEGORY_URL}/${encodeURIComponent(documentId)}`
    );

    return response.data;
  },

  async create(data: CreateCategoryData): Promise<CategoryResponse> {
    const response = await api.post<CategoryResponse>(
      CATEGORY_URL,
      { data }
    );

    return response.data;
  },

  async update(
    documentId: string,
    data: UpdateCategoryData
  ): Promise<CategoryResponse> {
    const response = await api.put<CategoryResponse>(
      `${CATEGORY_URL}/${encodeURIComponent(documentId)}`,
      { data }
    );

    return response.data;
  },

  async remove(documentId: string): Promise<void> {
    await api.delete(
      `${CATEGORY_URL}/${encodeURIComponent(documentId)}`
    );
  },
};