// backend/src/api/receipt/controllers/receipt.ts

import {
  factories,
} from '@strapi/strapi';

const RECEIPT_UID =
  'api::receipt.receipt' as const;

const ALLOWED_FIELDS = [
  'receiptNumber',
  'issuedAt',
  'subtotal',
  'discount',
  'total',
  'completeName',
  'ci',
  'order',
];

export default factories.createCoreController(
  RECEIPT_UID,
  ({ strapi }) => ({
    // =====================================================
    // PATCH RECEIPT
    // =====================================================

    async patch(ctx) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId del recibo es obligatorio'
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

      const existingReceipt =
        await strapi
          .documents(
            RECEIPT_UID
          )
          .findOne({
            documentId,
          });

      if (!existingReceipt) {
        return ctx.notFound(
          'Recibo no encontrado'
        );
      }

      const updatedReceipt =
        await strapi
          .documents(
            RECEIPT_UID
          )
          .update({
            documentId,

            data:
              data as any,

            populate: {
              order:
                true,
            },
          });

      const sanitizedReceipt =
        await this.sanitizeOutput!(
          updatedReceipt,
          ctx
        );

      ctx.body = {
        data:
          sanitizedReceipt,
      };

      return ctx.body;
    },
  })
);