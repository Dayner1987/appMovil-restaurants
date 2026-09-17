import { api } from './api';

import type {
  CreateReceiptData,
  ReceiptListResponse,
  ReceiptQueryParams,
  ReceiptResponse,
  UpdateReceiptData,
} from '@/types/receipt.types';

const RECEIPT_URL = '/api/receipts';

export const receiptService = {
  async findAll(
    params: ReceiptQueryParams = {}
  ): Promise<ReceiptListResponse> {
    const response = await api.get<ReceiptListResponse>(
      RECEIPT_URL,
      {
        params: {
          populate: 'order',
          'pagination[page]': params.page ?? 1,
          'pagination[pageSize]': params.pageSize ?? 25,
          sort: params.sort,
          'filters[order][id][$eq]': params.orderId,
          'filters[receiptNumber][$eq]': params.receiptNumber,
          'filters[ci][$eq]': params.ci,
        },
      }
    );

    return response.data;
  },

  async findOne(
    documentId: string
  ): Promise<ReceiptResponse> {
    const response = await api.get<ReceiptResponse>(
      `${RECEIPT_URL}/${encodeURIComponent(documentId)}`,
      {
        params: {
          populate: 'order',
        },
      }
    );

    return response.data;
  },

  async create(
    data: CreateReceiptData
  ): Promise<ReceiptResponse> {
    const response = await api.post<ReceiptResponse>(
      RECEIPT_URL,
      { data },
      {
        params: {
          populate: 'order',
        },
      }
    );

    return response.data;
  },

  async update(
    documentId: string,
    data: UpdateReceiptData
  ): Promise<ReceiptResponse> {
    const response = await api.put<ReceiptResponse>(
      `${RECEIPT_URL}/${encodeURIComponent(documentId)}`,
      { data },
      {
        params: {
          populate: 'order',
        },
      }
    );

    return response.data;
  },

  async remove(documentId: string): Promise<void> {
    await api.delete(
      `${RECEIPT_URL}/${encodeURIComponent(documentId)}`
    );
  },
};