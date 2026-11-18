/** Traduce los nombres de roles solo para presentación. Los valores de Strapi
 * (name/type) se conservan intactos para autenticación y permisos. */
export function roleLabel(value?: string | null): string {
  const normalized = String(value ?? '').trim().toLowerCase();
  const labels: Record<string, string> = {
    admin: 'Administrador',
    administrator: 'Administrador',
    restaurant: 'Restaurante',
    restaurante: 'Restaurante',
    employee: 'Empleado',
    empleado: 'Empleado',
    client: 'Cliente',
    cliente: 'Cliente',
    authenticated: 'Usuario autenticado',
    public: 'Público',
  };
  return labels[normalized] ?? (value?.trim() || 'Usuario');
}
