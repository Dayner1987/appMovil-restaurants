export default {
  routes: [
    {
      method: 'POST',
      path: '/restaurant-applications/register',
      handler: 'api::restaurant-application.restaurant-application.register',
      config: {
        auth: false,
      },
    },
  ],
};