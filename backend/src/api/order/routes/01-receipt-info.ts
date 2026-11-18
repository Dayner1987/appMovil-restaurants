export default {
  routes: [{
    method: 'GET',
    path: '/orders/:documentId/receipt-info',
    handler: 'receipt-info.details',
    config: { auth: { scope: [] } },
  }],
};
