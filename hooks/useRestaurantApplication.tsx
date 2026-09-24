import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { restaurantApplicationService } from '@/services/restaurant-application.service';

import type {
  RestaurantApplication,
  RestaurantApplicationQueryParams,
  RestaurantRegisterData,
  UpdateRestaurantApplicationData,
} from '@/types/restaurant-application.types';

interface UseRestaurantApplicationOptions {
  documentId?: string;
  applicantId?: number | string;
  autoLoad?: boolean;
  query?: RestaurantApplicationQueryParams;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            error?: {
              message?: string;
            };
          };
        };
      }
    ).response;

    return (
      response?.data?.error?.message ||
      'No se pudo completar la solicitud'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado';
}

export function useRestaurantApplication(
  options: UseRestaurantApplicationOptions = {}
) {
  const {
    documentId,
    applicantId,
    autoLoad = true,
    query,
  } = options;

  const [application, setApplication] =
    useState<RestaurantApplication | null>(null);

  const [applications, setApplications] = useState<
    RestaurantApplication[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // =====================================================
  // ACTUALIZAR UNA SOLICITUD EN TODOS LOS ESTADOS LOCALES
  // =====================================================
  const syncApplication = useCallback(
    (updated: RestaurantApplication) => {
      if (!mountedRef.current) {
        return;
      }

      setApplication((current) => {
        if (
          !current ||
          current.documentId === updated.documentId
        ) {
          return updated;
        }

        return current;
      });

      setApplications((current) =>
        current.map((item) =>
          item.documentId === updated.documentId
            ? updated
            : item
        )
      );
    },
    []
  );

  // =====================================================
  // CARGAR UNA SOLICITUD
  // =====================================================
  const loadApplication = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await restaurantApplicationService.findOne(id);

        if (mountedRef.current) {
          setApplication(response.data);
        }

        return response.data;
      } catch (error) {
        const message =
          getErrorMessage(error);

        if (mountedRef.current) {
          setError(message);
        }

        throw error;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  // =====================================================
  // CARGAR LISTA
  // =====================================================
  const loadApplications = useCallback(
    async (
      params: RestaurantApplicationQueryParams = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await restaurantApplicationService.findAll({
            ...params,
            applicantId:
              applicantId ?? params.applicantId,
          });

        if (mountedRef.current) {
          setApplications(response.data);
        }

        return response;
      } catch (error) {
        const message =
          getErrorMessage(error);

        if (mountedRef.current) {
          setError(message);
        }

        throw error;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [applicantId]
  );

  // =====================================================
  // REFRESCAR SIN OCULTAR LA LISTA
  // =====================================================
  const refreshApplications = useCallback(
    async (
      params: RestaurantApplicationQueryParams = {}
    ) => {
      if (mountedRef.current) {
        setRefreshing(true);
        setError(null);
      }

      try {
        const response =
          await restaurantApplicationService.findAll({
            ...params,
            applicantId:
              applicantId ?? params.applicantId,
          });

        if (mountedRef.current) {
          setApplications(response.data);
        }

        return response;
      } catch (error) {
        const message =
          getErrorMessage(error);

        if (mountedRef.current) {
          setError(message);
        }

        throw error;
      } finally {
        if (mountedRef.current) {
          setRefreshing(false);
        }
      }
    },
    [applicantId]
  );

  // =====================================================
  // REGISTRAR
  // =====================================================
  const registerApplication = useCallback(
    async (data: RestaurantRegisterData) => {
      setSaving(true);
      setError(null);

      try {
        return await restaurantApplicationService.register(
          data
        );
      } catch (error) {
        const message =
          getErrorMessage(error);

        if (mountedRef.current) {
          setError(message);
        }

        throw error;
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    []
  );

  // =====================================================
  // ACTUALIZAR
  // =====================================================
  const updateApplication = useCallback(
    async (
      id: string,
      data: UpdateRestaurantApplicationData
    ) => {
      setSaving(true);
      setError(null);

      try {
        const response =
          await restaurantApplicationService.update(
            id,
            data
          );

        const updated = response.data;

        syncApplication(updated);

        return updated;
      } catch (error) {
        const message =
          getErrorMessage(error);

        if (mountedRef.current) {
          setError(message);
        }

        throw error;
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    [syncApplication]
  );

  // =====================================================
  // APROBAR
  // =====================================================
  const approveApplication = useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);

      try {
        const response =
          await restaurantApplicationService.approve(id);

        const approved = response.data;

        syncApplication(approved);

        return approved;
      } catch (error) {
        const message =
          getErrorMessage(error);

        if (mountedRef.current) {
          setError(message);
        }

        throw error;
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    [syncApplication]
  );

  // =====================================================
  // RECHAZAR
  // =====================================================
  const rejectApplication = useCallback(
    async (
      id: string,
      reason: string
    ) => {
      setSaving(true);
      setError(null);

      try {
        const response =
          await restaurantApplicationService.reject(
            id,
            reason
          );

        const rejected = response.data;

        syncApplication(rejected);

        return rejected;
      } catch (error) {
        const message =
          getErrorMessage(error);

        if (mountedRef.current) {
          setError(message);
        }

        throw error;
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    [syncApplication]
  );

  // =====================================================
  // ELIMINAR
  // =====================================================
  const deleteApplication = useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);

      try {
        await restaurantApplicationService.remove(id);

        if (mountedRef.current) {
          setApplications((current) =>
            current.filter(
              (item) =>
                item.documentId !== id
            )
          );

          setApplication((current) =>
            current?.documentId === id
              ? null
              : current
          );
        }
      } catch (error) {
        const message =
          getErrorMessage(error);

        if (mountedRef.current) {
          setError(message);
        }

        throw error;
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    []
  );

  // =====================================================
  // FILTROS
  // =====================================================
  const getPendingApplications =
    useCallback(
      () =>
        applications.filter(
          (item) =>
            item.status === 'pending'
        ),
      [applications]
    );

  const getApprovedApplications =
    useCallback(
      () =>
        applications.filter(
          (item) =>
            item.status === 'approved'
        ),
      [applications]
    );

  const getRejectedApplications =
    useCallback(
      () =>
        applications.filter(
          (item) =>
            item.status === 'rejected'
        ),
      [applications]
    );

  // =====================================================
  // CARGA AUTOMÁTICA
  // =====================================================
  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadApplication(documentId);
      return;
    }

    void loadApplications(query);
  }, [
    autoLoad,
    documentId,
    query?.page,
    query?.pageSize,
    query?.sort,
    query?.status,
    query?.applicantId,
    loadApplication,
    loadApplications,
  ]);

  return {
    application,
    applications,

    loading,
    refreshing,
    saving,
    error,

    loadApplication,
    loadApplications,
    refreshApplications,

    registerApplication,
    updateApplication,
    approveApplication,
    rejectApplication,
    deleteApplication,

    getPendingApplications,
    getApprovedApplications,
    getRejectedApplications,

    refresh: documentId
      ? () => loadApplication(documentId)
      : () => refreshApplications(query),
  };
}