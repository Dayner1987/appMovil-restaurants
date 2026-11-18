import { factories } from '@strapi/strapi';

const SHIFT = 'api::employee-shift.employee-shift';
const USER = 'plugin::users-permissions.user';

export default factories.createCoreController(SHIFT, ({ strapi }) => {
  async function own(ctx: any, action: 'current' | 'open' | 'close') {
    const actorId = ctx.state.user?.id;
    if (!actorId) return ctx.unauthorized('Inicia sesión.');
    return strapi.db.transaction(async ({ trx }) => {
      if (action !== 'current') {
        const table = strapi.db.metadata.get(USER).tableName;
        await trx(table).where({ id: actorId }).update({ blocked: trx.ref('blocked') });
      }
      const actor = await strapi.db.query(USER).findOne({
        where: { id: actorId }, populate: { role: true, restaurant: true },
      });
      if (actor?.role?.type !== 'employee' || !actor.restaurant?.documentId) {
        return ctx.forbidden('Necesitas una cuenta de empleado con restaurante asignado.');
      }
      const shifts = strapi.documents(SHIFT);
      let shift = await shifts.findFirst({
        filters: { employee: { id: actorId }, restaurant: { documentId: actor.restaurant.documentId }, statusEm: 'OPEN' },
        sort: 'startedAt:desc',
      });
      if (action === 'open' && !shift) {
        shift = await shifts.create({ status: 'published', data: {
          employee: actor.documentId, restaurant: actor.restaurant.documentId,
          statusEm: 'OPEN', startedAt: new Date().toISOString(),
        } });
      }
      if (action === 'close' && shift) {
        if (ctx.request.body?.documentId !== shift.documentId) return ctx.conflict('Actualiza tu jornada.');
        await shifts.update({ documentId: shift.documentId, status: 'published',
          data: { statusEm: 'CLOSED', endedAt: new Date().toISOString() } });
        shift = null;
      }
      ctx.body = { data: shift };
      return ctx.body;
    });
  }
  return {
    current(ctx) { return own(ctx, 'current'); },
    open(ctx) { return own(ctx, 'open'); },
    close(ctx) { return own(ctx, 'close'); },
  };
});
