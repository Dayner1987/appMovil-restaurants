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
      type: 'saved';

      restaurant:
        Restaurant;
    }
  | {
      type: 'deleted';

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
function notifyChange(change: RestaurantChange) {
  if (
    change.type === 'saved' &&
    !change.restaurant?.documentId
  ) {
    console.warn(
      '[Restaurant] No se notificó un restaurante sin documentId.',
      change.restaurant
    );
    return;
  }

  listeners.forEach((listener) => {
    try {
      listener(change);
    } catch (error) {
      console.error(
        '[Restaurant] Error sincronizando cambios:',
        error
      );
    }
  });
}

// Normaliza respuestas de Strapi y del servicio Axios.
function extractRestaurant(
  response: unknown,
  fallbackDocumentId?: string
): Restaurant | null {
  const root = response as any;

  const candidates = [
    root?.data?.data,
    root?.data?.restaurant,
    root?.data,
    root?.restaurant,
    root,
  ];

  for (const candidate of candidates) {
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      Array.isArray(candidate)
    ) {
      continue;
    }

    const attributes =
      candidate.attributes &&
      typeof candidate.attributes === 'object'
        ? candidate.attributes
        : {};

    const documentId =
      candidate.documentId ??
      attributes.documentId ??
      fallbackDocumentId;

    const hasRestaurantData =
      candidate.id !== undefined ||
      attributes.id !== undefined ||
      typeof candidate.name === 'string' ||
      typeof attributes.name === 'string';

    if (
      !hasRestaurantData ||
      typeof documentId !== 'string' ||
      !documentId.trim()
    ) {
      continue;
    }

    return {
      ...attributes,
      ...candidate,
      id: candidate.id ?? attributes.id,
      documentId,
    } as Restaurant;
  }

  return null;
}

// Recupera el restaurante actualizado después de una operación.
async function saveRestaurantResponse(
  response: unknown,
  documentId?: string
): Promise<Restaurant> {
  let savedRestaurant = extractRestaurant(
    response,
    documentId
  );

  // Si el endpoint no devuelve el restaurante completo,
  // se consulta nuevamente a Strapi.
  if (!savedRestaurant && documentId) {
    const freshResponse =
      await restaurantService.findOne(documentId);

    savedRestaurant = extractRestaurant(
      freshResponse,
      documentId
    );
  }

  if (!savedRestaurant) {
    throw new Error(
      'No se pudo recuperar la información actualizada del restaurante.'
    );
  }

  notifyChange({
    type: 'saved',
    restaurant: savedRestaurant,
  });

  return savedRestaurant;
}
function getErrorMessage(
  error: unknown
): string {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const data =
      error.response?.data as
        | {
            error?: {
              message?: string;
            };
          }
        | undefined;

    return (
      data?.error
        ?.message ??
      'No se pudo completar la operación del restaurante.'
    );
  }

  return error instanceof
    Error
    ? error.message
    : 'Ocurrió un error inesperado.';
}

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
      /^-+|-+$/g,
      ''
    );
}

function prepareData<
  T extends
    UpdateRestaurantData,
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

    if (
      !result.name
    ) {
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
    useState<
      string | null
    >(null);

  const mountedRef =
    useRef(false);

  const requestRef =
    useRef(0);

  const mutationRef =
    useRef(false);

  const hasLoadedRef =
    useRef(false);

  // =====================================================
  // QUERY
  // =====================================================

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

      userId:
        query?.userId,

      userDocumentId:
        query?.userDocumentId
          ?.trim() ||
        undefined,
    });

  // =====================================================
  // MOUNT
  // =====================================================

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

  // =====================================================
  // REFRESH
  // =====================================================

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

        setLoading(
          true
        );

        setError(
          null
        );

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
              const currentRestaurant = extractRestaurant(
  response,
  documentId
);

if (!currentRestaurant) {
  throw new Error(
    'No se pudo recuperar la información del restaurante.'
  );
}

setRestaurant(currentRestaurant);
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

            // Si estamos buscando el restaurante
            // de un usuario, usamos el primero
            // encontrado como restaurante actual.
            if (
              params.userId !==
                undefined ||
              params.userDocumentId
            ) {
              setRestaurant(
                response.data[0] ??
                null
              );
            }
          }

          return response;
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

          throw requestError;
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

  // =====================================================
  // AUTO LOAD
  // =====================================================

  useEffect(() => {
    hasLoadedRef.current =
      false;

    setRestaurant(
      null
    );

    setRestaurants(
      []
    );

    setPagination(
      null
    );

    setError(
      null
    );

    if (
      autoLoad
    ) {
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

  // =====================================================
  // SYNC
  // =====================================================
useEffect(() => {
  const onChange = (change: RestaurantChange) => {
    if (!mountedRef.current) {
      return;
    }

    if (change.type === 'saved') {
      const savedRestaurant = change.restaurant;

      if (
        !savedRestaurant ||
        !savedRestaurant.documentId
      ) {
        console.warn(
          '[Restaurant] Cambio recibido sin restaurante válido.'
        );

        if (documentId) {
          void refresh().catch(() => undefined);
        }

        return;
      }

      if (documentId) {
        if (
          savedRestaurant.documentId !== documentId
        ) {
          return;
        }

        requestRef.current += 1;

        setLoading(false);
        setRestaurant(savedRestaurant);

        return;
      }

      setRestaurants((current) => {
        const exists = current.some(
          (item) =>
            item.documentId === savedRestaurant.documentId
        );

        return exists
          ? current.map((item) =>
              item.documentId === savedRestaurant.documentId
                ? savedRestaurant
                : item
            )
          : [savedRestaurant, ...current];
      });

      setRestaurant((current) =>
        current?.documentId === savedRestaurant.documentId
          ? savedRestaurant
          : current
      );

      return;
    }

    // Eliminación de restaurante.
    if (documentId) {
      if (change.documentId !== documentId) {
        return;
      }

      requestRef.current += 1;

      setLoading(false);
      setRestaurant(null);

      return;
    }

    setRestaurants((current) =>
      current.filter(
        (item) => item.documentId !== change.documentId
      )
    );

    setRestaurant((current) =>
      current?.documentId === change.documentId
        ? null
        : current
    );
  };

  listeners.add(onChange);

  return () => {
    listeners.delete(onChange);
  };
}, [documentId, refresh]);

  // =====================================================
  // MUTATION
  // =====================================================

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
          setSaving(
            true
          );

          setError(
            null
          );
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
            setSaving(
              false
            );
          }
        }
      },
      []
    );

  // =====================================================
  // RESTAURANTS OF USER
  // =====================================================

  const getMyRestaurants =
    useCallback(
      (
        user:
          AppUser
      ) =>
        restaurants.filter(
          (
            item
          ) =>
            item.users?.some(
              (
                restaurantUser
              ) =>
                restaurantUser.id ===
                  user.id ||
                (
                  Boolean(
                    user.documentId
                  ) &&
                  restaurantUser
                    .documentId ===
                    user.documentId
                )
            )
        ),
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
        ).length < 3,
      [
        getMyRestaurants,
      ]
    );

  // =====================================================
  // CREATE
  // =====================================================

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

            return await saveRestaurantResponse(response);
          }
        ),
      [
        runMutation,
        canCreateRestaurant,
      ]
    );

  // =====================================================
  // UPDATE
  // =====================================================

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

            return await saveRestaurantResponse(response, id);
          }
        ),
      [
        runMutation,
      ]
    );

  // =====================================================
  // LOGO
  // =====================================================

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

            return await saveRestaurantResponse(response, id);
          }
        ),
      [
        runMutation,
      ]
    );

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

            return await saveRestaurantResponse(response, id);
          }
        ),
      [
        runMutation,
      ]
    );

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

            return await saveRestaurantResponse(response, id);
          }
        ),
      [
        runMutation,
      ]
    );

  // =====================================================
  // QR
  // =====================================================

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

            return await saveRestaurantResponse(response, id);
          }
        ),
      [
        runMutation,
      ]
    );

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

            return await saveRestaurantResponse(response, id);
          }
        ),
      [
        runMutation,
      ]
    );

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

            return await saveRestaurantResponse(response, id);
          }
        ),
      [
        runMutation,
      ]
    );

  // =====================================================
  // DELETE
  // =====================================================

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

  // =====================================================
  // HELPERS
  // =====================================================

  const getRestaurantProducts =
    useCallback(
      () =>
        restaurant?.products ??
        [],
      [
        restaurant,
      ]
    );

  const getRestaurantOrders =
    useCallback(
      () =>
        restaurant?.orders ??
        [],
      [
        restaurant,
      ]
    );

  const clearError =
    useCallback(() => {
      setError(
        null
      );
    }, []);

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
    getRestaurantOrders,

    clearError,

    createSlug:
      createRestaurantSlug,
  };
}