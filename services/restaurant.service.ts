// services/restaurant.service.ts

import {
  api,
} from './api';

import type {
  CreateRestaurantData,
  RestaurantListResponse,
  RestaurantMediaResponse,
  RestaurantQueryParams,
  RestaurantResponse,
  UpdateRestaurantData,
} from '@/types/restaurant.types';

const RESTAURANT_URL =
  '/api/restaurants';

// =====================================================
// FORM DATA
// =====================================================

function createMediaFormData(
  fieldName:
    | 'logo'
    | 'QRImage',
  imageUri: string,
  fileName: string,
  mimeType: string
) {
  const formData =
    new FormData();

  formData.append(
    fieldName,
    {
      uri:
        imageUri,

      name:
        fileName,

      type:
        mimeType,
    } as any
  );

  return formData;
}

// =====================================================
// SERVICE
// =====================================================

export const restaurantService = {
  // ===================================================
  // GET ALL
  // ===================================================

  async findAll(
    params:
      RestaurantQueryParams = {}
  ): Promise<RestaurantListResponse> {
    const response =
      await api.get<RestaurantListResponse>(
        RESTAURANT_URL,
        {
          params: {
            populate:
              '*',

            'pagination[page]':
              params.page ??
              1,

            'pagination[pageSize]':
              params.pageSize ??
              25,

            sort:
              params.sort,

            'filters[statusRes][$eq]':
              params.statusRes,

            'filters[name][$containsi]':
              params.name,

            'filters[email][$eq]':
              params.email,
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // GET ONE
  // ===================================================

  async findOne(
    documentId: string
  ): Promise<RestaurantResponse> {
    const response =
      await api.get<RestaurantResponse>(
        `${RESTAURANT_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          params: {
            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // CREATE
  // ===================================================

  async create(
    data:
      CreateRestaurantData
  ): Promise<RestaurantResponse> {
    const response =
      await api.post<RestaurantResponse>(
        RESTAURANT_URL,
        {
          data,
        },
        {
          params: {
            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // PUT NATIVO STRAPI
  // ===================================================

  async update(
    documentId: string,
    data:
      UpdateRestaurantData
  ): Promise<RestaurantResponse> {
    const response =
      await api.put<RestaurantResponse>(
        `${RESTAURANT_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          data,
        },
        {
          params: {
            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // PATCH PERSONALIZADO
  // ===================================================

  async patch(
    documentId: string,
    data:
      UpdateRestaurantData
  ): Promise<RestaurantResponse> {
    const response =
      await api.patch<RestaurantResponse>(
        `${RESTAURANT_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          data,
        }
      );

    return response.data;
  },

  // ===================================================
  // CREATE LOGO
  //
  // POST
  // /api/restaurants/:documentId/logo
  // ===================================================

  async createLogo(
    documentId: string,
    imageUri: string,
    fileName =
      'restaurant-logo.jpg',
    mimeType =
      'image/jpeg'
  ): Promise<RestaurantMediaResponse> {
    const formData =
      createMediaFormData(
        'logo',
        imageUri,
        fileName,
        mimeType
      );

    const response =
      await api.post<RestaurantMediaResponse>(
        `${RESTAURANT_URL}/${encodeURIComponent(
          documentId
        )}/logo`,
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // UPDATE LOGO
  //
  // PATCH
  // /api/restaurants/:documentId/logo
  // ===================================================

  async updateLogo(
    documentId: string,
    imageUri: string,
    fileName =
      'restaurant-logo.jpg',
    mimeType =
      'image/jpeg'
  ): Promise<RestaurantMediaResponse> {
    const formData =
      createMediaFormData(
        'logo',
        imageUri,
        fileName,
        mimeType
      );

    const response =
      await api.patch<RestaurantMediaResponse>(
        `${RESTAURANT_URL}/${encodeURIComponent(
          documentId
        )}/logo`,
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // DELETE LOGO
  // ===================================================

  async deleteLogo(
    documentId: string
  ): Promise<RestaurantMediaResponse> {
    const response =
      await api.delete<RestaurantMediaResponse>(
        `${RESTAURANT_URL}/${encodeURIComponent(
          documentId
        )}/logo`
      );

    return response.data;
  },

  // ===================================================
  // CREATE QR IMAGE
  //
  // IMPORTANTE:
  // URL = qr-image
  // FORM KEY = QRImage
  // ===================================================

  async createQRImage(
    documentId: string,
    imageUri: string,
    fileName =
      'restaurant-qr.png',
    mimeType =
      'image/png'
  ): Promise<RestaurantMediaResponse> {
    const formData =
      createMediaFormData(
        'QRImage',
        imageUri,
        fileName,
        mimeType
      );

    const response =
      await api.post<RestaurantMediaResponse>(
        `${RESTAURANT_URL}/${encodeURIComponent(
          documentId
        )}/qr-image`,
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // UPDATE QR IMAGE
  // ===================================================

  async updateQRImage(
    documentId: string,
    imageUri: string,
    fileName =
      'restaurant-qr.png',
    mimeType =
      'image/png'
  ): Promise<RestaurantMediaResponse> {
    const formData =
      createMediaFormData(
        'QRImage',
        imageUri,
        fileName,
        mimeType
      );

    const response =
      await api.patch<RestaurantMediaResponse>(
        `${RESTAURANT_URL}/${encodeURIComponent(
          documentId
        )}/qr-image`,
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // DELETE QR IMAGE
  // ===================================================

  async deleteQRImage(
    documentId: string
  ): Promise<RestaurantMediaResponse> {
    const response =
      await api.delete<RestaurantMediaResponse>(
        `${RESTAURANT_URL}/${encodeURIComponent(
          documentId
        )}/qr-image`
      );

    return response.data;
  },

  // ===================================================
  // DELETE RESTAURANT
  // ===================================================

  async remove(
    documentId: string
  ): Promise<void> {
    await api.delete(
      `${RESTAURANT_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};