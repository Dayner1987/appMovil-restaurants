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
    let response =
      await api.get<OrderListResponse>(
        ORDER_URL,
        {
          params: {
            status:
              'published',

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

    if (!response.data?.data?.length) {
      response = await api.get<OrderListResponse>(
        ORDER_URL,
        {
          params: {
            ...response.config.params,
            status: 'draft',
          },
        },
      );
    }

    return response.data;
  },

  // ===================================================
  // GET ONE
  // ===================================================

  async findOne(
    documentId:
      string
  ): Promise<OrderResponse> {
    const url = `${ORDER_URL}/${encodeURIComponent(documentId)}`;

    // Prefer Published: el backend de pagos actualiza/publica la
    // orden al aprobar un pago. Si la orden todavía no tiene versión
    // publicada, usamos Draft como fallback para órdenes recién creadas.
    try {
      const published = await api.get<OrderResponse>(url, {
        params: {
          status: 'published',
          populate: '*',
        },
      });

      if (published.data?.data?.documentId) {
        return published.data;
      }
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status !== 404) throw error;
    }

    const draft = await api.get<OrderResponse>(url, {
      params: {
        status: 'draft',
        populate: '*',
      },
    });

    return draft.data;
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
              'published',

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