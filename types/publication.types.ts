// types/publication.types.ts

// =====================================================
// MEDIA FORMAT
// =====================================================

export interface PublicationImageFormat {
  name?: string;

  hash?: string;

  ext?: string;

  mime?: string;

  path?:
    | string
    | null;

  width?: number;

  height?: number;

  size?: number;

  sizeInBytes?: number;

  url?: string;
}

// =====================================================
// IMAGE
// =====================================================

export interface PublicationImage {
  id: number;

  documentId?: string;

  name?: string;

  url?: string;

  alternativeText?:
    | string
    | null;

  caption?:
    | string
    | null;

  width?:
    | number
    | null;

  height?:
    | number
    | null;

  mime?:
    | string
    | null;

  size?:
    | number
    | null;

  formats?: {
    thumbnail?:
      PublicationImageFormat;

    small?:
      PublicationImageFormat;

    medium?:
      PublicationImageFormat;

    large?:
      PublicationImageFormat;
  } | null;

  createdAt?: string;

  updatedAt?: string;

  publishedAt?:
    | string
    | null;
}

// =====================================================
// IMAGE UPLOAD
// =====================================================

export interface PublicationImageUpload {
  uri: string;

  fileName?: string;

  mimeType?: string;

  /**
   * Expo Web puede entregar
   * directamente el File.
   *
   * Android/iOS normalmente
   * no lo necesitan.
   */
  file?:
    File
    | null;
}

// =====================================================
// RESTAURANT
// =====================================================

export interface PublicationRestaurant {
  id: number;

  documentId?: string;

  name?: string;

  slug?:
    | string
    | null;

  description?:
    | string
    | null;

  email?: string;

  address?:
    | string
    | null;

  phone?:
    | string
    | null;

  nit?:
    | string
    | null;

  statusRes?:
    | string
    | null;
}

// =====================================================
// PUBLICATION
// =====================================================

export interface Publication {
  id: number;

  documentId: string;

  title: string;

  description: string;

  image:
    | PublicationImage
    | null;

  featured:
    | boolean
    | null;

  restaurant?:
    | PublicationRestaurant
    | null;

  createdAt: string;

  updatedAt: string;

  publishedAt:
    | string
    | null;
}

// =====================================================
// CREATE
// =====================================================

export interface CreatePublicationData {
  title: string;

  description: string;

  featured?:
    | boolean
    | null;

  /**
   * Para nuestro flujo usamos
   * documentId del Restaurant.
   */
  restaurant?:
    | number
    | string
    | null;

  /**
   * Se conserva por compatibilidad
   * con Strapi.
   *
   * Normalmente las imágenes se
   * manejan con los endpoints:
   *
   * POST  /image
   * PATCH /image
   */
  image?:
    | number
    | null;
}

// =====================================================
// UPDATE
// =====================================================

export type UpdatePublicationData =
  Partial<CreatePublicationData>;

// =====================================================
// PAGINATION
// =====================================================

export interface PublicationPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface PublicationListResponse {
  data:
    Publication[];

  meta: {
    pagination:
      PublicationPagination;
  };
}

export interface PublicationResponse {
  data:
    Publication;

  meta?: Record<
    string,
    unknown
  >;
}

// =====================================================
// IMAGE RESPONSE
// =====================================================

export interface PublicationImageResponse {
  data:
    Publication;

  message?: string;
}

// =====================================================
// QUERY
// =====================================================

export interface PublicationQueryParams {
  page?: number;

  pageSize?: number;

  sort?:
    | string
    | string[];

  /**
   * IMPORTANTE:
   * usamos documentId y NO id numérico.
   */
  restaurantDocumentId?:
    string;

  featured?: boolean;

  title?: string;
}