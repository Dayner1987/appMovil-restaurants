import { api } from './api';


import type {

  CreatePaymentData,

  PaymentListResponse,

  PaymentQueryParams,

  PaymentResponse,

  UpdatePaymentData,

} from '@/types/payment.types';



const PAYMENT_URL = '/api/payments';




export const paymentService = {



  async findAll(

    params: PaymentQueryParams = {}

  ): Promise<PaymentListResponse> {


    const response = await api.get<PaymentListResponse>(

      PAYMENT_URL,

      {

        params: {


          populate: 'order',


          'pagination[page]':

            params.page ?? 1,


          'pagination[pageSize]':

            params.pageSize ?? 25,



          sort: params.sort,



          'filters[order][id][$eq]':

            params.orderId,



          'filters[statusPayment][$eq]':

            params.statusPayment,



          'filters[method][$eq]':

            params.method,


        },

      }

    );



    return response.data;

  },







  async findOne(

    documentId: string

  ): Promise<PaymentResponse> {



    const response = await api.get<PaymentResponse>(

      `${PAYMENT_URL}/${documentId}`,

      {

        params: {

          populate: 'order',

        },

      }

    );



    return response.data;

  },








  async create(

    data: CreatePaymentData

  ): Promise<PaymentResponse> {



    const response = await api.post<PaymentResponse>(

      PAYMENT_URL,

      {

        data,

      },

      {

        params: {

          populate: 'order',

        },

      }

    );



    return response.data;

  },









  async update(

    documentId: string,

    data: UpdatePaymentData

  ): Promise<PaymentResponse> {



    const response = await api.put<PaymentResponse>(

      `${PAYMENT_URL}/${documentId}`,

      {

        data,

      },

      {

        params: {

          populate: 'order',

        },

      }

    );



    return response.data;

  },









  async remove(

    documentId: string

  ): Promise<void> {



    await api.delete(

      `${PAYMENT_URL}/${documentId}`

    );



  },


};