// services/employee-shift.service.ts

import {
  api,
} from './api';

import type {
  CreateEmployeeShiftData,
  EmployeeShift,
  EmployeeShiftListResponse,
  EmployeeShiftQueryParams,
  EmployeeShiftResponse,
  UpdateEmployeeShiftData,
} from '@/types/employee.types';

const SHIFT_URL =
  '/api/employee-shifts';

// =====================================================
// NORMALIZE
// =====================================================

function normalizeShift(
  shift:
    EmployeeShift
): EmployeeShift {
  return {
    ...shift,

    orders:
      shift.orders ??
      shift.employeeShift ??
      [],

    payments:
      shift.payments ??
      shift.employeeShift2 ??
      [],
  };
}

// =====================================================
// SERVICE
// =====================================================

export const employeeShiftService = {
  // ===================================================
  // FIND ALL
  // ===================================================

  async findAll(
    params:
      EmployeeShiftQueryParams = {}
  ): Promise<EmployeeShiftListResponse> {
    const response =
      await api.get<EmployeeShiftListResponse>(
        SHIFT_URL,
        {
          params: {
            /*
             * Mientras Draft & Publish siga activo,
             * usamos draft para leer el estado operativo.
             */
            status:
              'draft',

            populate:
              '*',

            'pagination[page]':
              params.page ??
              1,

            'pagination[pageSize]':
              params.pageSize ??
              25,

            sort:
              params.sort ??
              'startedAt:desc',

            'filters[employee][id][$eq]':
              params.employeeId,

            'filters[restaurant][documentId][$eq]':
              params.restaurantDocumentId,

            'filters[statusEm][$eq]':
              params.statusEm,
          },
        }
      );

    return {
      ...response.data,

      data:
        response.data.data.map(
          normalizeShift
        ),
    };
  },

  // ===================================================
  // FIND ONE
  // ===================================================

  async findOne(
    documentId:
      string
  ): Promise<EmployeeShiftResponse> {
    const response =
      await api.get<EmployeeShiftResponse>(
        `${SHIFT_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          params: {
            status:
              'draft',

            populate:
              '*',
          },
        }
      );

    return {
      ...response.data,

      data:
        normalizeShift(
          response.data.data
        ),
    };
  },

  // ===================================================
  // CURRENT OPEN
  // ===================================================

  async findCurrentOpen(
    employeeId:
      number,

    restaurantDocumentId:
      string
  ): Promise<EmployeeShift | null> {
    const response =
      await this.findAll({
        employeeId,

        restaurantDocumentId,

        statusEm:
          'OPEN',

        page:
          1,

        pageSize:
          1,

        sort:
          'startedAt:desc',
      });

    return (
      response.data[0] ??
      null
    );
  },

  // ===================================================
  // CREATE
  // ===================================================

  async create(
    data:
      CreateEmployeeShiftData
  ): Promise<EmployeeShiftResponse> {
    const response =
      await api.post<EmployeeShiftResponse>(
        SHIFT_URL,
        {
          data,
        },
        {
          params: {
            populate:
              '*',
          },
        }
      );

    return {
      ...response.data,

      data:
        normalizeShift(
          response.data.data
        ),
    };
  },

  // ===================================================
  // UPDATE
  // ===================================================

  async update(
    documentId:
      string,

    data:
      UpdateEmployeeShiftData
  ): Promise<EmployeeShiftResponse> {
    const response =
      await api.put<EmployeeShiftResponse>(
        `${SHIFT_URL}/${encodeURIComponent(
          documentId
        )}`,
        {
          data,
        },
        {
          params: {
            populate:
              '*',
          },
        }
      );

    return {
      ...response.data,

      data:
        normalizeShift(
          response.data.data
        ),
    };
  },
};