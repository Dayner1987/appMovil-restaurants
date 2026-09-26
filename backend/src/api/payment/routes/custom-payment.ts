// backend/src/api/payment/routes/custom-payment.ts

export default {
  type: 'content-api',

  routes: [
    {
      method: 'PATCH',

      path:
        '/payments/:documentId',

      handler:
        'payment.patch',

      config: {
        auth: {
          scope: [],
        },

        policies: [],
        middlewares: [],
      },
    },
  ],
};