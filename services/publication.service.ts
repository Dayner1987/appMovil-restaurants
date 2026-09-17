import { api } from './api';

import type {
  CreatePublicationData,
  PublicationListResponse,
  PublicationQueryParams,
  PublicationResponse,
  UpdatePublicationData,
} from '@/types/publication.types';

const PUBLICATION_URL = '/api/publications';

export const publicationService = {
  async findAll(
    params: PublicationQueryParams = {}
  ): Promise<PublicationListResponse> {
    const response = await api.get<PublicationListResponse>(
      PUBLICATION_URL,
      {
        params: {
          populate: '*',
          'pagination[page]': params.page ?? 1,
          'pagination[pageSize]': params.pageSize ?? 25,
          sort: params.sort,
          'filters[restaurant][id][$eq]': params.restaurantId,
          'filters[featured][$eq]': params.featured,
        },
      }
    );

    return response.data;
  },

  async findOne(
    documentId: string
  ): Promise<PublicationResponse> {
    const response = await api.get<PublicationResponse>(
      `${PUBLICATION_URL}/${encodeURIComponent(documentId)}`,
      {
        params: {
          populate: '*',
        },
      }
    );

    return response.data;
  },

  async create(
    data: CreatePublicationData
  ): Promise<PublicationResponse> {
    const response = await api.post<PublicationResponse>(
      PUBLICATION_URL,
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
    data: UpdatePublicationData
  ): Promise<PublicationResponse> {
    const response = await api.put<PublicationResponse>(
      `${PUBLICATION_URL}/${encodeURIComponent(documentId)}`,
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
      `${PUBLICATION_URL}/${encodeURIComponent(documentId)}`
    );
  },
};