import { orderService } from '@/services/order.service';
import type { Order } from '@/types/orders.types';

function belongsToUser(order: Order, userId: number): boolean {
  const linkedUsers = Array.isArray(order.users) ? order.users : [];
  return linkedUsers.some((linkedUser) => linkedUser.id === userId)
    || order.customer?.id === userId;
}

function newestVersion(current: Order | undefined, candidate: Order): Order {
  if (!current) return candidate;
  const currentUpdated = Date.parse(current.updatedAt || current.createdAt || '') || 0;
  const candidateUpdated = Date.parse(candidate.updatedAt || candidate.createdAt || '') || 0;
  if (candidateUpdated > currentUpdated) return candidate;
  if (candidateUpdated === currentUpdated && candidate.publishedAt && !current.publishedAt) return candidate;
  return current;
}

/** Orders are requested in both Strapi document states so the customer history
 * can show drafts and published versions without duplicate document cards. */
export const customerOrdersService = {
  async findMine(userId: number): Promise<Order[]> {
    if (!Number.isFinite(userId) || userId <= 0) {
      throw new Error('No se pudo identificar al usuario. Inicia sesión nuevamente.');
    }

    const baseQuery = {
      userId,
      page: 1,
      pageSize: 100,
      sort: 'orderedAt:desc',
    } as const;

    const [publishedResult, draftResult] = await Promise.allSettled([
      orderService.findAll({ ...baseQuery, status: 'published' }),
      orderService.findAll({ ...baseQuery, status: 'draft' }),
    ]);

    const successfulOrders: Order[][] = [];
    if (publishedResult.status === 'fulfilled') successfulOrders.push(publishedResult.value.data ?? []);
    if (draftResult.status === 'fulfilled') successfulOrders.push(draftResult.value.data ?? []);

    if (!successfulOrders.length) {
      const firstError = publishedResult.status === 'rejected' ? publishedResult.reason :
        draftResult.status === 'rejected' ? draftResult.reason : new Error('No se pudieron cargar tus órdenes.');
      throw firstError;
    }

    const byDocumentId = new Map<string, Order>();
    for (const resultOrders of successfulOrders) {
      for (const order of resultOrders) {
        // Never display another customer's order, even if a backend filter is misconfigured.
        if (!belongsToUser(order, userId) || !order.documentId) continue;
        byDocumentId.set(order.documentId, newestVersion(byDocumentId.get(order.documentId), order));
      }
    }

    return [...byDocumentId.values()].sort((a, b) => {
      const aDate = Date.parse(a.orderedAt || a.createdAt || '') || 0;
      const bDate = Date.parse(b.orderedAt || b.createdAt || '') || 0;
      return bDate - aDate;
    });
  },

  async cancelPending(order: Order): Promise<void> {
    if (!order.documentId) throw new Error('La orden no tiene un identificador válido.');
    if (order.statusOrder !== 'PENDING') {
      throw new Error('Solo puedes cancelar órdenes que todavía están pendientes.');
    }
    if (order.paymentStatus === 'PAID') {
      throw new Error('Esta orden ya tiene un pago aprobado. Contacta al restaurante para solicitar ayuda.');
    }

    await orderService.patch(order.documentId, {
      statusOrder: 'CANCELLED',
      completeAt: null,
    });
  },
};
