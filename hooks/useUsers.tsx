// hooks/useUser.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  userService,
} from '@/services/user.service';

import type {
  AppUser,
  ChangePasswordData,
  ChangePasswordResponse,
  UpdateMyProfileData,
  UpdateUserData,
  UserImage,
  UserQueryParams,
} from '@/types/user.types';

interface UseUserOptions {
  userId?: number | string;

  autoLoad?: boolean;

  query?: UserQueryParams;
}

export function useUser(
  options: UseUserOptions = {}
) {
  const {
    userId,
    autoLoad = true,
    query,
  } = options;

  const [
    user,
    setUser,
  ] =
    useState<AppUser | null>(
      null
    );

  const [
    users,
    setUsers,
  ] =
    useState<AppUser[]>([]);

  const [
    avatar,
    setAvatar,
  ] =
    useState<UserImage | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const mountedRef =
    useRef(true);

  // ===================================================
  // MOUNT
  // ===================================================

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  // ===================================================
  // CARGAR MI USUARIO
  // ===================================================

  const loadMe =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const currentUser =
          await userService.getMe();

        if (
          mountedRef.current
        ) {
          setUser(
            currentUser
          );

          setAvatar(
            currentUser.avatar ??
              null
          );
        }

        return currentUser;
      } catch (
        requestError
      ) {
        if (
          mountedRef.current
        ) {
          setError(
            'No se pudo cargar el usuario'
          );
        }

        throw requestError;
      } finally {
        if (
          mountedRef.current
        ) {
          setLoading(false);
        }
      }
    }, []);

  // ===================================================
  // CARGAR AVATAR
  // ===================================================

  const loadMyAvatar =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await userService.getMyAvatar();

        if (
          mountedRef.current
        ) {
          setAvatar(
            response.avatar
          );

          setUser(
            (
              currentUser
            ) =>
              currentUser
                ? {
                    ...currentUser,

                    avatar:
                      response.avatar,
                  }
                : currentUser
          );
        }

        return response.avatar;
      } catch (
        requestError
      ) {
        if (
          mountedRef.current
        ) {
          setError(
            'No se pudo cargar el avatar'
          );
        }

        throw requestError;
      } finally {
        if (
          mountedRef.current
        ) {
          setLoading(false);
        }
      }
    }, []);

  // ===================================================
  // CARGAR UN USUARIO
  // ===================================================

  const loadUser =
    useCallback(
      async (
        id:
          | number
          | string
      ) => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await userService.findOne(
              id
            );

          const loadedUser =
            response.data;

          if (
            mountedRef.current
          ) {
            setUser(
              loadedUser
            );

            setAvatar(
              loadedUser.avatar ??
                null
            );
          }

          return loadedUser;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo cargar el usuario'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // CARGAR USUARIOS
  // ===================================================

  const loadUsers =
    useCallback(
      async (
        params:
          UserQueryParams = {}
      ) => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await userService.findAll(
              params
            );

          if (
            mountedRef.current
          ) {
            setUsers(
              response.data
            );
          }

          return response;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudieron cargar los usuarios'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // ACTUALIZAR MI PERFIL
  // ===================================================

  const updateMyProfile =
    useCallback(
      async (
        data:
          UpdateMyProfileData
      ) => {
        setSaving(true);
        setError(null);

        try {
          const updatedUser =
            await userService.updateMyProfile(
              data
            );

          if (
            mountedRef.current
          ) {
            setUser(
              updatedUser
            );

            setAvatar(
              updatedUser.avatar ??
                null
            );
          }

          return updatedUser;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo actualizar el perfil'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(false);
          }
        }
      },
      []
    );

  // ===================================================
  // ACTUALIZAR AVATAR
  // ===================================================

  const uploadMyAvatar =
    useCallback(
      async (
        imageUri: string,

        fileName =
          'avatar.jpg',

        mimeType =
          'image/jpeg'
      ) => {
        setSaving(true);
        setError(null);

        try {
          const response =
            await userService.uploadMyAvatar(
              imageUri,
              fileName,
              mimeType
            );

          if (
            mountedRef.current
          ) {
            setAvatar(
              response.avatar
            );

            setUser(
              (
                currentUser
              ) =>
                currentUser
                  ? {
                      ...currentUser,

                      avatar:
                        response.avatar,
                    }
                  : currentUser
            );
          }

          return response.avatar;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo actualizar el avatar'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(false);
          }
        }
      },
      []
    );

  // ===================================================
  // ELIMINAR AVATAR
  // ===================================================

  const removeMyAvatar =
    useCallback(async () => {
      setSaving(true);
      setError(null);

      try {
        const response =
          await userService.removeMyAvatar();

        if (
          mountedRef.current
        ) {
          setAvatar(null);

          setUser(
            (
              currentUser
            ) =>
              currentUser
                ? {
                    ...currentUser,

                    avatar: null,
                  }
                : currentUser
          );
        }

        return response;
      } catch (
        requestError
      ) {
        if (
          mountedRef.current
        ) {
          setError(
            'No se pudo eliminar el avatar'
          );
        }

        throw requestError;
      } finally {
        if (
          mountedRef.current
        ) {
          setSaving(false);
        }
      }
    }, []);

  // ===================================================
  // ADMIN - ACTUALIZAR USUARIO
  // ===================================================

  const updateUser =
    useCallback(
      async (
        id:
          | number
          | string,

        data:
          UpdateUserData
      ) => {
        setSaving(true);
        setError(null);

        try {
          const response =
            await userService.update(
              id,
              data
            );

          const updatedUser =
            response.data;

          if (
            mountedRef.current
          ) {
            setUsers(
              (
                currentUsers
              ) =>
                currentUsers.map(
                  (
                    item
                  ) =>
                    item.id ===
                    updatedUser.id
                      ? updatedUser
                      : item
                )
            );

            if (
              user?.id ===
              updatedUser.id
            ) {
              setUser(
                updatedUser
              );

              setAvatar(
                updatedUser.avatar ??
                  null
              );
            }
          }

          return updatedUser;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo actualizar el usuario'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(false);
          }
        }
      },
      [
        user?.id,
      ]
    );

  // ===================================================
  // ADMIN - ELIMINAR USUARIO
  // ===================================================

  const deleteUser =
    useCallback(
      async (
        id:
          | number
          | string
      ) => {
        setSaving(true);
        setError(null);

        try {
          await userService.remove(
            id
          );

          if (
            mountedRef.current
          ) {
            setUsers(
              (
                currentUsers
              ) =>
                currentUsers.filter(
                  (
                    item
                  ) =>
                    item.id !==
                    id
                )
            );

            if (
              user?.id ===
              id
            ) {
              setUser(
                null
              );

              setAvatar(
                null
              );
            }
          }
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo eliminar el usuario'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(false);
          }
        }
      },
      [
        user?.id,
      ]
    );

  // ===================================================
  // CAMBIAR PASSWORD
  // ===================================================

  const changePassword =
    useCallback(
      async (
        data:
          ChangePasswordData
      ): Promise<ChangePasswordResponse> => {
        setSaving(true);
        setError(null);

        try {
          const response =
            await userService.changePassword(
              data
            );

          if (
            mountedRef.current
          ) {
            setUser(
              response.user
            );

            setAvatar(
              response.user
                .avatar ??
                null
            );
          }

          return response;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo cambiar la contraseña'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(false);
          }
        }
      },
      []
    );

  // ===================================================
  // AUTO LOAD
  // ===================================================

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (
      userId !==
      undefined
    ) {
      void loadUser(
        userId
      ).catch(
        () =>
          undefined
      );

      return;
    }

    if (query) {
      void loadUsers(
        query
      ).catch(
        () =>
          undefined
      );

      return;
    }

    void loadMe().catch(
      () => undefined
    );
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

  // ===================================================
  // RETURN
  // ===================================================

  return {
    user,
    users,
    avatar,

    loading,
    saving,
    error,

    loadMe,
    loadUser,
    loadUsers,
    loadMyAvatar,

    updateMyProfile,

    uploadMyAvatar,
    removeMyAvatar,

    updateUser,
    deleteUser,

    changePassword,

    refresh:
      userId !==
      undefined
        ? () =>
            loadUser(
              userId
            )
        : query
          ? () =>
              loadUsers(
                query
              )
          : loadMe,
  };
}