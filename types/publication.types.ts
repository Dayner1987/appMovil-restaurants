export interface PublicationImage {
  id: number;
  documentId?: string;
  name?: string;
  url?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  mime?: string;
  size?: number;
}

export interface PublicationRestaurant {
  id: number;
  documentId?: string;
  name?: string;
}

export interface Publication {
  id: number;
  documentId: string;
  title: string;
  description: string;
  image: PublicationImage | null;
  featured: boolean | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  restaurant?: PublicationRestaurant | null;
}

export interface CreatePublicationData {
  title: string;
  description: string;
  image?: number | null;
  featured?: boolean | null;
  restaurant?: number | string | null;
}

export type UpdatePublicationData = Partial<CreatePublicationData>;

export interface PublicationPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface PublicationListResponse {
  data: Publication[];
  meta: {
    pagination: PublicationPagination;
  };
}

export interface PublicationResponse {
  data: Publication;
  meta?: Record<string, unknown>;
}

export interface PublicationQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
  restaurantId?: number | string;
  featured?: boolean;
}