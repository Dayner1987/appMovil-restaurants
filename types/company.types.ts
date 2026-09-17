export interface CompanyImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
  path?: string | null;
}

export interface CompanyImage {
  id: number;
  documentId?: string;
  name: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, CompanyImageFormat> | null;
  mime?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: number;
  documentId: string;
  name: string;
  email: string;
  number: string;
  logoImg?: CompanyImage | null;
  aditionalLink: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CreateCompanyData {
  name: string;
  email: string;
  number: string;
  logoImg?: number | null;
  aditionalLink?: string | null;
}

export type UpdateCompanyData = Partial<CreateCompanyData>;

export interface CompanyPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface CompanyListResponse {
  data: Company[];
  meta: {
    pagination: CompanyPagination;
  };
}

export interface CompanyResponse {
  data: Company;
  meta?: Record<string, unknown>;
}

export interface CompanyQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
}