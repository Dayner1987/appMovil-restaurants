// src/extensions/users-permissions/server/routes/me-routes.ts

export const meRoutes = [
  {
    method: 'PATCH',

    path:
      '/users/me/profile',

    handler:
      'user.updateProfile',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
    },
  },

  {
    method: 'GET',

    path:
      '/users/me/avatar',

    handler:
      'user.getMyAvatar',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
    },
  },

  {
    method: 'PUT',

    path:
      '/users/me/avatar',

    handler:
      'user.updateMyAvatar',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
    },
  },

  {
    method: 'DELETE',

    path:
      '/users/me/avatar',

    handler:
      'user.removeMyAvatar',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
    },
  },
];