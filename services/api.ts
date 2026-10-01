// services/api.ts

import axios from 'axios';

import {
  authStorage,
} from '@/config/auth.storage';

// =====================================================
// API URL
// =====================================================
//
// IMPORTANTE:
//
// En Expo Go:
// localhost = celular
//
// Por eso debemos usar la IP local
// de la computadora donde corre Strapi.
//
// Metro actualmente está usando:
// 10.205.236.181
//
// =====================================================

const API_URL =
  'http://10.205.236.181:1337';

// =====================================================
// AXIOS
// =====================================================

export const api =
  axios.create({
    baseURL:
      API_URL,

    headers: {
      Accept:
        'application/json',

      'Content-Type':
        'application/json',
    },

    timeout:
      15000,
  });

// =====================================================
// REQUEST
// =====================================================

api.interceptors.request.use(
  async (
    config
  ) => {
    const token =
      await authStorage
        .getToken();

    // ===================================================
    // JWT
    // ===================================================

    if (
      token
    ) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // ===================================================
    // FORMDATA
    // ===================================================
    //
    // Cuando enviamos archivos no debemos forzar:
    //
    // Content-Type: application/json
    //
    // Axios debe crear automáticamente:
    //
    // multipart/form-data; boundary=...
    //
    // ===================================================

    if (
      typeof FormData !==
        'undefined' &&
      config.data instanceof
        FormData
    ) {
      if (
        typeof config.headers
          .delete ===
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

  async (
    error
  ) => {
    return Promise.reject(
      error
    );
  }
);

// =====================================================
// RESPONSE
// =====================================================

api.interceptors.response.use(
  (
    response
  ) =>
    response,

  async (
    error
  ) => {
    if (
      error.response
        ?.status ===
      401
    ) {
      await authStorage
        .clearSession();
    }

    return Promise.reject(
      error
    );
  }
);