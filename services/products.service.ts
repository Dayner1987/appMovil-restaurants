import { api } from './api';

import type {
  CreateProductData,
  ProductListResponse,
  ProductQueryParams,
  ProductResponse,
  UpdateProductData,
} from '@/types/product.types';


const PRODUCT_URL = '/api/products';


export const productService = {

  async findAll(
    params: ProductQueryParams = {}
  ): Promise<ProductListResponse> {

    const response = await api.get<ProductListResponse>(
      PRODUCT_URL,
      {
        params: {
          populate: '*',

          'pagination[page]':
            params.page ?? 1,

          'pagination[pageSize]':
            params.pageSize ?? 25,

          sort: params.sort,

          'filters[restaurant][id][$eq]':
            params.restaurantId,

          'filters[category][id][$eq]':
            params.categoryId,

          'filters[isAvailable][$eq]':
            params.available,
        },
      }
    );

    return response.data;
  },


  async findOne(
    documentId: string
  ): Promise<ProductResponse> {

    const response = await api.get<ProductResponse>(
      `${PRODUCT_URL}/${documentId}`,
      {
        params: {
          populate: '*',
        },
      }
    );

    return response.data;
  },


  async create(
    data: CreateProductData
  ): Promise<ProductResponse> {

    const response = await api.post<ProductResponse>(
      PRODUCT_URL,
      {
        data,
      },
      {
        params: {
          populate: '*',
        },
      }
    );

    return response.data;
  },


  async update(
    documentId: string,
    data: UpdateProductData
  ): Promise<ProductResponse> {

    const response = await api.put<ProductResponse>(
      `${PRODUCT_URL}/${documentId}`,
      {
        data,
      },
      {
        params: {
          populate: '*',
        },
      }
    );

    return response.data;
  },


  async remove(
    documentId: string
  ): Promise<void> {

    await api.delete(
      `${PRODUCT_URL}/${documentId}`
    );
  },

};