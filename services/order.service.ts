// services/order.service.ts

import {
  api,
} from './api';

import type {
  CreateOrderData,
  OrderListResponse,
  OrderQueryParams,
  OrderResponse,
  UpdateOrderData,
} from '@/types/orders.types';

const ORDER_URL =
  '/api/orders';

export const orderService = {
  // ===================================================
  // GET ALL
  // ===================================================

  async findAll(
    params:
      OrderQueryParams = {}
  ): Promise<OrderListResponse> {
    const response =
      await api.get<OrderListResponse>(
        ORDER_URL,
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
              25,

            sort:
              params.sort ??
              'orderedAt:desc',

            'filters[orderCode][$containsi]':
              params.orderCode,

            'filters[orderType][$eq]':
              params.orderType,

            'filters[statusOrder][$eq]':
              params.statusOrder,

            'filters[paymentStatus][$eq]':
              params.paymentStatus,

            // =========================================
            // RESTAURANT
            //
            // API comprobada:
            //
            // filters[restaurant][documentId][$eq]
            // =========================================

            'filters[restaurant][documentId][$eq]':
              params.restaurantDocumentId,

            // =========================================
            // USERS
            // =========================================

            'filters[users][id][$eq]':
              params.userId,

            // =========================================
            // ORDERED DATE RANGE
            // =========================================

            'filters[orderedAt][$gte]':
              params.orderedFrom,

            'filters[orderedAt][$lte]':
              params.orderedTo,

            // =========================================
            // COMPLETE DATE RANGE
            // =========================================

            'filters[completeAt][$gte]':
              params.completedFrom,

            'filters[completeAt][$lte]':
              params.completedTo,
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
  ): Promise<OrderResponse> {
    const response =
      await api.get<OrderResponse>(
        `${ORDER_URL}/${encodeURIComponent(
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
  // POST /api/orders
  //
  // IMPORTANTE:
  // No mandamos status=draft aquí.
  //
  // Dejamos el comportamiento nativo que ya
  // comprobaste en Insomnia.
  // ===================================================

  async create(
    data:
      CreateOrderData
  ): Promise<OrderResponse> {
    const response =
      await api.post<OrderResponse>(
        ORDER_URL,
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
  // PATCH PERSONALIZADO
  //
  // PATCH /api/orders/:documentId
  //
  // Esta es tu ruta custom.
  // ===================================================

  async patch(
    documentId:
      string,

    data:
      UpdateOrderData
  ): Promise<OrderResponse> {
    const response =
      await api.patch<OrderResponse>(
        `${ORDER_URL}/${encodeURIComponent(
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
      `${ORDER_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};