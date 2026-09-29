// services/order-item.service.ts

import {
  api,
} from './api';

import type {
  CreateOrderItemData,
  OrderItemListResponse,
  OrderItemQueryParams,
  OrderItemResponse,
  UpdateOrderItemData,
} from '@/types/order-item.types';

const ORDER_ITEM_URL =
  '/api/order-items';

export const orderItemService = {
  // ===================================================
  // GET ALL
  // ===================================================

  async findAll(
    params:
      OrderItemQueryParams = {}
  ): Promise<OrderItemListResponse> {
    const response =
      await api.get<OrderItemListResponse>(
        ORDER_ITEM_URL,
        {
          params: {
            status:
              'draft',

            populate:
              '*',

            'pagination[page]':
              params.page ??
              1,

            'pagination[pageSize]':
              params.pageSize ??
              100,

            sort:
              params.sort ??
              'createdAt:asc',

            // =========================================
            // ORDER
            // =========================================

            'filters[order][documentId][$eq]':
              params.orderDocumentId,

            // =========================================
            // PRODUCT
            // =========================================

            'filters[product][documentId][$eq]':
              params.productDocumentId,
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // GET ONE
  // ===================================================

  async findOne(
    documentId:
      string
  ): Promise<OrderItemResponse> {
    const response =
      await api.get<OrderItemResponse>(
        `${ORDER_ITEM_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          params: {
            status:
              'draft',

            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // CREATE
  //
  // POST /api/order-items
  // ===================================================

  async create(
    data:
      CreateOrderItemData
  ): Promise<OrderItemResponse> {
    const response =
      await api.post<OrderItemResponse>(
        ORDER_ITEM_URL,
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
  // UPDATE
  //
  // OrderItem no tiene PATCH custom.
  //
  // Usamos PUT nativo de Strapi.
  // ===================================================

  async update(
    documentId:
      string,

    data:
      UpdateOrderItemData
  ): Promise<OrderItemResponse> {
    const response =
      await api.put<OrderItemResponse>(
        `${ORDER_ITEM_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          data,
        },
        {
          params: {
            status:
              'draft',

            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // DELETE
  // ===================================================

  async remove(
    documentId:
      string
  ): Promise<void> {
    await api.delete(
      `${ORDER_ITEM_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};