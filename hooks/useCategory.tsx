import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';

import { categoryService } from '@/services/category.service';

import type {
  Category,
  CategoryPagination,
  CategoryQueryParams,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/types/category.types';

interface UseCategoryOptions {
  documentId?: string;
  autoLoad?: boolean;
  query?: CategoryQueryParams;
}

type CategoryChange =
  | { type: 'saved'; category: Category }
  | { type: 'deleted'; documentId: string };

// Notifica cambios entre pantallas que usan este hook.
const listeners = new Set<(change: CategoryChange) => void>();

function notifyChange(change: CategoryChange) {
  listeners.forEach((listener) => listener(change));
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message;

    return typeof message === 'string'
      ? message
      : 'No se pudo completar la operación de categorías.';
  }

  return error instanceof Error
    ? error.message
    : 'Ocurrió un error inesperado.';
}

function prepareData<T extends UpdateCategoryData>(data: T): T {
  const result = { ...data };

  if (result.name !== undefined) {
    result.name = result.name.trim();

    if (!result.name) {
      throw new Error('Escribe el nombre de la categoría.');
    }
  }

  if (typeof result.description === 'string') {
    result.description = result.description.trim() || null;
  }

  return result;
}

export function useCategory(options: UseCategoryOptions = {}) {
  const { documentId, autoLoad = true, query } = options;

  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] =
    useState<CategoryPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(false);
  const requestRef = useRef(0);
  const mutationRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Una referencia nueva de query o sort no dispara otra consulta
  // si sus valores siguen siendo los mismos.
  const queryKey = JSON.stringify({
    page: query?.page ?? 1,
    pageSize: query?.pageSize ?? 25,
    sort: query?.sort ?? 'name:asc',
    name: query?.name?.trim() || undefined,
    isActive: query?.isActive,
  });

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;

    const requestId = ++requestRef.current;
    hasLoadedRef.current = true;
    setLoading(true);
    setError(null);

    try {
      if (documentId) {
        const response = await categoryService.findOne(documentId);

        if (
          mountedRef.current &&
          requestId === requestRef.current
        ) {
          setCategory(response.data);
        }
      } else {
        const params: CategoryQueryParams = JSON.parse(queryKey);
        const response = await categoryService.findAll(params);

        if (
          mountedRef.current &&
          requestId === requestRef.current
        ) {
          setCategories(response.data);
          setPagination(response.meta.pagination);
        }
      }
    } catch (requestError) {
      if (
        mountedRef.current &&
        requestId === requestRef.current
      ) {
        setError(getErrorMessage(requestError));
      }
    } finally {
      if (
        mountedRef.current &&
        requestId === requestRef.current
      ) {
        setLoading(false);
      }
    }
  }, [documentId, queryKey]);

  useEffect(() => {
    hasLoadedRef.current = false;
    setCategory(null);
    setCategories([]);
    setPagination(null);
    setError(null);
    setLoading(false);

    if (autoLoad) {
      void refresh();
    }

    return () => {
      requestRef.current += 1;
    };
  }, [autoLoad, refresh]);

  useEffect(() => {
    const onChange = (change: CategoryChange) => {
      if (!mountedRef.current) return;

      if (documentId) {
        const changedId = change.type === 'saved'
          ? change.category.documentId
          : change.documentId;

        if (changedId !== documentId) return;

        // Evita que una lectura anterior sobrescriba el cambio.
        requestRef.current += 1;
        setLoading(false);
        setCategory(
          change.type === 'saved' ? change.category : null
        );
      } else if (autoLoad || hasLoadedRef.current) {
        // Recupera la página correcta con sus filtros y totales.
        void refresh();
      }
    };

    listeners.add(onChange);

    return () => {
      listeners.delete(onChange);
    };
  }, [documentId, autoLoad, refresh]);

  const runMutation = useCallback(async <T,>(
    operation: () => Promise<T>
  ): Promise<T> => {
    if (mutationRef.current) {
      throw new Error('Espera a que termine la operación actual.');
    }

    mutationRef.current = true;

    if (mountedRef.current) {
      setSaving(true);
      setError(null);
    }

    try {
      return await operation();
    } catch (requestError) {
      if (mountedRef.current) {
        setError(getErrorMessage(requestError));
      }

      throw requestError;
    } finally {
      mutationRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const createCategory = useCallback(
    (data: CreateCategoryData): Promise<Category> =>
      runMutation(async () => {
        const payload = prepareData({
          ...data,
          isActive: data.isActive ?? true,
        });

        const response = await categoryService.create(payload);
        notifyChange({ type: 'saved', category: response.data });

        return response.data;
      }),
    [runMutation]
  );

  const updateCategory = useCallback(
    (
      id: string,
      data: UpdateCategoryData
    ): Promise<Category> =>
      runMutation(async () => {
        const response = await categoryService.update(
          id,
          prepareData(data)
        );

        notifyChange({ type: 'saved', category: response.data });
        return response.data;
      }),
    [runMutation]
  );

  const deleteCategory = useCallback(
    (id: string): Promise<void> =>
      runMutation(async () => {
        await categoryService.remove(id);
        notifyChange({ type: 'deleted', documentId: id });
      }),
    [runMutation]
  );

  const setCategoryActive = useCallback(
    (id: string, isActive: boolean) =>
      updateCategory(id, { isActive }),
    [updateCategory]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    category,
    categories,
    pagination,
    loading,
    saving,
    error,
    refresh,
    createCategory,
    updateCategory,
    deleteCategory,
    setCategoryActive,
    clearError,
  };
}