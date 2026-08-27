export default (plugin: any) => {
  async function findUserWithRole(userId: number) {
    return strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          id: userId,
        },
        populate: {
          role: true,
        },
      });
  }

  function formatRole(role: any) {
    if (!role) {
      return null;
    }

    return {
      id: role.id,
      name: role.name,
      type: role.type,
      description: role.description,
    };
  }

  function formatUser(user: any) {
    return {
      id: user.id,
      documentId: user.documentId,
      username: user.username,
      email: user.email,
      provider: user.provider,
      confirmed: user.confirmed,
      blocked: user.blocked,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      secondLastName: user.secondLastName,
      phone: user.phone,
      ci: user.ci,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: formatRole(user.role),
    };
  }

  /*
   * GET /api/users/me
   * Devuelve el usuario autenticado con su rol.
   */
  plugin.controllers.user.me = async (ctx: any) => {
    const authenticatedUser = ctx.state.user;

    if (!authenticatedUser) {
      return ctx.unauthorized('No autenticado');
    }

    const user = await findUserWithRole(
      authenticatedUser.id
    );

    if (!user) {
      return ctx.notFound('Usuario no encontrado');
    }

    ctx.body = formatUser(user);
  };

  /*
   * PATCH /api/users/me
   * Actualiza únicamente los campos autorizados.
   */
  plugin.controllers.user.updateMe = async (
    ctx: any
  ) => {
    const authenticatedUser = ctx.state.user;

    if (!authenticatedUser) {
      return ctx.unauthorized('No autenticado');
    }

    const {
      firstName,
      lastName,
      middleName,
      secondLastName,
      phone,
      ci,
    } = ctx.request.body;

    const data = {
      firstName,
      lastName,
      middleName,
      secondLastName,
      phone,
      ci,
    };

    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined
      )
    );

    await strapi
      .plugin('users-permissions')
      .service('user')
      .edit(authenticatedUser.id, cleanData);

    const updatedUser = await findUserWithRole(
      authenticatedUser.id
    );

    if (!updatedUser) {
      return ctx.notFound('Usuario no encontrado');
    }

    ctx.body = formatUser(updatedUser);
  };

  /*
   * Ruta para editar el usuario autenticado.
   */
  plugin.routes['content-api'].routes.push({
    method: 'PATCH',
    path: '/users/me',
    handler: 'user.updateMe',
    config: {
      prefix: '',
    },
  });

  return plugin;
};