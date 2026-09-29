// hooks/usePublication.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import {
  publicationService,
} from '@/services/publication.service';

import type {
  CreatePublicationData,
  Publication,
  PublicationImageUpload,
  PublicationPagination,
  PublicationQueryParams,
  UpdatePublicationData,
} from '@/types/publication.types';

// =====================================================
// OPTIONS
// =====================================================

interface UsePublicationOptions {
  documentId?: string;

  restaurantDocumentId?:
    string;

  autoLoad?: boolean;

  query?:
    PublicationQueryParams;
}

// =====================================================
// CHANGE EVENT
// =====================================================

type PublicationChange =
  | {
      type:
        'saved';

      publication:
        Publication;
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
        PublicationChange
    ) => void
  >();

function notifyChange(
  change:
    PublicationChange
) {
  listeners.forEach(
    (
      listener
    ) => {
      listener(
        change
      );
    }
  );
}

// =====================================================
// ERROR
// =====================================================

function getErrorMessage(
  error: unknown
): string {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const data =
      error.response
        ?.data as
        | {
            error?: {
              message?: string;
            };

            message?: string;
          }
        | undefined;

    return (
      data?.error
        ?.message ??
      data?.message ??
      'No se pudo completar la operación de publicaciones.'
    );
  }

  return error instanceof
    Error
    ? error.message
    : 'Ocurrió un error inesperado.';
}

// =====================================================
// PREPARE DATA
// =====================================================

function prepareData<
  T extends
    UpdatePublicationData,
>(
  data: T
): T {
  const result = {
    ...data,
  };

  if (
    result.title !==
    undefined
  ) {
    result.title =
      result.title.trim();

    if (
      !result.title
    ) {
      throw new Error(
        'Escribe el título de la publicación.'
      );
    }
  }

  if (
    result.description !==
    undefined
  ) {
    result.description =
      result.description.trim();

    if (
      !result.description
    ) {
      throw new Error(
        'Escribe la descripción de la publicación.'
      );
    }
  }

  return result;
}

// =====================================================
// HOOK
// =====================================================

export function usePublication(
  options:
    UsePublicationOptions = {}
) {
  const {
    documentId,

    restaurantDocumentId,

    autoLoad = true,

    query,
  } = options;

  const [
    publication,
    setPublication,
  ] =
    useState<Publication | null>(
      null
    );

  const [
    publications,
    setPublications,
  ] =
    useState<Publication[]>(
      []
    );

  const [
    pagination,
    setPagination,
  ] =
    useState<PublicationPagination | null>(
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

  const mutationRef =
    useRef(false);

  const requestRef =
    useRef(0);

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
        query?.sort ??
        'createdAt:desc',

      restaurantDocumentId:
        restaurantDocumentId ??
        query
          ?.restaurantDocumentId,

      featured:
        query?.featured,

      title:
        query?.title
          ?.trim() ||
        undefined,
    });

  // ===================================================
  // MOUNT
  // ===================================================

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
  // SYNC LOCAL
  // ===================================================

  const syncPublication =
    useCallback(
      (
        updated:
          Publication
      ) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        setPublication(
          (
            current
          ) =>
            current
              ?.documentId ===
            updated.documentId
              ? updated
              : current
        );

        setPublications(
          (
            current
          ) =>
            current.map(
              (
                item
              ) =>
                item.documentId ===
                updated.documentId
                  ? updated
                  : item
            )
        );
      },
      []
    );

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

        setLoading(
          true
        );

        setError(
          null
        );

        try {
          // =============================================
          // ONE
          // =============================================

          if (
            documentId
          ) {
            const response =
              await publicationService
                .findOne(
                  documentId
                );

            if (
              mountedRef.current &&
              requestId ===
                requestRef.current
            ) {
              setPublication(
                response.data
              );
            }

            return;
          }

          // =============================================
          // LIST
          // =============================================

          const params =
            JSON.parse(
              queryKey
            ) as PublicationQueryParams;

          const response =
            await publicationService
              .findAll(
                params
              );

          if (
            mountedRef.current &&
            requestId ===
              requestRef.current
          ) {
            setPublications(
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

  // ===================================================
  // AUTO LOAD
  // ===================================================

  useEffect(() => {
    hasLoadedRef.current =
      false;

    setPublication(
      null
    );

    setPublications(
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
      void refresh().catch(
        () => undefined
      );
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
  // GLOBAL SYNC
  // ===================================================

  useEffect(() => {
    const onChange =
      (
        change:
          PublicationChange
      ) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        // =============================================
        // DETAIL SCREEN
        // =============================================

        if (
          documentId
        ) {
          const changedId =
            change.type ===
            'saved'
              ? change
                  .publication
                  .documentId
              : change
                  .documentId;

          if (
            changedId !==
            documentId
          ) {
            return;
          }

          requestRef.current +=
            1;

          setLoading(
            false
          );

          setPublication(
            change.type ===
            'saved'
              ? change.publication
              : null
          );

          return;
        }

        // =============================================
        // LIST SCREEN
        // =============================================

        if (
          autoLoad ||
          hasLoadedRef.current
        ) {
          void refresh().catch(
            () => undefined
          );
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

  // ===================================================
  // CREATE
  // ===================================================

  const createPublication =
    useCallback(
      (
        data:
          CreatePublicationData
      ): Promise<Publication> =>
        runMutation(
          async () => {
            const payload =
              prepareData({
                ...data,

                featured:
                  data.featured ??
                  false,

                restaurant:
                  data.restaurant ??
                  restaurantDocumentId ??
                  null,
              });

            const response =
              await publicationService
                .create(
                  payload
                );

            notifyChange({
              type:
                'saved',

              publication:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
        restaurantDocumentId,
      ]
    );

  // ===================================================
  // UPDATE DATA
  // ===================================================

  const updatePublication =
    useCallback(
      (
        id:
          string,

        data:
          UpdatePublicationData
      ): Promise<Publication> =>
        runMutation(
          async () => {
            const response =
              await publicationService
                .patch(
                  id,
                  prepareData(
                    data
                  )
                );

            syncPublication(
              response.data
            );

            notifyChange({
              type:
                'saved',

              publication:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
        syncPublication,
      ]
    );

  // ===================================================
  // FEATURED
  // ===================================================

  const toggleFeatured =
    useCallback(
      (
        id:
          string,

        featured:
          boolean
      ) =>
        updatePublication(
          id,
          {
            featured,
          }
        ),
      [
        updatePublication,
      ]
    );

  // ===================================================
  // CREATE IMAGE
  //
  // POST
  // ===================================================

  const createImage =
    useCallback(
      (
        id:
          string,

        image:
          PublicationImageUpload
      ): Promise<Publication> =>
        runMutation(
          async () => {
            const response =
              await publicationService
                .createImage(
                  id,
                  image
                );

            syncPublication(
              response.data
            );

            notifyChange({
              type:
                'saved',

              publication:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
        syncPublication,
      ]
    );

  // ===================================================
  // UPDATE IMAGE
  //
  // PATCH
  // ===================================================

  const updateImage =
    useCallback(
      (
        id:
          string,

        image:
          PublicationImageUpload
      ): Promise<Publication> =>
        runMutation(
          async () => {
            const response =
              await publicationService
                .updateImage(
                  id,
                  image
                );

            syncPublication(
              response.data
            );

            notifyChange({
              type:
                'saved',

              publication:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
        syncPublication,
      ]
    );

  // ===================================================
  // DELETE IMAGE
  // ===================================================

  const deleteImage =
    useCallback(
      (
        id:
          string
      ): Promise<Publication> =>
        runMutation(
          async () => {
            const response =
              await publicationService
                .deleteImage(
                  id
                );

            syncPublication(
              response.data
            );

            notifyChange({
              type:
                'saved',

              publication:
                response.data,
            });

            return response.data;
          }
        ),
      [
        runMutation,
        syncPublication,
      ]
    );

  // ===================================================
  // SAVE IMAGE
  //
  // hasImage:
  // true  -> PATCH
  // false -> POST
  // ===================================================

  const saveImage =
    useCallback(
      (
        id:
          string,

        image:
          PublicationImageUpload,

        hasImage:
          boolean
      ) =>
        hasImage
          ? updateImage(
              id,
              image
            )
          : createImage(
              id,
              image
            ),
      [
        createImage,
        updateImage,
      ]
    );

  // ===================================================
  // DELETE PUBLICATION
  // ===================================================

  const deletePublication =
    useCallback(
      (
        id:
          string
      ): Promise<void> =>
        runMutation(
          async () => {
            await publicationService
              .remove(
                id
              );

            if (
              mountedRef.current
            ) {
              setPublications(
                (
                  current
                ) =>
                  current.filter(
                    (
                      item
                    ) =>
                      item.documentId !==
                      id
                  )
              );

              setPublication(
                (
                  current
                ) =>
                  current
                    ?.documentId ===
                  id
                    ? null
                    : current
              );
            }

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
  // CLEAR ERROR
  // ===================================================

  const clearError =
    useCallback(
      () => {
        setError(
          null
        );
      },
      []
    );

  return {
    publication,
    publications,
    pagination,

    loading,
    saving,
    error,

    refresh,

    createPublication,
    updatePublication,
    deletePublication,

    toggleFeatured,

    createImage,
    updateImage,
    deleteImage,
    saveImage,

    clearError,
  };
}