// backend/src/api/restaurant/controllers/restaurant.ts

import {
  factories,
} from '@strapi/strapi';

const RESTAURANT_UID =
  'api::restaurant.restaurant' as const;

const ALLOWED_FIELDS = [
  'name',
  'slug',
  'description',
  'email',
  'address',
  'phone',
  'nit',
  'statusRes',
  'users',
  'categories',
  'products',
  'promotions',
  'publications',
  'orders',
];

// =====================================================
// HELPERS
// =====================================================

function getSingleFile(
  files: any,
  fieldName: string
) {
  const file =
    files?.[fieldName];

  if (!file) {
    return null;
  }

  return Array.isArray(
    file
  )
    ? file[0] ?? null
    : file;
}

async function uploadOneFile(
  strapi: any,
  file: any,
  alternativeText: string
) {
  const uploadedFiles =
    await strapi
      .plugin('upload')
      .service('upload')
      .upload({
        data: {
          fileInfo: {
            name:
              file.originalFilename ??
              file.name ??
              'image',

            alternativeText,
          },
        },

        files:
          file,
      });

  if (
    !uploadedFiles?.length
  ) {
    throw new Error(
      'No se pudo subir la imagen'
    );
  }

  return uploadedFiles[0];
}

async function removeUploadedFile(
  strapi: any,
  file: any
) {
  if (!file) {
    return;
  }

  await strapi
    .plugin('upload')
    .service('upload')
    .remove(file);
}

export default factories.createCoreController(
  RESTAURANT_UID,
  ({ strapi }) => {
    // ===================================================
    // ACTUALIZAR MEDIA
    // ===================================================

    async function updateMedia(
      ctx: any,
      fieldName:
        | 'logo'
        | 'QRImage',
      requireEmpty:
        boolean
    ) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId del restaurante es obligatorio'
        );
      }

      const restaurant =
        await strapi
          .documents(
            RESTAURANT_UID
          )
          .findOne({
            documentId,

            populate: {
              logo:
                true,

              QRImage:
                true,
            },
          });

      if (!restaurant) {
        return ctx.notFound(
          'Restaurante no encontrado'
        );
      }

      const currentMedia =
        (restaurant as any)[
          fieldName
        ];

      if (
        requireEmpty &&
        currentMedia
      ) {
        return ctx.badRequest(
          `${fieldName} ya existe. Utiliza PATCH para reemplazarlo.`
        );
      }

      const file =
        getSingleFile(
          ctx.request.files,
          fieldName
        );

      if (!file) {
        return ctx.badRequest(
          `Debe enviar un archivo en el campo ${fieldName}`
        );
      }

      let uploadedFile:
        any = null;

      try {
        uploadedFile =
          await uploadOneFile(
            strapi,
            file,
            `${fieldName} del restaurante ${documentId}`
          );

        const updated =
          await strapi
            .documents(
              RESTAURANT_UID
            )
            .update({
              documentId,

              data: {
                [fieldName]:
                  uploadedFile.id,
              } as any,

              populate: {
                logo:
                  true,

                QRImage:
                  true,

                users:
                  true,

                categories:
                  true,

                products:
                  true,

                promotions:
                  true,

                publications:
                  true,

                orders:
                  true,
              },
            });

        if (
          !requireEmpty &&
          currentMedia
        ) {
          try {
            await removeUploadedFile(
              strapi,
              currentMedia
            );
          } catch (
            deleteError
          ) {
            strapi.log.error(
              `No se pudo eliminar ${fieldName} anterior`,
              deleteError
            );
          }
        }

        return updated;
      } catch (error) {
        if (
          uploadedFile
        ) {
          try {
            await removeUploadedFile(
              strapi,
              uploadedFile
            );
          } catch {}
        }

        throw error;
      }
    }

    // ===================================================
    // ELIMINAR MEDIA
    // ===================================================

    async function deleteMedia(
      ctx: any,
      fieldName:
        | 'logo'
        | 'QRImage'
    ) {
      const {
        documentId,
      } = ctx.params;

      const restaurant =
        await strapi
          .documents(
            RESTAURANT_UID
          )
          .findOne({
            documentId,

            populate: {
              logo:
                true,

              QRImage:
                true,
            },
          });

      if (!restaurant) {
        return ctx.notFound(
          'Restaurante no encontrado'
        );
      }

      const currentMedia =
        (restaurant as any)[
          fieldName
        ];

      if (!currentMedia) {
        return ctx.badRequest(
          `El restaurante no tiene ${fieldName}`
        );
      }

      const updated =
        await strapi
          .documents(
            RESTAURANT_UID
          )
          .update({
            documentId,

            data: {
              [fieldName]:
                null,
            } as any,

            populate: {
              logo:
                true,

              QRImage:
                true,

              users:
                true,

              categories:
                true,

              products:
                true,

              promotions:
                true,

              publications:
                true,

              orders:
                true,
            },
          });

      try {
        await removeUploadedFile(
          strapi,
          currentMedia
        );
      } catch (error) {
        strapi.log.error(
          `No se pudo eliminar ${fieldName}`,
          error
        );
      }

      return updated;
    }

    return {
      // =================================================
      // PATCH RESTAURANT
      // =================================================

      async patch(ctx) {
        const {
          documentId,
        } = ctx.params;

        if (!documentId) {
          return ctx.badRequest(
            'El documentId del restaurante es obligatorio'
          );
        }

        const body =
          (ctx.request.body as any) ??
          {};

        const payload =
          body.data ??
          body;

        if (
          !payload ||
          typeof payload !==
            'object' ||
          Array.isArray(
            payload
          )
        ) {
          return ctx.badRequest(
            'Los datos enviados no son válidos'
          );
        }

        const data =
          Object.fromEntries(
            Object.entries(
              payload
            ).filter(
              ([key]) =>
                ALLOWED_FIELDS.includes(
                  key
                )
            )
          );

        if (
          Object.keys(
            data
          ).length === 0
        ) {
          return ctx.badRequest(
            'No se enviaron campos válidos para actualizar'
          );
        }

        const existing =
          await strapi
            .documents(
              RESTAURANT_UID
            )
            .findOne({
              documentId,
            });

        if (!existing) {
          return ctx.notFound(
            'Restaurante no encontrado'
          );
        }

        const updated =
          await strapi
            .documents(
              RESTAURANT_UID
            )
            .update({
              documentId,

              data:
                data as any,

              populate: {
                logo:
                  true,

                QRImage:
                  true,

                users:
                  true,

                categories:
                  true,

                products:
                  true,

                promotions:
                  true,

                publications:
                  true,

                orders:
                  true,
              },
            });

        const sanitized =
          await this.sanitizeOutput!(
            updated,
            ctx
          );

        ctx.body = {
          data:
            sanitized,
        };

        return ctx.body;
      },

      // =================================================
      // LOGO
      // =================================================

      async createLogo(ctx) {
        try {
          const updated =
            await updateMedia(
              ctx,
              'logo',
              true
            );

          if (
            !updated ||
            ctx.body
          ) {
            return updated;
          }

          const sanitized =
            await this.sanitizeOutput!(
              updated,
              ctx
            );

          ctx.body = {
            data:
              sanitized,
          };

          return ctx.body;
        } catch (error) {
          strapi.log.error(
            'Error creando logo',
            error
          );

          return ctx.internalServerError(
            'No se pudo subir el logo'
          );
        }
      },

      async updateLogo(ctx) {
        try {
          const updated =
            await updateMedia(
              ctx,
              'logo',
              false
            );

          const sanitized =
            await this.sanitizeOutput!(
              updated,
              ctx
            );

          ctx.body = {
            data:
              sanitized,
          };

          return ctx.body;
        } catch (error) {
          return ctx.internalServerError(
            'No se pudo actualizar el logo'
          );
        }
      },

      async removeLogo(ctx) {
        const updated =
          await deleteMedia(
            ctx,
            'logo'
          );

        const sanitized =
          await this.sanitizeOutput!(
            updated,
            ctx
          );

        ctx.body = {
          data:
            sanitized,

          message:
            'Logo eliminado correctamente',
        };

        return ctx.body;
      },

      // =================================================
      // QR IMAGE
      // =================================================

      async createQRImage(ctx) {
        try {
          const updated =
            await updateMedia(
              ctx,
              'QRImage',
              true
            );

          const sanitized =
            await this.sanitizeOutput!(
              updated,
              ctx
            );

          ctx.body = {
            data:
              sanitized,
          };

          return ctx.body;
        } catch (error) {
          return ctx.internalServerError(
            'No se pudo subir la imagen QR'
          );
        }
      },

      async updateQRImage(ctx) {
        try {
          const updated =
            await updateMedia(
              ctx,
              'QRImage',
              false
            );

          const sanitized =
            await this.sanitizeOutput!(
              updated,
              ctx
            );

          ctx.body = {
            data:
              sanitized,
          };

          return ctx.body;
        } catch (error) {
          return ctx.internalServerError(
            'No se pudo actualizar la imagen QR'
          );
        }
      },

      async removeQRImage(ctx) {
        const updated =
          await deleteMedia(
            ctx,
            'QRImage'
          );

        const sanitized =
          await this.sanitizeOutput!(
            updated,
            ctx
          );

        ctx.body = {
          data:
            sanitized,

          message:
            'Imagen QR eliminada correctamente',
        };

        return ctx.body;
      },
    };
  }
);