// hooks/useRestaurantEmployees.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import {
  restaurantEmployeeService,
} from '@/services/restaurant-employee.service';

import type {
  CreateRestaurantEmployeeData,
  EmployeePasswordData,
  RestaurantEmployee,
  UpdateRestaurantEmployeeData,
} from '@/types/employee.types';

function getErrorMessage(
  error:
    unknown,

  fallback:
    string
) {
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
      fallback
    );
  }

  return error instanceof
    Error
    ? error.message
    : fallback;
}

interface UseRestaurantEmployeesOptions {
  autoLoad?:
    boolean;
}

export function useRestaurantEmployees(
  options:
    UseRestaurantEmployeesOptions = {}
) {
  const {
    autoLoad =
      true,
  } = options;

  const [
    employees,
    setEmployees,
  ] =
    useState<RestaurantEmployee[]>(
      []
    );

  const [
    employee,
    setEmployee,
  ] =
    useState<RestaurantEmployee | null>(
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
    useRef(true);

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  // ===================================================
  // LOAD ALL
  // ===================================================

  const loadEmployees =
    useCallback(
      async () => {
        if (
          mountedRef.current
        ) {
          setLoading(
            true
          );

          setError(
            null
          );
        }

        try {
          const response =
            await restaurantEmployeeService
              .findAll();

          if (
            mountedRef.current
          ) {
            setEmployees(
              response.data
            );
          }

          return response.data;
        } catch (
          requestError
        ) {
          const message =
            getErrorMessage(
              requestError,
              'No se pudieron cargar los empleados.'
            );

          if (
            mountedRef.current
          ) {
            setError(
              message
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
  // LOAD ONE
  // ===================================================

  const loadEmployee =
    useCallback(
      async (
        id:
          number
      ) => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await restaurantEmployeeService
              .findOne(
                id
              );

          if (
            mountedRef.current
          ) {
            setEmployee(
              response.data
            );
          }

          return response.data;
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
  // CREATE
  // ===================================================

  const createEmployee =
    useCallback(
      async (
        data:
          CreateRestaurantEmployeeData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await restaurantEmployeeService
              .create(
                data
              );

          if (
            mountedRef.current
          ) {
            setEmployees(
              (
                current
              ) => [
                response.data,
                ...current,
              ]
            );

            setEmployee(
              response.data
            );
          }

          return response.data;
        } catch (
          requestError
        ) {
          const message =
            getErrorMessage(
              requestError,
              'No se pudo crear el empleado.'
            );

          if (
            mountedRef.current
          ) {
            setError(
              message
            );
          }

          throw requestError;
        } finally {
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
  // UPDATE
  // ===================================================

  const updateEmployee =
    useCallback(
      async (
        id:
          number,

        data:
          UpdateRestaurantEmployeeData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await restaurantEmployeeService
              .update(
                id,
                data
              );

          const updated =
            response.data;

          if (
            mountedRef.current
          ) {
            setEmployees(
              (
                current
              ) =>
                current.map(
                  (
                    item
                  ) =>
                    item.id ===
                    updated.id
                      ? updated
                      : item
                )
            );

            setEmployee(
              (
                current
              ) =>
                current?.id ===
                updated.id
                  ? updated
                  : current
            );
          }

          return updated;
        } finally {
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
  // BLOCK / ENABLE
  // ===================================================

  const setEmployeeBlocked =
    useCallback(
      async (
        id:
          number,

        blocked:
          boolean
      ) => {
        setSaving(
          true
        );

        try {
          const response =
            await restaurantEmployeeService
              .updateStatus(
                id,
                blocked
              );

          const updated =
            response.data;

          if (
            mountedRef.current
          ) {
            setEmployees(
              (
                current
              ) =>
                current.map(
                  (
                    item
                  ) =>
                    item.id ===
                    updated.id
                      ? updated
                      : item
                )
            );

            setEmployee(
              (
                current
              ) =>
                current?.id ===
                updated.id
                  ? updated
                  : current
            );
          }

          return updated;
        } finally {
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
  // PASSWORD
  // ===================================================

  const resetEmployeePassword =
    useCallback(
      async (
        id:
          number,

        data:
          EmployeePasswordData
      ) => {
        setSaving(
          true
        );

        try {
          return await restaurantEmployeeService
            .resetPassword(
              id,
              data
            );
        } finally {
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
  // AUTO LOAD
  // ===================================================

  useEffect(() => {
    if (
      !autoLoad
    ) {
      return;
    }

    void loadEmployees()
      .catch(
        () =>
          undefined
      );
  }, [
    autoLoad,
    loadEmployees,
  ]);

  return {
    employees,
    employee,

    loading,
    saving,
    error,

    loadEmployees,
    loadEmployee,

    createEmployee,
    updateEmployee,

    setEmployeeBlocked,
    resetEmployeePassword,

    refresh:
      loadEmployees,
  };
}