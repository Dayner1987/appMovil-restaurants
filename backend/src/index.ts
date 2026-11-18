export default {
  register() {},

  /**
   * Los nombres son etiquetas visibles en Content Manager / Users & Permissions.
   * Se traducen sin modificar `type`, que es el identificador interno usado
   * por la autenticación, las rutas y las reglas de autorización.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    const roleLabels: Array<{ type: string; oldName: string; name: string }> = [
      { type: 'admin', oldName: 'Admin', name: 'Administrador' },
      { type: 'authenticated', oldName: 'Authenticated', name: 'Usuario autenticado' },
      { type: 'client', oldName: 'Client', name: 'Cliente' },
      { type: 'employee', oldName: 'Employee', name: 'Empleado' },
      { type: 'public', oldName: 'Public', name: 'Público' },
      { type: 'restaurant', oldName: 'Restaurant', name: 'Restaurante' },
    ];

    for (const item of roleLabels) {
      let role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: item.type },
      });

      if (!role) {
        role = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { name: item.oldName },
        });
      }

      if (role && role.name !== item.name) {
        await strapi.db.query('plugin::users-permissions.role').update({
          where: { id: role.id },
          data: { name: item.name },
        });
      }
    }
  },
};
