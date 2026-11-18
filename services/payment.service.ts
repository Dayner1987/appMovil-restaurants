// services/payment.service.ts

import { api } from './api';

import type {
  CreatePaymentData,
  PaymentListResponse,
  PaymentQueryParams,
  PaymentResponse,
  UpdatePaymentData,
} from '@/types/payment.types';

const PAYMENT_URL = '/api/payments';
const READ_STATUS = 'published';

const paymentPopulateParams = {
  status: READ_STATUS,
  'populate[order][populate][restaurant]': true,
  'populate[order][populate][users]': true,
};

export const paymentService = {
  // GET ALL: los pagos creados por el backend se consultan en
  // la versión publicada. Se conserva el filtro Payment -> Order -> Restaurant.
  async findAll(
    params: PaymentQueryParams = {},
  ): Promise<PaymentListResponse> {
    const response = await api.get<PaymentListResponse>(
      PAYMENT_URL,
      {
        params: {
          ...paymentPopulateParams,
          'pagination[page]': params.page ?? 1,
          'pagination[pageSize]': params.pageSize ?? 100,
          sort: params.sort ?? 'paidAt:desc',

          'filters[order][documentId][$eq]': params.orderDocumentId,
          'filters[order][restaurant][documentId][$eq]': params.restaurantDocumentId,
          'filters[statusPayment][$eq]': params.statusPayment,
          'filters[method][$eq]': params.method,
          'filters[paidAt][$gte]': params.paidFrom,
          'filters[paidAt][$lte]': params.paidTo,
        },
      },
    );

    return {
      ...response.data,
      data: Array.isArray(response.data?.data) ? response.data.data : [],
    };
  },

  // GET ONE: se consulta Published porque el controlador de pagos
  // publica el pago y la prueba de Insomnia confirmó esta variante.
  async findOne(documentId: string): Promise<PaymentResponse> {
    if (!documentId) {
      throw new Error('Falta el identificador del pago.');
    }

    const response = await api.get<PaymentResponse>(
      `${PAYMENT_URL}/${encodeURIComponent(documentId)}`,
      { params: paymentPopulateParams },
    );

    if (!response.data?.data?.documentId) {
      throw new Error('El servidor no devolvió el pago solicitado.');
    }

    return response.data;
  },

  // POST /api/payments
  async create(data: CreatePaymentData): Promise<PaymentResponse> {
    const response = await api.post<PaymentResponse>(
      PAYMENT_URL,
      { data },
      {
        params: {
          'populate[order][populate][restaurant]': true,
          'populate[order][populate][users]': true,
        },
      },
    );

    if (!response.data?.data?.documentId) {
      throw new Error('El servidor no devolvió el pago creado.');
    }

    return response.data;
  },

  // PATCH personalizado /api/payments/:documentId.
  //
  // IMPORTANTE: la ruta comprobada en Insomnia responde {} aunque
  // sí actualiza el pago y la orden. Por eso no usamos el body del
  // PATCH como Payment: hacemos GET Published después de la mutación.
  async update(
    documentId: string,
    data: UpdatePaymentData,
  ): Promise<PaymentResponse> {
    if (!documentId) {
      throw new Error('Falta el identificador del pago.');
    }

    await api.patch(
      `${PAYMENT_URL}/${encodeURIComponent(documentId)}`,
      { data },
    );

    return this.findOne(documentId);
  },

  async remove(documentId: string): Promise<void> {
    await api.delete(
      `${PAYMENT_URL}/${encodeURIComponent(documentId)}`,
    );
  },
};
