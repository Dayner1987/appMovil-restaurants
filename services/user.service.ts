// services/user.service.ts

import {
  Platform,
} from 'react-native';

import { api } from './api';

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

const USERS_URL =
  '/api/users';

const USERS_ME_URL =
  '/api/users/me';

// =====================================================
// RUTAS QUE AGREGAMOS NOSOTROS AL PLUGIN
// =====================================================

const USERS_ME_EXTENSION_URL =
  '/api/users-permissions/users/me';

// =====================================================
// PASSWORD NATIVO DE STRAPI
// =====================================================

const CHANGE_PASSWORD_URL =
  '/api/auth/change-password';

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
  ): Promise<UserResponse> {
    const response =
      await api.get<UserResponse>(
        `${USERS_URL}/${id}`,
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
  ): Promise<UserResponse> {
    const response =
      await api.put<UserResponse>(
        `${USERS_URL}/${id}`,
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