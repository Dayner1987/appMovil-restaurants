import { api } from './api';
import { authStorage } from '@/config/auth.storage';

import type {
  AppUser,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RestaurantRegisterData,
  RestaurantRegisterResponse,
} from '@/types/auth.types';

async function fetchCurrentUser(jwt: string): Promise<AppUser> {
  const response = await api.get<AppUser>('/api/users/me', {
    params: {
      populate: 'role',
    },
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  return response.data;
}

async function completeSession(
  response: LoginResponse
): Promise<LoginResponse> {
  const { jwt } = response;

  if (!jwt) {
    throw new Error('El servidor no devolvió el token de acceso');
  }

  const user = await fetchCurrentUser(jwt);

  await authStorage.saveSession(jwt, user);

  return { jwt, user };
}

export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      '/api/auth/local',
      credentials
    );

    return completeSession(response.data);
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      '/api/auth/local/register',
      data
    );

    return completeSession(response.data);
  },

  async getCurrentUser(): Promise<AppUser> {
    const jwt = await authStorage.getToken();

    if (!jwt) {
      throw new Error('No existe una sesión activa');
    }

    const user = await fetchCurrentUser(jwt);

    await authStorage.saveUser(user);

    return user;
  },

  async getStoredUser(): Promise<AppUser | null> {
    return authStorage.getUser();
  },

  async getToken(): Promise<string | null> {
    return authStorage.getToken();
  },

  async logout(): Promise<void> {
    await authStorage.clearSession();
  },

  async registerRestaurant(
    data: RestaurantRegisterData
  ): Promise<RestaurantRegisterResponse> {
    const response = await api.post<RestaurantRegisterResponse>(
      '/api/restaurant-applications/register',
      data
    );

    return response.data;
  },
};