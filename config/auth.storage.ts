import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppUser } from '@/types/user.types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authStorage = {
  async saveSession(jwt: string, user: AppUser): Promise<void> {
    if (!jwt || !user?.id) {
      throw new Error('La respuesta no contiene una sesión válida');
    }

    await AsyncStorage.multiSet([
      [TOKEN_KEY, jwt],
      [USER_KEY, JSON.stringify(user)],
    ]);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async getUser(): Promise<AppUser | null> {
    const stored = await AsyncStorage.getItem(USER_KEY);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AppUser;
    } catch {
      await AsyncStorage.removeItem(USER_KEY);
      return null;
    }
  },

  async saveUser(user: AppUser): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};