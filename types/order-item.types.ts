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
  description?: string;
  price?: number;
  image?: unknown;

  [key: string]: unknown;
}


export interface OrderItem {
  id: number;
  documentId: string;

  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;

  // Nombre histórico del producto vendido
  productName: string | null;

  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;

  // Relaciones
  order?: OrderItemOrder | null;
  product?: OrderItemProduct | null;
}


export interface CreateOrderItemData {
  quantity: number;

  unitPrice: number;

  discount?: number;

  subtotal: number;

  // Se guarda como respaldo del nombre del producto
  productName?: string | null;

  order?: number | string | null;

  product?: number | string | null;
}


export type UpdateOrderItemData = Partial<CreateOrderItemData>;



export interface OrderItemPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}


export interface OrderItemListResponse {
  data: OrderItem[];

  meta: {
    pagination: OrderItemPagination;
  };
}


export interface OrderItemResponse {
  data: OrderItem;

  meta?: Record<string, unknown>;
}


export interface OrderItemQueryParams {
  page?: number;

  pageSize?: number;

  sort?: string | string[];

  orderId?: number | string;

  productId?: number | string;
}