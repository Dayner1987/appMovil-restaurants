// services/publication.service.ts

import {
  Platform,
} from 'react-native';

import {
  api,
} from './api';

import type {
  CreatePublicationData,
  PublicationImageResponse,
  PublicationImageUpload,
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

async function createImageFormData(
  image:
    PublicationImageUpload
) {
  const formData =
    new FormData();

  const fileName =
    image.fileName?.trim() ||
    'publication-image.jpg';

  const mimeType =
    image.mimeType?.trim() ||
    'image/jpeg';

  // ===================================================
  // WEB
  // ===================================================

  if (
    Platform.OS ===
    'web'
  ) {
    if (image.file) {
      formData.append(
        'image',
        image.file,
        fileName
      );

      return formData;
    }

    const response =
      await fetch(
        image.uri
      );

    if (!response.ok) {
      throw new Error(
        'No se pudo preparar la imagen seleccionada.'
      );
    }

    const blob =
      await response.blob();

    formData.append(
      'image',
      blob,
      fileName
    );

    return formData;
  }

  // ===================================================
  // ANDROID / IOS
  // ===================================================

  formData.append(
    'image',
    {
      uri:
        image.uri,

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
            /*
             * Para la gestión del restaurante
             * necesitamos trabajar con el draft
             * actual.
             */
            status:
              'draft',

            populate:
              '*',

            'pagination[page]':
              params.page ??
              1,

            'pagination[pageSize]':
              params.pageSize ??
              25,

            sort:
              params.sort ??
              'createdAt:desc',

            /*
             * API comprobada en Insomnia:
             *
             * filters[restaurant]
             * [documentId][$eq]
             */
            'filters[restaurant][documentId][$eq]':
              params.restaurantDocumentId,

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
    documentId:
      string
  ): Promise<PublicationResponse> {
    const response =
      await api.get<PublicationResponse>(
        `${PUBLICATION_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          params: {
            status:
              'draft',

            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // CREATE
  //
  // POST /api/publications
  // ===================================================

  async create(
    data:
      CreatePublicationData
  ): Promise<PublicationResponse> {
    /*
     * No forzamos status=draft aquí.
     *
     * Dejamos exactamente el comportamiento
     * que ya comprobaste en Insomnia.
     */
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
    documentId:
      string,

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
            status:
              'draft',

            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // PATCH PERSONALIZADO
  //
  // PATCH /api/publications/:documentId
  // ===================================================

  async patch(
    documentId:
      string,

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
        },
        {
          params: {
            status:
              'draft',

            populate:
              '*',
          },
        }
      );

    return response.data;
  },

  // ===================================================
  // CREATE IMAGE
  //
  // SOLO SI image === null
  //
  // POST
  // /api/publications/:documentId/image
  // ===================================================

  async createImage(
    documentId:
      string,

    image:
      PublicationImageUpload
  ): Promise<PublicationImageResponse> {
    const formData =
      await createImageFormData(
        image
      );

    const response =
      await api.post<PublicationImageResponse>(
        `${PUBLICATION_URL}/${encodeURIComponent(
          documentId
        )}/image`,
        formData
      );

    return response.data;
  },

  // ===================================================
  // UPDATE IMAGE
  //
  // SOLO SI YA EXISTE image
  //
  // PATCH
  // /api/publications/:documentId/image
  // ===================================================

  async updateImage(
    documentId:
      string,

    image:
      PublicationImageUpload
  ): Promise<PublicationImageResponse> {
    const formData =
      await createImageFormData(
        image
      );

    const response =
      await api.patch<PublicationImageResponse>(
        `${PUBLICATION_URL}/${encodeURIComponent(
          documentId
        )}/image`,
        formData
      );

    return response.data;
  },

  // ===================================================
  // DELETE IMAGE
  // ===================================================

  async deleteImage(
    documentId:
      string
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
    documentId:
      string
  ): Promise<void> {
    await api.delete(
      `${PUBLICATION_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};