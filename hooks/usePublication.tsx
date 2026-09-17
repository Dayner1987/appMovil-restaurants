import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { api } from '@/services/api';
import { publicationService } from '@/services/publication.service';

import type {
  CreatePublicationData,
  Publication,
  PublicationQueryParams,
  UpdatePublicationData,
} from '@/types/publication.types';

interface UsePublicationOptions {
  documentId?: string;
  restaurantId?: number | string;
  autoLoad?: boolean;
  query?: PublicationQueryParams;
}

export function usePublication(
  options: UsePublicationOptions = {}
) {
  const {
    documentId,
    restaurantId,
    autoLoad = true,
    query,
  } = options;

  const [publication, setPublication] =
    useState<Publication | null>(null);

  const [publications, setPublications] =
    useState<Publication[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadPublication = useCallback(async (
    id: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await publicationService.findOne(id);

      if (mountedRef.current) {
        setPublication(response.data);
      }

      return response.data;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo cargar la publicación');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadPublications = useCallback(async (
    params: PublicationQueryParams = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await publicationService.findAll({
          ...params,
          restaurantId:
            restaurantId ?? params.restaurantId,
        });

      if (mountedRef.current) {
        setPublications(response.data);
      }

      return response;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudieron cargar las publicaciones');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [restaurantId]);

  const createPublication = useCallback(async (
    data: CreatePublicationData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response =
        await publicationService.create({
          ...data,
          title: data.title.trim(),
          description: data.description.trim(),
          featured: data.featured ?? false,
          restaurant:
            data.restaurant ?? restaurantId ?? null,
        });

      const newPublication = response.data;

      if (mountedRef.current) {
        setPublication(newPublication);
        setPublications((currentPublications) => [
          newPublication,
          ...currentPublications,
        ]);
      }

      return newPublication;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo crear la publicación');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [restaurantId]);

  const updatePublication = useCallback(async (
    id: string,
    data: UpdatePublicationData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response =
        await publicationService.update(id, {
          ...data,
          title: data.title?.trim(),
          description: data.description?.trim(),
        });

      const updatedPublication = response.data;

      if (mountedRef.current) {
        setPublication(updatedPublication);

        setPublications((currentPublications) =>
          currentPublications.map((item) =>
            item.documentId ===
            updatedPublication.documentId
              ? updatedPublication
              : item
          )
        );
      }

      return updatedPublication;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar la publicación');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const toggleFeatured = useCallback(async (
    id: string,
    featured: boolean
  ) => {
    return updatePublication(id, {
      featured,
    });
  }, [updatePublication]);

  const uploadImage = useCallback(async (
    imageUri: string,
    fileName = 'publication.jpg',
    mimeType = 'image/jpeg'
  ) => {
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();

      formData.append('files', {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as unknown as Blob);

      const response = await api.post<
        Array<{ id: number }>
      >(
        '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data[0];
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo subir la imagen');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const deletePublication = useCallback(async (
    id: string
  ) => {
    setSaving(true);
    setError(null);

    try {
      await publicationService.remove(id);

      if (mountedRef.current) {
        setPublications((currentPublications) =>
          currentPublications.filter(
            (item) => item.documentId !== id
          )
        );

        if (publication?.documentId === id) {
          setPublication(null);
        }
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo eliminar la publicación');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [publication?.documentId]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadPublication(documentId);
      return;
    }

    void loadPublications({
      ...query,
      restaurantId:
        restaurantId ?? query?.restaurantId,
    });
  }, [
    autoLoad,
    documentId,
    restaurantId,
    query?.page,
    query?.pageSize,
    query?.sort,
    query?.restaurantId,
    query?.featured,
    loadPublication,
    loadPublications,
  ]);

  return {
    publication,
    publications,
    loading,
    saving,
    error,
    loadPublication,
    loadPublications,
    createPublication,
    updatePublication,
    toggleFeatured,
    uploadImage,
    deletePublication,
    refresh: documentId
      ? () => loadPublication(documentId)
      : () =>
          loadPublications({
            ...query,
            restaurantId:
              restaurantId ?? query?.restaurantId,
          }),
  };
}
