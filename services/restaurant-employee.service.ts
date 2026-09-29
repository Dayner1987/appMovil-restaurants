// services/restaurant-employee.service.ts

import {
  api,
} from './api';

import type {
  CreateRestaurantEmployeeData,
  EmployeeMessageResponse,
  EmployeePasswordData,
  RestaurantEmployeeListResponse,
  RestaurantEmployeeResponse,
  UpdateRestaurantEmployeeData,
} from '@/types/employee.types';

const EMPLOYEE_URL =
  '/api/users-permissions/restaurant/employees';

export const restaurantEmployeeService = {
  // ===================================================
  // CREATE
  // ===================================================

  async create(
    data:
      CreateRestaurantEmployeeData
  ): Promise<RestaurantEmployeeResponse> {
    const response =
      await api.post<RestaurantEmployeeResponse>(
        EMPLOYEE_URL,
        data
      );

    return response.data;
  },

  // ===================================================
  // FIND ALL
  // ===================================================

  async findAll():
    Promise<RestaurantEmployeeListResponse> {
    const response =
      await api.get<RestaurantEmployeeListResponse>(
        EMPLOYEE_URL
      );

    return response.data;
  },

  // ===================================================
  // FIND ONE
  //
  // User usa ID NUMÉRICO.
  // ===================================================

  async findOne(
    id:
      number
  ): Promise<RestaurantEmployeeResponse> {
    const response =
      await api.get<RestaurantEmployeeResponse>(
        `${EMPLOYEE_URL}/${encodeURIComponent(
          String(
            id
          )
        )}`
      );

    return response.data;
  },

  // ===================================================
  // UPDATE
  // ===================================================

  async update(
    id:
      number,

    data:
      UpdateRestaurantEmployeeData
  ): Promise<RestaurantEmployeeResponse> {
    const response =
      await api.put<RestaurantEmployeeResponse>(
        `${EMPLOYEE_URL}/${encodeURIComponent(
          String(
            id
          )
        )}`,

        data
      );

    return response.data;
  },

  // ===================================================
  // STATUS
  // ===================================================

  async updateStatus(
    id:
      number,

    blocked:
      boolean
  ): Promise<RestaurantEmployeeResponse> {
    const response =
      await api.put<RestaurantEmployeeResponse>(
        `${EMPLOYEE_URL}/${encodeURIComponent(
          String(
            id
          )
        )}/status`,

        {
          blocked,
        }
      );

    return response.data;
  },

  // ===================================================
  // PASSWORD
  // ===================================================

  async resetPassword(
    id:
      number,

    data:
      EmployeePasswordData
  ): Promise<EmployeeMessageResponse> {
    const response =
      await api.put<EmployeeMessageResponse>(
        `${EMPLOYEE_URL}/${encodeURIComponent(
          String(
            id
          )
        )}/password`,

        data
      );

    return response.data;
  },
};