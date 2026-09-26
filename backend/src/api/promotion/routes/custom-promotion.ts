// backend/src/api/promotion/routes/custom-promotion.ts

export default {
  type: 'content-api',

  routes: [
    {
      method: 'PATCH',

      path:
        '/promotions/:documentId',

      handler:
        'promotion.patch',

      info: {
        apiName:
          'promotion',

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