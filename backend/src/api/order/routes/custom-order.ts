// backend/src/api/order/routes/custom-order.ts

export default {
  type: 'content-api',

  routes: [
    {
      method: 'PATCH',

      path:
        '/orders/:documentId',

      handler:
        'order.patch',

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