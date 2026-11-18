export default {
  async details(ctx: any) {
    const actorId = ctx.state.user?.id;

    if (!actorId) {
      return ctx.unauthorized('Inicia sesión para consultar el recibo.');
    }

    const actor = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: { id: actorId },
        populate: {
          role: true,
          restaurant: true,
        },
      });

    const fields = [
      'id',
      'firstName',
      'middleName',
      'lastName',
      'secondLastName',
      'ci',
      'phone',
    ];

    const orders = await strapi.db
      .query('api::order.order')
      .findMany({
        where: { documentId: ctx.params.documentId },
        populate: {
          customer: { select: fields },
          users: { select: fields },
          restaurant: {
            populate: { logo: true },
          },
        },
      });

    const order = orders.find((row) => !row.publishedAt) ?? orders[0];

    if (!actor || !order || order.statusOrder !== 'COMPLETED') {
      return ctx.notFound('Recibo no disponible.');
    }

    const buyer =
      order.customer ??
      (order.users?.length === 1 ? order.users[0] : null);

    const staff =
      ['employee', 'restaurant'].includes(actor.role?.type) &&
      !!actor.restaurant?.documentId &&
      actor.restaurant.documentId === order.restaurant?.documentId;

    if (actor.role?.type !== 'admin' && !staff && buyer?.id !== actor.id) {
      return ctx.forbidden();
    }

    const seller = order.restaurant;

    const saved = await strapi.db
      .query('api::receipt.receipt')
      .findOne({
        where: {
          order: { documentId: order.documentId },
        },
        select: ['completeName', 'ci'],
        orderBy: { updatedAt: 'desc' },
      });

    const buyerName = [
      buyer?.firstName,
      buyer?.middleName,
      buyer?.lastName,
      buyer?.secondLastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    ctx.body = {
      data: {
        buyer: {
          name: buyerName || saved?.completeName || null,
          ci: buyer?.ci || saved?.ci || null,
          phone: buyer?.phone || null,
        },
        restaurant: {
          name: seller?.name ?? 'Restaurante',
          nit: seller?.nit ?? null,
          logoUrl:
            seller?.logo?.formats?.small?.url ??
            seller?.logo?.url ??
            null,
        },
      },
    };
  },
};