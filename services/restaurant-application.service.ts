import { api } from './api';

import type {
  RestaurantApplicationListResponse,
  RestaurantApplicationQueryParams,
  RestaurantApplicationResponse,
  RestaurantRegisterData,
  RestaurantRegisterResponse,
  UpdateRestaurantApplicationData,
} from '@/types/restaurant-application.types';

const APPLICATION_URL = '/api/restaurant-applications';

export const restaurantApplicationService = {
  async register(
    data: RestaurantRegisterData
  ): Promise<RestaurantRegisterResponse> {
    const response = await api.post<RestaurantRegisterResponse>(
      `${APPLICATION_URL}/register`,
      data
    );

    return response.data;
  },

  async findAll(
    params: RestaurantApplicationQueryParams = {}
  ): Promise<RestaurantApplicationListResponse> {
    const response = await api.get<RestaurantApplicationListResponse>(
      APPLICATION_URL,
      {
        params: {
          populate: 'applicant',
          'pagination[page]': params.page ?? 1,
          'pagination[pageSize]': params.pageSize ?? 25,
          sort: params.sort,
          'filters[status][$eq]': params.status,
          'filters[applicant][id][$eq]': params.applicantId,
        },
      }
    );

    return response.data;
  },

  async findOne(
    documentId: string
  ): Promise<RestaurantApplicationResponse> {
    const response = await api.get<RestaurantApplicationResponse>(
      `${APPLICATION_URL}/${encodeURIComponent(documentId)}`,
      {
        params: {
          populate: 'applicant',
        },
      }
    );

    return response.data;
  },

  async update(
    documentId: string,
    data: UpdateRestaurantApplicationData
  ): Promise<RestaurantApplicationResponse> {
    const response = await api.put<RestaurantApplicationResponse>(
      `${APPLICATION_URL}/${encodeURIComponent(documentId)}`,
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

  async approve(
    documentId: string
  ): Promise<RestaurantApplicationResponse> {
    return this.update(documentId, {
      status: 'approved',
      rejectionReason: null,
      reviewedAt: new Date().toISOString(),
    });
  },

  async reject(
    documentId: string,
    rejectionReason: string
  ): Promise<RestaurantApplicationResponse> {
    return this.update(documentId, {
      status: 'rejected',
      rejectionReason,
      reviewedAt: new Date().toISOString(),
    });
  },

  async remove(documentId: string): Promise<void> {
    await api.delete(
      `${APPLICATION_URL}/${encodeURIComponent(documentId)}`
    );
  },
};