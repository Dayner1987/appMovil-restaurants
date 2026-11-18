// services/employee-shift.service.ts
//
// Las jornadas del empleado se gestionan mediante las rutas propias
// del usuario autenticado. El backend obtiene empleado y restaurante
// desde el JWT; el frontend no debe enviar esas relaciones.

import { api } from './api';

import type {
  CreateEmployeeShiftData,
  EmployeeShift,
  EmployeeShiftCloseResponse,
  EmployeeShiftCurrentResponse,
  EmployeeShiftListResponse,
  EmployeeShiftQueryParams,
  EmployeeShiftResponse,
  UpdateEmployeeShiftData,
} from '@/types/employee.types';

const SHIFT_URL = '/api/employee-shifts';
const MY_CURRENT_URL = `${SHIFT_URL}/mine/current`;
const MY_OPEN_URL = `${SHIFT_URL}/mine/open`;
const MY_CLOSE_URL = `${SHIFT_URL}/mine/close`;

function normalizeShift(shift: EmployeeShift): EmployeeShift {
  return {
    ...shift,
    orders: shift.orders ?? shift.employeeShift ?? [],
    payments: shift.payments ?? shift.employeeShift2 ?? [],
  };
}

export const employeeShiftService = {
  // Consulta la jornada del empleado autenticado.
  // Los argumentos opcionales se conservan por compatibilidad con
  // pantallas antiguas, pero ya no se envían al backend.
  async findCurrentOpen(
    _employeeId?: number,
    _restaurantDocumentId?: string,
  ): Promise<EmployeeShift | null> {
    const response = await api.get<EmployeeShiftCurrentResponse>(
      MY_CURRENT_URL,
    );

    return response.data?.data
      ? normalizeShift(response.data.data)
      : null;
  },

  // Abre una jornada para el empleado del JWT.
  async openMine(): Promise<EmployeeShift> {
    const response = await api.post<EmployeeShiftResponse>(
      MY_OPEN_URL,
      {},
      { params: { populate: '*' } },
    );

    if (!response.data?.data?.documentId) {
      // Algunas implementaciones pueden responder sin incluir el
      // registro completo; en ese caso recuperamos la jornada actual.
      const current = await this.findCurrentOpen();
      if (current) return current;
      throw new Error('El servidor no devolvió la jornada creada.');
    }

    return normalizeShift(response.data.data);
  },

  // Cierra la jornada mediante el endpoint personalizado probado
  // en Insomnia. El backend espera { documentId }.
  async closeMine(documentId: string): Promise<void> {
    if (!documentId) {
      throw new Error('No se encontró el identificador de la jornada.');
    }

    await api.post<EmployeeShiftCloseResponse>(
      MY_CLOSE_URL,
      { documentId },
    );
  },

  // Métodos genéricos conservados para no romper otras pantallas
  // o funcionalidades administrativas que pudieran utilizarlos.
  async findAll(
    params: EmployeeShiftQueryParams = {},
  ): Promise<EmployeeShiftListResponse> {
    const response = await api.get<EmployeeShiftListResponse>(
      SHIFT_URL,
      {
        params: {
          status: 'published',
          populate: '*',
          'pagination[page]': params.page ?? 1,
          'pagination[pageSize]': params.pageSize ?? 25,
          sort: params.sort ?? 'startedAt:desc',
          'filters[employee][id][$eq]': params.employeeId,
          'filters[restaurant][documentId][$eq]': params.restaurantDocumentId,
          'filters[statusEm][$eq]': params.statusEm,
        },
      },
    );

    return {
      ...response.data,
      data: (response.data?.data ?? []).map(normalizeShift),
    };
  },

  async findOne(documentId: string): Promise<EmployeeShiftResponse> {
    const response = await api.get<EmployeeShiftResponse>(
      `${SHIFT_URL}/${encodeURIComponent(documentId)}`,
      {
        params: {
          status: 'published',
          populate: '*',
        },
      },
    );

    if (!response.data?.data) {
      throw new Error('No se encontró la jornada solicitada.');
    }

    return {
      ...response.data,
      data: normalizeShift(response.data.data),
    };
  },

  // Conservados por compatibilidad. La apertura/cierre normal del
  // empleado debe usar openMine() y closeMine().
  async create(data: CreateEmployeeShiftData): Promise<EmployeeShiftResponse> {
    const response = await api.post<EmployeeShiftResponse>(
      SHIFT_URL,
      { data },
      { params: { populate: '*' } },
    );

    if (!response.data?.data) {
      throw new Error('No se pudo crear la jornada.');
    }

    return {
      ...response.data,
      data: normalizeShift(response.data.data),
    };
  },

  async update(
    documentId: string,
    data: UpdateEmployeeShiftData,
  ): Promise<EmployeeShiftResponse> {
    const response = await api.put<EmployeeShiftResponse>(
      `${SHIFT_URL}/${encodeURIComponent(documentId)}`,
      { data },
      { params: { populate: '*' } },
    );

    if (!response.data?.data) {
      throw new Error('No se pudo actualizar la jornada.');
    }

    return {
      ...response.data,
      data: normalizeShift(response.data.data),
    };
  },
};
