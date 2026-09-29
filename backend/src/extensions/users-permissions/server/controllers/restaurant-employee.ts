// backend/src/extensions/users-permissions/server/controllers/restaurant-employee.ts

const USER_UID =
  'plugin::users-permissions.user';

const ROLE_UID =
  'plugin::users-permissions.role';

// =====================================================
// TYPES
// =====================================================

interface CreateEmployeeBody {
  username: string;

  email: string;

  password: string;

  firstName: string;

  middleName?: string | null;

  lastName: string;

  secondLastName?: string | null;

  ci?: string | null;

  phone?: string | null;
}

interface UpdateEmployeeBody {
  username: string;

  email: string;

  firstName: string;

  middleName?: string | null;

  lastName: string;

  secondLastName?: string | null;

  ci?: string | null;

  phone?: string | null;
}

// =====================================================
// HELPERS
// =====================================================

function cleanNullableText(
  value: unknown
): string | null {
  if (
    typeof value !==
    'string'
  ) {
    return null;
  }

  const cleaned =
    value.trim();

  return cleaned ||
    null;
}

// =====================================================
// SANITIZE
// =====================================================

function sanitizeEmployee(
  user: any
) {
  if (!user) {
    return null;
  }

  return {
    id:
      user.id,

    documentId:
      user.documentId,

    username:
      user.username,

    email:
      user.email,

    firstName:
      user.firstName ??
      null,

    middleName:
      user.middleName ??
      null,

    lastName:
      user.lastName ??
      null,

    secondLastName:
      user.secondLastName ??
      null,

    ci:
      user.ci ??
      null,

    phone:
      user.phone ??
      null,

    confirmed:
      user.confirmed,

    blocked:
      user.blocked,

    role:
      user.role
        ? {
            id:
              user.role.id,

            name:
              user.role.name,

            type:
              user.role.type,
          }
        : null,

    restaurant:
      user.restaurant
        ? {
            id:
              user.restaurant.id,

            documentId:
              user.restaurant.documentId,

            name:
              user.restaurant.name,
          }
        : null,

    createdAt:
      user.createdAt,

    updatedAt:
      user.updatedAt,
  };
}

// =====================================================
// RESTAURANT CONTEXT
//
// IMPORTANTE:
// usamos directamente la instancia global `strapi`.
// NO:
// const { strapi } = ctx;
// =====================================================

async function getRestaurantContext(
  ctx: any
) {
  const authUser =
    ctx.state.user;

  if (
    !authUser?.id
  ) {
    return {
      error:
        ctx.unauthorized(
          'Debes iniciar sesión'
        ),
    };
  }

  const user =
    await strapi.db
      .query(
        USER_UID
      )
      .findOne({
        where: {
          id:
            authUser.id,
        },

        populate: {
          role:
            true,

          restaurant:
            true,
        },
      });

  if (!user) {
    return {
      error:
        ctx.unauthorized(
          'Usuario no encontrado'
        ),
    };
  }

  const roleType =
    String(
      user.role?.type ??
      ''
    )
      .trim()
      .toLowerCase();

  if (
    roleType !==
    'restaurant'
  ) {
    return {
      error:
        ctx.forbidden(
          'Solo un restaurante puede gestionar empleados'
        ),
    };
  }

  if (
    !user.restaurant
  ) {
    return {
      error:
        ctx.badRequest(
          'El usuario no tiene un restaurante relacionado'
        ),
    };
  }

  return {
    user,

    restaurant:
      user.restaurant,
  };
}

// =====================================================
// EMPLOYEE ROLE
// =====================================================

async function getEmployeeRole() {
  return await strapi.db
    .query(
      ROLE_UID
    )
    .findOne({
      where: {
        type:
          'employee',
      },
    });
}

// =====================================================
// FIND OWN EMPLOYEE
// =====================================================

async function findOwnedEmployee(
  restaurantId: number,
  employeeId: number
) {
  const employeeRole =
    await getEmployeeRole();

  if (
    !employeeRole
  ) {
    return null;
  }

  return await strapi.db
    .query(
      USER_UID
    )
    .findOne({
      where: {
        id:
          employeeId,

        role: {
          id:
            employeeRole.id,
        },

        restaurant: {
          id:
            restaurantId,
        },
      },

      populate: {
        role:
          true,

        restaurant:
          true,

        avatar:
          true,
      },
    });
}

// =====================================================
// DUPLICATE USER
// =====================================================

async function findDuplicateUser(
  data: {
    username?: string;

    email?: string;

    phone?: string | null;

    ci?: string | null;
  },

  excludeId?: number
) {
  const alternatives:
    any[] = [];

  if (
    data.username
  ) {
    alternatives.push({
      username:
        data.username,
    });
  }

  if (
    data.email
  ) {
    alternatives.push({
      email:
        data.email,
    });
  }

  if (
    data.phone
  ) {
    alternatives.push({
      phone:
        data.phone,
    });
  }

  if (
    data.ci
  ) {
    alternatives.push({
      ci:
        data.ci,
    });
  }

  if (
    alternatives.length ===
    0
  ) {
    return null;
  }

  const where:
    any = {
    $or:
      alternatives,
  };

  if (
    excludeId
  ) {
    where.id = {
      $ne:
        excludeId,
    };
  }

  return await strapi.db
    .query(
      USER_UID
    )
    .findOne({
      where,
    });
}

// =====================================================
// CREATE EMPLOYEE
// =====================================================

export async function restaurantCreateEmployee(
  ctx: any
) {
  const context =
    await getRestaurantContext(
      ctx
    );

  if (
    context.error
  ) {
    return context.error;
  }

  const body =
    (
      ctx.request.body ??
      {}
    ) as Partial<CreateEmployeeBody>;

  const username =
    typeof body.username ===
      'string'
      ? body.username.trim()
      : '';

  const email =
    typeof body.email ===
      'string'
      ? body.email
          .trim()
          .toLowerCase()
      : '';

  const password =
    typeof body.password ===
      'string'
      ? body.password
      : '';

  const firstName =
    typeof body.firstName ===
      'string'
      ? body.firstName.trim()
      : '';

  const lastName =
    typeof body.lastName ===
      'string'
      ? body.lastName.trim()
      : '';

  const middleName =
    cleanNullableText(
      body.middleName
    );

  const secondLastName =
    cleanNullableText(
      body.secondLastName
    );

  const phone =
    cleanNullableText(
      body.phone
    );

  const ci =
    cleanNullableText(
      body.ci
    );

  if (
    !username ||
    !email ||
    !password ||
    !firstName ||
    !lastName
  ) {
    return ctx.badRequest(
      'Usuario, correo, contraseña, nombre y apellido son obligatorios'
    );
  }

  if (
    password.length <
    6
  ) {
    return ctx.badRequest(
      'La contraseña debe tener al menos 6 caracteres'
    );
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailRegex.test(
      email
    )
  ) {
    return ctx.badRequest(
      'El correo electrónico no es válido'
    );
  }

  const duplicate =
    await findDuplicateUser({
      username,
      email,
      phone,
      ci,
    });

  if (
    duplicate
  ) {
    return ctx.badRequest(
      'El usuario, correo, teléfono o CI ya está registrado'
    );
  }

  const employeeRole =
    await getEmployeeRole();

  if (
    !employeeRole
  ) {
    return ctx.internalServerError(
      'No se encontró el rol Employee'
    );
  }

  // ===================================================
  // USERS-PERMISSIONS SERVICE
  //
  // Usamos este service para que Strapi gestione
  // correctamente el password.
  // ===================================================

  const userService =
    strapi
      .plugin(
        'users-permissions'
      )
      .service(
        'user'
      );

  const created =
    await userService.add({
      username,

      email,

      password,

      provider:
        'local',

      confirmed:
        true,

      blocked:
        false,

      role:
        employeeRole.id,

      restaurant:
        context.restaurant.id,

      firstName,

      middleName,

      lastName,

      secondLastName,

      ci,

      phone,
    });

  if (
    !created?.id
  ) {
    return ctx.internalServerError(
      'No se pudo crear el empleado'
    );
  }

  const employee =
    await strapi.db
      .query(
        USER_UID
      )
      .findOne({
        where: {
          id:
            created.id,
        },

        populate: {
          role:
            true,

          restaurant:
            true,

          avatar:
            true,
        },
      });

  ctx.status =
    201;

  ctx.body = {
    message:
      'Empleado creado correctamente',

    data:
      sanitizeEmployee(
        employee
      ),
  };

  return ctx.body;
}

// =====================================================
// FIND ALL EMPLOYEES
// =====================================================

export async function restaurantFindEmployees(
  ctx: any
) {
  const context =
    await getRestaurantContext(
      ctx
    );

  if (
    context.error
  ) {
    return context.error;
  }

  const employeeRole =
    await getEmployeeRole();

  if (
    !employeeRole
  ) {
    return ctx.internalServerError(
      'No se encontró el rol Employee'
    );
  }

  const employees =
    await strapi.db
      .query(
        USER_UID
      )
      .findMany({
        where: {
          role: {
            id:
              employeeRole.id,
          },

          restaurant: {
            id:
              context.restaurant.id,
          },
        },

        populate: {
          role:
            true,

          restaurant:
            true,

          avatar:
            true,
        },

        orderBy: {
          createdAt:
            'desc',
        },
      });

  ctx.body = {
    data:
      employees.map(
        sanitizeEmployee
      ),

    meta: {
      total:
        employees.length,
    },
  };

  return ctx.body;
}

// =====================================================
// FIND ONE EMPLOYEE
// =====================================================

export async function restaurantFindEmployee(
  ctx: any
) {
  const context =
    await getRestaurantContext(
      ctx
    );

  if (
    context.error
  ) {
    return context.error;
  }

  const employeeId =
    Number(
      ctx.params.id
    );

  if (
    !Number.isInteger(
      employeeId
    )
  ) {
    return ctx.badRequest(
      'ID de empleado inválido'
    );
  }

  const employee =
    await findOwnedEmployee(
      context.restaurant.id,
      employeeId
    );

  if (
    !employee
  ) {
    return ctx.notFound(
      'Empleado no encontrado'
    );
  }

  ctx.body = {
    data:
      sanitizeEmployee(
        employee
      ),

    meta: {},
  };

  return ctx.body;
}

// =====================================================
// UPDATE EMPLOYEE
// =====================================================

export async function restaurantUpdateEmployee(
  ctx: any
) {
  const context =
    await getRestaurantContext(
      ctx
    );

  if (
    context.error
  ) {
    return context.error;
  }

  const employeeId =
    Number(
      ctx.params.id
    );

  if (
    !Number.isInteger(
      employeeId
    )
  ) {
    return ctx.badRequest(
      'ID de empleado inválido'
    );
  }

  const employee =
    await findOwnedEmployee(
      context.restaurant.id,
      employeeId
    );

  if (
    !employee
  ) {
    return ctx.notFound(
      'Empleado no encontrado'
    );
  }

  const body =
    (
      ctx.request.body ??
      {}
    ) as Partial<UpdateEmployeeBody>;

  const username =
    typeof body.username ===
      'string'
      ? body.username.trim()
      : '';

  const email =
    typeof body.email ===
      'string'
      ? body.email
          .trim()
          .toLowerCase()
      : '';

  const firstName =
    typeof body.firstName ===
      'string'
      ? body.firstName.trim()
      : '';

  const lastName =
    typeof body.lastName ===
      'string'
      ? body.lastName.trim()
      : '';

  if (
    !username ||
    !email ||
    !firstName ||
    !lastName
  ) {
    return ctx.badRequest(
      'Usuario, correo, nombre y apellido son obligatorios'
    );
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailRegex.test(
      email
    )
  ) {
    return ctx.badRequest(
      'El correo electrónico no es válido'
    );
  }

  const phone =
    cleanNullableText(
      body.phone
    );

  const ci =
    cleanNullableText(
      body.ci
    );

  const duplicate =
    await findDuplicateUser(
      {
        username,
        email,
        phone,
        ci,
      },

      employeeId
    );

  if (
    duplicate
  ) {
    return ctx.badRequest(
      'El usuario, correo, teléfono o CI ya pertenece a otro usuario'
    );
  }

  const userService =
    strapi
      .plugin(
        'users-permissions'
      )
      .service(
        'user'
      );

  await userService.edit(
    employeeId,
    {
      username,

      email,

      firstName,

      middleName:
        cleanNullableText(
          body.middleName
        ),

      lastName,

      secondLastName:
        cleanNullableText(
          body.secondLastName
        ),

      ci,

      phone,
    }
  );

  const updated =
    await findOwnedEmployee(
      context.restaurant.id,
      employeeId
    );

  ctx.body = {
    message:
      'Empleado actualizado correctamente',

    data:
      sanitizeEmployee(
        updated
      ),
  };

  return ctx.body;
}

// =====================================================
// BLOCK / ENABLE EMPLOYEE
// =====================================================

export async function restaurantUpdateEmployeeStatus(
  ctx: any
) {
  const context =
    await getRestaurantContext(
      ctx
    );

  if (
    context.error
  ) {
    return context.error;
  }

  const employeeId =
    Number(
      ctx.params.id
    );

  if (
    !Number.isInteger(
      employeeId
    )
  ) {
    return ctx.badRequest(
      'ID de empleado inválido'
    );
  }

  const employee =
    await findOwnedEmployee(
      context.restaurant.id,
      employeeId
    );

  if (
    !employee
  ) {
    return ctx.notFound(
      'Empleado no encontrado'
    );
  }

  const {
    blocked,
  } =
    ctx.request.body ??
    {};

  if (
    typeof blocked !==
    'boolean'
  ) {
    return ctx.badRequest(
      'blocked debe ser boolean'
    );
  }

  await strapi.db
    .query(
      USER_UID
    )
    .update({
      where: {
        id:
          employeeId,
      },

      data: {
        blocked,
      },
    });

  const updated =
    await findOwnedEmployee(
      context.restaurant.id,
      employeeId
    );

  ctx.body = {
    message:
      blocked
        ? 'Empleado bloqueado correctamente'
        : 'Empleado habilitado correctamente',

    data:
      sanitizeEmployee(
        updated
      ),
  };

  return ctx.body;
}

// =====================================================
// RESET EMPLOYEE PASSWORD
// =====================================================

export async function restaurantResetEmployeePassword(
  ctx: any
) {
  const context =
    await getRestaurantContext(
      ctx
    );

  if (
    context.error
  ) {
    return context.error;
  }

  const employeeId =
    Number(
      ctx.params.id
    );

  if (
    !Number.isInteger(
      employeeId
    )
  ) {
    return ctx.badRequest(
      'ID de empleado inválido'
    );
  }

  const employee =
    await findOwnedEmployee(
      context.restaurant.id,
      employeeId
    );

  if (
    !employee
  ) {
    return ctx.notFound(
      'Empleado no encontrado'
    );
  }

  const {
    password,
    passwordConfirmation,
  } =
    ctx.request.body ??
    {};

  if (
    typeof password !==
      'string' ||
    password.length <
      6
  ) {
    return ctx.badRequest(
      'La contraseña debe tener al menos 6 caracteres'
    );
  }

  if (
    password !==
    passwordConfirmation
  ) {
    return ctx.badRequest(
      'Las contraseñas no coinciden'
    );
  }

  const userService =
    strapi
      .plugin(
        'users-permissions'
      )
      .service(
        'user'
      );

  await userService.edit(
    employeeId,
    {
      password,
    }
  );

  ctx.body = {
    message:
      'Contraseña actualizada correctamente',
  };

  return ctx.body;
}