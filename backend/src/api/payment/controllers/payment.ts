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
    return strapi.db.transaction(async ({ trx }) => {
    const payment: any = await strapi.documents(PAYMENT_UID).findOne({
      documentId: ctx.params.documentId,
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
    if (data.statusPayment === 'APPROVED') {
      const siblings = await strapi.documents(PAYMENT_UID).findMany({
        filters: { order: { documentId: payment.order.documentId }, statusPayment: 'APPROVED' },
      });
      if (siblings.some(item => item.documentId !== payment.documentId)) {
        return ctx.badRequest('La orden ya tiene un pago confirmado.');
      }
    }
    ctx.request.body = { data: {
      statusPayment: data.statusPayment,
      processedBy: actor.id,
      paidAt: data.statusPayment === 'APPROVED' ? (payment.statusPayment === 'APPROVED' ? payment.paidAt : new Date().toISOString()) : payment.paidAt,
    } };
    ctx.query = { ...ctx.query, status: 'published' };
      const response = await super.update(ctx);
      if (ctx.status >= 400) return response;
      if (data.statusPayment === 'APPROVED') {
        await strapi.documents(ORDER_UID).update({
          documentId: payment.order.documentId,
          status: 'published',
          data: { paymentStatus: 'PAID' },
        });
      }
      return response;
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
