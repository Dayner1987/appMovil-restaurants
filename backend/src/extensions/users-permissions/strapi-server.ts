// src/extensions/users-permissions/strapi-server.ts

import {
  updateProfile,
} from './server/controllers/profile';

import {
  getMyAvatar,
  removeMyAvatar,
  updateMyAvatar,
} from './server/controllers/avatar';

import {
  meRoutes,
} from './server/routes/me-routes';

export default (
  plugin: any
) => {
  // =====================================================
  // OBTENER ROL
  // =====================================================

  async function getUserRole(
    userId:
      | number
      | string
  ) {
    const user =
      await strapi.db
        .query(
          'plugin::users-permissions.user'
        )
        .findOne({
          where: {
            id: userId,
          },

          select: ['id'],

          populate: {
            role: {
              select: [
                'id',
                'name',
                'type',
                'description',
              ],
            },
          },
        });

    if (!user) {
      throw new Error(
        'No se encontró el usuario'
      );
    }

    if (!user.role) {
      return null;
    }

    return {
      id:
        user.role.id,

      name:
        user.role.name,

      type:
        user.role.type,

      description:
        user.role
          .description,
    };
  }

  // =====================================================
  // SANITIZAR USER
  // =====================================================

  function sanitizeUser(
    user: any
  ) {
    if (!user) {
      return user;
    }

    const {
      password,
      resetPasswordToken,
      confirmationToken,
      ...safeUser
    } = user;

    return safeUser;
  }

  // =====================================================
  // EXTENDER CONTROLADORES
  // =====================================================

  function extendController(
    name: string,

    extend: (
      controller: any
    ) => any
  ) {
    const original =
      plugin.controllers[
        name
      ];

    plugin.controllers[
      name
    ] =
      typeof original ===
      'function'
        ? (
            ...args: any[]
          ) =>
            extend(
              original(
                ...args
              )
            )
        : extend(original);
  }

  // =====================================================
  // AUTH ORIGINAL
  // SOLO AGREGAMOS ROLE A LA RESPUESTA
  // =====================================================

  extendController(
    'auth',
    (
      controller
    ) => {
      for (const action of [
        'callback',
        'register',
      ]) {
        const originalAction =
          controller[
            action
          ];

        if (
          typeof originalAction !==
          'function'
        ) {
          throw new Error(
            `No se encontró auth.${action}`
          );
        }

        controller[
          action
        ] =
          async function (
            ctx: any,
            ...args: any[]
          ) {
            const result =
              await originalAction.call(
                this,
                ctx,
                ...args
              );

            const body =
              result ??
              ctx.body;

            if (
              !body?.user
                ?.id
            ) {
              return result;
            }

            const role =
              await getUserRole(
                body.user.id
              );

            const response =
              {
                ...body,

                user: {
                  ...body.user,
                  role,
                },
              };

            ctx.body =
              response;

            return response;
          };
      }

      return controller;
    }
  );

  // =====================================================
  // USER ORIGINAL
  // =====================================================

  extendController(
    'user',
    (
      controller
    ) => {
      // =================================================
      // GET /api/users/me
      // =================================================

      const originalMe =
        controller.me;

      if (
        typeof originalMe !==
        'function'
      ) {
        throw new Error(
          'No se encontró user.me'
        );
      }

      controller.me =
        async function (
          ctx: any,
          ...args: any[]
        ) {
          const result =
            await originalMe.call(
              this,
              ctx,
              ...args
            );

          const body =
            result ??
            ctx.body;

          if (!body?.id) {
            return result;
          }

          const user =
            await strapi.db
              .query(
                'plugin::users-permissions.user'
              )
              .findOne({
                where: {
                  id: body.id,
                },

                populate: {
                  role: {
                    select: [
                      'id',
                      'name',
                      'type',
                      'description',
                    ],
                  },

                  avatar:
                    true,

                  restaurant:
                    true,
                },
              });

          if (!user) {
            return ctx.notFound(
              'Usuario no encontrado'
            );
          }

          const safeUser =
            sanitizeUser(
              user
            );

          ctx.body =
            safeUser;

          return safeUser;
        };

      // =================================================
      // NUESTRAS ACCIONES
      // =================================================

      controller.updateProfile =
        updateProfile;

      controller.getMyAvatar =
        getMyAvatar;

      controller.updateMyAvatar =
        updateMyAvatar;

      controller.removeMyAvatar =
        removeMyAvatar;

      return controller;
    }
  );

  // =====================================================
  // AGREGAR RUTAS SIN BORRAR LAS DE STRAPI
  // =====================================================

  const contentApiRoutes =
    plugin.routes?.[
      'content-api'
    ]?.routes;

  if (!contentApiRoutes) {
    throw new Error(
      'No se encontraron las rutas content-api de users-permissions'
    );
  }

  for (
    const route of
    meRoutes
  ) {
    const alreadyExists =
      contentApiRoutes.some(
        (
          existing:
            any
        ) =>
          existing.method ===
            route.method &&
          existing.path ===
            route.path
      );

    if (
      !alreadyExists
    ) {
      contentApiRoutes.push(
        route
      );
    }
  }

  return plugin;
};