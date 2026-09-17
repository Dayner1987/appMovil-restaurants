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
  restaurant?: PaymentRestaurant | null;
  users?: PaymentUser | PaymentUser[] | null;
}



export interface Payment {

  id: number;

  documentId: string;


  amount: number;


  method: PaymentMethod;


  statusPayment: PaymentStatus;


  transactionReference: string | null;


  paidAt: string;


  createdAt: string;

  updatedAt: string;

  publishedAt: string | null;


  // Relación manyToOne con Order
  order?: PaymentOrder | null;

}



export interface CreatePaymentData {


  amount: number;
  method: PaymentMethod;
  statusPayment?: PaymentStatus;
  transactionReference?: string | null;
  paidAt: string;
  order?: number | string | null;

}



export type UpdatePaymentData =
  Partial<CreatePaymentData>;





export interface PaymentPagination {

  page: number;

  pageSize: number;

  pageCount: number;

  total: number;

}




export interface PaymentListResponse {

  data: Payment[];

  meta: {

    pagination: PaymentPagination;

  };

}





export interface PaymentResponse {

  data: Payment;

  meta?: Record<string, unknown>;

}




export interface PaymentQueryParams {

  page?: number;

  pageSize?: number;

  sort?: string | string[];

  orderId?: number | string;

  statusPayment?: PaymentStatus;

  method?: PaymentMethod;

}
export interface PaymentRestaurant {
  id: number;
  documentId?: string;
  name?: string;
  logoImg?: unknown;
}

export interface PaymentUser {
  id: number;
  documentId?: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  secondLastName?: string | null;
  username?: string;
  email?: string;
}