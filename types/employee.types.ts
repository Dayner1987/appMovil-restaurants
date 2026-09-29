// types/employee.types.ts

import type {
  Order,
  OrderStatus,
  OrderType,
} from './orders.types';

import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './payment.types';

import type {
  Receipt,
} from './receipt.types';

// =====================================================
// ROLE
// =====================================================

export interface EmployeeRole {
  id: number;

  documentId?: string;

  name: string;

  type: string;

  description?:
    | string
    | null;
}

// =====================================================
// RESTAURANT
// =====================================================

export interface EmployeeRestaurant {
  id: number;

  documentId: string;

  name: string;

  slug?: string;

  email?: string;

  phone?:
    | string
    | null;

  address?:
    | string
    | null;

  nit?:
    | string
    | null;

  statusRes?: string;
}

// =====================================================
// USER REFERENCE
// =====================================================

export interface EmployeeUserReference {
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

  ci?:
    | string
    | null;

  phone?:
    | string
    | null;
}

// =====================================================
// RESTAURANT EMPLOYEE
// =====================================================

export interface RestaurantEmployee
  extends EmployeeUserReference {
  username: string;

  email: string;

  confirmed: boolean;

  blocked: boolean;

  role:
    | EmployeeRole
    | null;

  restaurant:
    | EmployeeRestaurant
    | null;

  createdAt: string;

  updatedAt: string;
}

// =====================================================
// CREATE EMPLOYEE
// =====================================================

export interface CreateRestaurantEmployeeData {
  username: string;

  email: string;

  password: string;

  firstName: string;

  middleName?:
    | string
    | null;

  lastName: string;

  secondLastName?:
    | string
    | null;

  ci?:
    | string
    | null;

  phone?:
    | string
    | null;
}

// =====================================================
// UPDATE EMPLOYEE
// =====================================================

export interface UpdateRestaurantEmployeeData {
  username: string;

  email: string;

  firstName: string;

  middleName?:
    | string
    | null;

  lastName: string;

  secondLastName?:
    | string
    | null;

  ci?:
    | string
    | null;

  phone?:
    | string
    | null;
}

// =====================================================
// EMPLOYEE RESPONSES
// =====================================================

export interface RestaurantEmployeeResponse {
  message?: string;

  data:
    RestaurantEmployee;

  meta?: Record<
    string,
    unknown
  >;
}

export interface RestaurantEmployeeListResponse {
  data:
    RestaurantEmployee[];

  meta: {
    total:
      number;
  };
}

export interface EmployeePasswordData {
  password:
    string;

  passwordConfirmation:
    string;
}

export interface EmployeeMessageResponse {
  message:
    string;
}

// =====================================================
// SHIFT
// =====================================================

export type EmployeeShiftStatus =
  | 'OPEN'
  | 'CLOSED';

// =====================================================
// SHIFT REFERENCE
// =====================================================

export interface EmployeeShiftReference {
  id: number;

  documentId: string;

  startedAt: string;

  endedAt:
    | string
    | null;

  statusEm:
    EmployeeShiftStatus;
}

// =====================================================
// ORDER WITH EMPLOYEE RELATIONS
// =====================================================

export type EmployeeOrder =
  Order & {
    customer?:
      | EmployeeUserReference
      | null;

    createdByUser?:
      | EmployeeUserReference
      | null;

    /*
     * Nombre ACTUAL del backend.
     */
    completeBy?:
      | EmployeeUserReference
      | null;

    /*
     * Lo dejamos preparado por si luego
     * renombras completeBy -> completedBy.
     */
    completedBy?:
      | EmployeeUserReference
      | null;

    shift?:
      | EmployeeShiftReference
      | null;
  };

// =====================================================
// PAYMENT WITH EMPLOYEE RELATIONS
// =====================================================

export type EmployeePayment =
  Omit<
    Payment,
    'order'
  > & {
    order?:
      | {
          id: number;

          documentId: string;

          orderCode?: string;

          statusOrder?: string;

          paymentStatus?:
            | string
            | null;

          total?: number;
        }
      | null;

    processedBy?:
      | EmployeeUserReference
      | null;

    shift?:
      | EmployeeShiftReference
      | null;
  };

// =====================================================
// RECEIPT WITH EMPLOYEE RELATIONS
// =====================================================

export type EmployeeReceipt =
  Omit<
    Receipt,
    'order'
  > & {
    order?:
      | {
          id?: number;

          documentId?: string;

          orderCode?: string;
        }
      | null;

    issuedBy?:
      | EmployeeUserReference
      | null;
  };

// =====================================================
// EMPLOYEE SHIFT
// =====================================================

export interface EmployeeShift {
  id: number;

  documentId: string;

  startedAt: string;

  endedAt:
    | string
    | null;

  statusEm:
    EmployeeShiftStatus;

  employee?:
    | EmployeeUserReference
    | null;

  restaurant?:
    | EmployeeRestaurant
    | null;

  /*
   * Nombres que queremos usar en frontend.
   */
  orders?:
    EmployeeOrder[];

  payments?:
    EmployeePayment[];

  /*
   * Nombres ACTUALES de Strapi.
   *
   * Los mantenemos temporalmente para
   * no romper mientras renombras las relaciones.
   */
  employeeShift?:
    EmployeeOrder[];

  employeeShift2?:
    EmployeePayment[];

  createdAt: string;

  updatedAt: string;

  publishedAt:
    | string
    | null;
}

// =====================================================
// SHIFT DATA
// =====================================================

export interface CreateEmployeeShiftData {
  startedAt:
    string;

  statusEm?:
    EmployeeShiftStatus;

  employee:
    number;

  restaurant:
    string;
}

export interface UpdateEmployeeShiftData {
  endedAt?:
    | string
    | null;

  statusEm?:
    EmployeeShiftStatus;
}

// =====================================================
// SHIFT QUERY
// =====================================================

export interface EmployeeShiftQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  employeeId?:
    number;

  restaurantDocumentId?:
    string;

  statusEm?:
    EmployeeShiftStatus;
}

// =====================================================
// SHIFT RESPONSES
// =====================================================

export interface EmployeeShiftResponse {
  data:
    EmployeeShift;

  meta?: Record<
    string,
    unknown
  >;
}

export interface EmployeeShiftListResponse {
  data:
    EmployeeShift[];

  meta: {
    pagination: {
      page:
        number;

      pageSize:
        number;

      pageCount:
        number;

      total:
        number;
    };
  };
}

// =====================================================
// ORDER PAYMENT STATUS
// =====================================================

export type EmployeeOrderPaymentStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

// =====================================================
// CREATE ORDER LINE
// =====================================================

export interface EmployeeOrderLine {
  quantity:
    number;

  unitPrice:
    number;

  discount?:
    number;

  productName:
    string;

  productDocumentId?:
    string;
}

// =====================================================
// CREATE ORDER INPUT
// =====================================================

export interface CreateEmployeeOrderInput {
  orderType:
    OrderType;

  customerId?:
    number;

  lines:
    EmployeeOrderLine[];

  generalDiscount?:
    number;
}

// =====================================================
// ORDER QUERY
// =====================================================

export interface EmployeeOrderQueryParams {
  page?: number;

  pageSize?: number;

  restaurantDocumentId?:
    string;

  createdByUserId?:
    number;

  completedByUserId?:
    number;

  shiftDocumentId?:
    string;

  statusOrder?:
    OrderStatus;

  paymentStatus?:
    EmployeeOrderPaymentStatus;
}

// =====================================================
// PAYMENT INPUT
// =====================================================

export interface RegisterEmployeePaymentInput {
  orderDocumentId:
    string;

  amount:
    number;

  method:
    PaymentMethod;

  statusPayment?:
    PaymentStatus;

  transactionReference?:
    | string
    | null;
}

// =====================================================
// PAYMENT QUERY
// =====================================================

export interface EmployeePaymentQueryParams {
  page?: number;

  pageSize?: number;

  restaurantDocumentId?:
    string;

  orderDocumentId?:
    string;

  processedById?:
    number;

  shiftDocumentId?:
    string;

  statusPayment?:
    PaymentStatus;
}

// =====================================================
// RECEIPT INPUT
// =====================================================

export interface CreateEmployeeReceiptInput {
  orderDocumentId:
    string;

  completeName?:
    | string
    | null;

  ci?:
    | string
    | null;
}