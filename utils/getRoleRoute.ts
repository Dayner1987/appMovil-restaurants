import type { Href } from 'expo-router';
import type { AppUser } from '@/types/user.types';

export function getRoleRoute(user: AppUser): Href {
  const role =
    user.role?.type?.trim().toLowerCase() ??
    user.role?.name?.trim().toLowerCase();

  switch (role) {
    case 'admin':
      return '/(tabs-admin)';

    case 'restaurant':
      return '/(tabs-restaurant)';

    case 'employee':
      return '/(tabs-employee)';

    case 'client':
    case 'authenticated':
      return '/(tabs)';

    default:
      return '/(tabs)';
  }
}