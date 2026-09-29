// types/orders.types.ts

// =====================================================
// ENUMS
// =====================================================

export type OrderType =
  | 'ONLINE'
  | 'COUNTER'
  | 'PICKUP';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Estado general de pago de la ORDEN.
 *
 * Es diferente de Payment.statusPayment.
 */
export type OrderPaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'PARTIAL'
  | 'FAILED'
  | 'REFUNDED';

// =====================================================
// RESTAURANT
// =====================================================

export interface OrderRestaurant {
  id: number;

  documentId?: string;

  name?: string;

  slug?:
    | string
    | null;

  description?:
    | string
    | null;

  email?: string;

  address?:
    | string
    | null;

  phone?:
    | string
    | null;

  nit?:
    | string
    | null;

  statusRes?:
    | string
    | null;
}

// =====================================================
// ORDER ITEM RESUMIDO
//
// Es el OrderItem que llega dentro de:
// Order.order_items
//
// El tipo completo está en:
// types/order-item.types.ts
// =====================================================

export interface OrderItemSummary {
  id: number;

  documentId?: string;

  quantity: number;

  unitPrice: number;

  discount:
    | number
    | null;

  subtotal: number;

  productName:
    | string
    | null;

  createdAt?: string;

  updatedAt?: string;

  publishedAt?:
    | string
    | null;
}

// =====================================================
// PAYMENT RESUMIDO
//
// Es el Payment que llega dentro de:
// Order.payments
//
// El tipo completo está en:
// types/payment.types.ts
// =====================================================

export interface OrderPaymentSummary {
  id: number;

  documentId?: string;

  amount: number;

  method?:
    | string
    | null;

  statusPayment?:
    | string
    | null;

  transactionReference?:
    | string
    | null;

  paidAt:
    | string
    | null;

  createdAt?: string;

  updatedAt?: string;

  publishedAt?:
    | string
    | null;
}

// =====================================================
// USER
// =====================================================

export interface OrderUser {
  id: number;

  documentId?: string;

  username?: string;

  email?: string;

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
}

// =====================================================
// ORDER
// =====================================================

export interface Order {
  id: number;

  documentId: string;

  orderCode: string;

  /**
   * No es required en Strapi.
   */
  orderType:
    | OrderType
    | null;

  /**
   * No es required en Strapi.
   */
  statusOrder:
    | OrderStatus
    | null;

  /**
   * Actualmente comprobamos incluso:
   * paymentStatus: null
   */
  paymentStatus:
    | OrderPaymentStatus
    | null;

  subtotal: number;

  discount:
    | number
    | null;

  total: number;

  orderedAt: string;

  completeAt:
    | string
    | null;

  restaurant?:
    | OrderRestaurant
    | null;

  order_items?:
    OrderItemSummary[];

  payments?:
    OrderPaymentSummary[];

  /**
   * Strapi:
   * manyToMany con users-permissions User.
   */
  users?:
    OrderUser[];

  createdAt: string;

  updatedAt: string;

  publishedAt:
    | string
    | null;
}

// =====================================================
// CREATE
// =====================================================

export interface CreateOrderData {
  /**
   * Required en Strapi.
   */
  orderCode: string;

  orderType?:
    | OrderType
    | null;

  statusOrder?:
    | OrderStatus
    | null;

  paymentStatus?:
    | OrderPaymentStatus
    | null;

  /**
   * Required en Strapi.
   */
  subtotal: number;

  discount?:
    | number
    | null;

  /**
   * Required en Strapi.
   */
  total: number;

  /**
   * Required en Strapi.
   */
  orderedAt: string;

  completeAt?:
    | string
    | null;

  /**
   * documentId del Restaurant.
   */
  restaurant?:
    | string
    | number
    | null;

  /**
   * Usuarios relacionados a la orden.
   */
  users?: (
    | string
    | number
  )[];
}

// =====================================================
// UPDATE
// =====================================================

export interface UpdateOrderData {
  orderCode?: string;

  orderType?:
    | OrderType
    | null;

  statusOrder?:
    | OrderStatus
    | null;

  paymentStatus?:
    | OrderPaymentStatus
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
    | string
    | number
    | null;

  users?: (
    | string
    | number
  )[];
}

// =====================================================
// PAGINATION
// =====================================================

export interface OrderPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface OrderListResponse {
  data:
    Order[];

  meta: {
    pagination:
      OrderPagination;
  };
}

export interface OrderResponse {
  data:
    Order;

  meta?: Record<
    string,
    unknown
  >;
}

// =====================================================
// QUERY
// =====================================================

export interface OrderQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  orderCode?: string;

  orderType?:
    OrderType;

  statusOrder?:
    OrderStatus;

  paymentStatus?:
    OrderPaymentStatus;

  /**
   * IMPORTANTE:
   *
   * Usamos documentId del restaurante.
   *
   * NO el id numérico porque con
   * Draft & Publish cambia.
   */
  restaurantDocumentId?:
    string;

  userId?:
    | number
    | string;

  orderedFrom?:
    string;

  orderedTo?:
    string;

  completedFrom?:
    string;

  completedTo?:
    string;
}