// backend/src/api/publication/routes/custom-publication.ts

export default {
  type: 'content-api',

  routes: [
    {
      method: 'PATCH',

      path:
        '/publications/:documentId',

      handler:
        'publication.patch',

      info: {
        apiName:
          'publication',

        type:
          'content-api',
      },

      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'POST',

      path:
        '/publications/:documentId/image',

      handler:
        'publication.createImage',

      info: {
        apiName:
          'publication',

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
        '/publications/:documentId/image',

      handler:
        'publication.updateImage',

      info: {
        apiName:
          'publication',

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
        '/publications/:documentId/image',

      handler:
        'publication.removeImage',

      info: {
        apiName:
          'publication',

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