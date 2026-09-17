import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { userService } from '@/services/user.service';

import type {
  AppUser,
  ChangePasswordData,
  UpdateMyProfileData,
  UpdateUserData,
  UserQueryParams,
} from '@/types/user.types';

interface UseUserOptions {
  userId?: number | string;
  autoLoad?: boolean;
  query?: UserQueryParams;
}

export function useUser(options: UseUserOptions = {}) {
  const {
    userId,
    autoLoad = true,
    query,
  } = options;

  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadMe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = await userService.getMe();

      if (mountedRef.current) {
        setUser(currentUser);
      }

      return currentUser;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo cargar el usuario');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadUser = useCallback(async (
    id: number | string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.findOne(id);

      if (mountedRef.current) {
        setUser(response.data);
      }

      return response.data;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo cargar el usuario');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadUsers = useCallback(async (
    params: UserQueryParams = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.findAll(params);

      if (mountedRef.current) {
        setUsers(response.data);
      }

      return response;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudieron cargar los usuarios');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const updateMyProfile = useCallback(async (
    data: UpdateMyProfileData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const updatedUser = await userService.updateMyProfile(data);

      if (mountedRef.current) {
        setUser(updatedUser);
      }

      return updatedUser;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar el perfil');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const uploadMyAvatar = useCallback(async (
    imageUri: string,
    fileName = 'avatar.jpg',
    mimeType = 'image/jpeg'
  ) => {
    setSaving(true);
    setError(null);

    try {
      const updatedUser = await userService.uploadMyAvatar(
        imageUri,
        fileName,
        mimeType
      );

      if (mountedRef.current) {
        setUser(updatedUser);
      }

      return updatedUser;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar el avatar');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const updateUser = useCallback(async (
    id: number | string,
    data: UpdateUserData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response = await userService.update(id, data);
      const updatedUser = response.data;

      if (mountedRef.current) {
        setUsers((currentUsers) =>
          currentUsers.map((item) =>
            item.id === updatedUser.id
              ? updatedUser
              : item
          )
        );

        if (user?.id === updatedUser.id) {
          setUser(updatedUser);
        }
      }

      return updatedUser;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar el usuario');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [user?.id]);

  const deleteUser = useCallback(async (
    id: number | string
  ) => {
    setSaving(true);
    setError(null);

    try {
      await userService.remove(id);

      if (mountedRef.current) {
        setUsers((currentUsers) =>
          currentUsers.filter((item) => item.id !== id)
        );

        if (user?.id === id) {
          setUser(null);
        }
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo eliminar el usuario');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [user?.id]);

  const changePassword = useCallback(async (
    data: ChangePasswordData
  ) => {
    setSaving(true);
    setError(null);

    try {
      await userService.changePassword(data);
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo cambiar la contraseña');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (userId !== undefined) {
      void loadUser(userId);
      return;
    }

    if (query) {
      void loadUsers(query);
      return;
    }

    void loadMe();
  }, [
    autoLoad,
    userId,
    query?.page,
    query?.pageSize,
    query?.sort,
    query?.username,
    query?.email,
    query?.blocked,
    query?.confirmed,
    query?.roleId,
    query?.restaurantId,
    loadMe,
    loadUser,
    loadUsers,
  ]);

  return {
    user,
    users,
    loading,
    saving,
    error,
    loadMe,
    loadUser,
    loadUsers,
    updateMyProfile,
    uploadMyAvatar,
    updateUser,
    deleteUser,
    changePassword,
    refresh: userId
      ? () => loadUser(userId)
      : query
        ? () => loadUsers(query)
        : loadMe,
  };
}