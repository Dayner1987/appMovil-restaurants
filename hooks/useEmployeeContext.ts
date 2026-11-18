// hooks/useEmployeeContext.ts

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useUser,
} from '@/hooks/useUsers';

export function useEmployeeContext() {
  const {
    user:
      authUser,

    loading:
      authLoading,
  } =
    useAuth();

  const {
    user:
      fullUser,

    loading:
      userLoading,

    loadMe,
  } =
    useUser({
      autoLoad:
        Boolean(
          authUser?.id
        ),
    });

  const user =
    fullUser ??
    authUser ??
    null;

  const employeeId =
    user?.id;

  const restaurant =
    user?.restaurant ??
    null;

  const restaurantDocumentId =
    restaurant
      ?.documentId;

  const restaurantName =
    restaurant
      ?.name ??
    'Restaurante';

  return {
    user,

    employeeId,

    restaurant,

    restaurantDocumentId,

    restaurantName,

    loading:
      authLoading ||
      userLoading,

    refreshUser:
      loadMe,
  };
}