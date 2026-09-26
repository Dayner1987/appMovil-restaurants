// types/orders.types.ts

export type OrderType =
  | 'ONLINE'
  | 'COUNTER'
  | 'DELIVERY'
  | 'PICKUP';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus =
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

  logo?:
    | {
        id: number;
        documentId?: string;
        url?: string;
        name?: string;
      }
    | null;
}

// =====================================================
// ORDER ITEM
// =====================================================

export interface OrderItem {
  id: number;

  documentId?: string;

  quantity?: number;

  unitPrice?: number;

  discount?: number;

  subtotal?: number;

  productName?:
    | string
    | null;
}

// =====================================================
// PAYMENT
// =====================================================

export interface OrderPayment {
  id: number;

  documentId?: string;

  amount?: number;

  method?: string;

  statusPayment?:
    PaymentStatus;

  transactionReference?:
    | string
    | null;

  paidAt?:
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

  lastName?:
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

  orderType:
    OrderType;

  statusOrder:
    OrderStatus;

  paymentStatus:
    PaymentStatus;

  subtotal: number;

  discount: number;

  total: number;

  orderedAt: string;

  completeAt:
    | string
    | null;

  restaurant?:
    | OrderRestaurant
    | null;

  order_items?:
    OrderItem[];

  payments?:
    OrderPayment[];

  /*
   * En Strapi es manyToMany.
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
  orderType:
    OrderType;

  subtotal: number;

  discount?: number;

  total: number;

  restaurant?:
    | number
    | string
    | null;

  users?:
    (
      | number
      | string
    )[];

  order_items?:
    (
      | number
      | string
    )[];

  payments?:
    (
      | number
      | string
    )[];
}

// =====================================================
// UPDATE
// =====================================================

export interface UpdateOrderData {
  orderCode?: string;

  orderType?:
    OrderType;

  statusOrder?:
    OrderStatus;

  paymentStatus?:
    PaymentStatus;

  subtotal?: number;

  discount?: number;

  total?: number;

  orderedAt?: string;

  completeAt?:
    | string
    | null;

  restaurant?:
    | number
    | string
    | null;

  users?:
    (
      | number
      | string
    )[];

  order_items?:
    (
      | number
      | string
    )[];

  payments?:
    (
      | number
      | string
    )[];
}

// =====================================================
// PAGINACIÓN
// =====================================================

export interface OrderPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface OrderListResponse {
  data: Order[];

  meta: {
    pagination:
      OrderPagination;
  };
}

export interface OrderResponse {
  data: Order;

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
    PaymentStatus;

  restaurantId?:
    | number
    | string;

  userId?:
    | number
    | string;
}

export interface CreateOrderData {
  orderCode?: string;

  orderType:
    OrderType;

  statusOrder?:
    OrderStatus;

  paymentStatus?:
    PaymentStatus;

  subtotal: number;

  discount?: number;

  total: number;

  orderedAt?: string;

  completeAt?:
    | string
    | null;

  restaurant?:
    | number
    | string
    | null;

  users?:
    (
      | number
      | string
    )[];

  order_items?:
    (
      | number
      | string
    )[];

  payments?:
    (
      | number
      | string
    )[];
}