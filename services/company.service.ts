import { api } from './api';

import type {
  CompanyListResponse,
  CompanyQueryParams,
  CompanyResponse,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyImage
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

  async update(
    documentId: string,
    data: UpdateCompanyData
  ): Promise<CompanyResponse> {
    const response = await api.put<CompanyResponse>(
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

  async uploadLogo(
  imageUri: string,
  fileName = 'company-logo.jpg',
  mimeType = 'image/jpeg'
): Promise<CompanyImage> {
  const formData = new FormData();

  formData.append('files', {
    uri: imageUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const response = await api.post<CompanyImage[]>(
    '/api/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data[0];
},
};