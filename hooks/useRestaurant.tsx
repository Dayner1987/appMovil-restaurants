// hooks/useRestaurant.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import {
  restaurantService,
} from '@/services/restaurant.service';

import type {
  CreateRestaurantData,
  Restaurant,
  RestaurantPagination,
  RestaurantQueryParams,
  UpdateRestaurantData,
} from '@/types/restaurant.types';

import type {
  AppUser,
} from '@/types/user.types';

interface UseRestaurantOptions {
  documentId?: string;

  autoLoad?: boolean;

  query?:
    RestaurantQueryParams;
}

export interface RestaurantMediaUpload {
  uri: string;

  fileName?: string;

  mimeType?: string;
}

type RestaurantChange =
  | {
      type:
        'saved';

      restaurant:
        Restaurant;
    }
  | {
      type:
        'deleted';

      documentId:
        string;
    };

const listeners =
  new Set<
    (
      change:
        RestaurantChange
    ) => void
  >();

function notifyChange(
  change:
    RestaurantChange
) {
  listeners.forEach(
    (listener) =>
      listener(change)
  );
}

function getErrorMessage(
  error: unknown
): string {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const message =
      error.response?.data
        ?.error?.message;

    return typeof message ===
      'string'
      ? message
      : 'No se pudo completar la operación del restaurante.';
  }

  return error instanceof Error
    ? error.message
    : 'Ocurrió un error inesperado.';
}

// =====================================================
// SLUG
// =====================================================

export function createRestaurantSlug(
  name: string
): string {
  return name
    .normalize(
      'NFD'
    )
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-|-$/g,
      ''
    );
}

// =====================================================
// PREPARE UPDATE
// =====================================================

function prepareData<
  T extends UpdateRestaurantData,
>(
  data: T
): T {
  const result = {
    ...data,
  };

  if (
    result.name !==
    undefined
  ) {
    result.name =
      result.name.trim();

    if (!result.name) {
      throw new Error(
        'Escribe el nombre del restaurante.'
      );
    }

    if (
      result.slug ===
      undefined
    ) {
      result.slug =
        createRestaurantSlug(
          result.name
        );
    }
  }

  if (
    typeof result.slug ===
    'string'
  ) {
    result.slug =
      result.slug.trim();
  }

  if (
    typeof result.description ===
    'string'
  ) {
    result.description =
      result.description
        .trim() ||
      null;
  }

  if (
    typeof result.email ===
    'string'
  ) {
    result.email =
      result.email
        .trim()
        .toLowerCase();
  }

  if (
    typeof result.address ===
    'string'
  ) {
    result.address =
      result.address
        .trim() ||
      null;
  }

  if (
    typeof result.phone ===
    'string'
  ) {
    result.phone =
      result.phone
        .trim() ||
      null;
  }

  if (
    typeof result.nit ===
    'string'
  ) {
    result.nit =
      result.nit
        .trim() ||
      null;
  }

  return result;
}

export function useRestaurant(
  options:
    UseRestaurantOptions = {}
) {
  const {
    documentId,
    autoLoad = true,
    query,
  } = options;

  const [
    restaurant,
    setRestaurant,
  ] =
    useState<Restaurant | null>(
      null
    );

  const [
    restaurants,
    setRestaurants,
  ] =
    useState<Restaurant[]>(
      []
    );

  const [
    pagination,
    setPagination,
  ] =
    useState<RestaurantPagination | null>(
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
    useRef(false);

  const requestRef =
    useRef(0);

  const mutationRef =
    useRef(false);

  const hasLoadedRef =
    useRef(false);

  // ===================================================
  // QUERY
  // ===================================================

  const queryKey =
    JSON.stringify({
      page:
        query?.page ??
        1,

      pageSize:
        query?.pageSize ??
        25,

      sort:
        query?.sort,

      statusRes:
        query?.statusRes,

      name:
        query?.name
          ?.trim() ||
        undefined,

      email:
        query?.email
          ?.trim() ||
        undefined,
    });

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;

      requestRef.current +=
        1;
    };
  }, []);

  // ===================================================
  // REFRESH
  // ===================================================

  const refresh =
    useCallback(
      async () => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        const requestId =
          ++requestRef.current;

        hasLoadedRef.current =
          true;

        setLoading(true);
        setError(null);

        try {
          if (
            documentId
          ) {
            const response =
              await restaurantService.findOne(
                documentId
              );

            if (
              mountedRef.current &&
              requestId ===
                requestRef.current
            ) {
              setRestaurant(
                response.data
              );
            }

            return;
          }

          const params:
            RestaurantQueryParams =
            JSON.parse(
              queryKey
            );

          const response =
            await restaurantService.findAll(
              params
            );

          if (
            mountedRef.current &&
            requestId ===
              requestRef.current
          ) {
            setRestaurants(
              response.data
            );

            setPagination(
              response.meta
                .pagination
            );
          }
        } catch (
          requestError
        ) {
          if (
            mountedRef.current &&
            requestId ===
              requestRef.current
          ) {
            setError(
              getErrorMessage(
                requestError
              )
            );
          }
        } finally {
          if (
            mountedRef.current &&
            requestId ===
              requestRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        documentId,
        queryKey,
      ]
    );

  useEffect(() => {
    hasLoadedRef.current =
      false;

    setRestaurant(null);
    setRestaurants([]);
    setPagination(null);
    setError(null);

    if (autoLoad) {
      void refresh();
    }

    return () => {
      requestRef.current +=
        1;
    };
  }, [
    autoLoad,
    refresh,
  ]);

  // ===================================================
  // SINCRONIZAR CAMBIOS
  // ===================================================

  useEffect(() => {
    const onChange = (
      change:
        RestaurantChange
    ) => {
      if (
        !mountedRef.current
      ) {
        return;
      }

      if (
        documentId
      ) {
        const changedId =
          change.type ===
          'saved'
            ? change.restaurant
                .documentId
            : change.documentId;

        if (
          changedId !==
          documentId
        ) {
          return;
        }

        requestRef.current +=
          1;

        setLoading(false);

        setRestaurant(
          change.type ===
            'saved'
            ? change.restaurant
            : null
        );

        return;
      }

      if (
        autoLoad ||
        hasLoadedRef.current
      ) {
        void refresh();
      }
    };

    listeners.add(
      onChange
    );

    return () => {
      listeners.delete(
        onChange
      );
    };
  }, [
    documentId,
    autoLoad,
    refresh,
  ]);

  // ===================================================
  // MUTATION
  // ===================================================

  const runMutation =
    useCallback(
      async <T,>(
        operation:
          () => Promise<T>
      ): Promise<T> => {
        if (
          mutationRef.current
        ) {
          throw new Error(
            'Espera a que termine la operación actual.'
          );
        }

        mutationRef.current =
          true;

        if (
          mountedRef.current
        ) {
          setSaving(true);
          setError(null);
        }

        try {
          return await operation();
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              getErrorMessage(
                requestError
              )
            );
          }

          throw requestError;
        } finally {
          mutationRef.current =
            false;

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
  // RESTAURANTES DE UN USUARIO
  // ===================================================

  const getMyRestaurants =
    useCallback(
      (
        user:
          AppUser
      ) => {
        return restaurants.filter(
          (
            item
          ) =>
            item.users?.some(
              (
                restaurantUser
              ) =>
                restaurantUser.id ===
                user.id
            )
        );
      },
      [
        restaurants,
      ]
    );

  const canCreateRestaurant =
    useCallback(
      (
        user:
          AppUser
      ) =>
        getMyRestaurants(
          user
        ).length <
        3,
      [
        getMyRestaurants,
      ]
    );

  // ===================================================
  // CREATE
  // ===================================================

  const createRestaurant =
    useCallback(
      (
        data:
          CreateRestaurantData,

        user?:
          AppUser
      ): Promise<Restaurant> =>
        runMutation(
          async () => {
            if (
              user &&
              !canCreateRestaurant(
                user
              )
            ) {
              throw new Error(
                'Solo puedes registrar hasta 3 restaurantes.'
              );
            }

            const payload =
              prepareData({
                ...data,

                name:
                  data.name.trim(),

                slug:
                  data.slug
                    ?.trim() ||
                  createRestaurantSlug(
                    data.name
                  ),

                statusRes:
                  data.statusRes ??
                  'PENDING',

                users:
                  user
                    ? [
                        user.id,
                      ]
                    : data.users,
              });

            const response =
              await restaurantService.create(
                payload
              );

            notifyChange({
              type:
                'saved',

              restaurant:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
        canCreateRestaurant,
      ]
    );

  // ===================================================
  // UPDATE - PATCH
  // ===================================================

  const updateRestaurant =
    useCallback(
      (
        id: string,

        data:
          UpdateRestaurantData
      ): Promise<Restaurant> =>
        runMutation(
          async () => {
            const response =
              await restaurantService.patch(
                id,
                prepareData(
                  data
                )
              );

            notifyChange({
              type:
                'saved',

              restaurant:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // LOGO CREATE
  // ===================================================

  const createLogo =
    useCallback(
      (
        id: string,

        image:
          RestaurantMediaUpload
      ): Promise<Restaurant> =>
        runMutation(
          async () => {
            const response =
              await restaurantService.createLogo(
                id,
                image.uri,
                image.fileName ??
                  'restaurant-logo.jpg',
                image.mimeType ??
                  'image/jpeg'
              );

            notifyChange({
              type:
                'saved',

              restaurant:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // LOGO UPDATE
  // ===================================================

  const updateLogo =
    useCallback(
      (
        id: string,

        image:
          RestaurantMediaUpload
      ): Promise<Restaurant> =>
        runMutation(
          async () => {
            const response =
              await restaurantService.updateLogo(
                id,
                image.uri,
                image.fileName ??
                  'restaurant-logo.jpg',
                image.mimeType ??
                  'image/jpeg'
              );

            notifyChange({
              type:
                'saved',

              restaurant:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // LOGO DELETE
  // ===================================================

  const deleteLogo =
    useCallback(
      (
        id: string
      ): Promise<Restaurant> =>
        runMutation(
          async () => {
            const response =
              await restaurantService.deleteLogo(
                id
              );

            notifyChange({
              type:
                'saved',

              restaurant:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // QR CREATE
  // ===================================================

  const createQRImage =
    useCallback(
      (
        id: string,

        image:
          RestaurantMediaUpload
      ): Promise<Restaurant> =>
        runMutation(
          async () => {
            const response =
              await restaurantService.createQRImage(
                id,
                image.uri,
                image.fileName ??
                  'restaurant-qr.png',
                image.mimeType ??
                  'image/png'
              );

            notifyChange({
              type:
                'saved',

              restaurant:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // QR UPDATE
  // ===================================================

  const updateQRImage =
    useCallback(
      (
        id: string,

        image:
          RestaurantMediaUpload
      ): Promise<Restaurant> =>
        runMutation(
          async () => {
            const response =
              await restaurantService.updateQRImage(
                id,
                image.uri,
                image.fileName ??
                  'restaurant-qr.png',
                image.mimeType ??
                  'image/png'
              );

            notifyChange({
              type:
                'saved',

              restaurant:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // QR DELETE
  // ===================================================

  const deleteQRImage =
    useCallback(
      (
        id: string
      ): Promise<Restaurant> =>
        runMutation(
          async () => {
            const response =
              await restaurantService.deleteQRImage(
                id
              );

            notifyChange({
              type:
                'saved',

              restaurant:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // DELETE RESTAURANT
  // ===================================================

  const deleteRestaurant =
    useCallback(
      (
        id: string
      ): Promise<void> =>
        runMutation(
          async () => {
            await restaurantService.remove(
              id
            );

            notifyChange({
              type:
                'deleted',

              documentId:
                id,
            });
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // HELPERS
  // ===================================================

  const getRestaurantProducts =
    useCallback(
      () =>
        restaurant
          ?.products ??
        [],
      [
        restaurant,
      ]
    );

  const getRestaurantOrders =
    useCallback(
      () =>
        restaurant
          ?.orders ??
        [],
      [
        restaurant,
      ]
    );

  const getRestaurantCategories =
    useCallback(
      () =>
        restaurant
          ?.categories ??
        [],
      [
        restaurant,
      ]
    );

  const clearError =
    useCallback(
      () =>
        setError(
          null
        ),
      []
    );

  return {
    restaurant,
    restaurants,
    pagination,

    loading,
    saving,
    error,

    refresh,

    createRestaurant,
    updateRestaurant,
    deleteRestaurant,

    createLogo,
    updateLogo,
    deleteLogo,

    createQRImage,
    updateQRImage,
    deleteQRImage,

    getMyRestaurants,
    canCreateRestaurant,

    getRestaurantProducts,
    getRestaurantCategories,
    getRestaurantOrders,

    clearError,

    createSlug:
      createRestaurantSlug,
  };
}