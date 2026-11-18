import { factories } from '@strapi/strapi';

const PAYMENT_UID = 'api::payment.payment' as const;
const ORDER_UID = 'api::order.order' as const;
const methods = ['CASH', 'QR'];

export default factories.createCoreController(PAYMENT_UID, ({ strapi }) => ({
  async create(ctx) {
    const data = ctx.request.body?.data;
    if (!data || !methods.includes(data.method)) {
      return ctx.badRequest('Selecciona QR o efectivo.');
    }
    // Un pago nuevo queda pendiente hasta que el personal lo compruebe.
    if (data.statusPayment !== 'PENDING') {
      return ctx.badRequest('Registra el pago pendiente y luego verifica su recepción.');
    }
    ctx.query = { ...ctx.query, status: 'published' };
    return super.create(ctx);
  },

  async update(ctx) {
    const data = ctx.request.body?.data;
    if (!data || (data.method !== undefined && !methods.includes(data.method))) {
      return ctx.badRequest('Selecciona QR o efectivo.');
    }
    const paymentId = ctx.params.id ?? ctx.params.documentId;
    if (!paymentId) return ctx.badRequest('Falta el identificador del pago.');
    ctx.params.id = paymentId;
    return strapi.db.transaction(async ({ trx }) => {
      const paymentTable = strapi.db.metadata.get(PAYMENT_UID).tableName;
      await trx(paymentTable).where({ document_id: paymentId }).update({ paid_at: trx.ref('paid_at') });
      const payment: any = await strapi.documents(PAYMENT_UID).findOne({
        documentId: paymentId,
        populate: { order: { populate: { restaurant: true } } },
      });
      if (!payment) return ctx.notFound('Pago no encontrado.');
      if (!payment.order?.documentId) return ctx.badRequest('El pago no tiene una orden asociada.');
      const orderTable = strapi.db.metadata.get(ORDER_UID).tableName;
      await trx(orderTable).where('document_id', payment.order.documentId).select('id').forUpdate();
      const actor: any = ctx.state.user && await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: ctx.state.user.id },
        populate: ['role', 'restaurant'],
      });
      if (!actor || !['admin', 'restaurant', 'employee'].includes(actor.role?.type)) {
        return ctx.forbidden('Solo el personal puede verificar pagos.');
      }
      if (actor.role.type !== 'admin' &&
          (!actor.restaurant?.documentId || actor.restaurant.documentId !== payment.order?.restaurant?.documentId)) {
        return ctx.forbidden('El pago pertenece a otro restaurante.');
      }
      if (data.method !== undefined && data.method !== payment.method) {
        return ctx.badRequest('El método ya fue elegido para este pedido.');
      }
      // Solo se admite verificar o rechazar el registro existente.
      if (!['APPROVED', 'REJECTED'].includes(data.statusPayment)) {
        return ctx.badRequest('Selecciona un resultado de verificación válido.');
      }
      if (payment.statusPayment === 'APPROVED' && data.statusPayment !== 'APPROVED') {
        return ctx.badRequest('Este pago ya fue confirmado.');
      }
      let shiftDocumentId: string | undefined;
      if (data.statusPayment === 'APPROVED' && payment.statusPayment !== 'APPROVED') {
        if (payment.order.statusOrder === 'CANCELLED') return ctx.badRequest('La orden está cancelada.');
        if (Math.round(Number(payment.amount) * 100) !== Math.round(Number(payment.order.total) * 100)) {
          return ctx.badRequest('El importe del pago no coincide con el total de la orden.');
        }
        if (actor.role.type === 'employee') {
          const shift = await strapi.documents('api::employee-shift.employee-shift').findFirst({
            filters: { employee: { id: actor.id }, restaurant: { documentId: actor.restaurant.documentId }, statusEm: 'OPEN' },
          });
          if (!shift) return ctx.badRequest('Abre tu jornada antes de confirmar el pago.');
          shiftDocumentId = shift.documentId;
        }
      }
      if (data.statusPayment === 'APPROVED') {
        const siblings = await strapi.documents(PAYMENT_UID).findMany({
          filters: { order: { documentId: payment.order.documentId }, statusPayment: 'APPROVED' },
        });
        if (siblings.some(item => item.documentId !== payment.documentId)) {
          return ctx.badRequest('La orden ya tiene un pago confirmado.');
        }
      }
      const updated = payment.statusPayment === data.statusPayment
        ? payment
        : await strapi.documents(PAYMENT_UID).update({
            documentId: paymentId,
            status: 'published',
            data: {
              statusPayment: data.statusPayment,
              processedBy: actor.documentId,
              ...(shiftDocumentId ? { shift: shiftDocumentId } : {}),
              paidAt: data.statusPayment === 'APPROVED' ? new Date().toISOString() : payment.paidAt,
            },
            populate: { order: true },
          });

      if (data.statusPayment === 'APPROVED' && payment.order.paymentStatus !== 'PAID') {
        await strapi.documents(ORDER_UID).update({
          documentId: payment.order.documentId, status: 'published',
          data: { paymentStatus: 'PAID' },
        });
      }
      ctx.body = this.transformResponse!(await this.sanitizeOutput!(updated, ctx));
      return ctx.body;
    });
  },

   async patch(ctx, next) {
    ctx.request.body = {
      data: ctx.request.body?.data ?? ctx.request.body,
    };

    if (typeof this.update !== 'function') {
      throw new Error(
        'No está disponible el controlador de actualización de pagos.'
      );
    }

    return this.update(ctx, next);
  },
}));
