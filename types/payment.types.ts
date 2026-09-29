// types/payment.types.ts

// =====================================================
// ENUMS
// =====================================================

export type PaymentMethod =
  | 'CASH'
  | 'QR'
  | 'CARD'
  | 'TRANSFER';

export type PaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED';

// =====================================================
// RESTAURANT
// =====================================================

export interface PaymentRestaurant {
  id: number;

  documentId?: string;

  name?: string;

  email?: string;

  phone?:
    | string
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

  orderType?:
    | string
    | null;

  statusOrder?:
    | string
    | null;

  paymentStatus?:
    | string
    | null;

  subtotal?: number;

  discount?:
    | number
    | null;

  total?: number;

  orderedAt?: string;

  completeAt?:
    | string
    | null;

  restaurant?:
    | PaymentRestaurant
    | null;

  users?:
    PaymentUser[];
}

// =====================================================
// PAYMENT
// =====================================================

export interface Payment {
  id: number;

  documentId: string;

  amount: number;

  /*
   * En Strapi puede venir null.
   */
  method:
    | PaymentMethod
    | null;

  /*
   * Valores reales del backend:
   *
   * PENDING
   * APPROVED
   * REJECTED
   * REFUNDED
   *
   * También puede venir null.
   */
  statusPayment:
    | PaymentStatus
    | null;

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

  method?:
    | PaymentMethod
    | null;

  statusPayment?:
    | PaymentStatus
    | null;

  transactionReference?:
    | string
    | null;

  paidAt: string;

  /*
   * Normalmente enviaremos:
   * Order.documentId
   */
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
// PAGINATION
// =====================================================

export interface PaymentPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface PaymentListResponse {
  data:
    Payment[];

  meta: {
    pagination:
      PaymentPagination;
  };
}

export interface PaymentResponse {
  data:
    Payment;

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

  /*
   * Payment -> Order
   */
  orderDocumentId?:
    string;

  /*
   * Payment -> Order -> Restaurant
   */
  restaurantDocumentId?:
    string;

  statusPayment?:
    PaymentStatus;

  method?:
    PaymentMethod;

  paidFrom?:
    string;

  paidTo?:
    string;
}