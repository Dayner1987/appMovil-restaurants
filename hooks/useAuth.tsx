import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

import { authService } from '@/services/auth.service';

import type {
  AppUser,
  LoginCredentials,
  RegisterData,
  RestaurantRegisterData,
  RestaurantRegisterResponse,
} from '@/types/auth.types';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AppUser>;
  register: (data: RegisterData) => Promise<AppUser>;
  logout: () => Promise<void>;
  registerRestaurant: (
    data: RestaurantRegisterData
  ) => Promise<RestaurantRegisterResponse>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const jwt = await authService.getToken();

        if (!jwt) {
          return;
        }

        const currentUser = await authService.getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        // Una falla de conexión no debe borrar el token guardado.
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          await authService.logout();
        }

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void restoreSession().catch(() => {
      if (active) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  async function login(
    credentials: LoginCredentials
  ): Promise<AppUser> {
    const { user: currentUser } = await authService.login(credentials);

    setUser(currentUser);
    return currentUser;
  }

  async function register(data: RegisterData): Promise<AppUser> {
    const { user: currentUser } = await authService.register(data);

    setUser(currentUser);
    return currentUser;
  }

  async function registerRestaurant(
    data: RestaurantRegisterData
  ): Promise<RestaurantRegisterResponse> {
    return authService.registerRestaurant(data);
  }

  async function logout(): Promise<void> {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        registerRestaurant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }

  return context;
}