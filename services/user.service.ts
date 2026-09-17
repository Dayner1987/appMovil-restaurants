import { api } from './api';

import type {
  AppUser,
  ChangePasswordData,
  UpdateMyProfileData,
  UpdateUserData,
  UserListResponse,
  UserQueryParams,
  UserResponse,
} from '@/types/user.types';

const USERS_URL = '/api/users';
const USERS_ME_URL = '/api/users/me';

export const userService = {
  async findAll(
    params: UserQueryParams = {}
  ): Promise<UserListResponse> {
    const response = await api.get<UserListResponse>(
      USERS_URL,
      {
        params: {
          populate: 'role,avatar,restaurant,orders,restaurant_application',
          'pagination[page]': params.page ?? 1,
          'pagination[pageSize]': params.pageSize ?? 25,
          sort: params.sort,
          'filters[username][$containsi]': params.username,
          'filters[email][$containsi]': params.email,
          'filters[blocked][$eq]': params.blocked,
          'filters[confirmed][$eq]': params.confirmed,
          'filters[role][id][$eq]': params.roleId,
          'filters[restaurant][id][$eq]': params.restaurantId,
        },
      }
    );

    return response.data;
  },

  async findOne(
    id: number | string
  ): Promise<UserResponse> {
    const response = await api.get<UserResponse>(
      `${USERS_URL}/${id}`,
      {
        params: {
          populate: 'role,avatar,restaurant,orders,restaurant_application',
        },
      }
    );

    return response.data;
  },

  async update(
    id: number | string,
    data: UpdateUserData
  ): Promise<UserResponse> {
    const response = await api.put<UserResponse>(
      `${USERS_URL}/${id}`,
      data,
      {
        params: {
          populate: 'role,avatar,restaurant',
        },
      }
    );

    return response.data;
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`${USERS_URL}/${id}`);
  },

  async getMe(): Promise<AppUser> {
    const response = await api.get<AppUser>(
      USERS_ME_URL,
      {
        params: {
          populate: 'role,avatar,restaurant',
        },
      }
    );

    return response.data;
  },

  async updateMyProfile(
    data: UpdateMyProfileData
  ): Promise<AppUser> {
    const response = await api.patch<AppUser>(
      `${USERS_ME_URL}/profile`,
      data
    );

    return response.data;
  },

  async uploadMyAvatar(
    imageUri: string,
    fileName = 'avatar.jpg',
    mimeType = 'image/jpeg'
  ): Promise<AppUser> {
    const formData = new FormData();

    formData.append('avatar', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    const response = await api.post<AppUser>(
      `${USERS_ME_URL}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  async changePassword(
    data: ChangePasswordData
  ): Promise<void> {
    await api.post(
      `${USERS_ME_URL}/password`,
      data
    );
  },
};