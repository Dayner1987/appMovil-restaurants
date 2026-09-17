export type RestaurantApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | string;

export interface RestaurantApplicationApplicant {
  id: number;
  documentId?: string;
  username?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  blocked?: boolean;
  confirmed?: boolean;
}

export interface RestaurantApplication {
  id: number;
  documentId: string;
  proposedRestaurantName: string;
  status: RestaurantApplicationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  applicant?: RestaurantApplicationApplicant | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface RestaurantRegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  proposedRestaurantName: string;
}

export interface RestaurantRegisterResponse {
  message: string;
  application: {
    id: number;
    documentId: string;
    proposedRestaurantName: string;
    status: RestaurantApplicationStatus;
  };
}

export interface UpdateRestaurantApplicationData {
  status?: RestaurantApplicationStatus;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
}

export interface RestaurantApplicationPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface RestaurantApplicationListResponse {
  data: RestaurantApplication[];
  meta: {
    pagination: RestaurantApplicationPagination;
  };
}

export interface RestaurantApplicationResponse {
  data: RestaurantApplication;
  meta?: Record<string, unknown>;
}

export interface RestaurantApplicationQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
  status?: RestaurantApplicationStatus;
  applicantId?: number | string;
}