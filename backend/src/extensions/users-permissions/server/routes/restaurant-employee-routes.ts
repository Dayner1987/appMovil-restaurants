// backend/src/extensions/users-permissions/server/routes/restaurant-employee-routes.ts

export const restaurantEmployeeRoutes = [
  // =====================================================
  // CREAR EMPLEADO
  // =====================================================
  {
    method: 'POST',
    path: '/restaurant/employees',
    handler:
      'user.restaurantCreateEmployee',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
      middlewares: [],
    },
  },

  // =====================================================
  // LISTAR EMPLEADOS DEL RESTAURANTE
  // =====================================================
  {
    method: 'GET',
    path: '/restaurant/employees',
    handler:
      'user.restaurantFindEmployees',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
      middlewares: [],
    },
  },

  // =====================================================
  // OBTENER EMPLEADO
  // =====================================================
  {
    method: 'GET',
    path: '/restaurant/employees/:id',
    handler:
      'user.restaurantFindEmployee',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
      middlewares: [],
    },
  },

  // =====================================================
  // ACTUALIZAR EMPLEADO
  // =====================================================
  {
    method: 'PUT',
    path: '/restaurant/employees/:id',
    handler:
      'user.restaurantUpdateEmployee',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
      middlewares: [],
    },
  },

  // =====================================================
  // BLOQUEAR / HABILITAR
  // =====================================================
  {
    method: 'PUT',
    path: '/restaurant/employees/:id/status',
    handler:
      'user.restaurantUpdateEmployeeStatus',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
      middlewares: [],
    },
  },

  // =====================================================
  // CAMBIAR CONTRASEÑA
  // =====================================================
  {
    method: 'PUT',
    path: '/restaurant/employees/:id/password',
    handler:
      'user.restaurantResetEmployeePassword',

    config: {
      auth: {
        scope: [],
      },

      policies: [],
      middlewares: [],
    },
  },
];