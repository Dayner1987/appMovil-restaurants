// types/order-item.types.ts

export interface OrderItemOrder {
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

export interface OrderItemProduct {
  id: number;

  documentId?: string;

  name?: string;

  slug?: string | null;

  description?:
    | string
    | null;

  price?: number;

  stock?:
    | number
    | null;

  isAvailable?: boolean;

  mainImage?:
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

  documentId: string;

  quantity: number;

  unitPrice: number;

  discount: number;

  subtotal: number;

  /*
   * Nombre histórico del producto vendido.
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

  discount?: number;

  subtotal: number;

  productName?:
    | string
    | null;

  order?:
    | number
    | string
    | null;

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
// PAGINACIÓN
// =====================================================

export interface OrderItemPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface OrderItemListResponse {
  data: OrderItem[];

  meta: {
    pagination:
      OrderItemPagination;
  };
}

export interface OrderItemResponse {
  data: OrderItem;

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

  orderId?:
    | number
    | string;

  productId?:
    | number
    | string;
}