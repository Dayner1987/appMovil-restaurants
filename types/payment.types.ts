// types/payment.types.ts

export type PaymentMethod =
  | 'QR'
  | 'CASH'
  | 'CARD'
  | 'TRANSFER'
  | string;

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | string;

// =====================================================
// RESTAURANT
// =====================================================

export interface PaymentRestaurant {
  id: number;

  documentId?: string;

  name?: string;

  email?: string;

  phone?: string | null;

  logo?:
    | {
        id: number;
        documentId?: string;
        name?: string;
        url?: string;
      }
    | null;
}

// =====================================================
// USER
// =====================================================

export interface PaymentUser {
  id: number;

  documentId?: string;

  firstName?:
    | string
    | null;

  middleName?:
    | string
    | null;

  lastName?:
    | string
    | null;

  secondLastName?:
    | string
    | null;

  username?: string;

  email?: string;
}

// =====================================================
// ORDER
// =====================================================

export interface PaymentOrder {
  id: number;

  documentId?: string;

  orderCode?: string;

  orderType?: string;

  statusOrder?: string;

  paymentStatus?: string;

  subtotal?: number;

  discount?: number;

  total?: number;

  restaurant?:
    | PaymentRestaurant
    | null;

  users?: PaymentUser[];
}

// =====================================================
// PAYMENT
// =====================================================

export interface Payment {
  id: number;

  documentId: string;

  amount: number;

  method:
    PaymentMethod;

  statusPayment:
    PaymentStatus;

  transactionReference:
    | string
    | null;

  paidAt: string;

  order?:
    | PaymentOrder
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

export interface CreatePaymentData {
  amount: number;

  method:
    PaymentMethod;

  statusPayment?:
    PaymentStatus;

  transactionReference?:
    | string
    | null;

  paidAt: string;

  order?:
    | number
    | string
    | null;
}

// =====================================================
// UPDATE
// =====================================================

export type UpdatePaymentData =
  Partial<CreatePaymentData>;

// =====================================================
// PAGINACIÓN
// =====================================================

export interface PaymentPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface PaymentListResponse {
  data: Payment[];

  meta: {
    pagination:
      PaymentPagination;
  };
}

export interface PaymentResponse {
  data: Payment;

  meta?: Record<
    string,
    unknown
  >;
}

// =====================================================
// QUERY
// =====================================================

export interface PaymentQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  orderId?:
    | number
    | string;

  statusPayment?:
    PaymentStatus;

  method?:
    PaymentMethod;
}