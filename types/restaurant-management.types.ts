// types/restaurant-management.types.ts
//
// Tipos exclusivos para la gestión del restaurante autenticado.
// No incluyen password en las respuestas del empleado.

export type RestaurantManagementStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'REJECTED'
  | string;

export interface RestaurantManagementRole {
  id: number;
  documentId?: string | null;
  name: string;
  type: string;
  description?: string | null;
}

export interface RestaurantManagementRestaurantRef {
  id: number;
  documentId: string;
  name: string;
}

export interface RestaurantManagementEmployee {
  id: number;
  documentId: string;

  username: string;
  email: string;

  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;

  ci: string | null;
  phone: string | null;

  confirmed: boolean;
  blocked: boolean;

  role: RestaurantManagementRole | null;
  restaurant: RestaurantManagementRestaurantRef | null;

  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface CreateRestaurantManagementEmployeeInput {
  username: string;
  email: string;
  password: string;

  firstName: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;

  ci?: string | null;
  phone?: string | null;
}

export interface UpdateRestaurantManagementEmployeeInput {
  username: string;
  email: string;

  firstName: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;

  ci?: string | null;
  phone?: string | null;
}

export interface ChangeRestaurantEmployeePasswordInput {
  password: string;
  passwordConfirmation: string;
}

export interface RestaurantManagementEmployeeResponse {
  message?: string;
  data: RestaurantManagementEmployee;
  meta?: Record<string, unknown>;
}

export interface RestaurantManagementEmployeeListResponse {
  data: RestaurantManagementEmployee[];
  meta?: {
    total?: number;
    pagination?: {
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total?: number;
    };
    [key: string]: unknown;
  };
}

export interface RestaurantManagementMedia {
  id: number;
  documentId?: string | null;
  name?: string | null;
  alternativeText?: string | null;
  caption?: string | null;

  width?: number | null;
  height?: number | null;

  formats?: Record<string, {
    name?: string;
    hash?: string;
    ext?: string;
    mime?: string;
    path?: string | null;
    width?: number;
    height?: number;
    size?: number;
    sizeInBytes?: number;
    url?: string;
  } | undefined> | null;

  hash?: string | null;
  ext?: string | null;
  mime?: string | null;
  size?: number | null;
  sizeInBytes?: number | null;

  url?: string | null;
  previewUrl?: string | null;

  provider?: string | null;
  provider_metadata?: unknown;

  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

export interface ManagedRestaurant {
  id: number;
  documentId: string;

  name: string;
  slug: string | null;
  description: string | null;
  email: string;
  address: string | null;
  phone: string | null;
  nit: string | null;

  statusRes: RestaurantManagementStatus;

  logo: RestaurantManagementMedia | null;
  QRImage: RestaurantManagementMedia | null;

  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface UpdateManagedRestaurantInput {
  name?: string;
  description?: string | null;
  email?: string;
  address?: string | null;
  phone?: string | null;
  nit?: string | null;
}

export interface RestaurantManagementMediaUpload {
  uri: string;
  fileName?: string;
  mimeType?: string;
}
