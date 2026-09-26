// types/publication.types.ts

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

  width?: number | null;
  height?: number | null;

  mime?: string | null;

  size?: number | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface PublicationRestaurant {
  id: number;

  documentId?: string;

  name?: string;
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

  restaurant?:
    | number
    | string
    | null;

  /*
   * Se mantiene por compatibilidad con
   * el endpoint nativo de Strapi.
   *
   * Las imágenes normalmente las
   * manejaremos con los endpoints
   * personalizados.
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
// PAGINACIÓN
// =====================================================

export interface PublicationPagination {
  page: number;

  pageSize: number;

  pageCount: number;

  total: number;
}

export interface PublicationListResponse {
  data: Publication[];

  meta: {
    pagination:
      PublicationPagination;
  };
}

export interface PublicationResponse {
  data: Publication;

  meta?: Record<
    string,
    unknown
  >;
}

// =====================================================
// RESPUESTA DE IMAGEN
// =====================================================

export interface PublicationImageResponse {
  data: Publication;

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

  restaurantId?:
    | number
    | string;

  featured?: boolean;

  title?: string;
}