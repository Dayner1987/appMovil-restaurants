/**
 * Custom company routes
 */

export default {
  routes: [
    {
      method: 'PATCH',
      path: '/companies/:documentId',
      handler: 'company.patchInfo',
      config: {},
    },
    {
      method: 'PUT',
      path: '/companies/:documentId/logo',
      handler: 'company.putLogo',
      config: {},
    },
    {
      method: 'PATCH',
      path: '/companies/:documentId/logo',
      handler: 'company.patchLogo',
      config: {},
    },
    {
      method: 'DELETE',
      path: '/companies/:documentId/logo',
      handler: 'company.deleteLogo',
      config: {},
    },
  ],
};