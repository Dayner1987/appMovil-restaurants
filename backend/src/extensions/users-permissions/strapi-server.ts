export default (plugin: any) => {
  async function getUserRole(userId: number | string) {
    const user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: { id: userId },
        select: ['id'],
        populate: {
          role: {
            select: ['id', 'name', 'type', 'description'],
          },
        },
      });

    if (!user) {
      throw new Error('No se encontró el usuario');
    }

    return user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          type: user.role.type,
          description: user.role.description,
        }
      : null;
  }

  function extendController(
    name: string,
    extend: (controller: any) => any
  ) {
    const original = plugin.controllers[name];

    plugin.controllers[name] =
      typeof original === 'function'
        ? (...args: any[]) => extend(original(...args))
        : extend(original);
  }

  extendController('auth', (controller) => {
    for (const action of ['callback', 'register']) {
      const originalAction = controller[action];

      if (typeof originalAction !== 'function') {
        throw new Error(
          `No se encontró el controlador auth.${action}`
        );
      }

      controller[action] = async function (
        ctx: any,
        ...args: any[]
      ) {
        const result = await originalAction.call(
          this,
          ctx,
          ...args
        );

        const body = result ?? ctx.body;

        if (!body?.user?.id) {
          return result;
        }

        const role = await getUserRole(body.user.id);

        const response = {
          ...body,
          user: {
            ...body.user,
            role,
          },
        };

        ctx.body = response;
        return response;
      };
    }

    return controller;
  });

  extendController('user', (controller) => {
    const originalMe = controller.me;

    controller.me = async function (
      ctx: any,
      ...args: any[]
    ) {
      const result = await originalMe.call(this, ctx, ...args);
      const body = result ?? ctx.body;

      if (!body?.id) {
        return result;
      }

      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({
          where: { id: body.id },
          populate: {
            role: true,
            avatar: true,
            restaurant: true,
          },
        });

      if (!user) {
        return ctx.notFound('Usuario no encontrado');
      }

      const {
        password,
        resetPasswordToken,
        confirmationToken,
        ...safeUser
      } = user;

      ctx.body = safeUser;
      return safeUser;
    };

    controller.updateMe = async (ctx: any) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const {
        firstName,
        middleName,
        lastName,
        secondLastName,
        phone,
        ci,
      } = ctx.request.body || {};

      const data: Record<string, any> = {};

      if (firstName !== undefined) data.firstName = firstName;
      if (middleName !== undefined) data.middleName = middleName;
      if (lastName !== undefined) data.lastName = lastName;
      if (secondLastName !== undefined) {
        data.secondLastName = secondLastName;
      }
      if (phone !== undefined) data.phone = phone;
      if (ci !== undefined) data.ci = ci;

      const updatedUser = await strapi.db
        .query('plugin::users-permissions.user')
        .update({
          where: { id: userId },
          data,
          populate: {
            role: true,
            avatar: true,
            restaurant: true,
          },
        });

      if (!updatedUser) {
        return ctx.notFound('Usuario no encontrado');
      }

      const {
        password,
        resetPasswordToken,
        confirmationToken,
        ...safeUser
      } = updatedUser;

      ctx.body = safeUser;
      return safeUser;
    };

    controller.uploadMyAvatar = async (ctx: any) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const uploadedFile = ctx.request.files?.avatar;

      if (!uploadedFile) {
        return ctx.badRequest(
          'Debes enviar una imagen en el campo avatar'
        );
      }

      const file = Array.isArray(uploadedFile)
        ? uploadedFile[0]
        : uploadedFile;

      const uploadedFiles = await strapi
        .plugin('upload')
        .service('upload')
        .upload({
          data: {
            fileInfo: {
              name: file.name,
              alternativeText: `Avatar del usuario ${userId}`,
            },
          },
          files: file,
        });

      const avatar = uploadedFiles?.[0];

      if (!avatar) {
        return ctx.internalServerError(
          'No se pudo subir el avatar'
        );
      }

      const updatedUser = await strapi.db
        .query('plugin::users-permissions.user')
        .update({
          where: { id: userId },
          data: {
            avatar: avatar.id,
          },
          populate: {
            role: true,
            avatar: true,
            restaurant: true,
          },
        });

      const {
        password,
        resetPasswordToken,
        confirmationToken,
        ...safeUser
      } = updatedUser;

      ctx.body = safeUser;
      return safeUser;
    };

    return controller;
  });

  // Rutas agregadas dentro del mismo archivo.
 const contentApiRoutes =
  plugin.routes?.['content-api']?.routes;

if (!contentApiRoutes) {
  throw new Error(
    'No se encontraron las rutas content-api de users-permissions'
  );
}

contentApiRoutes.push(
  {
    method: 'PATCH',
    path: '/users/me/profile',
    handler: 'user.updateMe',
    config: {
      auth: {
        scope: [],
      },
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/users/me/avatar',
    handler: 'user.uploadMyAvatar',
    config: {
      auth: {
        scope: [],
      },
      policies: [],
    },
  }
);
  return plugin;
};