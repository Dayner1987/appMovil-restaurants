const USER_UID = 'plugin::users-permissions.user';
const ROLE_UID = 'plugin::users-permissions.role';

function sanitizeUser(user: any) {
  if (!user) return user;

  const {
    password,
    resetPasswordToken,
    confirmationToken,
    ...safeUser
  } = user;

  return safeUser;
}

function formatUser(user: any) {
  const safeUser = sanitizeUser(user);

  return {
    ...safeUser,
    role: user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          type: user.role.type,
          description: user.role.description ?? null,
        }
      : null,
    avatar: user.avatar ?? null,
    restaurant: user.restaurant ?? null,
  };
}

export async function requireAdmin(ctx: any) {
  const currentUser = ctx.state.user;

  if (!currentUser?.id) {
    ctx.unauthorized('Usuario no autenticado');
    return false;
  }

  const user = await strapi.db
    .query(USER_UID)
    .findOne({
      where: {
        id: currentUser.id,
      },
      populate: {
        role: true,
      },
    });

  const roleName = user?.role?.name?.toLowerCase();
  const roleType = user?.role?.type?.toLowerCase();

  if (roleName !== 'admin' && roleType !== 'admin') {
    ctx.forbidden(
      'Solo un administrador puede gestionar usuarios'
    );

    return false;
  }

  return true;
}
export async function adminResetPassword(ctx: any) {
  if (!(await requireAdmin(ctx))) return;

  const userId = ctx.params.id;

  const body =
    ctx.request.body?.data ??
    ctx.request.body ??
    {};

  const {
    password,
    passwordConfirmation,
  } = body;

  if (!password || !passwordConfirmation) {
    return ctx.badRequest(
      'La contraseña y su confirmación son obligatorias'
    );
  }

  if (password !== passwordConfirmation) {
    return ctx.badRequest(
      'Las contraseñas no coinciden'
    );
  }

  if (password.length < 6) {
    return ctx.badRequest(
      'La contraseña debe tener al menos 6 caracteres'
    );
  }

  const user = await strapi.db
    .query(USER_UID)
    .findOne({
      where: {
        id: userId,
      },
    });

  if (!user) {
    return ctx.notFound(
      'Usuario no encontrado'
    );
  }

  try {
    await strapi
      .plugin('users-permissions')
      .service('user')
      .edit(userId, {
        password,
      });

    ctx.status = 200;

    return {
      ok: true,
      message:
        'Contraseña actualizada correctamente',
    };
  } catch (error) {
    strapi.log.error(
      'Error actualizando contraseña administrativa',
      error
    );

    return ctx.internalServerError(
      'No se pudo actualizar la contraseña'
    );
  }
}
async function findUserById(id: string | number) {
  return strapi.db.query(USER_UID).findOne({
    where: {
      id,
    },
    populate: {
      role: {
        select: [
          'id',
          'name',
          'type',
          'description',
        ],
      },
      avatar: true,
      restaurant: true,
    },
  });
}

// =====================================================
// GET /api/users/admin
// =====================================================

export async function adminFind(ctx: any) {
  if (!(await requireAdmin(ctx))) return;

  const page = Number(ctx.query?.pagination?.page ?? 1);
  const pageSize = Number(
    ctx.query?.pagination?.pageSize ?? 25
  );

  const start = (page - 1) * pageSize;

  const result = await strapi.db
    .query(USER_UID)
    .findPage({
      page,
      pageSize,
      orderBy: {
        createdAt: 'desc',
      },
      populate: {
        role: {
          select: [
            'id',
            'name',
            'type',
            'description',
          ],
        },
        avatar: true,
        restaurant: true,
      },
    });

  ctx.body = {
    data: result.results.map(formatUser),
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(
          result.pagination.total / pageSize
        ),
        total: result.pagination.total,
        start,
      },
    },
  };

  return ctx.body;
}

// =====================================================
// GET /api/users/admin/:id
// =====================================================

export async function adminFindOne(ctx: any) {
  if (!(await requireAdmin(ctx))) return;

  const user = await findUserById(ctx.params.id);

  if (!user) {
    return ctx.notFound('Usuario no encontrado');
  }

  ctx.body = {
    data: formatUser(user),
  };

  return ctx.body;
}

// =====================================================
// PATCH /api/users/admin/:id
// =====================================================

export async function adminPatch(ctx: any) {
  if (!(await requireAdmin(ctx))) return;

  const userId = ctx.params.id;
  const body =
    ctx.request.body?.data ??
    ctx.request.body ??
    {};

  const allowedFields = [
    'username',
    'email',
    'firstName',
    'middleName',
    'lastName',
    'secondLastName',
    'phone',
    'ci',
    'blocked',
  ];

  const data: Record<string, any> = {};

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        field
      )
    ) {
      data[field] = body[field];
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      body,
      'role'
    )
  ) {
    const roleValue = body.role;

    const roleId =
      typeof roleValue === 'object'
        ? roleValue.id
        : roleValue;

    if (!roleId) {
      return ctx.badRequest(
        'El role debe contener un id válido'
      );
    }

    const role = await strapi.db
      .query(ROLE_UID)
      .findOne({
        where: {
          id: roleId,
        },
      });

    if (!role) {
      return ctx.badRequest(
        'El rol indicado no existe'
      );
    }

    data.role = role.id;
  }

  if (Object.keys(data).length === 0) {
    return ctx.badRequest(
      'No se enviaron campos válidos para actualizar'
    );
  }

  try {
    const updatedUser = await strapi.db
      .query(USER_UID)
      .update({
        where: {
          id: userId,
        },
        data,
        populate: {
          role: {
            select: [
              'id',
              'name',
              'type',
              'description',
            ],
          },
          avatar: true,
          restaurant: true,
        },
      });

    if (!updatedUser) {
      return ctx.notFound(
        'Usuario no encontrado'
      );
    }

    ctx.body = {
      data: formatUser(updatedUser),
    };

    return ctx.body;
  } catch (error: any) {
    strapi.log.error(
      'Error actualizando usuario por administrador',
      error
    );

    if (
      error?.message
        ?.toLowerCase()
        .includes('unique')
    ) {
      return ctx.badRequest(
        'El nombre de usuario, correo, teléfono o CI ya está registrado'
      );
    }

    return ctx.internalServerError(
      'No se pudo actualizar el usuario'
    );
  }
}

// =====================================================
// PUT/PATCH /api/users/admin/:id/avatar
// =====================================================

export async function adminUpdateAvatar(ctx: any) {
  if (!(await requireAdmin(ctx))) return;

  const userId = ctx.params.id;
  const uploadedFile = ctx.request.files?.avatar;

  if (!uploadedFile) {
    return ctx.badRequest(
      'Debes enviar una imagen en el campo avatar'
    );
  }

  const file = Array.isArray(uploadedFile)
    ? uploadedFile[0]
    : uploadedFile;

  const mime = file?.mimetype ?? file?.type ?? '';

  if (mime && !mime.startsWith('image/')) {
    return ctx.badRequest(
      'El archivo debe ser una imagen'
    );
  }

  const user = await findUserById(userId);

  if (!user) {
    return ctx.notFound('Usuario no encontrado');
  }

  try {
    const oldAvatar = user.avatar;

    const uploadedFiles = await strapi
      .plugin('upload')
      .service('upload')
      .upload({
        data: {
          fileInfo: {
            name:
              file.originalFilename ??
              file.name ??
              `avatar-${userId}`,
            alternativeText:
              `Avatar del usuario ${userId}`,
          },
        },
        files: file,
      });

    const newAvatar = uploadedFiles?.[0];

    if (!newAvatar) {
      return ctx.internalServerError(
        'No se pudo subir el avatar'
      );
    }

    const updatedUser = await strapi.db
      .query(USER_UID)
      .update({
        where: {
          id: userId,
        },
        data: {
          avatar: newAvatar.id,
        },
        populate: {
          role: {
            select: [
              'id',
              'name',
              'type',
              'description',
            ],
          },
          avatar: true,
          restaurant: true,
        },
      });

    if (oldAvatar?.id) {
      try {
        await strapi
          .plugin('upload')
          .service('upload')
          .remove(oldAvatar.id);
      } catch (error) {
        strapi.log.warn(
          'No se pudo eliminar el avatar anterior'
        );
      }
    }

    ctx.body = {
      data: formatUser(updatedUser),
    };

    return ctx.body;
  } catch (error) {
    strapi.log.error(
      'Error actualizando avatar de usuario',
      error
    );

    return ctx.internalServerError(
      'No se pudo actualizar el avatar'
    );
  }
}

// =====================================================
// DELETE /api/users/admin/:id/avatar
// =====================================================

export async function adminRemoveAvatar(ctx: any) {
  if (!(await requireAdmin(ctx))) return;

  const userId = ctx.params.id;
  const user = await findUserById(userId);

  if (!user) {
    return ctx.notFound('Usuario no encontrado');
  }

  const oldAvatar = user.avatar;

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

  if (oldAvatar?.id) {
    try {
      await strapi
        .plugin('upload')
        .service('upload')
        .remove(oldAvatar.id);
    } catch (error) {
      strapi.log.warn(
        'No se pudo eliminar el archivo del avatar'
      );
    }
  }

  ctx.body = {
    data: {
      id: userId,
      avatar: null,
    },
    message: 'Avatar eliminado correctamente',
  };

  return ctx.body;
}