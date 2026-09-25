// services/user.service.ts

import {
  Platform,
} from 'react-native';

import { api } from './api';
import type {
  AdminAvatarResponse,
  AdminResetPasswordData,
  AdminResetPasswordResponse,
  RoleListResponse,
  RoleResponse,
  UpdateRoleData,
} from '@/types/user.types';

import {
  authStorage,
} from '@/config/auth.storage';

import type {
  AppUser,
  ChangePasswordData,
  ChangePasswordResponse,
  MyAvatarResponse,
  RemoveMyAvatarResponse,
  UpdateMyProfileData,
  UpdateUserData,
  UserListResponse,
  UserQueryParams,
  UserResponse,
} from '@/types/user.types';

// =====================================================
// RUTAS NATIVAS DE USERS-PERMISSIONS
// =====================================================

// services/user.service.ts

const USERS_URL =
  '/api/users';

const USERS_ME_URL =
  '/api/users/me';

const USERS_ME_EXTENSION_URL =
  '/api/users-permissions/users/me';

const USERS_ADMIN_EXTENSION_URL =
  '/api/users-permissions/users';

const CHANGE_PASSWORD_URL =
  '/api/auth/change-password';

const ROLES_URL =
  '/api/users-permissions/roles';

const ADMIN_PASSWORD_URL =
  '/api/users-permissions/admin/users';

export const userService = {
  // ===================================================
  // ADMIN - LISTAR USUARIOS
  // ===================================================

  async findAll(
  params: UserQueryParams = {}
): Promise<UserListResponse> {
  const response =
    await api.get<UserListResponse>(
      USERS_URL,
      {
        params: {
          populate:
            'role,avatar,restaurant,orders,restaurant_application',

          'pagination[page]':
            params.page ?? 1,

          'pagination[pageSize]':
            params.pageSize ?? 25,

          sort:
            params.sort,

          'filters[username][$containsi]':
            params.username,

          'filters[email][$containsi]':
            params.email,

          'filters[blocked][$eq]':
            params.blocked,

          'filters[confirmed][$eq]':
            params.confirmed,

          'filters[role][id][$eq]':
            params.roleId,

          'filters[restaurant][id][$eq]':
            params.restaurantId,
        },
      }
    );

  return response.data;
},

  // ===================================================
  // ADMIN - OBTENER USUARIO
  // ===================================================
async findOne(
  id: number | string
): Promise<AppUser> {
  const response =
    await api.get<AppUser>(
      `${USERS_URL}/${encodeURIComponent(
        String(id)
      )}`,
      {
        params: {
          populate:
            'role,avatar,restaurant,orders,restaurant_application',
        },
      }
    );

  return response.data;
},

  // ===================================================
  // ADMIN - ACTUALIZAR USUARIO
  // ===================================================

  async update(
  id: number | string,
  data: UpdateUserData
): Promise<AppUser> {
  const response =
    await api.patch<UserResponse>(
      `${USERS_ADMIN_EXTENSION_URL}/${encodeURIComponent(
        String(id)
      )}`,
      data
    );

  return response.data.data;
},
async patch(
  id: number | string,
  data: UpdateUserData
): Promise<UserResponse> {
  const response =
    await api.patch<UserResponse>(
      `${USERS_URL}/${encodeURIComponent(String(id))}`,
      data,
      {
        params: {
          populate:
            'role,avatar,restaurant',
        },
      }
    );

  return response.data;
},

async findRoles(): Promise<RoleListResponse> {
  const response =
    await api.get<RoleListResponse>(
      ROLES_URL
    );

  return response.data;
},

async findRole(
  roleId: number | string
): Promise<RoleResponse> {
  const response =
    await api.get<RoleResponse>(
      `${ROLES_URL}/${encodeURIComponent(
        String(roleId)
      )}`
    );

  return response.data;
},

async updateRole(
  roleId: number | string,
  data: UpdateRoleData
): Promise<{ ok: boolean }> {
  const response =
    await api.put<{ ok: boolean }>(
      `${ROLES_URL}/${encodeURIComponent(
        String(roleId)
      )}`,
      data
    );

  return response.data;
},
async assignRole(
  userId: number | string,
  roleId: number | string
): Promise<UserResponse> {
  const response =
    await api.patch<UserResponse>(
      `${USERS_URL}/${encodeURIComponent(
        String(userId)
      )}`,
      {
        role: roleId,
      },
      {
        params: {
          populate:
            'role,avatar,restaurant',
        },
      }
    );

  return response.data;
},


  // ===================================================
  // ADMIN - ELIMINAR USUARIO
  // ===================================================

  async remove(
    id: number | string
  ): Promise<void> {
    await api.delete(
      `${USERS_URL}/${id}`
    );
  },
async uploadUserAvatar(
  userId: number | string,
  imageUri: string,
  fileName = 'avatar.jpg',
  mimeType = 'image/jpeg'
): Promise<AdminAvatarResponse> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const imageResponse =
      await fetch(imageUri);

    const blob =
      await imageResponse.blob();

    formData.append(
      'avatar',
      blob,
      fileName
    );
  } else {
    formData.append(
      'avatar',
      {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any
    );
  }

  const response =
    await api.patch<AdminAvatarResponse>(
      `${USERS_ADMIN_EXTENSION_URL}/${encodeURIComponent(
        String(userId)
      )}/avatar`,
      formData
    );

  return response.data;
},

async removeUserAvatar(
  userId: number | string
): Promise<AdminAvatarResponse> {
  const response =
    await api.delete<AdminAvatarResponse>(
      `${USERS_ADMIN_EXTENSION_URL}/${encodeURIComponent(
        String(userId)
      )}/avatar`
    );

  return response.data;
},
async resetUserPassword(
  userId: number | string,
  data: AdminResetPasswordData
): Promise<AdminResetPasswordResponse> {
  const response =
    await api.post<AdminResetPasswordResponse>(
      `${ADMIN_PASSWORD_URL}/${encodeURIComponent(
        String(userId)
      )}/password`,
      data
    );

  return response.data;
},

  // ===================================================
  // GET /api/users/me
  // ===================================================

  async getMe(): Promise<AppUser> {
    const response =
      await api.get<AppUser>(
        USERS_ME_URL
      );

    return response.data;
  },

  // ===================================================
  // PATCH
  // /api/users-permissions/users/me/profile
  // ===================================================

  async updateMyProfile(
    data: UpdateMyProfileData
  ): Promise<AppUser> {
    const response =
      await api.patch<AppUser>(
        `${USERS_ME_EXTENSION_URL}/profile`,
        data
      );

    return response.data;
  },

  // ===================================================
  // GET
  // /api/users-permissions/users/me/avatar
  // ===================================================

  async getMyAvatar(): Promise<MyAvatarResponse> {
    const response =
      await api.get<MyAvatarResponse>(
        `${USERS_ME_EXTENSION_URL}/avatar`
      );

    return response.data;
  },

  // ===================================================
  // PUT
  // /api/users-permissions/users/me/avatar
  // ===================================================

  async uploadMyAvatar(
  imageUri: string,
  fileName = 'avatar.jpg',
  mimeType = 'image/jpeg'
): Promise<MyAvatarResponse> {
  const formData =
    new FormData();

  if (Platform.OS === 'web') {
    const imageResponse =
      await fetch(imageUri);

    const blob =
      await imageResponse.blob();

    formData.append(
      'avatar',
      blob,
      fileName
    );
  } else {
    formData.append(
      'avatar',
      {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any
    );
  }

  const response =
    await api.put<MyAvatarResponse>(
      `${USERS_ME_EXTENSION_URL}/avatar`,
      formData
    );

  return response.data;
},

  // ===================================================
  // DELETE
  // /api/users-permissions/users/me/avatar
  // ===================================================

  async removeMyAvatar(): Promise<RemoveMyAvatarResponse> {
    const response =
      await api.delete<RemoveMyAvatarResponse>(
        `${USERS_ME_EXTENSION_URL}/avatar`
      );

    return response.data;
  },

  // ===================================================
  // POST /api/auth/change-password
  // ===================================================

  async changePassword(
    data: ChangePasswordData
  ): Promise<ChangePasswordResponse> {
    const response =
      await api.post<ChangePasswordResponse>(
        CHANGE_PASSWORD_URL,
        {
          currentPassword:
            data.currentPassword,

          password:
            data.newPassword,

          passwordConfirmation:
            data.confirmPassword,
        }
      );
///admin

    /*
     * Strapi devuelve un JWT NUEVO después
     * de cambiar la contraseña.
     *
     * Por eso debemos reemplazar el JWT
     * almacenado.
     */

    const storedUser =
      await authStorage.getUser();

    /*
     * La respuesta de change-password
     * no nos devolvió role/avatar/restaurant
     * durante la prueba.
     *
     * Conservamos esos datos de la sesión
     * anterior.
     */

    const sessionUser: AppUser =
      {
        ...(storedUser ??
          response.data.user),

        ...response.data.user,

        role:
          response.data.user
            .role ??
          storedUser?.role ??
          null,

        avatar:
          response.data.user
            .avatar ??
          storedUser?.avatar ??
          null,

        restaurant:
          response.data.user
            .restaurant ??
          storedUser?.restaurant ??
          null,
      };

    await authStorage.saveSession(
      response.data.jwt,
      sessionUser
    );

    return {
      ...response.data,

      user:
        sessionUser,
    };
  },
};