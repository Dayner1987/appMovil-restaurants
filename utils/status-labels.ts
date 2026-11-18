/**
 * Traduce estados internos de la API para mostrarlos en español.
 * Los valores originales se conservan para las reglas de negocio y las peticiones.
 */
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY: 'Listo',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  PARTIAL: 'Parcial',
  PAID: 'Pagado',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado',
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido',
  OPEN: 'Abierto',
  CLOSED: 'Cerrado',
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  MODIFIED: 'Modificado',
};

export function statusLabel(
  value: string | null | undefined,
  fallback = 'Sin estado'
): string {
  if (!value?.trim()) return fallback;

  const normalized = value.trim().toUpperCase();
  return STATUS_LABELS[normalized] ?? value;
}
