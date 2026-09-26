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
            populate:
              'order,product',

            'pagination[page]':
              params.page ??
              1,

            'pagination[pageSize]':
              params.pageSize ??
              25,

            sort:
              params.sort,

            'filters[order][id][$eq]':
              params.orderId,

            'filters[product][id][$eq]':
              params.productId,
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
  ): Promise<OrderItemResponse> {
    const response =
      await api.get<OrderItemResponse>(
        `${ORDER_ITEM_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          params: {
            populate:
              'order,product',
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
              'order,product',
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
      UpdateOrderItemData
  ): Promise<OrderItemResponse> {
    const response =
      await api.patch<OrderItemResponse>(
        `${ORDER_ITEM_URL}/${encodeURIComponent(
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
      `${ORDER_ITEM_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};