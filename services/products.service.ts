// services/product.service.ts

import {
  api,
} from './api';

import type {
  CreateProductData,
  ProductImageUpload,
  ProductListResponse,
  ProductMediaResponse,
  ProductQueryParams,
  ProductResponse,
  UpdateProductData,
} from '@/types/product.types';

const PRODUCT_URL =
  '/api/products';

// =====================================================
// FORM DATA - IMAGEN INDIVIDUAL
// =====================================================

function createImageFormData(
  fieldName:
    | 'mainImage'
    | 'gallery',

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
// FORM DATA - GALERÍA
// =====================================================

function createGalleryFormData(
  images:
    ProductImageUpload[]
) {
  const formData =
    new FormData();

  for (
    const image of
    images
  ) {
    formData.append(
      'gallery',
      {
        uri:
          image.uri,

        name:
          image.fileName ??
          'product-gallery.jpg',

        type:
          image.mimeType ??
          'image/jpeg',
      } as any
    );
  }

  return formData;
}

// =====================================================
// SERVICE
// =====================================================

export const productService = {
  // ===================================================
  // GET ALL
  // ===================================================

  async findAll(
    params:
      ProductQueryParams = {}
  ): Promise<ProductListResponse> {
    const response =
      await api.get<ProductListResponse>(
        PRODUCT_URL,
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

            'filters[category][id][$eq]':
              params.categoryId,

            'filters[isAvailable][$eq]':
              params.available,

            'filters[name][$containsi]':
              params.name,
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
  ): Promise<ProductResponse> {
    const response =
      await api.get<ProductResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
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
      CreateProductData
  ): Promise<ProductResponse> {
    const response =
      await api.post<ProductResponse>(
        PRODUCT_URL,
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
      UpdateProductData
  ): Promise<ProductResponse> {
    const response =
      await api.put<ProductResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
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
  //
  // PATCH
  // /api/products/:documentId
  // ===================================================

  async patch(
    documentId: string,

    data:
      UpdateProductData
  ): Promise<ProductResponse> {
    const response =
      await api.patch<ProductResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          data,
        }
      );

    return response.data;
  },

  // ===================================================
  // CREATE MAIN IMAGE
  //
  // POST
  // /api/products/:documentId/main-image
  // ===================================================

  async createMainImage(
    documentId: string,

    imageUri: string,

    fileName =
      'product-main-image.jpg',

    mimeType =
      'image/jpeg'
  ): Promise<ProductMediaResponse> {
    const formData =
      createImageFormData(
        'mainImage',
        imageUri,
        fileName,
        mimeType
      );

    const response =
      await api.post<ProductMediaResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}/main-image`,
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
  // UPDATE MAIN IMAGE
  //
  // PATCH
  // /api/products/:documentId/main-image
  // ===================================================

  async updateMainImage(
    documentId: string,

    imageUri: string,

    fileName =
      'product-main-image.jpg',

    mimeType =
      'image/jpeg'
  ): Promise<ProductMediaResponse> {
    const formData =
      createImageFormData(
        'mainImage',
        imageUri,
        fileName,
        mimeType
      );

    const response =
      await api.patch<ProductMediaResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}/main-image`,
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
  // DELETE MAIN IMAGE
  //
  // DELETE
  // /api/products/:documentId/main-image
  // ===================================================

  async deleteMainImage(
    documentId: string
  ): Promise<ProductMediaResponse> {
    const response =
      await api.delete<ProductMediaResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}/main-image`
      );

    return response.data;
  },

  // ===================================================
  // ADD GALLERY IMAGES
  //
  // POST
  // /api/products/:documentId/gallery
  // ===================================================

  async addGalleryImages(
    documentId: string,

    images:
      ProductImageUpload[]
  ): Promise<ProductMediaResponse> {
    if (
      images.length ===
      0
    ) {
      throw new Error(
        'Debe seleccionar al menos una imagen'
      );
    }

    const formData =
      createGalleryFormData(
        images
      );

    const response =
      await api.post<ProductMediaResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}/gallery`,
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
  // UPDATE ONE GALLERY IMAGE
  //
  // PATCH
  // /api/products/:documentId/gallery/:fileId
  // ===================================================

  async updateGalleryImage(
    documentId: string,

    fileId:
      | number
      | string,

    imageUri: string,

    fileName =
      'product-gallery.jpg',

    mimeType =
      'image/jpeg'
  ): Promise<ProductMediaResponse> {
    const formData =
      createImageFormData(
        'gallery',
        imageUri,
        fileName,
        mimeType
      );

    const response =
      await api.patch<ProductMediaResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}/gallery/${encodeURIComponent(
          String(
            fileId
          )
        )}`,
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
  // DELETE ONE GALLERY IMAGE
  //
  // DELETE
  // /api/products/:documentId/gallery/:fileId
  // ===================================================

  async deleteGalleryImage(
    documentId: string,

    fileId:
      | number
      | string
  ): Promise<ProductMediaResponse> {
    const response =
      await api.delete<ProductMediaResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}/gallery/${encodeURIComponent(
          String(
            fileId
          )
        )}`
      );

    return response.data;
  },

  // ===================================================
  // DELETE PRODUCT
  // ===================================================

  async remove(
    documentId: string
  ): Promise<void> {
    await api.delete(
      `${PRODUCT_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};