// backend/src/api/product/controllers/product.ts

import {
  factories,
} from '@strapi/strapi';

const PRODUCT_UID =
  'api::product.product' as const;

const ALLOWED_FIELDS = [
  'name',
  'slug',
  'sku',
  'description',
  'price',
  'stock',
  'isAvailable',
  'restaurant',
  'category',
  'promotions',
  'order_items',
];

// =====================================================
// HELPERS
// =====================================================

function getSingleFile(
  files: any,
  fieldName: string
) {
  const file =
    files?.[
      fieldName
    ];

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

function getMultipleFiles(
  files: any,
  fieldName: string
) {
  const file =
    files?.[
      fieldName
    ];

  if (!file) {
    return [];
  }

  return Array.isArray(
    file
  )
    ? file
    : [file];
}

async function uploadOneFile(
  strapi: any,
  file: any,
  alternativeText: string
) {
  const uploadService =
    strapi
      .plugin(
        'upload'
      )
      .service(
        'upload'
      );

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
    .plugin(
      'upload'
    )
    .service(
      'upload'
    )
    .remove(
      file
    );
}

// =====================================================
// CONTROLLER
// =====================================================

export default factories.createCoreController(
  PRODUCT_UID,
  ({ strapi }) => ({
    // =====================================================
    // PATCH PRODUCT
    // =====================================================

    async patch(ctx) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId del producto es obligatorio'
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

      /*
       * mainImage y gallery NO se incluyen aquí.
       * Se administran desde sus endpoints específicos.
       */

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

      const existingProduct =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .findOne({
            documentId,
          });

      if (
        !existingProduct
      ) {
        return ctx.notFound(
          'Producto no encontrado'
        );
      }

      const updatedProduct =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .update({
            documentId,

            data:
              data as any,

            populate: {
              mainImage:
                true,

              gallery:
                true,

              restaurant:
                true,

              category:
                true,

              promotions:
                true,

              order_items:
                true,
            },
          });

      const sanitizedProduct =
        await this.sanitizeOutput!(
          updatedProduct,
          ctx
        );

      ctx.body = {
        data:
          sanitizedProduct,
      };

      return ctx.body;
    },

    // =====================================================
    // CREAR MAIN IMAGE
    // POST /api/products/:documentId/main-image
    // =====================================================

    async createMainImage(
      ctx
    ) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId del producto es obligatorio'
        );
      }

      const product =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .findOne({
            documentId,

            populate: {
              mainImage:
                true,
            },
          });

      if (!product) {
        return ctx.notFound(
          'Producto no encontrado'
        );
      }

      if (
        product.mainImage
      ) {
        return ctx.badRequest(
          'El producto ya tiene una imagen principal. Utiliza PATCH para reemplazarla.'
        );
      }

      const file =
        getSingleFile(
          ctx.request
            .files,
          'mainImage'
        );

      if (!file) {
        return ctx.badRequest(
          'Debe enviar una imagen en el campo mainImage'
        );
      }

      let uploadedFile:
        any = null;

      try {
        uploadedFile =
          await uploadOneFile(
            strapi,
            file,
            `Imagen principal del producto ${documentId}`
          );

        const updatedProduct =
          await strapi
            .documents(
              PRODUCT_UID
            )
            .update({
              documentId,

              data: {
                mainImage:
                  uploadedFile.id,
              } as any,

              populate: {
                mainImage:
                  true,

                gallery:
                  true,

                restaurant:
                  true,

                category:
                  true,

                promotions:
                  true,
              },
            });

        const sanitizedProduct =
          await this.sanitizeOutput!(
            updatedProduct,
            ctx
          );

        ctx.body = {
          data:
            sanitizedProduct,
        };

        return ctx.body;
      } catch (
        error
      ) {
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
          'Error creando mainImage del producto',
          error
        );

        return ctx.internalServerError(
          'No se pudo subir la imagen principal'
        );
      }
    },

    // =====================================================
    // REEMPLAZAR MAIN IMAGE
    // PATCH /api/products/:documentId/main-image
    // =====================================================

    async updateMainImage(
      ctx
    ) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId del producto es obligatorio'
        );
      }

      const product =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .findOne({
            documentId,

            populate: {
              mainImage:
                true,
            },
          });

      if (!product) {
        return ctx.notFound(
          'Producto no encontrado'
        );
      }

      const file =
        getSingleFile(
          ctx.request
            .files,
          'mainImage'
        );

      if (!file) {
        return ctx.badRequest(
          'Debe enviar una imagen en el campo mainImage'
        );
      }

      const oldImage =
        product.mainImage;

      let uploadedFile:
        any = null;

      try {
        uploadedFile =
          await uploadOneFile(
            strapi,
            file,
            `Imagen principal del producto ${documentId}`
          );

        const updatedProduct =
          await strapi
            .documents(
              PRODUCT_UID
            )
            .update({
              documentId,

              data: {
                mainImage:
                  uploadedFile.id,
              } as any,

              populate: {
                mainImage:
                  true,

                gallery:
                  true,

                restaurant:
                  true,

                category:
                  true,

                promotions:
                  true,
              },
            });

        /*
         * Primero guardamos la nueva.
         * Después eliminamos la anterior.
         * Así no dejamos el producto sin imagen
         * si falla la subida.
         */

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
              'No se pudo eliminar la imagen principal anterior',
              deleteError
            );
          }
        }

        const sanitizedProduct =
          await this.sanitizeOutput!(
            updatedProduct,
            ctx
          );

        ctx.body = {
          data:
            sanitizedProduct,
        };

        return ctx.body;
      } catch (
        error
      ) {
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
          'Error actualizando mainImage del producto',
          error
        );

        return ctx.internalServerError(
          'No se pudo actualizar la imagen principal'
        );
      }
    },

    // =====================================================
    // ELIMINAR MAIN IMAGE
    // DELETE /api/products/:documentId/main-image
    // =====================================================

    async removeMainImage(
      ctx
    ) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId del producto es obligatorio'
        );
      }

      const product =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .findOne({
            documentId,

            populate: {
              mainImage:
                true,
            },
          });

      if (!product) {
        return ctx.notFound(
          'Producto no encontrado'
        );
      }

      const oldImage =
        product.mainImage;

      if (!oldImage) {
        return ctx.badRequest(
          'El producto no tiene imagen principal'
        );
      }

      const updatedProduct =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .update({
            documentId,

            data: {
              mainImage:
                null,
            } as any,

            populate: {
              mainImage:
                true,

              gallery:
                true,

              restaurant:
                true,

              category:
                true,

              promotions:
                true,
            },
          });

      try {
        await removeUploadedFile(
          strapi,
          oldImage
        );
      } catch (
        error
      ) {
        strapi.log.error(
          'No se pudo eliminar el archivo mainImage',
          error
        );
      }

      const sanitizedProduct =
        await this.sanitizeOutput!(
          updatedProduct,
          ctx
        );

      ctx.body = {
        data:
          sanitizedProduct,

        message:
          'Imagen principal eliminada correctamente',
      };

      return ctx.body;
    },

    // =====================================================
    // AGREGAR IMAGENES A GALLERY
    // POST /api/products/:documentId/gallery
    // =====================================================

    async addGalleryImages(
      ctx
    ) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId del producto es obligatorio'
        );
      }

      const product =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .findOne({
            documentId,

            populate: {
              gallery:
                true,
            },
          });

      if (!product) {
        return ctx.notFound(
          'Producto no encontrado'
        );
      }

      const files =
        getMultipleFiles(
          ctx.request
            .files,
          'gallery'
        );

      if (
        files.length ===
        0
      ) {
        return ctx.badRequest(
          'Debe enviar al menos una imagen en el campo gallery'
        );
      }

      const uploadedFiles:
        any[] = [];

      try {
        for (
          const file of
          files
        ) {
          const uploaded =
            await uploadOneFile(
              strapi,
              file,
              `Galería del producto ${documentId}`
            );

          uploadedFiles.push(
            uploaded
          );
        }

        const currentGallery =
          Array.isArray(
            product.gallery
          )
            ? product.gallery
            : [];

        const galleryIds = [
          ...currentGallery.map(
            (
              image: any
            ) =>
              image.id
          ),

          ...uploadedFiles.map(
            (
              image
            ) =>
              image.id
          ),
        ];

        const updatedProduct =
          await strapi
            .documents(
              PRODUCT_UID
            )
            .update({
              documentId,

              data: {
                gallery:
                  galleryIds,
              } as any,

              populate: {
                mainImage:
                  true,

                gallery:
                  true,

                restaurant:
                  true,

                category:
                  true,

                promotions:
                  true,
              },
            });

        const sanitizedProduct =
          await this.sanitizeOutput!(
            updatedProduct,
            ctx
          );

        ctx.body = {
          data:
            sanitizedProduct,
        };

        return ctx.body;
      } catch (
        error
      ) {
        /*
         * Si falla la actualización,
         * limpiamos los archivos que acabamos
         * de subir.
         */

        for (
          const uploadedFile of
          uploadedFiles
        ) {
          try {
            await removeUploadedFile(
              strapi,
              uploadedFile
            );
          } catch {}
        }

        strapi.log.error(
          'Error agregando imágenes a gallery',
          error
        );

        return ctx.internalServerError(
          'No se pudieron agregar las imágenes'
        );
      }
    },

    // =====================================================
    // REEMPLAZAR UNA IMAGEN DE GALLERY
    // PATCH
    // /api/products/:documentId/gallery/:fileId
    // =====================================================

    async updateGalleryImage(
      ctx
    ) {
      const {
        documentId,
        fileId,
      } = ctx.params;

      if (
        !documentId ||
        !fileId
      ) {
        return ctx.badRequest(
          'El documentId y fileId son obligatorios'
        );
      }

      const product =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .findOne({
            documentId,

            populate: {
              gallery:
                true,
            },
          });

      if (!product) {
        return ctx.notFound(
          'Producto no encontrado'
        );
      }

      const gallery =
        Array.isArray(
          product.gallery
        )
          ? product.gallery
          : [];

      const oldImage =
        gallery.find(
          (
            image: any
          ) =>
            String(
              image.id
            ) ===
            String(
              fileId
            )
        );

      if (!oldImage) {
        return ctx.notFound(
          'La imagen no pertenece a la galería del producto'
        );
      }

      const file =
        getSingleFile(
          ctx.request
            .files,
          'gallery'
        );

      if (!file) {
        return ctx.badRequest(
          'Debe enviar una imagen en el campo gallery'
        );
      }

      let uploadedFile:
        any = null;

      try {
        uploadedFile =
          await uploadOneFile(
            strapi,
            file,
            `Galería del producto ${documentId}`
          );

        const galleryIds =
          gallery.map(
            (
              image: any
            ) =>
              String(
                image.id
              ) ===
              String(
                fileId
              )
                ? uploadedFile.id
                : image.id
          );

        const updatedProduct =
          await strapi
            .documents(
              PRODUCT_UID
            )
            .update({
              documentId,

              data: {
                gallery:
                  galleryIds,
              } as any,

              populate: {
                mainImage:
                  true,

                gallery:
                  true,

                restaurant:
                  true,

                category:
                  true,

                promotions:
                  true,
              },
            });

        try {
          await removeUploadedFile(
            strapi,
            oldImage
          );
        } catch (
          deleteError
        ) {
          strapi.log.error(
            'No se pudo eliminar la imagen anterior de gallery',
            deleteError
          );
        }

        const sanitizedProduct =
          await this.sanitizeOutput!(
            updatedProduct,
            ctx
          );

        ctx.body = {
          data:
            sanitizedProduct,
        };

        return ctx.body;
      } catch (
        error
      ) {
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
          'Error reemplazando imagen de gallery',
          error
        );

        return ctx.internalServerError(
          'No se pudo reemplazar la imagen'
        );
      }
    },

    // =====================================================
    // ELIMINAR UNA IMAGEN DE GALLERY
    // DELETE
    // /api/products/:documentId/gallery/:fileId
    // =====================================================

    async removeGalleryImage(
      ctx
    ) {
      const {
        documentId,
        fileId,
      } = ctx.params;

      if (
        !documentId ||
        !fileId
      ) {
        return ctx.badRequest(
          'El documentId y fileId son obligatorios'
        );
      }

      const product =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .findOne({
            documentId,

            populate: {
              gallery:
                true,
            },
          });

      if (!product) {
        return ctx.notFound(
          'Producto no encontrado'
        );
      }

      const gallery =
        Array.isArray(
          product.gallery
        )
          ? product.gallery
          : [];

      const imageToDelete =
        gallery.find(
          (
            image: any
          ) =>
            String(
              image.id
            ) ===
            String(
              fileId
            )
        );

      if (
        !imageToDelete
      ) {
        return ctx.notFound(
          'La imagen no pertenece a la galería del producto'
        );
      }

      const remainingIds =
        gallery
          .filter(
            (
              image: any
            ) =>
              String(
                image.id
              ) !==
              String(
                fileId
              )
          )
          .map(
            (
              image: any
            ) =>
              image.id
          );

      const updatedProduct =
        await strapi
          .documents(
            PRODUCT_UID
          )
          .update({
            documentId,

            data: {
              gallery:
                remainingIds,
            } as any,

            populate: {
              mainImage:
                true,

              gallery:
                true,

              restaurant:
                true,

              category:
                true,

              promotions:
                true,
            },
          });

      try {
        await removeUploadedFile(
          strapi,
          imageToDelete
        );
      } catch (
        error
      ) {
        strapi.log.error(
          'No se pudo eliminar el archivo de gallery',
          error
        );
      }

      const sanitizedProduct =
        await this.sanitizeOutput!(
          updatedProduct,
          ctx
        );

      ctx.body = {
        data:
          sanitizedProduct,

        message:
          'Imagen eliminada de la galería correctamente',
      };

      return ctx.body;
    },
  })
);