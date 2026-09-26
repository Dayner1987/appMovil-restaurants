// backend/src/api/product/routes/custom-product.ts

export default {
  type: 'content-api',

  routes: [
    // =====================================================
    // PRODUCT
    // =====================================================

    {
      method: 'PATCH',

      path:
        '/products/:documentId',

      handler:
        'product.patch',

      config: {
        auth: {
          scope: [],
        },

        policies: [],
        middlewares: [],
      },
    },

    // =====================================================
    // MAIN IMAGE
    // =====================================================

    {
      method: 'POST',

      path:
        '/products/:documentId/main-image',

      handler:
        'product.createMainImage',

      config: {
        auth: {
          scope: [],
        },

        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'PATCH',

      path:
        '/products/:documentId/main-image',

      handler:
        'product.updateMainImage',

      config: {
        auth: {
          scope: [],
        },

        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'DELETE',

      path:
        '/products/:documentId/main-image',

      handler:
        'product.removeMainImage',

      config: {
        auth: {
          scope: [],
        },

        policies: [],
        middlewares: [],
      },
    },

    // =====================================================
    // GALLERY
    // =====================================================

    {
      method: 'POST',

      path:
        '/products/:documentId/gallery',

      handler:
        'product.addGalleryImages',

      config: {
        auth: {
          scope: [],
        },

        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'PATCH',

      path:
        '/products/:documentId/gallery/:fileId',

      handler:
        'product.updateGalleryImage',

      config: {
        auth: {
          scope: [],
        },

        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'DELETE',

      path:
        '/products/:documentId/gallery/:fileId',

      handler:
        'product.removeGalleryImage',

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