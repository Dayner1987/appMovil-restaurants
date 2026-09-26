// backend/src/api/payment/controllers/payment.ts

import {
  factories,
} from '@strapi/strapi';

const PAYMENT_UID =
  'api::payment.payment' as const;

const ALLOWED_FIELDS = [
  'amount',
  'method',
  'statusPayment',
  'transactionReference',
  'paidAt',
  'order',
];

export default factories.createCoreController(
  PAYMENT_UID,
  ({ strapi }) => ({
    // =====================================================
    // PATCH PAYMENT
    // =====================================================

    async patch(ctx) {
      const {
        documentId,
      } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId del pago es obligatorio'
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

      const existingPayment =
        await strapi
          .documents(
            PAYMENT_UID
          )
          .findOne({
            documentId,
          });

      if (
        !existingPayment
      ) {
        return ctx.notFound(
          'Pago no encontrado'
        );
      }

      const updatedPayment =
        await strapi
          .documents(
            PAYMENT_UID
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

      const sanitizedPayment =
        await this.sanitizeOutput!(
          updatedPayment,
          ctx
        );

      ctx.body = {
        data:
          sanitizedPayment,
      };

      return ctx.body;
    },
  })
);