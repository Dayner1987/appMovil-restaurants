// services/restaurant-application.service.ts

import { api } from './api';

import type {
  RestaurantApplicationListResponse,
  RestaurantApplicationQueryParams,
  RestaurantApplicationResponse,
  RestaurantRegisterData,
  RestaurantRegisterResponse,
  UpdateRestaurantApplicationData,
} from '@/types/restaurant-application.types';

const APPLICATION_URL =
  '/api/restaurant-applications';

export const restaurantApplicationService = {
  async register(
    data: RestaurantRegisterData
  ): Promise<RestaurantRegisterResponse> {
    const response =
      await api.post<RestaurantRegisterResponse>(
        `${APPLICATION_URL}/register`,
        data
      );

    return response.data;
  },

  // =====================================================
  // LISTAR SOLICITUDES
  // Usa la ruta NORMAL de Strapi
  // =====================================================
  async findAll(
    params: RestaurantApplicationQueryParams = {}
  ): Promise<RestaurantApplicationListResponse> {
    const response =
      await api.get<RestaurantApplicationListResponse>(
        APPLICATION_URL,
        {
          params: {
            populate: 'applicant',

            'pagination[page]':
              params.page ?? 1,

            'pagination[pageSize]':
              params.pageSize ?? 25,

            sort:
              params.sort,

            'filters[status][$eq]':
              params.status,

            'filters[applicant][id][$eq]':
              params.applicantId,
          },
        }
      );

    return response.data;
  },

  // =====================================================
  // OBTENER UNA SOLICITUD
  // Usa la ruta NORMAL de Strapi
  // =====================================================
  async findOne(
    documentId: string
  ): Promise<RestaurantApplicationResponse> {
    const response =
      await api.get<RestaurantApplicationResponse>(
        `${APPLICATION_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          params: {
            populate: 'applicant',
          },
        }
      );

    return response.data;
  },

  // =====================================================
  // UPDATE NORMAL
  // =====================================================
  async update(
    documentId: string,
    data: UpdateRestaurantApplicationData
  ): Promise<RestaurantApplicationResponse> {
    const response =
      await api.put<RestaurantApplicationResponse>(
        `${APPLICATION_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          data,
        },
        {
          params: {
            populate: 'applicant',
          },
        }
      );

    return response.data;
  },

  // =====================================================
  // APROBAR
  // AQUÍ SÍ usamos nuestro endpoint personalizado
  // =====================================================
  async approve(
  documentId: string
): Promise<RestaurantApplicationResponse> {
  const response =
    await api.put<RestaurantApplicationResponse>(
      `${APPLICATION_URL}/admin/${encodeURIComponent(
        documentId
      )}/status`,
      {
        data: {
          status: 'approved',
        },
      }
    );

  return response.data;
},

  // =====================================================
  // RECHAZAR
  // AQUÍ SÍ usamos nuestro endpoint personalizado
  // =====================================================
  async reject(
  documentId: string,
  rejectionReason: string
): Promise<RestaurantApplicationResponse> {
  const response =
    await api.put<RestaurantApplicationResponse>(
      `${APPLICATION_URL}/admin/${encodeURIComponent(
        documentId
      )}/status`,
      {
        data: {
          status: 'rejected',
          rejectionReason,
        },
      }
    );

  return response.data;
},

  // =====================================================
  // ELIMINAR
  // =====================================================
  async remove(
    documentId: string
  ): Promise<void> {
    await api.delete(
      `${APPLICATION_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};