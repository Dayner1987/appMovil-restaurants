// src/extensions/users-permissions/server/routes/admin-user-routes.ts

export const adminUserRoutes = [
  // =====================================================
  // ADMIN - RESET PASSWORD
  // =====================================================

  {
    method: 'POST',
    path: '/admin/users/:id/password',
    handler: 'user.adminResetPassword',
    config: {
      auth: {
        scope: [],
      },
      policies: [],
    },
  },

  // =====================================================
  // ADMIN - ACTUALIZAR AVATAR
  // =====================================================

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

  // =====================================================
  // ADMIN - ELIMINAR AVATAR
  // =====================================================

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

  // =====================================================
  // ADMIN - ACTUALIZAR USUARIO
  // IMPORTANTE: ruta genérica al final
  // =====================================================

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
];