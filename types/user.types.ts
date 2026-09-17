export type AppRole =
  | 'admin'
  | 'restaurant'
  | 'employee'
  | 'client'
  | 'authenticated'
  | string;

export interface UserRole {
  id: number;
  name: string;
  description?: string | null;
  type: AppRole;
}

export interface UserImage {
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

export interface UserRestaurant {
  id: number;
  documentId?: string;
  name?: string;
  email?: string;
}

export interface UserOrder {
  id: number;
  documentId?: string;
  orderCode?: string;
  total?: number;
  statusOrder?: string;
}

export interface UserRestaurantApplication {
  id: number;
  documentId?: string;
  proposedRestaurantName?: string;
  status?: 'pending' | 'approved' | 'rejected' | string;
  rejectionReason?: string | null;
}

export interface AppUser {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  provider?: string | null;
  confirmed: boolean;
  blocked: boolean;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  ci?: string | null;
  phone?: string | null;
  role?: UserRole | null;
  avatar?: UserImage | null;
  restaurant?: UserRestaurant | null;
  orders?: UserOrder[];
  restaurant_application?: UserRestaurantApplication | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface UpdateMyProfileData {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  secondLastName?: string | null;
  phone?: string | null;
  ci?: string | null;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  secondLastName?: string | null;
  ci?: string | null;
  phone?: string | null;
  confirmed?: boolean;
  blocked?: boolean;
  role?: number | null;
  restaurant?: number | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface UserListResponse {
  data: AppUser[];
  meta: {
    pagination: UserPagination;
  };
}

export interface UserResponse {
  data: AppUser;
  meta?: Record<string, unknown>;
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
  username?: string;
  email?: string;
  blocked?: boolean;
  confirmed?: boolean;
  roleId?: number | string;
  restaurantId?: number | string;
}