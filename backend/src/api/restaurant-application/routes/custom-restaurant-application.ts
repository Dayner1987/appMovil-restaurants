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
  ],
};
