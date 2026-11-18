// hooks/useRestaurantManagement.ts
//
// Estado y operaciones de la sección "Mi restaurante".
// Mantiene separada esta funcionalidad de los hooks de catálogo/productos.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import {
  restaurantManagementService,
} from '@/services/restaurant-management.service';

import type {
  ChangeRestaurantEmployeePasswordInput,
  CreateRestaurantManagementEmployeeInput,
  ManagedRestaurant,
  RestaurantManagementEmployee,
  RestaurantManagementMediaUpload,
  UpdateManagedRestaurantInput,
  UpdateRestaurantManagementEmployeeInput,
} from '@/types/restaurant-management.types';

interface UseRestaurantManagementOptions {
  restaurantDocumentId?: string;
  autoLoadRestaurant?: boolean;
  autoLoadEmployees?: boolean;
}

function errorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;

    return (
      data?.error?.message ??
      data?.message ??
      fallback
    );
  }

  return error instanceof Error
    ? error.message
    : fallback;
}

function validEmployeeId(
  id: number | string,
): number {
  const parsed = Number(id);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(
      'El identificador del empleado no es válido.',
    );
  }

  return parsed;
}

export function useRestaurantManagement(
  options: UseRestaurantManagementOptions = {},
) {
  const {
    restaurantDocumentId,
    autoLoadRestaurant = false,
    autoLoadEmployees = false,
  } = options;

  const [
    restaurant,
    setRestaurant,
  ] = useState<ManagedRestaurant | null>(
    null,
  );

  const [
    employees,
    setEmployees,
  ] = useState<RestaurantManagementEmployee[]>(
    [],
  );

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState<RestaurantManagementEmployee | null>(
    null,
  );

  const [
    loadingRestaurant,
    setLoadingRestaurant,
  ] = useState(false);

  const [
    loadingEmployees,
    setLoadingEmployees,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const mountedRef =
    useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadRestaurant =
    useCallback(
      async (
        documentId = restaurantDocumentId,
      ) => {
        if (!documentId) {
          throw new Error(
            'No se encontró el restaurante asociado a la cuenta.',
          );
        }

        setLoadingRestaurant(true);
        setError(null);

        try {
          const item =
            await restaurantManagementService.getRestaurant(
              documentId,
            );

          if (mountedRef.current) {
            setRestaurant(item);
          }

          return item;
        } catch (error) {
          const message =
            errorMessage(
              error,
              'No se pudo cargar la información del restaurante.',
            );

          if (mountedRef.current) {
            setError(message);
          }

          throw error;
        } finally {
          if (mountedRef.current) {
            setLoadingRestaurant(false);
          }
        }
      },
      [restaurantDocumentId],
    );

  const loadEmployees =
    useCallback(
      async () => {
        setLoadingEmployees(true);
        setError(null);

        try {
          const response =
            await restaurantManagementService.listEmployees();

          if (mountedRef.current) {
            setEmployees(response.data);
          }

          return response.data;
        } catch (error) {
          const message =
            errorMessage(
              error,
              'No se pudieron cargar los empleados.',
            );

          if (mountedRef.current) {
            setError(message);
          }

          throw error;
        } finally {
          if (mountedRef.current) {
            setLoadingEmployees(false);
          }
        }
      },
      [],
    );

  const loadEmployee =
    useCallback(
      async (
        id: number | string,
      ) => {
        const employeeId =
          validEmployeeId(id);

        setError(null);

        try {
          const response =
            await restaurantManagementService.getEmployee(
              employeeId,
            );

          if (mountedRef.current) {
            setSelectedEmployee(response.data);
          }

          return response.data;
        } catch (error) {
          const message =
            errorMessage(
              error,
              'No se pudo cargar la información del empleado.',
            );

          if (mountedRef.current) {
            setError(message);
          }

          throw error;
        }
      },
      [],
    );

  const createEmployee =
    useCallback(
      async (
        data: CreateRestaurantManagementEmployeeInput,
      ) => {
        setSaving(true);
        setError(null);

        try {
          const response =
            await restaurantManagementService.createEmployee(
              data,
            );

          if (mountedRef.current) {
            setEmployees(current => [
              response.data,
              ...current.filter(
                item =>
                  item.id !== response.data.id,
              ),
            ]);

            setSelectedEmployee(
              response.data,
            );
          }

          return response.data;
        } catch (error) {
          const message =
            errorMessage(
              error,
              'No se pudo crear el empleado.',
            );

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
      [],
    );

  const updateEmployee =
    useCallback(
      async (
        id: number | string,
        data: UpdateRestaurantManagementEmployeeInput,
      ) => {
        const employeeId =
          validEmployeeId(id);

        setSaving(true);
        setError(null);

        try {
          const response =
            await restaurantManagementService.updateEmployee(
              employeeId,
              data,
            );

          if (mountedRef.current) {
            setEmployees(current =>
              current.map(item =>
                item.id === response.data.id
                  ? response.data
                  : item,
              ),
            );

            setSelectedEmployee(current =>
              current?.id === response.data.id
                ? response.data
                : current,
            );
          }

          return response.data;
        } catch (error) {
          const message =
            errorMessage(
              error,
              'No se pudieron guardar los datos del empleado.',
            );

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
      [],
    );

  const setEmployeeBlocked =
    useCallback(
      async (
        id: number | string,
        blocked: boolean,
      ) => {
        const employeeId =
          validEmployeeId(id);

        setSaving(true);
        setError(null);

        try {
          const response =
            await restaurantManagementService.updateEmployeeStatus(
              employeeId,
              blocked,
            );

          if (mountedRef.current) {
            setEmployees(current =>
              current.map(item =>
                item.id === response.data.id
                  ? response.data
                  : item,
              ),
            );

            setSelectedEmployee(current =>
              current?.id === response.data.id
                ? response.data
                : current,
            );
          }

          return response.data;
        } catch (error) {
          const message =
            errorMessage(
              error,
              'No se pudo actualizar el estado del empleado.',
            );

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
      [],
    );

  const resetEmployeePassword =
    useCallback(
      async (
        id: number | string,
        data: ChangeRestaurantEmployeePasswordInput,
      ) => {
        const employeeId =
          validEmployeeId(id);

        setSaving(true);
        setError(null);

        try {
          return await restaurantManagementService.changeEmployeePassword(
            employeeId,
            data,
          );
        } catch (error) {
          const message =
            errorMessage(
              error,
              'No se pudo actualizar la contraseña.',
            );

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
      [],
    );

  const updateRestaurant =
    useCallback(
      async (
        data: UpdateManagedRestaurantInput,
        documentId = restaurantDocumentId,
      ) => {
        if (!documentId) {
          throw new Error(
            'No se encontró el restaurante asociado a la cuenta.',
          );
        }

        setSaving(true);
        setError(null);

        try {
          const updated =
            await restaurantManagementService.updateRestaurant(
              documentId,
              data,
            );

          if (mountedRef.current) {
            setRestaurant(updated);
          }

          return updated;
        } catch (error) {
          const message =
            errorMessage(
              error,
              'No se pudo actualizar la información del restaurante.',
            );

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
      [restaurantDocumentId],
    );

  const uploadRestaurantMedia =
    useCallback(
      async (
        type: 'logo' | 'QRImage',
        upload: RestaurantManagementMediaUpload,
        documentId = restaurantDocumentId,
        replace = false,
      ) => {
        if (!documentId) {
          throw new Error(
            'No se encontró el restaurante asociado a la cuenta.',
          );
        }

        setSaving(true);
        setError(null);

        try {
          const updated =
            type === 'logo'
              ? replace
                ? await restaurantManagementService.updateLogo(
                    documentId,
                    upload,
                  )
                : await restaurantManagementService.createLogo(
                    documentId,
                    upload,
                  )
              : replace
                ? await restaurantManagementService.updateQRImage(
                    documentId,
                    upload,
                  )
                : await restaurantManagementService.createQRImage(
                    documentId,
                    upload,
                  );

          if (mountedRef.current) {
            setRestaurant(updated);
          }

          return updated;
        } catch (error) {
          const message =
            errorMessage(
              error,
              type === 'logo'
                ? 'No se pudo actualizar el logo.'
                : 'No se pudo actualizar el QR.',
            );

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
      [restaurantDocumentId],
    );

  const deleteRestaurantMedia =
    useCallback(
      async (
        type: 'logo' | 'QRImage',
        documentId = restaurantDocumentId,
      ) => {
        if (!documentId) {
          throw new Error(
            'No se encontró el restaurante asociado a la cuenta.',
          );
        }

        setSaving(true);
        setError(null);

        try {
          const updated =
            type === 'logo'
              ? await restaurantManagementService.deleteLogo(
                  documentId,
                )
              : await restaurantManagementService.deleteQRImage(
                  documentId,
                );

          if (mountedRef.current) {
            setRestaurant(updated);
          }

          return updated;
        } catch (error) {
          const message =
            errorMessage(
              error,
              type === 'logo'
                ? 'No se pudo eliminar el logo.'
                : 'No se pudo eliminar el QR.',
            );

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
      [restaurantDocumentId],
    );

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  useEffect(() => {
    if (autoLoadRestaurant && restaurantDocumentId) {
      void loadRestaurant().catch(() => undefined);
    }
  }, [
    autoLoadRestaurant,
    restaurantDocumentId,
    loadRestaurant,
  ]);

  useEffect(() => {
    if (autoLoadEmployees) {
      void loadEmployees().catch(() => undefined);
    }
  }, [
    autoLoadEmployees,
    loadEmployees,
  ]);

  return {
    restaurant,
    employees,
    selectedEmployee,

    loadingRestaurant,
    loadingEmployees,
    saving,
    error,

    loadRestaurant,
    loadEmployees,
    loadEmployee,

    createEmployee,
    updateEmployee,
    setEmployeeBlocked,
    resetEmployeePassword,

    updateRestaurant,
    uploadRestaurantMedia,
    deleteRestaurantMedia,

    clearError,

    refreshEmployees: loadEmployees,
    refreshRestaurant: loadRestaurant,
  };
}
