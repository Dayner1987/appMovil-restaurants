// src/api/restaurant-application/routes/01-custom-restaurant-application.ts

export default {
  routes: [
    {
      method: 'POST',
      path: '/restaurant-applications/register',
      handler: 'restaurant-application.register',
      config: {
        auth: false,
      },
    },

    {
      method: 'GET',
      path: '/restaurant-applications/admin',
      handler: 'restaurant-application.adminFind',
      config: {},
    },

    {
      method: 'GET',
      path: '/restaurant-applications/admin/:documentId',
      handler: 'restaurant-application.adminFindOne',
      config: {},
    },

    {
      method: 'PUT',
      path: '/restaurant-applications/admin/:documentId/status',
      handler: 'restaurant-application.adminUpdateStatus',
      config: {},
    },
  ],
};