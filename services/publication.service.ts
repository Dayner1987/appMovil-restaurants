// services/publication.service.ts

import {
  api,
} from './api';

import type {
  CreatePublicationData,
  PublicationImageResponse,
  PublicationListResponse,
  PublicationQueryParams,
  PublicationResponse,
  UpdatePublicationData,
} from '@/types/publication.types';

const PUBLICATION_URL =
  '/api/publications';

// =====================================================
// FORM DATA
// =====================================================

function createImageFormData(
  imageUri: string,
  fileName: string,
  mimeType: string
) {
  const formData =
    new FormData();

  formData.append(
    'image',
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

export const publicationService = {
  // ===================================================
  // GET ALL
  // ===================================================

  async findAll(
    params:
      PublicationQueryParams = {}
  ): Promise<PublicationListResponse> {
    const response =
      await api.get<PublicationListResponse>(
        PUBLICATION_URL,
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

            'filters[restaurant][id][$eq]':
              params.restaurantId,

            'filters[featured][$eq]':
              params.featured,

            'filters[title][$containsi]':
              params.title,
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
  ): Promise<PublicationResponse> {
    const response =
      await api.get<PublicationResponse>(
        `${PUBLICATION_URL}/${encodeURIComponent(
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
      CreatePublicationData
  ): Promise<PublicationResponse> {
    const response =
      await api.post<PublicationResponse>(
        PUBLICATION_URL,
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
      UpdatePublicationData
  ): Promise<PublicationResponse> {
    const response =
      await api.put<PublicationResponse>(
        `${PUBLICATION_URL}/${encodeURIComponent(
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
      UpdatePublicationData
  ): Promise<PublicationResponse> {
    const response =
      await api.patch<PublicationResponse>(
        `${PUBLICATION_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          data,
        }
      );

    return response.data;
  },

  // ===================================================
  // CREATE IMAGE
  //
  // POST
  // /api/publications/:documentId/image
  // ===================================================

  async createImage(
    documentId: string,
    imageUri: string,
    fileName =
      'publication-image.jpg',
    mimeType =
      'image/jpeg'
  ): Promise<PublicationImageResponse> {
    const formData =
      createImageFormData(
        imageUri,
        fileName,
        mimeType
      );

    const response =
      await api.post<PublicationImageResponse>(
        `${PUBLICATION_URL}/${encodeURIComponent(
          documentId
        )}/image`,
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
  // UPDATE / REPLACE IMAGE
  //
  // PATCH
  // /api/publications/:documentId/image
  // ===================================================

  async updateImage(
    documentId: string,
    imageUri: string,
    fileName =
      'publication-image.jpg',
    mimeType =
      'image/jpeg'
  ): Promise<PublicationImageResponse> {
    const formData =
      createImageFormData(
        imageUri,
        fileName,
        mimeType
      );

    const response =
      await api.patch<PublicationImageResponse>(
        `${PUBLICATION_URL}/${encodeURIComponent(
          documentId
        )}/image`,
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
  // DELETE IMAGE
  // ===================================================

  async deleteImage(
    documentId: string
  ): Promise<PublicationImageResponse> {
    const response =
      await api.delete<PublicationImageResponse>(
        `${PUBLICATION_URL}/${encodeURIComponent(
          documentId
        )}/image`
      );

    return response.data;
  },

  // ===================================================
  // DELETE PUBLICATION
  // ===================================================

  async remove(
    documentId: string
  ): Promise<void> {
    await api.delete(
      `${PUBLICATION_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};