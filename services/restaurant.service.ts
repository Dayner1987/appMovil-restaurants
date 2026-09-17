import { api } from './api';

import type {
  CreateRestaurantData,
  RestaurantListResponse,
  RestaurantQueryParams,
  RestaurantResponse,
  UpdateRestaurantData,
} from '@/types/restaurant.types';

const RESTAURANT_URL = '/api/restaurants';

export const restaurantService = {
  async findAll(
    params: RestaurantQueryParams = {}
  ): Promise<RestaurantListResponse> {
    const response = await api.get<RestaurantListResponse>(
      RESTAURANT_URL,
      {
        params: {
          populate: '*',
          'pagination[page]': params.page ?? 1,
          'pagination[pageSize]': params.pageSize ?? 25,
          sort: params.sort,
          'filters[statusRes][$eq]': params.statusRes,
          'filters[name][$containsi]': params.name,
          'filters[email][$eq]': params.email,
        },
      }
    );

    return response.data;
  },

  async findOne(
    documentId: string
  ): Promise<RestaurantResponse> {
    const response = await api.get<RestaurantResponse>(
      `${RESTAURANT_URL}/${encodeURIComponent(documentId)}`,
      {
        params: {
          populate: '*',
        },
      }
    );

    return response.data;
  },

  async create(
    data: CreateRestaurantData
  ): Promise<RestaurantResponse> {
    const response = await api.post<RestaurantResponse>(
      RESTAURANT_URL,
      { data },
      {
        params: {
          populate: '*',
        },
      }
    );

    return response.data;
  },

  async update(
    documentId: string,
    data: UpdateRestaurantData
  ): Promise<RestaurantResponse> {
    const response = await api.put<RestaurantResponse>(
      `${RESTAURANT_URL}/${encodeURIComponent(documentId)}`,
      { data },
      {
        params: {
          populate: '*',
        },
      }
    );

    return response.data;
  },

  async remove(documentId: string): Promise<void> {
    await api.delete(
      `${RESTAURANT_URL}/${encodeURIComponent(documentId)}`
    );
  },
};