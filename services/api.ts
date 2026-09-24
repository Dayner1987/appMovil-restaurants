// services/api.ts

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
    const token =
      await authStorage.getToken();

    // ===================================================
    // JWT
    // ===================================================

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // ===================================================
    // FORMDATA
    // ===================================================
    // Cuando enviamos archivos NO debemos enviar
    // Content-Type: application/json.
    //
    // Axios / navegador debe generar:
    //
    // multipart/form-data; boundary=...
    // ===================================================

    if (
      typeof FormData !== 'undefined' &&
      config.data instanceof FormData
    ) {
      if (
        typeof config.headers.delete ===
        'function'
      ) {
        config.headers.delete(
          'Content-Type'
        );
      } else {
        delete config.headers[
          'Content-Type'
        ];
      }
    }

    return config;
  },

  async (error) => {
    return Promise.reject(
      error
    );
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (
      error.response?.status ===
      401
    ) {
      await authStorage.clearSession();
    }

    return Promise.reject(
      error
    );
  }
);