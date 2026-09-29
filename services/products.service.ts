// services/products.service.ts

import {
  Platform,
} from 'react-native';

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
// APPEND IMAGE
// =====================================================

async function appendImage(
  formData: FormData,

  fieldName:
    | 'mainImage'
    | 'gallery',

  image:
    ProductImageUpload,

  defaultFileName:
    string
) {
  const fileName =
    image.fileName?.trim() ||
    defaultFileName;

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
        fieldName,
        image.file,
        fileName
      );

      return;
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
      fieldName,
      blob,
      fileName
    );

    return;
  }

  // ===================================================
  // ANDROID / IOS
  // ===================================================

  formData.append(
    fieldName,
    {
      uri:
        image.uri,

      name:
        fileName,

      type:
        mimeType,
    } as any
  );
}

// =====================================================
// FORM DATA - UNA IMAGEN
// =====================================================

async function createImageFormData(
  fieldName:
    | 'mainImage'
    | 'gallery',

  image:
    ProductImageUpload,

  defaultFileName:
    string
) {
  const formData =
    new FormData();

  await appendImage(
    formData,
    fieldName,
    image,
    defaultFileName
  );

  return formData;
}

// =====================================================
// FORM DATA - GALERÍA
// =====================================================

async function createGalleryFormData(
  images:
    ProductImageUpload[]
) {
  const formData =
    new FormData();

  for (
    const [
      index,
      image,
    ] of images.entries()
  ) {
    await appendImage(
      formData,
      'gallery',
      image,
      `product-gallery-${index + 1}.jpg`
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
            // IMPORTANTE:
            // Los productos actuales están en draft.
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
              'name:asc',

            'filters[name][$containsi]':
              params.name,

            'filters[isAvailable][$eq]':
              params.available,

            'filters[restaurant][documentId][$eq]':
              params.restaurantDocumentId,

            'filters[category][documentId][$eq]':
              params.categoryDocumentId,
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
  ): Promise<ProductResponse> {
    const response =
      await api.get<ProductResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
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
  // CREATE PRODUCT
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
  // PUT NATIVO
  // ===================================================

  async update(
    documentId:
      string,

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
  // PATCH PRODUCT
  // ===================================================

  async patch(
    documentId:
      string,

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
  // CREATE MAIN IMAGE
  //
  // SOLO PARA CREAR IMAGEN POR PRIMERA VEZ
  //
  // POST
  // /api/products/:documentId/main-image
  // ===================================================

  async createMainImage(
    documentId:
      string,

    image:
      ProductImageUpload
  ): Promise<ProductMediaResponse> {
    const formData =
      await createImageFormData(
        'mainImage',
        image,
        'product-main-image.jpg'
      );

    const response =
      await api.post<ProductMediaResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}/main-image`,
        formData
      );

    return response.data;
  },

  // ===================================================
  // UPDATE MAIN IMAGE
  //
  // PARA REEMPLAZAR IMAGEN EXISTENTE
  //
  // PATCH
  // /api/products/:documentId/main-image
  // ===================================================

  async updateMainImage(
    documentId:
      string,

    image:
      ProductImageUpload
  ): Promise<ProductMediaResponse> {
    const formData =
      await createImageFormData(
        'mainImage',
        image,
        'product-main-image.jpg'
      );

    const response =
      await api.patch<ProductMediaResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}/main-image`,
        formData
      );

    return response.data;
  },

  // ===================================================
  // DELETE MAIN IMAGE
  // ===================================================

  async deleteMainImage(
    documentId:
      string
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
    documentId:
      string,

    images:
      ProductImageUpload[]
  ): Promise<ProductMediaResponse> {
    if (
      images.length ===
      0
    ) {
      throw new Error(
        'Debes seleccionar al menos una imagen.'
      );
    }

    const formData =
      await createGalleryFormData(
        images
      );

    const response =
      await api.post<ProductMediaResponse>(
        `${PRODUCT_URL}/${encodeURIComponent(
          documentId
        )}/gallery`,
        formData
      );

    return response.data;
  },

  // ===================================================
  // UPDATE GALLERY IMAGE
  //
  // PATCH
  // /api/products/:documentId/gallery/:fileId
  // ===================================================

  async updateGalleryImage(
    documentId:
      string,

    fileId:
      | number
      | string,

    image:
      ProductImageUpload
  ): Promise<ProductMediaResponse> {
    const formData =
      await createImageFormData(
        'gallery',
        image,
        'product-gallery.jpg'
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
        formData
      );

    return response.data;
  },

  // ===================================================
  // DELETE GALLERY IMAGE
  // ===================================================

  async deleteGalleryImage(
    documentId:
      string,

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
    documentId:
      string
  ): Promise<void> {
    await api.delete(
      `${PRODUCT_URL}/${encodeURIComponent(
        documentId
      )}`
    );
  },
};