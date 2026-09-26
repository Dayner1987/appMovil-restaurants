// backend/src/api/receipt/routes/custom-receipt.ts

export default {
  type: 'content-api',

  routes: [
    {
      method: 'PATCH',

      path:
        '/receipts/:documentId',

      handler:
        'receipt.patch',

      info: {
        apiName:
          'receipt',

        type:
          'content-api',
      },

      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};