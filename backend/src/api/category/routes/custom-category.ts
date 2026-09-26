// backend/src/api/category/routes/custom-category.ts

export default {
  routes: [
    {
      method:
        'PATCH',

      path:
        '/categories/:documentId',

      handler:
        'category.patch',

      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};