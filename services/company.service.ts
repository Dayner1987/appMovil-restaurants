import { api } from './api';
import { addImageToForm } from './upload';

import type {
  CompanyListResponse,
  CompanyQueryParams,
  CompanyResponse,
  CreateCompanyData,
  UpdateCompanyData,
} from '@/types/company.types';

const COMPANY_URL = '/api/companies';

export const companyService = {
  async findAll(
    params: CompanyQueryParams = {}
  ): Promise<CompanyListResponse> {
    const response = await api.get<CompanyListResponse>(
      COMPANY_URL,
      {
        params: {
          populate: 'logoImg',
          'pagination[page]': params.page ?? 1,
          'pagination[pageSize]': params.pageSize ?? 25,
          sort: params.sort,
        },
      }
    );

    return response.data;
  },

  async findOne(
    documentId: string
  ): Promise<CompanyResponse> {
    const response = await api.get<CompanyResponse>(
      `${COMPANY_URL}/${encodeURIComponent(documentId)}`,
      {
        params: {
          populate: 'logoImg',
        },
      }
    );

    return response.data;
  },

  async create(
    data: CreateCompanyData
  ): Promise<CompanyResponse> {
    const response = await api.post<CompanyResponse>(
      COMPANY_URL,
      { data },
      {
        params: {
          populate: 'logoImg',
        },
      }
    );

    return response.data;
  },

  // PUT: reemplaza todos los datos
  async update(
    documentId: string,
    data: UpdateCompanyData
  ): Promise<CompanyResponse> {
    const response = await api.patch<CompanyResponse>(
      `${COMPANY_URL}/${encodeURIComponent(documentId)}`,
      { data },
      {
        params: {
          populate: 'logoImg',
        },
      }
    );

    return response.data;
  },

  // PATCH: actualiza solamente los campos enviados
  async patch(
    documentId: string,
    data: UpdateCompanyData
  ): Promise<CompanyResponse> {
    const response = await api.patch<CompanyResponse>(
      `${COMPANY_URL}/${encodeURIComponent(documentId)}`,
      { data },
      {
        params: {
          populate: 'logoImg',
        },
      }
    );

    return response.data;
  },

  async remove(documentId: string): Promise<void> {
    await api.delete(
      `${COMPANY_URL}/${encodeURIComponent(documentId)}`
    );
  },

  // PATCH /companies/:documentId/logo
  async uploadLogo(
    documentId: string,
    imageUri: string,
    fileName = 'company-logo.jpg',
    mimeType = 'image/jpeg'
  ): Promise<CompanyResponse> {
    const formData = new FormData();

    await addImageToForm(formData, 'logoImg', imageUri, fileName, mimeType);

    const response = await api.patch<CompanyResponse>(
      `${COMPANY_URL}/${encodeURIComponent(documentId)}/logo`,
      formData,
      {
        params: {
          populate: 'logoImg',
        },
      }
    );

    return response.data;
  },

  async deleteLogo(
    documentId: string
  ): Promise<CompanyResponse> {
    const response = await api.delete<CompanyResponse>(
      `${COMPANY_URL}/${encodeURIComponent(documentId)}/logo`,
      {
        params: {
          populate: 'logoImg',
        },
      }
    );

    return response.data;
  },
};