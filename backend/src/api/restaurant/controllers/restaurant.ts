import { factories } from '@strapi/strapi';

const RESTAURANT_UID = 'api::restaurant.restaurant' as const;
const USER_UID = 'plugin::users-permissions.user' as const;

type RestaurantMediaField = 'logo' | 'QRImage';

const ALLOWED_FIELDS = new Set([
  'name',
  'slug',
  'description',
  'email',
  'address',
  'phone',
  'nit',
]);

function getSingleFile(files: any, fieldName: string) {
  const file = files?.[fieldName];
  if (!file) return null;
  return Array.isArray(file) ? file[0] ?? null : file;
}

function isImageFile(file: any) {
  const mime = String(file?.mimetype ?? file?.type ?? '').toLowerCase();
  return mime.startsWith('image/');
}

async function uploadAndLinkImage(
  strapi: any,
  file: any,
  restaurantId: number,
  fieldName: RestaurantMediaField,
  alternativeText: string
) {
  // El servicio de Upload debe crear la asociación con ref/refId/field.
  // No se actualiza el campo media con uploadedFile.id mediante Document Service:
  // Strapi 5 no recomienda esa conexión manual para campos media y Draft & Publish.
  const uploadedFiles = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      data: {
        ref: RESTAURANT_UID,
        refId: restaurantId,
        field: fieldName,
        fileInfo: {
          name: file.originalFilename ?? file.name ?? `${fieldName}.jpg`,
          alternativeText,
        },
      },
      files: file,
    });

  if (!Array.isArray(uploadedFiles) || !uploadedFiles[0]?.id) {
    throw new Error(`Strapi no devolvió el archivo subido para ${fieldName}`);
  }

  return uploadedFiles[0];
}

async function removeUploadedFile(strapi: any, file: any) {
  if (!file) return;
  await strapi.plugin('upload').service('upload').remove(file);
}

async function getOwnedRestaurant(
  strapi: any,
  ctx: any,
  documentId: string,
  populateMedia = true
): Promise<any> {
  const authenticatedUserId = ctx.state.user?.id;

  if (!authenticatedUserId) {
    return { error: ctx.unauthorized('Debes iniciar sesión') };
  }

  const user = await strapi.db.query(USER_UID).findOne({
    where: { id: authenticatedUserId },
    populate: {
      role: true,
      restaurant: true,
    },
  });

  if (!user) {
    return { error: ctx.unauthorized('No se encontró el usuario autenticado') };
  }

  const roleType = String(user.role?.type ?? '').trim().toLowerCase();
  if (roleType !== 'restaurant') {
    return { error: ctx.forbidden('Solo la cuenta del restaurante puede modificar sus datos') };
  }

  if (!user.restaurant?.id) {
    return { error: ctx.forbidden('La cuenta no tiene un restaurante asociado') };
  }

  const restaurant = await strapi.documents(RESTAURANT_UID).findOne({
    documentId,
    populate: populateMedia
      ? { logo: true, QRImage: true }
      : undefined,
  });

  if (!restaurant) {
    return { error: ctx.notFound('Restaurante no encontrado') };
  }

  const sameRestaurant =
    user.restaurant.documentId && restaurant.documentId
      ? user.restaurant.documentId === restaurant.documentId
      : Number(restaurant.id) === Number(user.restaurant.id);

  if (!sameRestaurant) {
    return { error: ctx.forbidden('No puedes modificar un restaurante que no pertenece a tu cuenta') };
  }

  return { restaurant };
}

async function sendRestaurantResponse(ctx: any, controller: any, restaurant: any) {
  // ctx.badRequest(), ctx.notFound(), etc. ya establecen ctx.body.
  // No se debe usar ctx.status para distinguir errores antes de escribir el body:
  // Koa puede reportar 404 mientras la respuesta todavía está vacía.
  if (ctx.body) return ctx.body;

  if (!restaurant) {
    return ctx.notFound('No se pudo recuperar el restaurante actualizado');
  }

  const sanitized = await controller.sanitizeOutput(restaurant, ctx);
  ctx.status = 200;
  ctx.body = { data: sanitized };
  return ctx.body;
}

export default factories.createCoreController(RESTAURANT_UID, ({ strapi }) => {
  async function updateMedia(
    ctx: any,
    fieldName: RestaurantMediaField,
    requireEmpty: boolean
  ) {
    const documentId = String(ctx.params?.documentId ?? '').trim();
    if (!documentId) {
      return ctx.badRequest('El documentId del restaurante es obligatorio');
    }

    const access = await getOwnedRestaurant(strapi, ctx, documentId, true);
    if (access.error) return access.error;

    const restaurant = access.restaurant;
    const currentMedia = restaurant[fieldName];

    if (requireEmpty && currentMedia) {
      return ctx.badRequest(`${fieldName} ya existe. Utiliza PATCH para reemplazarlo.`);
    }

    const file = getSingleFile(ctx.request.files, fieldName);
    if (!file) {
      return ctx.badRequest(`Debes enviar un archivo en el campo ${fieldName}`);
    }

    if (!isImageFile(file)) {
      return ctx.badRequest(`El archivo del campo ${fieldName} debe ser una imagen`);
    }

    let uploadedFile: any = null;

    try {
      uploadedFile = await uploadAndLinkImage(
        strapi,
        file,
        restaurant.id,
        fieldName,
        `${fieldName} del restaurante ${documentId}`
      );

      // El documento tiene Draft & Publish. Primero se vincula el archivo
      // a la versión draft recuperada y luego se publica el documento.
      await strapi.documents(RESTAURANT_UID).publish({ documentId });

      const updated = await strapi.documents(RESTAURANT_UID).findOne({
        documentId,
        status: 'published',
        populate: {
          logo: true,
          QRImage: true,
        },
      });

      // No se elimina automáticamente el archivo anterior. Podría estar
      // compartido por otro registro; se evita borrar recursos ajenos.
      if (currentMedia?.id && currentMedia.id !== uploadedFile.id) {
        strapi.log.info(
          `Se reemplazó ${fieldName} del restaurante ${documentId}. El archivo anterior permanece en la biblioteca multimedia.`
        );
      }

      return updated;
    } catch (error) {
      if (uploadedFile) {
        try {
          await removeUploadedFile(strapi, uploadedFile);
        } catch (cleanupError) {
          strapi.log.error('No se pudo limpiar el archivo subido tras el error', cleanupError);
        }
      }
      throw error;
    }
  }

  async function deleteMedia(ctx: any, fieldName: RestaurantMediaField) {
    const documentId = String(ctx.params?.documentId ?? '').trim();
    if (!documentId) {
      return ctx.badRequest('El documentId del restaurante es obligatorio');
    }

    const access = await getOwnedRestaurant(strapi, ctx, documentId, true);
    if (access.error) return access.error;

    const currentMedia = access.restaurant[fieldName];
    if (!currentMedia) {
      return ctx.badRequest(`El restaurante no tiene ${fieldName}`);
    }

    // Se actualiza la versión draft y se publica en una sola operación.
    // El archivo no se elimina de Media Library por si tiene otras asociaciones.
    return await strapi.documents(RESTAURANT_UID).update({
      documentId,
      status: 'published',
      data: { [fieldName]: null } as any,
      populate: {
        logo: true,
        QRImage: true,
      },
    });
  }

  return {
    async patch(ctx: any) {
      const documentId = String(ctx.params?.documentId ?? '').trim();
      if (!documentId) {
        return ctx.badRequest('El documentId del restaurante es obligatorio');
      }

      const access = await getOwnedRestaurant(strapi, ctx, documentId, true);
      if (access.error) return access.error;

      const body = ctx.request.body ?? {};
      const payload = body.data ?? body;

      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return ctx.badRequest('Los datos enviados no son válidos');
      }

      const unknownFields = Object.keys(payload).filter((key) => !ALLOWED_FIELDS.has(key));
      if (unknownFields.length > 0) {
        return ctx.badRequest(`No se permite modificar estos campos: ${unknownFields.join(', ')}`);
      }

      const data: Record<string, any> = {};
      for (const [key, value] of Object.entries(payload)) {
        data[key] = typeof value === 'string' ? value.trim() : value;
      }

      if (Object.keys(data).length === 0) {
        return ctx.badRequest('No se enviaron campos válidos para actualizar');
      }

      if (data.name !== undefined && (typeof data.name !== 'string' || !data.name)) {
        return ctx.badRequest('El nombre del restaurante no puede estar vacío');
      }

      if (data.email !== undefined) {
        const email = String(data.email).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return ctx.badRequest('El correo electrónico del restaurante no es válido');
        }
        data.email = email;
      }

      try {
        const updated = await strapi.documents(RESTAURANT_UID).update({
          documentId,
          status: 'published',
          data,
          populate: {
            logo: true,
            QRImage: true,
            users: true,
            products: true,
            promotions: true,
            publications: true,
            orders: true,
          },
        });

        return await sendRestaurantResponse(ctx, this, updated);
      } catch (error) {
        strapi.log.error(`Error actualizando el restaurante ${documentId}`, error);
        return ctx.internalServerError('No se pudo actualizar la información del restaurante');
      }
    },

    async createLogo(ctx: any) {
      try {
        const updated = await updateMedia(ctx, 'logo', true);
        return await sendRestaurantResponse(ctx, this, updated);
      } catch (error) {
        strapi.log.error('Error creando el logo del restaurante', error);
        return ctx.internalServerError('No se pudo subir el logo');
      }
    },

    async updateLogo(ctx: any) {
      try {
        const updated = await updateMedia(ctx, 'logo', false);
        return await sendRestaurantResponse(ctx, this, updated);
      } catch (error) {
        strapi.log.error('Error actualizando el logo del restaurante', error);
        return ctx.internalServerError('No se pudo actualizar el logo');
      }
    },

    async removeLogo(ctx: any) {
      try {
        const updated = await deleteMedia(ctx, 'logo');
        return await sendRestaurantResponse(ctx, this, updated);
      } catch (error) {
        strapi.log.error('Error eliminando el logo del restaurante', error);
        return ctx.internalServerError('No se pudo eliminar el logo');
      }
    },

    async createQRImage(ctx: any) {
      try {
        const updated = await updateMedia(ctx, 'QRImage', true);
        return await sendRestaurantResponse(ctx, this, updated);
      } catch (error) {
        strapi.log.error('Error creando la imagen QR del restaurante', error);
        return ctx.internalServerError('No se pudo subir la imagen QR');
      }
    },

    async updateQRImage(ctx: any) {
      try {
        const updated = await updateMedia(ctx, 'QRImage', false);
        return await sendRestaurantResponse(ctx, this, updated);
      } catch (error) {
        strapi.log.error('Error actualizando la imagen QR del restaurante', error);
        return ctx.internalServerError('No se pudo actualizar la imagen QR');
      }
    },

    async removeQRImage(ctx: any) {
      try {
        const updated = await deleteMedia(ctx, 'QRImage');
        return await sendRestaurantResponse(ctx, this, updated);
      } catch (error) {
        strapi.log.error('Error eliminando la imagen QR del restaurante', error);
        return ctx.internalServerError('No se pudo eliminar la imagen QR');
      }
    },
  };
});
