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

// =====================================================
// AGREGAR APPLICANT A LOS GET
// =====================================================
function populateApplicant(ctx: any) {
  ctx.query = {
    ...(ctx.query || {}),
    populate:
      ctx.query?.populate || 'applicant',
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
              applicant: true,
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

      // ===================================================
      // YA ESTÁ APROBADA
      //
      // Importante:
      // NO devolvemos 400.
      // Devolvemos 200 para que aprobar dos veces
      // accidentalmente no rompa el frontend.
      // ===================================================
      if (
        application.status ===
          'approved' &&
        status === 'approved'
      ) {
        ctx.status = 200;

        ctx.body =
          buildApplicationResponse(
            application
          );

        return ctx.body;
      }

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
      // APROBAR
      // ===================================================
      try {
        // ===============================================
        // BUSCAR USUARIO Y SU RESTAURANTE
        // ===============================================
        const user =
          await strapi.db
            .query(USER_UID)
            .findOne({
              where: {
                id:
                  applicant.id,
              },

              populate: {
                restaurant: true,
              },
            });

        if (!user) {
          return ctx.notFound(
            'No se encontró el usuario solicitante'
          );
        }

        let restaurant =
          user.restaurant;

        // ===============================================
        // CREAR RESTAURANTE SOLO SI NO EXISTE
        // ===============================================
        if (!restaurant) {
          restaurant =
            await strapi.db
              .query(RESTAURANT_UID)
              .create({
                data: {
                  name:
                    application.proposedRestaurantName,

                  email:
                    applicant.email,

                  phone:
                    applicant.phone ||
                    null,

                  statusRes:
                    'ACTIVE',

                  // Restaurant tiene Draft & Publish.
                  publishedAt:
                    new Date(),
                },
              });

          strapi.log.info(
            `Restaurante creado con ID: ${restaurant.id}`
          );
        } else {
          // Si por alguna razón el restaurante ya se creó
          // en un intento anterior, lo reutilizamos.
          strapi.log.info(
            `El usuario ya tiene el restaurante ${restaurant.id}. Se reutilizará.`
          );
        }

        // ===============================================
        // RELACIONAR RESTAURANTE Y DESBLOQUEAR USUARIO
        // ===============================================
        await strapi.db
          .query(USER_UID)
          .update({
            where: {
              id:
                applicant.id,
            },

            data: {
              restaurant:
                restaurant.id,

              blocked:
                false,
            },
          });

        // ===============================================
        // MARCAR SOLICITUD COMO APROBADA
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
                'approved',

              rejectionReason:
                null,

              reviewedAt,
            },
          });

        // ===============================================
        // CONSULTAR RESULTADO FINAL
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
            'La solicitud fue aprobada, pero no se pudo recuperar el resultado'
          );
        }

        // ===============================================
        // RESPONDER 200
        // ===============================================
        ctx.status = 200;

        ctx.body =
          buildApplicationResponse(
            updatedApplication
          );

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