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

// =====================================================
// GENERAR CÓDIGO
// =====================================================

function generateOrderCode():
  string {
  const date =
    new Date();

  const year =
    String(
      date.getFullYear()
    ).slice(-2);

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );

  const random =
    Math.floor(
      1000 +
        Math.random() *
          9000
    );

  return `ORD-${year}${month}${day}-${random}`;
}

// =====================================================
// SERVICE
// =====================================================

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

            'filters[orderCode][$containsi]':
              params.orderCode,

            'filters[orderType][$eq]':
              params.orderType,

            'filters[statusOrder][$eq]':
              params.statusOrder,

            'filters[paymentStatus][$eq]':
              params.paymentStatus,

            'filters[restaurant][id][$eq]':
              params.restaurantId,

            'filters[users][id][$eq]':
              params.userId,
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
  ): Promise<OrderResponse> {
    const response =
      await api.get<OrderResponse>(
        `${ORDER_URL}/${encodeURIComponent(
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
      CreateOrderData
  ): Promise<OrderResponse> {
    const response =
      await api.post<OrderResponse>(
        ORDER_URL,
        {
          data: {
            ...data,

            orderCode:
              generateOrderCode(),

            statusOrder:
              'PENDING',

            paymentStatus:
              'PENDING',

            discount:
              data.discount ??
              0,

            orderedAt:
              new Date()
                .toISOString(),
          },
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
  // PATCH /api/orders/:documentId
  // ===================================================

  async update(
    documentId: string,

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
      `${ORDER_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },

  
};