// backend/src/api/restaurant/routes/custom-restaurant.ts

export default {
  type: 'content-api',

  routes: [
    // =====================================================
    // RESTAURANT
    // =====================================================

    {
      method: 'PATCH',

      path:
        '/restaurants/:documentId',

      handler:
        'restaurant.patch',

      info: {
        apiName:
          'restaurant',

        type:
          'content-api',
      },

      config: {
        policies: [],
        middlewares: [],
      },
    },

    // =====================================================
    // LOGO
    // =====================================================

    {
      method: 'POST',

      path:
        '/restaurants/:documentId/logo',

      handler:
        'restaurant.createLogo',

      info: {
        apiName:
          'restaurant',

        type:
          'content-api',
      },

      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'PATCH',

      path:
        '/restaurants/:documentId/logo',

      handler:
        'restaurant.updateLogo',

      info: {
        apiName:
          'restaurant',

        type:
          'content-api',
      },

      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'DELETE',

      path:
        '/restaurants/:documentId/logo',

      handler:
        'restaurant.removeLogo',

      info: {
        apiName:
          'restaurant',

        type:
          'content-api',
      },

      config: {
        policies: [],
        middlewares: [],
      },
    },

    // =====================================================
    // QR IMAGE
    // =====================================================

    {
      method: 'POST',

      path:
        '/restaurants/:documentId/qr-image',

      handler:
        'restaurant.createQRImage',

      info: {
        apiName:
          'restaurant',

        type:
          'content-api',
      },

      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'PATCH',

      path:
        '/restaurants/:documentId/qr-image',

      handler:
        'restaurant.updateQRImage',

      info: {
        apiName:
          'restaurant',

        type:
          'content-api',
      },

      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'DELETE',

      path:
        '/restaurants/:documentId/qr-image',

      handler:
        'restaurant.removeQRImage',

      info: {
        apiName:
          'restaurant',

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