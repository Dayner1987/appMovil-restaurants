export default (plugin: any) => {
  plugin.controllers.user.updateMe = async (ctx: any) => {
    const user = ctx.state.user;

    if (!user) {
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
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const updatedUser = await strapi
      .plugin('users-permissions')
      .service('user')
      .edit(user.id, cleanData);

    ctx.body = updatedUser;
  };

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