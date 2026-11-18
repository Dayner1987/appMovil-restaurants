// backend/src/api/promotion/controllers/promotion.ts

import {
  factories,
} from '@strapi/strapi';

const PROMOTION_UID =
  'api::promotion.promotion' as const;

const ALLOWED_FIELDS = [
  'name',
  'description',
  'type',
  'percentage',
  'discountAmount',
  'buyQuantity',
  'payQuantity',
  'startAt',
  'endAt',
  'restaurant',
  'products',
];

export default factories.createCoreController(
  PROMOTION_UID,
  ({ strapi }) => ({
    // =====================================================
    // CREATE PROMOTION - PUBLICAR INMEDIATAMENTE
    // =====================================================
    async create(ctx) {
      const body = (ctx.request.body as any) ?? {};
      const payload = body.data ?? body;

      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return ctx.badRequest('Los datos enviados no son válidos');
      }

      const allowedFields = [
        'name', 'description', 'type', 'percentage', 'discountAmount',
        'buyQuantity', 'payQuantity', 'startAt', 'endAt', 'restaurant', 'products',
      ];
      const data = Object.fromEntries(
        Object.entries(payload).filter(([key]) => allowedFields.includes(key))
      );

      if (!String(data.name ?? '').trim() || !data.type || !data.restaurant) {
        return ctx.badRequest('El nombre, tipo y restaurante son obligatorios');
      }

      const createdPromotion = await strapi.documents(PROMOTION_UID).create({
        status: 'published',
        data: data as any,
        populate: { restaurant: true, products: true },
      });

      const sanitizedPromotion = await this.sanitizeOutput!(createdPromotion, ctx);
      ctx.status = 201;
      ctx.body = { data: sanitizedPromotion };
      return ctx.body;
    },

    // =====================================================
    // PATCH PROMOTION
    // =====================================================

    async patch(ctx) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId de la promoción es obligatorio'
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

      const existingPromotion =
        await strapi
          .documents(
            PROMOTION_UID
          )
          .findOne({
            documentId,
          });

      if (
        !existingPromotion
      ) {
        return ctx.notFound(
          'Promoción no encontrada'
        );
      }

      const updatedPromotion =
        await strapi
          .documents(
            PROMOTION_UID
          )
          .update({
            documentId,
            status: 'published',

            data:
              data as any,

            populate: {
              restaurant:
                true,

              products:
                true,
            },
          });

      const sanitizedPromotion =
        await this.sanitizeOutput!(
          updatedPromotion,
          ctx
        );

      ctx.body = {
        data:
          sanitizedPromotion,
      };

      return ctx.body;
    },
  })
);