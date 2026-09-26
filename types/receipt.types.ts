// types/receipt.types.ts

export interface ReceiptOrder {
  id: number;

  documentId?: string;

  orderCode?: string;

  orderType?: string;

  statusOrder?: string;

  paymentStatus?: string;

  subtotal?: number;

  discount?: number;

  total?: number;
}

// =====================================================
// RECEIPT
// =====================================================

export interface Receipt {
  id: number;

  documentId: string;

  receiptNumber: string;

  issuedAt: string;

  subtotal: number;

  discount:
    | number
    | null;

  total: number;

  completeName:
    | string
    | null;

  ci:
    | string
    | null;

  order?:
    | ReceiptOrder
    | null;

  createdAt: string;

  updatedAt: string;

  publishedAt:
    | string
    | null;
}

// =====================================================
// CREATE
// =====================================================

export interface CreateReceiptData {
  receiptNumber: string;

  issuedAt: string;

  subtotal: number;

  discount?:
    | number
    | null;

  total: number;

  completeName?:
    | string
    | null;

  ci?:
    | string
    | null;

  order?:
    | number
    | string
    | null;
}

// =====================================================
// UPDATE
// =====================================================

export type UpdateReceiptData =
  Partial<CreateReceiptData>;

// =====================================================
// PAGINACIÓN
// =====================================================

export interface ReceiptPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface ReceiptListResponse {
  data: Receipt[];

  meta: {
    pagination:
      ReceiptPagination;
  };
}

export interface ReceiptResponse {
  data: Receipt;

  meta?: Record<
    string,
    unknown
  >;
}

// =====================================================
// QUERY
// =====================================================

export interface ReceiptQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  orderId?:
    | number
    | string;

  receiptNumber?: string;

  ci?: string;
}