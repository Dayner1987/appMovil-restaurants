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
  'customer',
  'createdByUser',
  'completeBy',
  'shift',
];

export default factories.createCoreController(
  ORDER_UID,
  ({ strapi }) => ({
    // =====================================================
    // PATCH ORDER
    // =====================================================

    async history(ctx) {
      const userId = ctx.state.user?.id;
      if (!userId) return ctx.unauthorized('Inicia sesión para consultar tus pedidos.');
      const page = Number(ctx.query.page ?? 1);
      const state = ctx.query.state;
      const documentId = ctx.query.documentId;
      const states = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
      if (!Number.isSafeInteger(page) || page < 1 ||
          (state !== undefined && (typeof state !== 'string' || !states.includes(state))) ||
          (documentId !== undefined && typeof documentId !== 'string')) {
        return ctx.badRequest('Filtro o página de historial inválidos.');
      }
      const filters = {
        $or: [{ users: { id: userId } }, { customer: { id: userId } }],
        ...(typeof state === 'string' ? { statusOrder: { $eq: state as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' } } : {}),
        ...(typeof documentId === 'string' ? { documentId } : {}),
      };
      const pageSize = 25;
      const orders = strapi.documents(ORDER_UID);
      const [items, total] = await Promise.all([
        orders.findMany({
          filters, start: (page - 1) * pageSize, limit: pageSize,
          sort: ['orderedAt:desc', 'createdAt:desc', 'id:desc'],
          populate: { restaurant: true, order_items: true, payments: true },
        }),
        orders.count({ filters }),
      ]);
      ctx.body = {
        data: await this.sanitizeOutput!(items, ctx),
        meta: { pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } },
      };
      return ctx.body;
    },

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
            status: 'published',

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

              customer:
                true,

              createdByUser:
                true,

              completeBy:
                true,

              shift:
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