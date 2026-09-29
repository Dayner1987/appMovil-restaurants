// services/employee-operations.service.ts

import {
  api,
} from './api';

import type {
  OrderStatus,
} from '@/types/orders.types';

import type {
  EmployeeOrder,
  EmployeeOrderPaymentStatus,
  EmployeeOrderQueryParams,
  EmployeePayment,
  EmployeePaymentQueryParams,
  EmployeeReceipt,
} from '@/types/employee.types';

import type {
  OrderItemResponse,
} from '@/types/order-item.types';

import type {
  PaymentMethod,
  PaymentStatus,
} from '@/types/payment.types';

const ORDER_URL =
  '/api/orders';

const ORDER_ITEM_URL =
  '/api/order-items';

const PAYMENT_URL =
  '/api/payments';

const RECEIPT_URL =
  '/api/receipts';

// =====================================================
// INTERNAL RESPONSES
// =====================================================

interface EmployeeOrderResponse {
  data:
    EmployeeOrder;

  meta?: Record<
    string,
    unknown
  >;
}

interface EmployeeOrderListResponse {
  data:
    EmployeeOrder[];

  meta: {
    pagination: {
      page:
        number;

      pageSize:
        number;

      pageCount:
        number;

      total:
        number;
    };
  };
}

interface EmployeePaymentResponse {
  data:
    EmployeePayment;

  meta?: Record<
    string,
    unknown
  >;
}

interface EmployeePaymentListResponse {
  data:
    EmployeePayment[];

  meta: {
    pagination: {
      page:
        number;

      pageSize:
        number;

      pageCount:
        number;

      total:
        number;
    };
  };
}

interface EmployeeReceiptResponse {
  data:
    EmployeeReceipt;

  meta?: Record<
    string,
    unknown
  >;
}

interface EmployeeReceiptListResponse {
  data:
    EmployeeReceipt[];

  meta: {
    pagination: {
      page:
        number;

      pageSize:
        number;

      pageCount:
        number;

      total:
        number;
    };
  };
}

// =====================================================
// DATA
// =====================================================

export interface EmployeeOrderCreateData {
  orderCode:
    string;

  orderType:
    string;

  statusOrder:
    OrderStatus;

  paymentStatus:
    EmployeeOrderPaymentStatus;

  subtotal:
    number;

  discount:
    number;

  total:
    number;

  orderedAt:
    string;

  completeAt:
    | string
    | null;

  restaurant:
    string;

  createdByUser:
    number;

  shift:
    string;

  customer?:
    number;
}

export interface EmployeeOrderUpdateData {
  statusOrder?:
    OrderStatus;

  paymentStatus?:
    EmployeeOrderPaymentStatus;

  completeAt?:
    | string
    | null;

  /*
   * Nombre ACTUAL en Strapi.
   */
  completeBy?:
    number;
}

export interface EmployeeOrderItemCreateData {
  quantity:
    number;

  unitPrice:
    number;

  discount:
    number;

  subtotal:
    number;

  productName:
    string;

  order:
    string;

  product?:
    string;
}

export interface EmployeePaymentCreateData {
  amount:
    number;

  method:
    PaymentMethod;

  statusPayment:
    PaymentStatus;

  transactionReference?:
    | string
    | null;

  paidAt:
    string;

  order:
    string;

  processedBy:
    number;

  shift:
    string;
}

export interface EmployeeReceiptCreateData {
  receiptNumber:
    string;

  issuedAt:
    string;

  subtotal:
    number;

  discount:
    number;

  total:
    number;

  completeName?:
    | string
    | null;

  ci?:
    | string
    | null;

  order:
    string;

  issuedBy:
    number;
}

// =====================================================
// SERVICE
// =====================================================

export const employeeOperationsService = {
  // ===================================================
  // ORDERS
  // ===================================================

  async findOrders(
    params:
      EmployeeOrderQueryParams = {}
  ): Promise<EmployeeOrderListResponse> {
    const response =
      await api.get<EmployeeOrderListResponse>(
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
              100,

            sort:
              'orderedAt:desc',

            'filters[restaurant][documentId][$eq]':
              params.restaurantDocumentId,

            'filters[createdByUser][id][$eq]':
              params.createdByUserId,

            /*
             * ACTUALMENTE EL CAMPO ES completeBy.
             */
            'filters[completeBy][id][$eq]':
              params.completedByUserId,

            'filters[shift][documentId][$eq]':
              params.shiftDocumentId,

            'filters[statusOrder][$eq]':
              params.statusOrder,

            'filters[paymentStatus][$eq]':
              params.paymentStatus,
          },
        }
      );

    return response.data;
  },

  async findOrder(
    documentId:
      string
  ): Promise<EmployeeOrderResponse> {
    const response =
      await api.get<EmployeeOrderResponse>(
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

  async createOrder(
    data:
      EmployeeOrderCreateData
  ): Promise<EmployeeOrderResponse> {
    const response =
      await api.post<EmployeeOrderResponse>(
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

  async patchOrder(
    documentId:
      string,

    data:
      EmployeeOrderUpdateData
  ): Promise<EmployeeOrderResponse> {
    const response =
      await api.patch<EmployeeOrderResponse>(
        `${ORDER_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          data,
        }
      );

    return response.data;
  },

  async removeOrder(
    documentId:
      string
  ) {
    await api.delete(
      `${ORDER_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },

  // ===================================================
  // ORDER ITEM
  // ===================================================

  async createOrderItem(
    data:
      EmployeeOrderItemCreateData
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

  async removeOrderItem(
    documentId:
      string
  ) {
    await api.delete(
      `${ORDER_ITEM_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },

  // ===================================================
  // PAYMENTS
  // ===================================================

  async findPayments(
    params:
      EmployeePaymentQueryParams = {}
  ): Promise<EmployeePaymentListResponse> {
    const response =
      await api.get<EmployeePaymentListResponse>(
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
              'paidAt:desc',

            'filters[order][restaurant][documentId][$eq]':
              params.restaurantDocumentId,

            'filters[order][documentId][$eq]':
              params.orderDocumentId,

            'filters[processedBy][id][$eq]':
              params.processedById,

            'filters[shift][documentId][$eq]':
              params.shiftDocumentId,

            'filters[statusPayment][$eq]':
              params.statusPayment,
          },
        }
      );

    return response.data;
  },

  async findPayment(
    documentId:
      string
  ): Promise<EmployeePaymentResponse> {
    const response =
      await api.get<EmployeePaymentResponse>(
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

  async createPayment(
    data:
      EmployeePaymentCreateData
  ): Promise<EmployeePaymentResponse> {
    const response =
      await api.post<EmployeePaymentResponse>(
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
  // RECEIPTS
  // ===================================================

  async findReceipts(
    issuedById?:
      number,

    orderDocumentId?:
      string
  ): Promise<EmployeeReceiptListResponse> {
    const response =
      await api.get<EmployeeReceiptListResponse>(
        RECEIPT_URL,
        {
          params: {
            status:
              'draft',

            populate:
              '*',

            'pagination[page]':
              1,

            'pagination[pageSize]':
              100,

            sort:
              'issuedAt:desc',

            'filters[issuedBy][id][$eq]':
              issuedById,

            'filters[order][documentId][$eq]':
              orderDocumentId,
          },
        }
      );

    return response.data;
  },

  async findReceipt(
    documentId:
      string
  ): Promise<EmployeeReceiptResponse> {
    const response =
      await api.get<EmployeeReceiptResponse>(
        `${RECEIPT_URL}/${encodeURIComponent(
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

  async createReceipt(
    data:
      EmployeeReceiptCreateData
  ): Promise<EmployeeReceiptResponse> {
    const response =
      await api.post<EmployeeReceiptResponse>(
        RECEIPT_URL,
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
};