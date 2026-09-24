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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadApplication = useCallback(async (id: string) => {
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
      const message = getErrorMessage(error);

      if (mountedRef.current) {
        setError(message);
      }

      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadApplications = useCallback(
    async (params: RestaurantApplicationQueryParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await restaurantApplicationService.findAll({
            ...params,
            applicantId: applicantId ?? params.applicantId,
          });

        if (mountedRef.current) {
          setApplications(response.data);
        }

        return response;
      } catch (error) {
        const message = getErrorMessage(error);

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

  const registerApplication = useCallback(
    async (data: RestaurantRegisterData) => {
      setSaving(true);
      setError(null);

      try {
        return await restaurantApplicationService.register(data);
      } catch (error) {
        const message = getErrorMessage(error);

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

  const updateApplication = useCallback(
    async (
      id: string,
      data: UpdateRestaurantApplicationData
    ) => {
      setSaving(true);
      setError(null);

      try {
        const response =
          await restaurantApplicationService.update(id, data);

        const updated = response.data;

        if (mountedRef.current) {
          setApplication(updated);

          setApplications((current) =>
            current.map((item) =>
              item.documentId === updated.documentId
                ? updated
                : item
            )
          );
        }

        return updated;
      } catch (error) {
        const message = getErrorMessage(error);

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

  const approveApplication = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);

    try {
      const response =
        await restaurantApplicationService.approve(id);

      const approved = response.data;

      if (mountedRef.current) {
        setApplication(approved);

        setApplications((current) =>
          current.map((item) =>
            item.documentId === approved.documentId
              ? approved
              : item
          )
        );
      }

      return approved;
    } catch (error) {
      const message = getErrorMessage(error);

      if (mountedRef.current) {
        setError(message);
      }

      throw error;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const rejectApplication = useCallback(
    async (id: string, reason: string) => {
      setSaving(true);
      setError(null);

      try {
        const response =
          await restaurantApplicationService.reject(id, reason);

        const rejected = response.data;

        if (mountedRef.current) {
          setApplication(rejected);

          setApplications((current) =>
            current.map((item) =>
              item.documentId === rejected.documentId
                ? rejected
                : item
            )
          );
        }

        return rejected;
      } catch (error) {
        const message = getErrorMessage(error);

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

  const deleteApplication = useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);

      try {
        await restaurantApplicationService.remove(id);

        if (mountedRef.current) {
          setApplications((current) =>
            current.filter(
              (item) => item.documentId !== id
            )
          );

          if (application?.documentId === id) {
            setApplication(null);
          }
        }
      } catch (error) {
        const message = getErrorMessage(error);

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
    [application?.documentId]
  );

  const getPendingApplications = useCallback(
    () =>
      applications.filter(
        (item) => item.status === 'pending'
      ),
    [applications]
  );

  const getApprovedApplications = useCallback(
    () =>
      applications.filter(
        (item) => item.status === 'approved'
      ),
    [applications]
  );

  const getRejectedApplications = useCallback(
    () =>
      applications.filter(
        (item) => item.status === 'rejected'
      ),
    [applications]
  );

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
    saving,
    error,
    loadApplication,
    loadApplications,
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
      : () => loadApplications(query),
  };
}