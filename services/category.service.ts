// services/category.service.ts

import {
  api,
} from './api';

import type {
  CategoryListResponse,
  CategoryQueryParams,
  CategoryResponse,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/types/category.types';

const CATEGORY_URL =
  '/api/categories';

export const categoryService = {
  // ===================================================
  // GET ALL
  // ===================================================

  async findAll(
    params:
      CategoryQueryParams = {}
  ): Promise<CategoryListResponse> {
    const response =
      await api.get<CategoryListResponse>(
        CATEGORY_URL,
        {
          params: {
            populate:
              '*',

            'pagination[page]':
              params.page ??
              1,

            'pagination[pageSize]':
              params.pageSize ??
              25,

            sort:
              params.sort ??
              'name:asc',

            'filters[name][$containsi]':
              params.name,

            'filters[isActive][$eq]':
              params.isActive,

            'filters[restaurant][id][$eq]':
              params.restaurantId,
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // GET ONE
  // ===================================================

  async findOne(
    documentId: string
  ): Promise<CategoryResponse> {
    const response =
      await api.get<CategoryResponse>(
        `${CATEGORY_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          params: {
            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // CREATE
  // POST NATIVO STRAPI
  // ===================================================

  async create(
    data:
      CreateCategoryData
  ): Promise<CategoryResponse> {
    const response =
      await api.post<CategoryResponse>(
        CATEGORY_URL,
        {
          data,
        },
        {
          params: {
            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // UPDATE PARCIAL
  // PATCH PERSONALIZADO
  //
  // PATCH /api/categories/:documentId
  // ===================================================

  async update(
    documentId: string,
    data:
      UpdateCategoryData
  ): Promise<CategoryResponse> {
    const response =
      await api.patch<CategoryResponse>(
        `${CATEGORY_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          data,
        }
      );

    return response.data;
  },

  // ===================================================
  // DELETE
  // ===================================================

  async remove(
    documentId: string
  ): Promise<void> {
    await api.delete(
      `${CATEGORY_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};