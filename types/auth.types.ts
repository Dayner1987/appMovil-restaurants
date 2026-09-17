import type { AppUser } from './user.types';

export type { AppUser } from './user.types';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  user: AppUser;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
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
    status: 'pending' | 'approved' | 'rejected' | string;
  };
}