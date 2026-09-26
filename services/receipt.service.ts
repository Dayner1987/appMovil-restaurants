// services/receipt.service.ts

import {
  api,
} from './api';

import type {
  CreateReceiptData,
  ReceiptListResponse,
  ReceiptQueryParams,
  ReceiptResponse,
  UpdateReceiptData,
} from '@/types/receipt.types';

const RECEIPT_URL =
  '/api/receipts';

export const receiptService = {
  // ===================================================
  // GET ALL
  // ===================================================

  async findAll(
    params:
      ReceiptQueryParams = {}
  ): Promise<ReceiptListResponse> {
    const response =
      await api.get<ReceiptListResponse>(
        RECEIPT_URL,
        {
          params: {
            populate:
              'order',

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

            'filters[receiptNumber][$eq]':
              params.receiptNumber,

            'filters[ci][$eq]':
              params.ci,
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
  ): Promise<ReceiptResponse> {
    const response =
      await api.get<ReceiptResponse>(
        `${RECEIPT_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          params: {
            populate:
              'order',
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
      CreateReceiptData
  ): Promise<ReceiptResponse> {
    const response =
      await api.post<ReceiptResponse>(
        RECEIPT_URL,
        {
          data,
        },
        {
          params: {
            populate:
              'order',
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
      UpdateReceiptData
  ): Promise<ReceiptResponse> {
    const response =
      await api.patch<ReceiptResponse>(
        `${RECEIPT_URL}/${encodeURIComponent(
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
      `${RECEIPT_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};