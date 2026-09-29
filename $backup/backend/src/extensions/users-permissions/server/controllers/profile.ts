// src/extensions/users-permissions/server/controllers/profile.ts

const USER_UID = 'plugin::users-permissions.user';

function sanitizeUser(user: any) {
  if (!user) {
    return user;
  }

  const {
    password,
    resetPasswordToken,
    confirmationToken,
    ...safeUser
  } = user;

  return safeUser;
}

export async function updateProfile(ctx: any) {
  const userId = ctx.state.user?.id;

  if (!userId) {
    return ctx.unauthorized(
      'Usuario no autenticado'
    );
  }

  const body =
    ctx.request.body?.data ??
    ctx.request.body ??
    {};

  const {
    firstName,
    middleName,
    lastName,
    secondLastName,
    phone,
    ci,
  } = body;

  const data: Record<
    string,
    any
  > = {};

  if (firstName !== undefined) {
    data.firstName = firstName;
  }

  if (middleName !== undefined) {
    data.middleName = middleName;
  }

  if (lastName !== undefined) {
    data.lastName = lastName;
  }

  if (
    secondLastName !== undefined
  ) {
    data.secondLastName =
      secondLastName;
  }

  if (phone !== undefined) {
    data.phone = phone;
  }

  if (ci !== undefined) {
    data.ci = ci;
  }

  if (
    Object.keys(data).length === 0
  ) {
    return ctx.badRequest(
      'No se enviaron campos para actualizar'
    );
  }

  try {
    const updatedUser =
      await strapi.db
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

    ctx.body =
      sanitizeUser(updatedUser);

    return ctx.body;
  } catch (error: any) {
    strapi.log.error(
      'Error actualizando perfil:',
      error
    );

    if (
      error?.message
        ?.toLowerCase()
        .includes('unique')
    ) {
      return ctx.badRequest(
        'El teléfono o CI ya está registrado'
      );
    }

    return ctx.internalServerError(
      'No se pudo actualizar el perfil'
    );
  }
}