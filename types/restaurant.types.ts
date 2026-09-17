export type RestaurantStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'REJECTED'
  | string;

export interface RestaurantImage {
  id: number;
  documentId?: string;
  name?: string;
  url?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  mime?: string;
  size?: number;
}

export interface RestaurantUser {
  id: number;
  documentId?: string;
  username?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface RestaurantCategory {
  id: number;
  documentId?: string;
  name?: string;
  slug?: string;
}

export interface RestaurantProduct {
  id: number;
  documentId?: string;
  name?: string;
  price?: number;
}

export interface RestaurantPromotion {
  id: number;
  documentId?: string;
  name?: string;
}

export interface RestaurantPublication {
  id: number;
  documentId?: string;
  title?: string;
}

export interface RestaurantOrder {
  id: number;
  documentId?: string;
  orderCode?: string;
  total?: number;
  statusOrder?: string;
}

export interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  slug: string | null;
  description: string | null;
  email: string;
  address: string | null;
  phone: string | null;
  nit: string | null;
  statusRes: RestaurantStatus;
  logo: RestaurantImage | null;
  coverImage: RestaurantImage | null;
  users?: RestaurantUser[];
  categories?: RestaurantCategory[];
  products?: RestaurantProduct[];
  promotions?: RestaurantPromotion[];
  publications?: RestaurantPublication[];
  orders?: RestaurantOrder[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CreateRestaurantData {
  name: string;
  slug?: string | null;
  description?: string | null;
  email: string;
  address?: string | null;
  phone?: string | null;
  nit?: string | null;
  statusRes?: RestaurantStatus;
  logo?: number | null;
  coverImage?: number | null;
  users?: number[];
  categories?: number[];
  products?: number[];
  promotions?: number[];
  publications?: number[];
  orders?: number[];
}

export type UpdateRestaurantData = Partial<CreateRestaurantData>;

export interface RestaurantPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface RestaurantListResponse {
  data: Restaurant[];
  meta: {
    pagination: RestaurantPagination;
  };
}

export interface RestaurantResponse {
  data: Restaurant;
  meta?: Record<string, unknown>;
}

export interface RestaurantQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
  statusRes?: RestaurantStatus;
  name?: string;
  email?: string;
}