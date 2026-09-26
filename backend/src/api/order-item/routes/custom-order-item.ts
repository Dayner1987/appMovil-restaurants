// backend/src/api/order-item/routes/custom-order-item.ts

export default {
  type: 'content-api',

  routes: [
    {
      method: 'PATCH',

      path:
        '/order-items/:documentId',

      handler:
        'order-item.patch',

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