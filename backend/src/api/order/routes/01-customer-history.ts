export default {
  routes: [
    {
      method: 'GET',
      path: '/orders/mine/history',
      handler: 'order.history',
      config: { auth: { scope: [] } },
    },
  ],
};
