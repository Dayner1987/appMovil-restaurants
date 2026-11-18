// hooks/useEmployeeShift.ts
//
// Hook para la jornada del empleado autenticado.
// La relación empleado/restaurante se resuelve en el backend a partir del JWT.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { employeeShiftService } from '@/services/employee-shift.service';
import type { EmployeeShift } from '@/types/employee.types';

interface UseEmployeeShiftOptions {
  autoLoad?: boolean;
}

export function useEmployeeShift(
  options: UseEmployeeShiftOptions = {},
) {
  const { autoLoad = true } = options;

  const [shift, setShift] = useState<EmployeeShift | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const mutationRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadCurrentShift = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const current = await employeeShiftService.findCurrentOpen();

      if (mountedRef.current) {
        setShift(current);
      }

      return current;
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'No se pudo consultar la jornada.';

      if (mountedRef.current) setError(message);
      throw requestError;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const startShift = useCallback(async () => {
    if (mutationRef.current) {
      throw new Error('Espera a que termine la operación actual.');
    }

    mutationRef.current = true;
    setSaving(true);
    setError(null);

    try {
      // Evita duplicar una jornada si ya existe una abierta.
      const existing = await employeeShiftService.findCurrentOpen();

      if (existing) {
        if (mountedRef.current) setShift(existing);
        throw new Error('Ya tienes una jornada abierta.');
      }

      await employeeShiftService.openMine();

      // El GET posterior es la fuente de verdad del estado actual.
      const current = await employeeShiftService.findCurrentOpen();

      if (!current) {
        throw new Error('La jornada se envió para abrir, pero no aparece activa al consultar el servidor.');
      }

      if (mountedRef.current) setShift(current);
      return current;
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'No se pudo abrir la jornada.';

      if (mountedRef.current) setError(message);
      throw requestError;
    } finally {
      mutationRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }, []);

  const closeShift = useCallback(async () => {
    if (mutationRef.current) {
      throw new Error('Espera a que termine la operación actual.');
    }

    if (!shift?.documentId) {
      throw new Error('No existe una jornada abierta para cerrar.');
    }

    mutationRef.current = true;
    setSaving(true);
    setError(null);

    try {
      await employeeShiftService.closeMine(shift.documentId);

      // El endpoint probado responde data:null al cerrar.
      // Por eso no intentamos leer response.data.documentId.
      const current = await employeeShiftService.findCurrentOpen();

      if (mountedRef.current) setShift(current);

      if (current) {
        throw new Error('El servidor respondió al cierre, pero la jornada todavía aparece abierta.');
      }

      return null;
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'No se pudo cerrar la jornada.';

      if (mountedRef.current) setError(message);
      throw requestError;
    } finally {
      mutationRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }, [shift]);

  useEffect(() => {
    if (!autoLoad) return;
    void loadCurrentShift().catch(() => undefined);
  }, [autoLoad, loadCurrentShift]);

  return {
    shift,
    hasOpenShift: Boolean(shift?.statusEm === 'OPEN'),
    loading,
    saving,
    error,
    loadCurrentShift,
    startShift,
    closeShift,
    refresh: loadCurrentShift,
  };
}
