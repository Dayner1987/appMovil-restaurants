// backend/src/api/category/controllers/category.ts

import {
  factories,
} from '@strapi/strapi';

const CATEGORY_UID =
  'api::category.category';

const ALLOWED_FIELDS = [
  'name',
  'description',
  'isActive',
  'restaurant',
  'products',
];

export default factories.createCoreController(
  CATEGORY_UID,
  ({ strapi }) => ({
    // =====================================================
    // PATCH CATEGORY
    // =====================================================

    async patch(ctx) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId de la categoría es obligatorio'
        );
      }

      // Permite ambos formatos:
      //
      // {
      //   "data": {
      //     "name": "..."
      //   }
      // }
      //
      // o directamente:
      //
      // {
      //   "name": "..."
      // }

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

      // ===================================================
      // SOLO CAMPOS PERMITIDOS
      // ===================================================

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

      // ===================================================
      // VERIFICAR EXISTENCIA
      // ===================================================

      const existingCategory =
        await strapi
          .documents(
            CATEGORY_UID
          )
          .findOne({
            documentId,
          });

      if (
        !existingCategory
      ) {
        return ctx.notFound(
          'Categoría no encontrada'
        );
      }

      // ===================================================
      // ACTUALIZAR SOLO CAMPOS RECIBIDOS
      // ===================================================

      const updatedCategory =
        await strapi
          .documents(
            CATEGORY_UID
          )
          .update({
            documentId,

            data:
              data as any,

            populate: {
              restaurant:
                true,

              products:
                true,
            },
          });

      // ===================================================
      // SANITIZAR RESPUESTA
      // ===================================================

     const sanitizedCategory =
  await this.sanitizeOutput!(
    updatedCategory,
    ctx
  );

      ctx.body = {
        data:
          sanitizedCategory,
      };

      return ctx.body;
    },
  })
);