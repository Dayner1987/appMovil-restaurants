// backend/src/api/publication/controllers/publication.ts

import {
  factories,
} from '@strapi/strapi';

const PUBLICATION_UID =
  'api::publication.publication' as const;

const ALLOWED_FIELDS = [
  'title',
  'description',
  'featured',
  'restaurant',
];

// =====================================================
// MEDIA HELPERS
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

  if (
    Array.isArray(
      file
    )
  ) {
    return (
      file[0] ??
      null
    );
  }

  return file;
}

async function uploadOneFile(
  strapi: any,
  file: any,
  alternativeText: string
) {
  const uploadService =
    strapi
      .plugin('upload')
      .service('upload');

  const uploadedFiles =
    await uploadService.upload({
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
    !uploadedFiles ||
    uploadedFiles.length ===
      0
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

// =====================================================
// CONTROLLER
// =====================================================

export default factories.createCoreController(
  PUBLICATION_UID,
  ({ strapi }) => ({
    // =====================================================
    // PATCH PUBLICATION
    // =====================================================

    async patch(ctx) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId de la publicación es obligatorio'
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
            PUBLICATION_UID
          )
          .findOne({
            documentId,
          });

      if (!existing) {
        return ctx.notFound(
          'Publicación no encontrada'
        );
      }

      const updated =
        await strapi
          .documents(
            PUBLICATION_UID
          )
          .update({
            documentId,

            data:
              data as any,

            populate: {
              image:
                true,

              restaurant:
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

    // =====================================================
    // CREATE IMAGE
    // POST /publications/:documentId/image
    // =====================================================

    async createImage(ctx) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId de la publicación es obligatorio'
        );
      }

      const publication =
        await strapi
          .documents(
            PUBLICATION_UID
          )
          .findOne({
            documentId,

            populate: {
              image:
                true,
            },
          });

      if (!publication) {
        return ctx.notFound(
          'Publicación no encontrada'
        );
      }

      if (
        publication.image
      ) {
        return ctx.badRequest(
          'La publicación ya tiene una imagen. Utiliza PATCH para reemplazarla.'
        );
      }

      const file =
        getSingleFile(
          ctx.request.files,
          'image'
        );

      if (!file) {
        return ctx.badRequest(
          'Debe enviar una imagen en el campo image'
        );
      }

      let uploadedFile:
        any = null;

      try {
        uploadedFile =
          await uploadOneFile(
            strapi,
            file,
            `Imagen de publicación ${documentId}`
          );

        const updated =
          await strapi
            .documents(
              PUBLICATION_UID
            )
            .update({
              documentId,

              data: {
                image:
                  uploadedFile.id,
              } as any,

              populate: {
                image:
                  true,

                restaurant:
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

        strapi.log.error(
          'Error subiendo imagen de publicación',
          error
        );

        return ctx.internalServerError(
          'No se pudo subir la imagen'
        );
      }
    },

    // =====================================================
    // UPDATE IMAGE
    // PATCH /publications/:documentId/image
    // =====================================================

    async updateImage(ctx) {
      const {
        documentId,
      } = ctx.params;

      const publication =
        await strapi
          .documents(
            PUBLICATION_UID
          )
          .findOne({
            documentId,

            populate: {
              image:
                true,
            },
          });

      if (!publication) {
        return ctx.notFound(
          'Publicación no encontrada'
        );
      }

      const file =
        getSingleFile(
          ctx.request.files,
          'image'
        );

      if (!file) {
        return ctx.badRequest(
          'Debe enviar una imagen en el campo image'
        );
      }

      const oldImage =
        publication.image;

      let uploadedFile:
        any = null;

      try {
        uploadedFile =
          await uploadOneFile(
            strapi,
            file,
            `Imagen de publicación ${documentId}`
          );

        const updated =
          await strapi
            .documents(
              PUBLICATION_UID
            )
            .update({
              documentId,

              data: {
                image:
                  uploadedFile.id,
              } as any,

              populate: {
                image:
                  true,

                restaurant:
                  true,
              },
            });

        if (oldImage) {
          try {
            await removeUploadedFile(
              strapi,
              oldImage
            );
          } catch (
            deleteError
          ) {
            strapi.log.error(
              'No se pudo eliminar la imagen anterior',
              deleteError
            );
          }
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

        return ctx.internalServerError(
          'No se pudo actualizar la imagen'
        );
      }
    },

    // =====================================================
    // DELETE IMAGE
    // =====================================================

    async removeImage(ctx) {
      const {
        documentId,
      } = ctx.params;

      const publication =
        await strapi
          .documents(
            PUBLICATION_UID
          )
          .findOne({
            documentId,

            populate: {
              image:
                true,
            },
          });

      if (!publication) {
        return ctx.notFound(
          'Publicación no encontrada'
        );
      }

      if (
        !publication.image
      ) {
        return ctx.badRequest(
          'La publicación no tiene imagen'
        );
      }

      const oldImage =
        publication.image;

      const updated =
        await strapi
          .documents(
            PUBLICATION_UID
          )
          .update({
            documentId,

            data: {
              image:
                null,
            } as any,

            populate: {
              image:
                true,

              restaurant:
                true,
            },
          });

      try {
        await removeUploadedFile(
          strapi,
          oldImage
        );
      } catch (error) {
        strapi.log.error(
          'No se pudo eliminar la imagen física',
          error
        );
      }

      const sanitized =
        await this.sanitizeOutput!(
          updated,
          ctx
        );

      ctx.body = {
        data:
          sanitized,

        message:
          'Imagen eliminada correctamente',
      };

      return ctx.body;
    },
  })
);