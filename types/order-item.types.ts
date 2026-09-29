// types/order-item.types.ts

import type {
  OrderPaymentStatus,
  OrderStatus,
  OrderType,
} from './orders.types';

// =====================================================
// ORDER
// =====================================================

export interface OrderItemOrder {
  id: number;

  documentId?: string;

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
}

// =====================================================
// PRODUCT IMAGE
// =====================================================

export interface OrderItemProductImage {
  id: number;

  documentId?: string;

  name?: string;

  url?: string;
}

// =====================================================
// PRODUCT
// =====================================================

export interface OrderItemProduct {
  id: number;

  documentId?: string;

  name?: string;

  slug?:
    | string
    | null;

  description?:
    | string
    | null;

  price?: number;

  stock?:
    | number
    | null;

  isAvailable?: boolean;

  mainImage?:
    | OrderItemProductImage
    | null;
}

// =====================================================
// ORDER ITEM
// =====================================================

export interface OrderItem {
  id: number;

  documentId: string;

  /**
   * Required en Strapi.
   */
  quantity: number;

  /**
   * Required en Strapi.
   *
   * Este precio debe conservar el precio
   * utilizado al momento de realizar la orden.
   */
  unitPrice: number;

  /**
   * No es required en Strapi.
   */
  discount:
    | number
    | null;

  /**
   * Required en Strapi.
   */
  subtotal: number;

  /**
   * Nombre histórico del producto.
   *
   * Nos permite conservar el nombre aunque
   * Product cambie posteriormente.
   */
  productName:
    | string
    | null;

  order?:
    | OrderItemOrder
    | null;

  product?:
    | OrderItemProduct
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

export interface CreateOrderItemData {
  quantity: number;

  unitPrice: number;

  discount?:
    | number
    | null;

  subtotal: number;

  productName?:
    | string
    | null;

  /**
   * Normalmente enviaremos:
   * Order.documentId
   */
  order?:
    | number
    | string
    | null;

  /**
   * Normalmente enviaremos:
   * Product.documentId
   */
  product?:
    | number
    | string
    | null;
}

// =====================================================
// UPDATE
// =====================================================

export type UpdateOrderItemData =
  Partial<CreateOrderItemData>;

// =====================================================
// PAGINATION
// =====================================================

export interface OrderItemPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface OrderItemListResponse {
  data:
    OrderItem[];

  meta: {
    pagination:
      OrderItemPagination;
  };
}

export interface OrderItemResponse {
  data:
    OrderItem;

  meta?: Record<
    string,
    unknown
  >;
}

// =====================================================
// QUERY
// =====================================================

export interface OrderItemQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  /**
   * documentId de Order.
   */
  orderDocumentId?:
    string;

  /**
   * documentId de Product.
   */
  productDocumentId?:
    string;
}