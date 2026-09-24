// src/extensions/users-permissions/server/controllers/avatar.ts

const USER_UID =
  'plugin::users-permissions.user';

function formatAvatar(
  avatar: any
) {
  if (!avatar) {
    return null;
  }

  return {
    id: avatar.id,
    documentId:
      avatar.documentId ?? null,

    name:
      avatar.name ?? null,

    alternativeText:
      avatar.alternativeText ??
      null,

    width:
      avatar.width ?? null,

    height:
      avatar.height ?? null,

    formats:
      avatar.formats ?? null,

    mime:
      avatar.mime ?? null,

    size:
      avatar.size ?? null,

    url:
      avatar.url ?? null,

    previewUrl:
      avatar.previewUrl ?? null,

    provider:
      avatar.provider ?? null,

    createdAt:
      avatar.createdAt ?? null,

    updatedAt:
      avatar.updatedAt ?? null,
  };
}

// =====================================================
// GET /api/users/me/avatar
// =====================================================

export async function getMyAvatar(
  ctx: any
) {
  const userId =
    ctx.state.user?.id;

  if (!userId) {
    return ctx.unauthorized(
      'Usuario no autenticado'
    );
  }

  const user =
    await strapi.db
      .query(USER_UID)
      .findOne({
        where: {
          id: userId,
        },

        select: ['id'],

        populate: {
          avatar: true,
        },
      });

  if (!user) {
    return ctx.notFound(
      'Usuario no encontrado'
    );
  }

  ctx.body = {
    avatar:
      formatAvatar(
        user.avatar
      ),
  };

  return ctx.body;
}

// =====================================================
// PUT /api/users/me/avatar
// =====================================================

export async function updateMyAvatar(
  ctx: any
) {
  const userId =
    ctx.state.user?.id;

  if (!userId) {
    return ctx.unauthorized(
      'Usuario no autenticado'
    );
  }

  const uploadedFile =
    ctx.request.files?.avatar;

  if (!uploadedFile) {
    return ctx.badRequest(
      'Debes enviar una imagen en el campo avatar'
    );
  }

  const file =
    Array.isArray(
      uploadedFile
    )
      ? uploadedFile[0]
      : uploadedFile;

  const mime =
    file?.mimetype ??
    file?.type ??
    '';

  if (
    mime &&
    !mime.startsWith('image/')
  ) {
    return ctx.badRequest(
      'El archivo debe ser una imagen'
    );
  }

  try {
    const fileName =
      file?.originalFilename ??
      file?.name ??
      `avatar-${userId}`;

    const uploadedFiles =
      await strapi
        .plugin('upload')
        .service('upload')
        .upload({
          data: {
            fileInfo: {
              name: fileName,

              alternativeText:
                `Avatar del usuario ${userId}`,
            },
          },

          files: file,
        });

    const avatar =
      uploadedFiles?.[0];

    if (!avatar) {
      return ctx.internalServerError(
        'No se pudo subir el avatar'
      );
    }

    await strapi.db
      .query(USER_UID)
      .update({
        where: {
          id: userId,
        },

        data: {
          avatar:
            avatar.id,
        },
      });

    ctx.body = {
      avatar:
        formatAvatar(
          avatar
        ),
    };

    return ctx.body;
  } catch (error) {
    strapi.log.error(
      'Error actualizando avatar:',
      error
    );

    return ctx.internalServerError(
      'No se pudo actualizar el avatar'
    );
  }
}

// =====================================================
// DELETE /api/users/me/avatar
// =====================================================

export async function removeMyAvatar(
  ctx: any
) {
  const userId =
    ctx.state.user?.id;

  if (!userId) {
    return ctx.unauthorized(
      'Usuario no autenticado'
    );
  }

  const user =
    await strapi.db
      .query(USER_UID)
      .findOne({
        where: {
          id: userId,
        },

        select: ['id'],

        populate: {
          avatar: true,
        },
      });

  if (!user) {
    return ctx.notFound(
      'Usuario no encontrado'
    );
  }

  await strapi.db
    .query(USER_UID)
    .update({
      where: {
        id: userId,
      },

      data: {
        avatar: null,
      },
    });

  ctx.body = {
    avatar: null,

    message:
      'Avatar eliminado correctamente',
  };

  return ctx.body;
}