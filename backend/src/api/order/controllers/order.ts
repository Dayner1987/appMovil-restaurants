// backend/src/api/order/controllers/order.ts

import {
  factories,
} from '@strapi/strapi';

const ORDER_UID =
  'api::order.order' as const;

const ALLOWED_FIELDS = [
  'orderCode',
  'orderType',
  'statusOrder',
  'paymentStatus',
  'subtotal',
  'discount',
  'total',
  'orderedAt',
  'completeAt',
  'restaurant',
  'order_items',
  'payments',
  'users',
];

export default factories.createCoreController(
  ORDER_UID,
  ({ strapi }) => ({
    // =====================================================
    // PATCH ORDER
    // =====================================================

    async patch(ctx) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId de la orden es obligatorio'
        );
      }

      // ===================================================
      // BODY
      // Acepta:
      //
      // {
      //   "data": {
      //     "discount": 10
      //   }
      // }
      //
      // o:
      //
      // {
      //   "discount": 10
      // }
      // ===================================================

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
      // FILTRAR CAMPOS PERMITIDOS
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
      // BUSCAR ORDEN
      // ===================================================

      const existingOrder =
        await strapi
          .documents(
            ORDER_UID
          )
          .findOne({
            documentId,
          });

      if (
        !existingOrder
      ) {
        return ctx.notFound(
          'Orden no encontrada'
        );
      }

      // ===================================================
      // PATCH
      // SOLO CAMBIA LOS CAMPOS RECIBIDOS
      // ===================================================

      const updatedOrder =
        await strapi
          .documents(
            ORDER_UID
          )
          .update({
            documentId,

            data:
              data as any,

            populate: {
              restaurant:
                true,

              order_items:
                true,

              payments:
                true,

              users:
                true,
            },
          });

      // ===================================================
      // SANITIZAR
      // ===================================================

      const sanitizedOrder =
        await this.sanitizeOutput!(
          updatedOrder,
          ctx
        );

      ctx.body = {
        data:
          sanitizedOrder,
      };

      return ctx.body;
    },
  })
);