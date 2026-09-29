export const adminUserRoutes = [
  {
    method: 'PATCH',
    path: '/users/:id',
    handler: 'user.adminPatch',
    config: {
      auth: {
        scope: [],
      },
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/users/:id/avatar',
    handler: 'user.adminUpdateAvatar',
    config: {
      auth: {
        scope: [],
      },
      policies: [],
    },
  },
  {
    method: 'PATCH',
    path: '/users/:id/avatar',
    handler: 'user.adminUpdateAvatar',
    config: {
      auth: {
        scope: [],
      },
      policies: [],
    },
  },
  {
    method: 'DELETE',
    path: '/users/:id/avatar',
    handler: 'user.adminRemoveAvatar',
    config: {
      auth: {
        scope: [],
      },
      policies: [],
    },
  },
  {
  method: 'POST',
  path: '/users/admin/:id/password',
  handler: 'user.adminResetPassword',
  config: {
    auth: {
      scope: [],
    },
    policies: [],
  },
},
];