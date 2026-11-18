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

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

const APPLICATION_UID = 'api::restaurant-application.restaurant-application';
const RESTAURANT_UID = 'api::restaurant.restaurant';
const USER_UID = 'plugin::users-permissions.user';
const ROLE_UID = 'plugin::users-permissions.role';

const applicantPopulate = {
  applicant: {
    populate: {
      role: true,
      restaurant: true,
    },
  },
};

function buildApplicationResponse(application: any) {
  const applicant = application.applicant;
  const role = applicant?.role;
  const restaurant = applicant?.restaurant;

  return {
    data: {
      id: application.id,
      documentId: application.documentId,
      proposedRestaurantName: application.proposedRestaurantName,
      status: application.status,
      rejectionReason: application.rejectionReason ?? null,
      reviewedAt: application.reviewedAt ?? null,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      publishedAt: application.publishedAt ?? null,

      applicant: applicant
        ? {
            id: applicant.id,
            documentId: applicant.documentId,
            username: applicant.username,
            email: applicant.email,
            firstName: applicant.firstName ?? null,
            middleName: applicant.middleName ?? null,
            lastName: applicant.lastName ?? null,
            secondLastName: applicant.secondLastName ?? null,
            ci: applicant.ci ?? null,
            phone: applicant.phone ?? null,
            blocked: applicant.blocked,
            confirmed: applicant.confirmed,

            role: role
              ? {
                  id: role.id,
                  name: role.name,
                  type: role.type,
                }
              : null,

            restaurant: restaurant
              ? {
                  id: restaurant.id,
                  documentId: restaurant.documentId,
                  name: restaurant.name,
                  email: restaurant.email,
                  statusRes: restaurant.statusRes,
                }
              : null,
          }
        : null,
    },
    meta: {},
  };
}

export default factories.createCoreController(
  APPLICATION_UID,
  ({ strapi }) => ({
    // POST /api/restaurant-applications/register
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
        return ctx.badRequest('La contraseña debe tener al menos 6 caracteres');
      }

      const normalizedUsername = username.trim();
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPhone = phone.trim();

      const users = strapi.db.query(USER_UID);
      const existingUser = await users.findOne({
        where: {
          $or: [
            { username: normalizedUsername },
            { email: normalizedEmail },
            { phone: normalizedPhone },
          ],
        },
      });

      if (existingUser) {
        return ctx.badRequest(
          'El correo electrónico, nombre de usuario o teléfono ya está registrado'
        );
      }

      const authenticatedRole = await strapi.db.query(ROLE_UID).findOne({
        where: { type: 'authenticated' },
      });

      if (!authenticatedRole) {
        return ctx.internalServerError('No se encontró el rol Authenticated');
      }

      let createdUser: any = null;

      try {
        const userService = strapi.plugin('users-permissions').service('user');

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
          phone: normalizedPhone,
        });

        const application = await strapi.db.query(APPLICATION_UID).create({
          data: {
            proposedRestaurantName: proposedRestaurantName.trim(),
            status: 'pending',
            rejectionReason: null,
            reviewedAt: null,
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
            proposedRestaurantName: application.proposedRestaurantName,
            status: application.status,
          },
        };

        return ctx.body;
      } catch (error) {
        strapi.log.error('Error registrando solicitud de restaurante', error);

        if (createdUser?.id) {
          try {
            await users.delete({ where: { id: createdUser.id } });
          } catch (deleteError) {
            strapi.log.error(
              'No se pudo eliminar el usuario después del error',
              deleteError
            );
          }
        }

        return ctx.internalServerError('No se pudo registrar la solicitud');
      }
    },

    // GET /api/restaurant-applications/admin
    async adminFind(ctx: any) {
      ctx.query = {
        ...(ctx.query || {}),
        populate: ctx.query?.populate || applicantPopulate,
      };

      return await super.find(ctx);
    },

    // GET /api/restaurant-applications/admin/:documentId
    async adminFindOne(ctx: any) {
      const documentId = String(ctx.params?.documentId || '').trim();

      if (!documentId) {
        return ctx.badRequest('El documentId es obligatorio');
      }

      const application = await strapi.db.query(APPLICATION_UID).findOne({
        where: { documentId },
        populate: applicantPopulate,
      });

      if (!application) {
        return ctx.notFound('No se encontró la solicitud');
      }

      ctx.status = 200;
      ctx.body = buildApplicationResponse(application);
      return ctx.body;
    },

    // PUT /api/restaurant-applications/admin/:documentId/status
    async adminUpdateStatus(ctx: any) {
      const documentId = String(ctx.params?.documentId || '').trim();

      if (!documentId) {
        return ctx.badRequest('El documentId es obligatorio');
      }

      const body = ctx.request.body || {};
      const data = body?.data?.data ?? body?.data ?? body;
      const status = data?.status as ApplicationStatus | undefined;

      if (status !== 'approved' && status !== 'rejected') {
        return ctx.badRequest('El estado debe ser approved o rejected');
      }

      const rejectionReason =
        typeof data.rejectionReason === 'string'
          ? data.rejectionReason.trim()
          : '';

      if (status === 'rejected' && !rejectionReason) {
        return ctx.badRequest('Debe indicar el motivo del rechazo');
      }

      try {
        const result = await strapi.db.transaction(async ({ trx }) => {
          // Serializa las revisiones simultáneas de la misma solicitud.
          const table = strapi.db.metadata.get(APPLICATION_UID).tableName;
          const matched = await trx(table)
            .where({ document_id: documentId })
            .update({ status: trx.ref('status') });

          if (!matched) {
            return { code: 404, message: 'No se encontró la solicitud' };
          }

          const applications = strapi.db.query(APPLICATION_UID);
          const users = strapi.db.query(USER_UID);

          const application = await applications.findOne({
            where: { documentId },
            populate: applicantPopulate,
          });

          const user = application?.applicant;

          if (!user?.documentId) {
            return {
              code: 400,
              message: 'La solicitud no tiene un usuario asociado',
            };
          }

          const reviewedAt = new Date().toISOString();

          if (status === 'rejected') {
            if (application.status === 'approved') {
              return {
                code: 400,
                message: 'Una solicitud aprobada no puede ser rechazada',
              };
            }

            await users.update({
              where: { id: user.id },
              data: { blocked: true },
            });
          } else {
            const roles = await strapi.db.query(ROLE_UID).findMany({
              select: ['id', 'type', 'name'],
            });

            const role =
              roles.find((item: any) => item.type === 'restaurant') ??
              roles.find((item: any) =>
                ['restaurant', 'restaurante'].includes(
                  String(item.name).trim().toLowerCase()
                )
              );

            if (!role) {
              throw new Error('No se encontró el rol Restaurant / Restaurante');
            }

            const restaurants = strapi.documents(RESTAURANT_UID);
            let restaurantId: string | undefined = user.restaurant?.documentId;

            // Una solicitud antigua ya aprobada puede haber quedado sin vínculo.
            if (!restaurantId && application.status === 'approved') {
              const matches = await strapi.db.query(RESTAURANT_UID).findMany({
                where: { email: user.email },
                populate: { users: true },
              });

              // El borrador y la publicación comparten documentId.
              const documentIds = new Set(
                matches.map((item: any) => item.documentId)
              );

              const hasConflict = matches.some(
                (item: any) =>
                  item.name !== application.proposedRestaurantName ||
                  item.users.some((member: any) => member.id !== user.id)
              );

              if (documentIds.size !== 1 || hasConflict) {
                return {
                  code: 409,
                  message:
                    'Revisa el restaurante de esta aprobación anterior. No se pudo identificar con certeza.',
                };
              }

              restaurantId = matches[0].documentId;
            }

            if (!restaurantId) {
              const created = await restaurants.create({
                status: 'published',
                data: {
                  name: application.proposedRestaurantName,
                  email: user.email,
                  phone: user.phone || null,
                  statusRes: 'ACTIVE',
                },
              });

              restaurantId = created.documentId;
            } else {
              const published = await restaurants.findOne({
                documentId: restaurantId,
                status: 'published',
              });

              if (!published) {
                await restaurants.publish({ documentId: restaurantId });
              }
            }

            if (!restaurantId) {
              throw new Error('No se obtuvo el documentId del restaurante');
            }

            // User.restaurant es manyToOne y recibe una referencia singular.
            await strapi.documents(USER_UID).update({
              documentId: user.documentId,
              data: {
                restaurant: {
                  documentId: restaurantId,
                },
              },
            });

            await users.update({
              where: { id: user.id },
              data: {
                role: role.id,
                confirmed: true,
                blocked: false,
              },
            });

            const linkedUser = await users.findOne({
              where: { id: user.id },
              populate: { restaurant: true },
            });

            if (linkedUser?.restaurant?.documentId !== restaurantId) {
              throw new Error(
                'No se pudo verificar el restaurante asignado al usuario'
              );
            }

            for (const version of ['draft', 'published'] as const) {
              const linkedRestaurant = await restaurants.findOne({
                documentId: restaurantId,
                status: version,
                populate: { users: true },
              });

              const hasApplicant = linkedRestaurant?.users?.some(
                (member: any) => member.id === user.id
              );

              if (!hasApplicant) {
                throw new Error(
                  `No se encontró al solicitante en los usuarios del restaurante (${version})`
                );
              }
            }
          }

          const updated = await applications.update({
            where: { id: application.id },
            data: {
              status,
              rejectionReason: status === 'rejected' ? rejectionReason : null,
              reviewedAt:
                application.status === 'approved'
                  ? application.reviewedAt ?? reviewedAt
                  : reviewedAt,
            },
            populate: applicantPopulate,
          });

          return {
            code: 200,
            response: buildApplicationResponse(updated),
          };
        });

        if (result.code !== 200) {
          return ctx.throw(result.code, result.message);
        }

        ctx.status = 200;
        ctx.body = result.response;
        return ctx.body;
      } catch (error) {
        if ((error as any)?.status) throw error;

        strapi.log.error(
          'Error actualizando la solicitud de restaurante',
          error
        );

        return ctx.internalServerError(
          'No se pudo completar el cambio de estado de la solicitud'
        );
      }
    },
  })
);