// services/payment.service.ts

import {
  api,
} from './api';

import type {
  CreatePaymentData,
  PaymentListResponse,
  PaymentQueryParams,
  PaymentResponse,
  UpdatePaymentData,
} from '@/types/payment.types';

const PAYMENT_URL =
  '/api/payments';

export const paymentService = {
  // ===================================================
  // GET ALL
  // ===================================================

  async findAll(
    params:
      PaymentQueryParams = {}
  ): Promise<PaymentListResponse> {
    const response =
      await api.get<PaymentListResponse>(
        PAYMENT_URL,
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
              'paidAt:desc',

            // =========================================
            // ORDER
            // =========================================

            'filters[order][documentId][$eq]':
              params.orderDocumentId,

            // =========================================
            // RESTAURANT
            //
            // API comprobada en Insomnia:
            //
            // Payment
            // -> Order
            // -> Restaurant
            // =========================================

            'filters[order][restaurant][documentId][$eq]':
              params.restaurantDocumentId,

            // =========================================
            // PAYMENT STATUS
            // =========================================

            'filters[statusPayment][$eq]':
              params.statusPayment,

            // =========================================
            // METHOD
            // =========================================

            'filters[method][$eq]':
              params.method,

            // =========================================
            // PAID DATE RANGE
            // =========================================

            'filters[paidAt][$gte]':
              params.paidFrom,

            'filters[paidAt][$lte]':
              params.paidTo,
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
  ): Promise<PaymentResponse> {
    const response =
      await api.get<PaymentResponse>(
        `${PAYMENT_URL}/${encodeURIComponent(
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
  // POST /api/payments
  // ===================================================

  async create(
    data:
      CreatePaymentData
  ): Promise<PaymentResponse> {
    const response =
      await api.post<PaymentResponse>(
        PAYMENT_URL,
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
  // Payment no tiene PATCH personalizado.
  //
  // Usamos PUT nativo.
  // ===================================================

  async update(
    documentId:
      string,

    data:
      UpdatePaymentData
  ): Promise<PaymentResponse> {
    const response =
      await api.put<PaymentResponse>(
        `${PAYMENT_URL}/${encodeURIComponent(
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
      `${PAYMENT_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};