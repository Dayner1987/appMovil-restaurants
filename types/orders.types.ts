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

export interface OrderRestaurant {
  id: number;
  documentId?: string;
  name?: string;
  email?: string;
  number?: string;
  logoImg?: unknown;
  aditionalLink?: string | null;
}

export interface OrderItem {
  id: number;
  documentId?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  subtotal?: number;
  productName?: string | null;
}

export interface OrderPayment {
  id: number;
  documentId?: string;
  amount?: number;
  method?: string;
  statusPayment?: PaymentStatus;
  paidAt?: string | null;
}

export interface OrderUser {
  id: number;
  documentId?: string;
  username?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface Order {
  id: number;
  documentId: string;
  orderCode: string;
  orderType: OrderType;
  statusOrder: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  total: number;
  orderedAt: string;
  completeAt: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  restaurant?: OrderRestaurant | null;
  order_items?: OrderItem[];
  payments?: OrderPayment[];
  users?: OrderUser | OrderUser[] | null;
}

export interface CreateOrderData {
  orderType: OrderType;
  restaurant?: number | string | null;
  users?: number | string | null;
  order_items?: number[];
}

export interface UpdateOrderData {
  orderType?: OrderType;
  statusOrder?: OrderStatus;
  paymentStatus?: PaymentStatus;
  completeAt?: string | null;
  restaurant?: number | string | null;
  users?: number | string | null;
  order_items?: number[];
}

export interface OrderPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface OrderListResponse {
  data: Order[];
  meta: {
    pagination: OrderPagination;
  };
}

export interface OrderResponse {
  data: Order;
  meta?: Record<string, unknown>;
}

export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
  orderCode?: string;
  orderType?: OrderType;
  statusOrder?: OrderStatus;
  paymentStatus?: PaymentStatus;
}