import axios from 'axios';

import { authStorage } from '@/config/auth.storage';

export const api = axios.create({
  baseURL: 'http://localhost:1337',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await authStorage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await authStorage.clearSession();
    }

    return Promise.reject(error);
  }
);