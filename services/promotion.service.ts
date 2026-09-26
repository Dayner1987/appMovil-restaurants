// services/promotion.service.ts

import {
  api,
} from './api';

import type {
  CreatePromotionData,
  PromotionListResponse,
  PromotionQueryParams,
  PromotionResponse,
  UpdatePromotionData,
} from '@/types/promotion.types';

const PROMOTION_URL =
  '/api/promotions';

export const promotionService = {
  // ===================================================
  // GET ALL
  // ===================================================

  async findAll(
    params:
      PromotionQueryParams = {}
  ): Promise<PromotionListResponse> {
    const response =
      await api.get<PromotionListResponse>(
        PROMOTION_URL,
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
              params.sort,

            'filters[restaurant][id][$eq]':
              params.restaurantId,

            'filters[products][id][$eq]':
              params.productId,

            'filters[type][$eq]':
              params.type,
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
  ): Promise<PromotionResponse> {
    const response =
      await api.get<PromotionResponse>(
        `${PROMOTION_URL}/${encodeURIComponent(
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
  // ===================================================

  async create(
    data:
      CreatePromotionData
  ): Promise<PromotionResponse> {
    const response =
      await api.post<PromotionResponse>(
        PROMOTION_URL,
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
  // ===================================================

  async update(
    documentId: string,

    data:
      UpdatePromotionData
  ): Promise<PromotionResponse> {
    const response =
      await api.patch<PromotionResponse>(
        `${PROMOTION_URL}/${encodeURIComponent(
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
      `${PROMOTION_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};