// src/api/restaurant-application/controllers/restaurant-application.ts

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

type ApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

const APPLICATION_UID =
  'api::restaurant-application.restaurant-application';

const USER_UID =
  'plugin::users-permissions.user';

const RESTAURANT_UID =
  'api::restaurant.restaurant';

const ROLE_UID =
  'plugin::users-permissions.role';

// =====================================================
// AGREGAR APPLICANT A LOS GET
// =====================================================
function populateApplicant(ctx: any) {
  ctx.query = {
    ...(ctx.query || {}),
    populate:
      ctx.query?.populate || {
        applicant: {
          populate: ['role', 'restaurant'],
        },
      },
  };
}

// =====================================================
// RESPUESTA SEGURA DE SOLICITUD
// No devolvemos password ni campos sensibles.
// =====================================================
function buildApplicationResponse(
  application: any
) {
  const applicant =
    application?.applicant;

  return {
    data: {
      id:
        application.id,

      documentId:
        application.documentId,

      proposedRestaurantName:
        application.proposedRestaurantName,

      status:
        application.status,

      rejectionReason:
        application.rejectionReason ?? null,

      reviewedAt:
        application.reviewedAt ?? null,

      createdAt:
        application.createdAt,

      updatedAt:
        application.updatedAt,

      publishedAt:
        application.publishedAt ?? null,

      applicant: applicant
        ? {
            id:
              applicant.id,

            documentId:
              applicant.documentId,

            username:
              applicant.username,

            email:
              applicant.email,

            firstName:
              applicant.firstName ?? null,

            middleName:
              applicant.middleName ?? null,

            lastName:
              applicant.lastName ?? null,

            secondLastName:
              applicant.secondLastName ?? null,

            ci:
              applicant.ci ?? null,

            phone:
              applicant.phone ?? null,

            blocked:
              applicant.blocked,

            confirmed:
              applicant.confirmed,

            role: applicant.role
              ? {
                  id: applicant.role.id,
                  name: applicant.role.name,
                  type: applicant.role.type,
                }
              : null,

            restaurant: applicant.restaurant
              ? {
                  id: applicant.restaurant.id,
                  documentId: applicant.restaurant.documentId,
                  name: applicant.restaurant.name,
                  email: applicant.restaurant.email,
                  statusRes: applicant.restaurant.statusRes,
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
    // =====================================================
    // REGISTRAR SOLICITUD
    // POST /api/restaurant-applications/register
    // =====================================================
    async register(ctx: any) {
      const body = (
        ctx.request.body || {}
      ) as Partial<RestaurantRegisterBody>;

      const {
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        proposedRestaurantName,
      } = body;

      // ===================================================
      // VALIDACIONES
      // ===================================================
      if (
        typeof username !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        typeof firstName !== 'string' ||
        typeof lastName !== 'string' ||
        typeof phone !== 'string' ||
        typeof proposedRestaurantName !==
          'string' ||
        !username.trim() ||
        !email.trim() ||
        !password ||
        !firstName.trim() ||
        !lastName.trim() ||
        !phone.trim() ||
        !proposedRestaurantName.trim()
      ) {
        return ctx.badRequest(
          'Todos los campos son obligatorios'
        );
      }

      if (password.length < 6) {
        return ctx.badRequest(
          'La contraseña debe tener al menos 6 caracteres'
        );
      }

      const normalizedUsername =
        username.trim();

      const normalizedEmail =
        email.trim().toLowerCase();

      const normalizedPhone =
        phone.trim();

      // ===================================================
      // VERIFICAR USUARIO EXISTENTE
      // ===================================================
      const existingUser =
        await strapi.db
          .query(USER_UID)
          .findOne({
            where: {
              $or: [
                {
                  username:
                    normalizedUsername,
                },
                {
                  email:
                    normalizedEmail,
                },
                {
                  phone:
                    normalizedPhone,
                },
              ],
            },
          });

      if (existingUser) {
        return ctx.badRequest(
          'El correo electrónico, nombre de usuario o teléfono ya está registrado'
        );
      }

      // ===================================================
      // OBTENER ROL AUTHENTICATED
      // ===================================================
      const authenticatedRole =
        await strapi.db
          .query(
            'plugin::users-permissions.role'
          )
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
        // =================================================
        // CREAR USUARIO BLOQUEADO
        // =================================================
        const userService = strapi
          .plugin('users-permissions')
          .service('user');

        createdUser =
          await userService.add({
            username:
              normalizedUsername,

            email:
              normalizedEmail,

            password,

            provider:
              'local',

            confirmed:
              true,

            // No puede iniciar sesión hasta ser aprobado.
            blocked:
              true,

            role:
              authenticatedRole.id,

            firstName:
              firstName.trim(),

            lastName:
              lastName.trim(),

            phone:
              normalizedPhone,
          });

        // =================================================
        // CREAR SOLICITUD
        // =================================================
        const application =
          await strapi.db
            .query(APPLICATION_UID)
            .create({
              data: {
                proposedRestaurantName:
                  proposedRestaurantName.trim(),

                status:
                  'pending',

                rejectionReason:
                  null,

                reviewedAt:
                  null,

                applicant:
                  createdUser.id,
              },
            });

        ctx.status = 201;

        ctx.body = {
          message:
            'Solicitud registrada correctamente. Debe esperar la aprobación del administrador.',

          application: {
            id:
              application.id,

            documentId:
              application.documentId,

            proposedRestaurantName:
              application.proposedRestaurantName,

            status:
              application.status,
          },
        };

        return ctx.body;
      } catch (error) {
        strapi.log.error(
          'Error registrando solicitud de restaurante',
          error
        );

        // Si el usuario fue creado pero la solicitud falló,
        // eliminamos el usuario para no dejar datos huérfanos.
        if (createdUser?.id) {
          try {
            await strapi.db
              .query(USER_UID)
              .delete({
                where: {
                  id:
                    createdUser.id,
                },
              });
          } catch (deleteError) {
            strapi.log.error(
              'No se pudo eliminar el usuario después del error',
              deleteError
            );
          }
        }

        return ctx.internalServerError(
          'No se pudo registrar la solicitud'
        );
      }
    },

    // =====================================================
    // ADMIN - LISTAR SOLICITUDES
    // GET /api/restaurant-applications/admin
    // =====================================================
    async adminFind(ctx: any) {
      populateApplicant(ctx);

      return await super.find(ctx);
    },

    // =====================================================
    // ADMIN - VER UNA SOLICITUD
    // GET /api/restaurant-applications/admin/:documentId
    // =====================================================
    async adminFindOne(ctx: any) {
      const documentId = String(
        ctx.params?.documentId || ''
      ).trim();

      if (!documentId) {
        return ctx.badRequest(
          'El documentId es obligatorio'
        );
      }

      const application =
        await strapi.db
          .query(APPLICATION_UID)
          .findOne({
            where: {
              documentId,
            },

            populate: {
              applicant: {
                populate: {
                  role: true,
                  restaurant: true,
                },
              },
            },
          });

      if (!application) {
        return ctx.notFound(
          'No se encontró la solicitud'
        );
      }

      ctx.status = 200;

      ctx.body =
        buildApplicationResponse(
          application
        );

      return ctx.body;
    },

    // =====================================================
    // ADMIN - APROBAR / RECHAZAR
    //
    // PUT
    // /api/restaurant-applications/admin/:documentId/status
    // =====================================================
    async adminUpdateStatus(
      ctx: any
    ) {
      const documentId = String(
        ctx.params?.documentId || ''
      ).trim();

      if (!documentId) {
        return ctx.badRequest(
          'El documentId es obligatorio'
        );
      }

      // ===================================================
      // LEER BODY
      // ===================================================
      const body =
        ctx.request.body || {};

      // Permitimos:
      //
      // { status: "approved" }
      //
      // o:
      //
      // {
      //   data: {
      //     status: "approved"
      //   }
      // }
      //
      // Incluso toleramos doble data accidental.
      const data =
        body?.data?.data ??
        body?.data ??
        body;

      const status =
        data?.status as
          | ApplicationStatus
          | undefined;

      strapi.log.info(
        `BODY adminUpdateStatus: ${JSON.stringify(
          ctx.request.body
        )}`
      );

      if (
        status !== 'approved' &&
        status !== 'rejected'
      ) {
        return ctx.badRequest(
          `El estado debe ser approved o rejected. Recibido: ${String(
            status
          )}`
        );
      }

      // ===================================================
      // BUSCAR SOLICITUD
      // ===================================================
      const application =
        await strapi.db
          .query(APPLICATION_UID)
          .findOne({
            where: {
              documentId,
            },

            populate: {
              applicant: true,
            },
          });

      if (!application) {
        return ctx.notFound(
          'No se encontró la solicitud'
        );
      }

      if (!application.applicant) {
        return ctx.badRequest(
          'La solicitud no tiene un usuario asociado'
        );
      }

      const applicant =
        application.applicant;

      // Si la solicitud ya estaba aprobada, se vuelve a verificar
      // el usuario, el rol y el restaurante. Esto permite reparar
      // aprobaciones antiguas que quedaron incompletas.

      const reviewedAt =
        new Date().toISOString();

      // ===================================================
      // RECHAZAR
      // ===================================================
      if (status === 'rejected') {
        if (
          application.status ===
          'approved'
        ) {
          return ctx.badRequest(
            'Una solicitud aprobada no puede ser rechazada'
          );
        }

        const rejectionReason =
          typeof data.rejectionReason ===
          'string'
            ? data.rejectionReason.trim()
            : '';

        if (!rejectionReason) {
          return ctx.badRequest(
            'Debe indicar el motivo del rechazo'
          );
        }

        try {
          // ===============================================
          // MANTENER USUARIO BLOQUEADO
          // ===============================================
          await strapi.db
            .query(USER_UID)
            .update({
              where: {
                id:
                  applicant.id,
              },

              data: {
                blocked:
                  true,
              },
            });

          // ===============================================
          // ACTUALIZAR SOLICITUD
          // ===============================================
          await strapi.db
            .query(APPLICATION_UID)
            .update({
              where: {
                id:
                  application.id,
              },

              data: {
                status:
                  'rejected',

                rejectionReason,

                reviewedAt,
              },
            });

          // ===============================================
          // RECUPERAR SOLICITUD ACTUALIZADA
          // ===============================================
          const updatedApplication =
            await strapi.db
              .query(APPLICATION_UID)
              .findOne({
                where: {
                  documentId,
                },

                populate: {
                  applicant: true,
                },
              });

          if (!updatedApplication) {
            return ctx.internalServerError(
              'La solicitud fue rechazada, pero no se pudo recuperar el resultado'
            );
          }

          ctx.status = 200;

          ctx.body =
            buildApplicationResponse(
              updatedApplication
            );

          return ctx.body;
        } catch (error) {
          strapi.log.error(
            'Error rechazando solicitud de restaurante',
            error
          );

          return ctx.internalServerError(
            'No se pudo rechazar la solicitud'
          );
        }
      }

      // ===================================================
      // APROBAR Y ACTIVAR CUENTA DE RESTAURANTE
      // ===================================================
      try {
        const user = await strapi.db
          .query(USER_UID)
          .findOne({
            where: { id: applicant.id },
            populate: {
              role: true,
              restaurant: true,
            },
          });

        if (!user) {
          return ctx.notFound(
            'No se encontró el usuario solicitante'
          );
        }

        // Buscar el rol por type y, como respaldo, por name.
        let restaurantRole = await strapi.db
          .query(ROLE_UID)
          .findOne({ where: { type: 'restaurant' } });

        if (!restaurantRole) {
          restaurantRole = await strapi.db
            .query(ROLE_UID)
            .findOne({ where: { name: 'Restaurant' } });
        }
        if (!restaurantRole) {
          restaurantRole = await strapi.db
            .query(ROLE_UID)
            .findOne({ where: { name: 'Restaurante' } });
        }

        if (!restaurantRole) {
          const roles = await strapi.db
            .query(ROLE_UID)
            .findMany({ select: ['id', 'name', 'type'] });
          restaurantRole = roles.find((role: any) =>
            ['restaurant', 'restaurante'].includes(String(role.name || '').trim().toLowerCase()) ||
            String(role.type || '').trim().toLowerCase() === 'restaurant'
          ) || null;
        }

        if (!restaurantRole) {
          strapi.log.error(
            'No existe un rol Restaurant en Users & Permissions. No se completó la aprobación.'
          );
          return ctx.internalServerError(
            'No se encontró el rol Restaurant. Créalo en la administración de roles y vuelve a aprobar la solicitud.'
          );
        }

        let restaurant = user.restaurant;
        let recoveredByEmail = false;

        // Recuperación idempotente: si un intento anterior creó el
        // restaurante pero falló antes de vincularlo al usuario,
        // se reutiliza el registro que tenga el correo del solicitante.
        if (!restaurant) {
          restaurant = await strapi.db
            .query(RESTAURANT_UID)
            .findOne({
              where: { email: applicant.email },
            });
          recoveredByEmail = Boolean(restaurant);
        }

        if (!restaurant) {
          const createdRestaurant = await strapi
            .documents(RESTAURANT_UID)
            .create({
              status: 'published',
              data: {
                name: application.proposedRestaurantName,
                email: applicant.email,
                phone: applicant.phone || null,
                statusRes: 'ACTIVE',
              },
              populate: {
                users: true,
              },
            });

          restaurant = createdRestaurant;
          strapi.log.info(
            `Restaurante publicado durante la aprobación: ${createdRestaurant.documentId}`
          );
        } else if (!restaurant.publishedAt && restaurant.documentId) {
          // Evita que una relación antigua apunte a un restaurante borrador.
          await strapi.documents(RESTAURANT_UID).publish({
            documentId: restaurant.documentId,
          });

          restaurant = await strapi.db
            .query(RESTAURANT_UID)
            .findOne({
              where: { id: restaurant.id },
            });
        }

        if (!restaurant?.id) {
          throw new Error(
            'No se pudo crear o recuperar el registro del restaurante.'
          );
        }

        // La aprobación deja el restaurante activo y publicado. Si se recuperó
        // un registro previo por correo, se alinea también su nombre con la
        // solicitud que se está aprobando.
        if (restaurant.documentId) {
          restaurant = await strapi.documents(RESTAURANT_UID).update({
            documentId: restaurant.documentId,
            status: 'published',
            data: {
              statusRes: 'ACTIVE',
              ...(recoveredByEmail ? { name: application.proposedRestaurantName } : {}),
            },
            populate: { users: true },
          });
        } else {
          await strapi.db.query(RESTAURANT_UID).update({
            where: { id: restaurant.id },
            data: { statusRes: 'ACTIVE' },
          });
        }

        // Este es el paso que faltaba: asignar el rol Restaurant,
        // relacionar el usuario con el restaurante y habilitar el acceso.
        await strapi.db
          .query(USER_UID)
          .update({
            where: { id: applicant.id },
            data: {
              role: restaurantRole.id,
              restaurant: restaurant.id,
              blocked: false,
              confirmed: true,
            },
          });

        await strapi.db
          .query(APPLICATION_UID)
          .update({
            where: { id: application.id },
            data: {
              status: 'approved',
              rejectionReason: null,
              reviewedAt,
            },
          });

        const updatedApplication = await strapi.db
          .query(APPLICATION_UID)
          .findOne({
            where: { documentId },
            populate: {
              applicant: {
                populate: {
                  role: true,
                  restaurant: true,
                },
              },
            },
          });

        if (!updatedApplication) {
          return ctx.internalServerError(
            'La solicitud fue aprobada, pero no se pudo recuperar el resultado.'
          );
        }

        ctx.status = 200;
        ctx.body = buildApplicationResponse(updatedApplication);
        return ctx.body;
      } catch (error) {
        strapi.log.error(
          'Error aprobando solicitud de restaurante',
          error
        );

        return ctx.internalServerError(
          'No se pudo aprobar la solicitud'
        );
      }
    },
  })
);