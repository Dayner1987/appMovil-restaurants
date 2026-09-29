// hooks/useEmployeeShift.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  employeeShiftService,
} from '@/services/employee-shift.service';

import type {
  EmployeeShift,
} from '@/types/employee.types';

interface UseEmployeeShiftOptions {
  employeeId?:
    number;

  restaurantDocumentId?:
    string;

  autoLoad?:
    boolean;
}

export function useEmployeeShift(
  options:
    UseEmployeeShiftOptions = {}
) {
  const {
    employeeId,

    restaurantDocumentId,

    autoLoad =
      true,
  } = options;

  const [
    shift,
    setShift,
  ] =
    useState<EmployeeShift | null>(
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
  // CURRENT
  // ===================================================

  const loadCurrentShift =
    useCallback(
      async () => {
        if (
          !employeeId ||
          !restaurantDocumentId
        ) {
          if (
            mountedRef.current
          ) {
            setShift(
              null
            );
          }

          return null;
        }

        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const current =
            await employeeShiftService
              .findCurrentOpen(
                employeeId,
                restaurantDocumentId
              );

          if (
            mountedRef.current
          ) {
            setShift(
              current
            );
          }

          return current;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              requestError instanceof
                Error
                ? requestError.message
                : 'No se pudo cargar la jornada.'
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
      [
        employeeId,
        restaurantDocumentId,
      ]
    );

  // ===================================================
  // START
  // ===================================================

  const startShift =
    useCallback(
      async () => {
        if (
          !employeeId ||
          !restaurantDocumentId
        ) {
          throw new Error(
            'No se pudo identificar al empleado o restaurante.'
          );
        }

        const existing =
          await employeeShiftService
            .findCurrentOpen(
              employeeId,
              restaurantDocumentId
            );

        if (
          existing
        ) {
          if (
            mountedRef.current
          ) {
            setShift(
              existing
            );
          }

          throw new Error(
            'Ya existe una jornada abierta.'
          );
        }

        setSaving(
          true
        );

        try {
          const response =
            await employeeShiftService
              .create({
                startedAt:
                  new Date()
                    .toISOString(),

                statusEm:
                  'OPEN',

                employee:
                  employeeId,

                restaurant:
                  restaurantDocumentId,
              });

          if (
            mountedRef.current
          ) {
            setShift(
              response.data
            );
          }

          return response.data;
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
      [
        employeeId,
        restaurantDocumentId,
      ]
    );

  // ===================================================
  // CLOSE
  // ===================================================

  const closeShift =
    useCallback(
      async () => {
        if (
          !shift
        ) {
          throw new Error(
            'No existe una jornada abierta.'
          );
        }

        setSaving(
          true
        );

        try {
          const response =
            await employeeShiftService
              .update(
                shift.documentId,
                {
                  statusEm:
                    'CLOSED',

                  endedAt:
                    new Date()
                      .toISOString(),
                }
              );

          if (
            mountedRef.current
          ) {
            setShift(
              null
            );
          }

          return response.data;
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
      [
        shift,
      ]
    );

  useEffect(() => {
    if (
      !autoLoad
    ) {
      return;
    }

    void loadCurrentShift()
      .catch(
        () =>
          undefined
      );
  }, [
    autoLoad,
    loadCurrentShift,
  ]);

  return {
    shift,

    hasOpenShift:
      Boolean(
        shift &&
        shift.statusEm ===
          'OPEN'
      ),

    loading,
    saving,
    error,

    loadCurrentShift,
    startShift,
    closeShift,

    refresh:
      loadCurrentShift,
  };
}