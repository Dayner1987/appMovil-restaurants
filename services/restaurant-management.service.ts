// services/restaurant-management.service.ts
//
// Capa de consumo de API para el restaurante autenticado.
// Todos los endpoints aquí corresponden al backend comprobado en Insomnia.

import { api } from '@/services/api';
import { addImageToForm } from '@/services/upload';

import type {
  ChangeRestaurantEmployeePasswordInput,
  CreateRestaurantManagementEmployeeInput,
  ManagedRestaurant,
  RestaurantManagementEmployee,
  RestaurantManagementEmployeeListResponse,
  RestaurantManagementEmployeeResponse,
  RestaurantManagementMediaUpload,
  UpdateManagedRestaurantInput,
  UpdateRestaurantManagementEmployeeInput,
} from '@/types/restaurant-management.types';

const EMPLOYEES_URL =
  '/api/users-permissions/restaurant/employees';

const RESTAURANTS_URL =
  '/api/restaurants';

function encode(value: string | number) {
  return encodeURIComponent(String(value));
}

function unwrapObject<T>(payload: unknown): T {
  const root = payload as any;

  if (root?.data?.data && typeof root.data.data === 'object') {
    return root.data.data as T;
  }

  if (root?.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return root.data as T;
  }

  return root as T;
}

function unwrapList<T>(payload: unknown): T[] {
  const root = payload as any;

  if (Array.isArray(root?.data)) {
    return root.data as T[];
  }

  if (Array.isArray(root?.data?.data)) {
    return root.data.data as T[];
  }

  if (Array.isArray(root)) {
    return root as T[];
  }

  return [];
}

function unwrapEmployeeList(
  payload: unknown
): RestaurantManagementEmployeeListResponse {
  const root = payload as any;

  return {
    data: unwrapList<RestaurantManagementEmployee>(root),
    meta: root?.meta ?? root?.data?.meta,
  };
}

async function createMediaForm(
  fieldName: 'logo' | 'QRImage',
  upload: RestaurantManagementMediaUpload,
): Promise<FormData> {
  const form = new FormData();

  await addImageToForm(
    form,
    fieldName,
    upload.uri,
    upload.fileName ??
      (fieldName === 'logo'
        ? 'restaurant-logo.jpg'
        : 'restaurant-qr.jpg'),
    upload.mimeType ??
      (fieldName === 'logo'
        ? 'image/jpeg'
        : 'image/jpeg'),
  );

  return form;
}

export const restaurantManagementService = {
  // =====================================================
  // EMPLOYEES
  // =====================================================

  async listEmployees(): Promise<RestaurantManagementEmployeeListResponse> {
    const response = await api.get(
      EMPLOYEES_URL,
    );

    return unwrapEmployeeList(response.data);
  },

  async getEmployee(
    id: number | string,
  ): Promise<RestaurantManagementEmployeeResponse> {
    const response = await api.get(
      `${EMPLOYEES_URL}/${encode(id)}`,
    );

    const employee =
      unwrapObject<RestaurantManagementEmployee>(
        response.data,
      );

    return {
      message: response.data?.message,
      data: employee,
      meta: response.data?.meta,
    };
  },

  async createEmployee(
    data: CreateRestaurantManagementEmployeeInput,
  ): Promise<RestaurantManagementEmployeeResponse> {
    // El backend obtiene automáticamente el restaurante
    // desde el usuario autenticado. No enviamos restaurant.
    const response = await api.post(
      EMPLOYEES_URL,
      data,
    );

    return {
      message: response.data?.message,
      data: unwrapObject<RestaurantManagementEmployee>(
        response.data,
      ),
      meta: response.data?.meta,
    };
  },

  async updateEmployee(
    id: number | string,
    data: UpdateRestaurantManagementEmployeeInput,
  ): Promise<RestaurantManagementEmployeeResponse> {
    const response = await api.put(
      `${EMPLOYEES_URL}/${encode(id)}`,
      data,
    );

    return {
      message: response.data?.message,
      data: unwrapObject<RestaurantManagementEmployee>(
        response.data,
      ),
      meta: response.data?.meta,
    };
  },

  async updateEmployeeStatus(
    id: number | string,
    blocked: boolean,
  ): Promise<RestaurantManagementEmployeeResponse> {
    const response = await api.put(
      `${EMPLOYEES_URL}/${encode(id)}/status`,
      { blocked },
    );

    return {
      message: response.data?.message,
      data: unwrapObject<RestaurantManagementEmployee>(
        response.data,
      ),
      meta: response.data?.meta,
    };
  },

  async changeEmployeePassword(
    id: number | string,
    data: ChangeRestaurantEmployeePasswordInput,
  ): Promise<{ message: string }> {
    const response = await api.put(
      `${EMPLOYEES_URL}/${encode(id)}/password`,
      data,
    );

    return {
      message:
        response.data?.message ??
        'Contraseña actualizada correctamente.',
    };
  },

  // =====================================================
  // RESTAURANT
  // =====================================================

  async getRestaurant(
    documentId: string,
  ): Promise<ManagedRestaurant> {
    const response = await api.get(
      `${RESTAURANTS_URL}/${encode(documentId)}`,
      {
        params: {
          populate: '*',
        },
      },
    );

    return unwrapObject<ManagedRestaurant>(
      response.data,
    );
  },

  async updateRestaurant(
    documentId: string,
    data: UpdateManagedRestaurantInput,
  ): Promise<ManagedRestaurant> {
    const response = await api.patch(
      `${RESTAURANTS_URL}/${encode(documentId)}`,
      {
        data,
      },
      {
        params: {
          populate: '*',
        },
      },
    );

    return unwrapObject<ManagedRestaurant>(
      response.data,
    );
  },

  // =====================================================
  // LOGO
  // =====================================================

  async createLogo(
    documentId: string,
    upload: RestaurantManagementMediaUpload,
  ): Promise<ManagedRestaurant> {
    const form = await createMediaForm(
      'logo',
      upload,
    );

    const response = await api.post(
      `${RESTAURANTS_URL}/${encode(documentId)}/logo`,
      form,
    );

    return unwrapObject<ManagedRestaurant>(
      response.data,
    );
  },

  async updateLogo(
    documentId: string,
    upload: RestaurantManagementMediaUpload,
  ): Promise<ManagedRestaurant> {
    const form = await createMediaForm(
      'logo',
      upload,
    );

    const response = await api.patch(
      `${RESTAURANTS_URL}/${encode(documentId)}/logo`,
      form,
    );

    return unwrapObject<ManagedRestaurant>(
      response.data,
    );
  },

  async deleteLogo(
    documentId: string,
  ): Promise<ManagedRestaurant> {
    const response = await api.delete(
      `${RESTAURANTS_URL}/${encode(documentId)}/logo`,
    );

    return unwrapObject<ManagedRestaurant>(
      response.data,
    );
  },

  // =====================================================
  // QR
  // =====================================================

  async createQRImage(
    documentId: string,
    upload: RestaurantManagementMediaUpload,
  ): Promise<ManagedRestaurant> {
    const form = await createMediaForm(
      'QRImage',
      upload,
    );

    const response = await api.post(
      `${RESTAURANTS_URL}/${encode(documentId)}/qr-image`,
      form,
    );

    return unwrapObject<ManagedRestaurant>(
      response.data,
    );
  },

  async updateQRImage(
    documentId: string,
    upload: RestaurantManagementMediaUpload,
  ): Promise<ManagedRestaurant> {
    const form = await createMediaForm(
      'QRImage',
      upload,
    );

    const response = await api.patch(
      `${RESTAURANTS_URL}/${encode(documentId)}/qr-image`,
      form,
    );

    return unwrapObject<ManagedRestaurant>(
      response.data,
    );
  },

  async deleteQRImage(
    documentId: string,
  ): Promise<ManagedRestaurant> {
    const response = await api.delete(
      `${RESTAURANTS_URL}/${encode(documentId)}/qr-image`,
    );

    return unwrapObject<ManagedRestaurant>(
      response.data,
    );
  },
};
