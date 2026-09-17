import { factories } from '@strapi/strapi';

interface RestaurantRegisterBody {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  proposedRestaurantName: string;
}

export default factories.createCoreController(
  'api::restaurant-application.restaurant-application',
  ({ strapi }) => ({
    async register(ctx: any) {
      const body = (ctx.request.body || {}) as Partial<RestaurantRegisterBody>;

      const {
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        proposedRestaurantName,
      } = body;

      if (
        typeof username !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        typeof firstName !== 'string' ||
        typeof lastName !== 'string' ||
        typeof phone !== 'string' ||
        typeof proposedRestaurantName !== 'string' ||
        !username.trim() ||
        !email.trim() ||
        !password ||
        !firstName.trim() ||
        !lastName.trim() ||
        !phone.trim() ||
        !proposedRestaurantName.trim()
      ) {
        return ctx.badRequest('Todos los campos son obligatorios');
      }

      if (password.length < 6) {
        return ctx.badRequest(
          'La contraseña debe tener al menos 6 caracteres'
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedUsername = username.trim();

      const existingUser = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({
          where: {
            $or: [
              { email: normalizedEmail },
              { username: normalizedUsername },
            ],
          },
        });

      if (existingUser) {
        return ctx.badRequest(
          'El correo electrónico o nombre de usuario ya está registrado'
        );
      }

      const authenticatedRole = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({
          where: {
            type: 'authenticated',
          },
        });

      if (!authenticatedRole) {
        return ctx.internalServerError(
          'No se encontró el rol Authenticated'
        );
      }

      let createdUser: any = null;

      try {
        const userService = strapi
          .plugin('users-permissions')
          .service('user');

        createdUser = await userService.add({
          username: normalizedUsername,
          email: normalizedEmail,
          password,
          provider: 'local',
          confirmed: true,
          blocked: true,
          role: authenticatedRole.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        });

        const application = await strapi.db
          .query('api::restaurant-application.restaurant-application')
          .create({
            data: {
              proposedRestaurantName: proposedRestaurantName.trim(),
              status: 'pending',
              applicant: createdUser.id,
            },
          });

        ctx.status = 201;
        ctx.body = {
          message:
            'Solicitud registrada correctamente. Debe esperar la aprobación del administrador.',
          application: {
            id: application.id,
            documentId: application.documentId,
            proposedRestaurantName:
              application.proposedRestaurantName,
            status: application.status,
          },
        };

        return ctx.body;
      } catch (error) {
        strapi.log.error(
          'Error registrando solicitud de restaurante',
          error
        );

        if (createdUser?.id) {
          await strapi.db
            .query('plugin::users-permissions.user')
            .delete({
              where: {
                id: createdUser.id,
              },
            });
        }

        return ctx.internalServerError(
          'No se pudo registrar la solicitud'
        );
      }
    },
  })
);