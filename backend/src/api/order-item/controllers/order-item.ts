// backend/src/api/order-item/controllers/order-item.ts

import {
  factories,
} from '@strapi/strapi';

const ORDER_ITEM_UID =
  'api::order-item.order-item' as const;

const ALLOWED_FIELDS = [
  'quantity',
  'unitPrice',
  'discount',
  'subtotal',
  'order',
  'product',
  'productName',
];

export default factories.createCoreController(
  ORDER_ITEM_UID,
  ({ strapi }) => ({
    // =====================================================
    // PATCH ORDER ITEM
    // =====================================================

    async patch(ctx) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId del detalle de orden es obligatorio'
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

      const existingOrderItem =
        await strapi
          .documents(
            ORDER_ITEM_UID
          )
          .findOne({
            documentId,
          });

      if (
        !existingOrderItem
      ) {
        return ctx.notFound(
          'Detalle de orden no encontrado'
        );
      }

      const updatedOrderItem =
        await strapi
          .documents(
            ORDER_ITEM_UID
          )
          .update({
            documentId,

            data:
              data as any,

            populate: {
              order:
                true,

              product:
                true,
            },
          });

      const sanitizedOrderItem =
        await this.sanitizeOutput!(
          updatedOrderItem,
          ctx
        );

      ctx.body = {
        data:
          sanitizedOrderItem,
      };

      return ctx.body;
    },
  })
);