import { useCallback, useEffect, useRef, useState } from 'react';
import { restaurantService } from '@/services/restaurant.service';
import type {
  CreateRestaurantData,
  Restaurant,
  RestaurantQueryParams,
  UpdateRestaurantData,
} from '@/types/restaurant.types';
import type { AppUser } from '@/types/user.types';

interface UseRestaurantOptions {
  documentId?: string;
  userId?: number | string;
  autoLoad?: boolean;
  query?: RestaurantQueryParams;
}

function createSlug(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function useRestaurant(options: UseRestaurantOptions = {}) {
  const { documentId, userId, autoLoad = true, query } = options;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadRestaurant = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await restaurantService.findOne(id);
      if (mountedRef.current) {
        setRestaurant(response.data);
      }
      return response.data;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadRestaurants = useCallback(async (params: RestaurantQueryParams = {}) => {
    setLoading(true);
    try {
      const response = await restaurantService.findAll({
        ...params,
      });
      if (mountedRef.current) {
        setRestaurants(response.data);
      }
      return response;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const getMyRestaurants = useCallback((user: AppUser) => {
    return restaurants.filter(
      (restaurant) => restaurant.users?.some((item) => item.id === user.id)
    );
  }, [restaurants]);

  const canCreateRestaurant = useCallback((user: AppUser) => {
    const myRestaurants = getMyRestaurants(user);
    return myRestaurants.length < 3;
  }, [getMyRestaurants]);

  const createRestaurant = useCallback(async (
    data: CreateRestaurantData,
    user?: AppUser
  ) => {
    if (user && !canCreateRestaurant(user)) {
      throw new Error('Solo puedes registrar hasta 3 restaurantes');
    }

    setSaving(true);
    try {
      const restaurantData: CreateRestaurantData = {
        ...data,
        name: data.name.trim(),
        slug: data.slug || createSlug(data.name),
        statusRes: data.statusRes ?? 'PENDING',
        users: user ? [user.id] : data.users,
      };

      const response = await restaurantService.create(restaurantData);
      const newRestaurant = response.data;

      if (mountedRef.current) {
        setRestaurant(newRestaurant);
        setRestaurants((current) => [newRestaurant, ...current]);
      }

      return newRestaurant;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [canCreateRestaurant]);

  const updateRestaurant = useCallback(async (
    id: string,
    data: UpdateRestaurantData
  ) => {
    setSaving(true);
    try {
      const response = await restaurantService.update(id, {
        ...data,
        slug: data.name ? createSlug(data.name) : data.slug,
      });

      const updated = response.data;

      if (mountedRef.current) {
        setRestaurant(updated);
        setRestaurants((current) =>
          current.map((item) =>
            item.documentId === updated.documentId ? updated : item
          )
        );
      }

      return updated;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const updateRestaurantImages = useCallback(async (
    id: string,
    images: {
      logo?: number | null;
      coverImage?: number | null;
    }
  ) => {
    return updateRestaurant(id, images);
  }, [updateRestaurant]);

  const deleteRestaurant = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await restaurantService.remove(id);

      if (mountedRef.current) {
        setRestaurants((current) =>
          current.filter((item) => item.documentId !== id)
        );

        if (restaurant?.documentId === id) {
          setRestaurant(null);
        }
      }
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [restaurant?.documentId]);

  const getRestaurantProducts = useCallback(() => {
    return restaurant?.products ?? [];
  }, [restaurant]);

  const getRestaurantOrders = useCallback(() => {
    return restaurant?.orders ?? [];
  }, [restaurant]);

  const getRestaurantCategories = useCallback(() => {
    return restaurant?.categories ?? [];
  }, [restaurant]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadRestaurant(documentId);
    } else {
      void loadRestaurants(query);
    }
  }, [
    autoLoad,
    documentId,
    query?.page,
    query?.pageSize,
    query?.sort,
    query?.statusRes,
    query?.name,
    query?.email,
    loadRestaurant,
    loadRestaurants,
  ]);

  return {
    restaurant,
    restaurants,
    loading,
    saving,
    error,
    loadRestaurant,
    loadRestaurants,
    createRestaurant,
    updateRestaurant,
    updateRestaurantImages,
    deleteRestaurant,
    getMyRestaurants,
    canCreateRestaurant,
    getRestaurantProducts,
    getRestaurantCategories,
    getRestaurantOrders,
    refresh: documentId
      ? () => loadRestaurant(documentId)
      : () => loadRestaurants(query),
  };
}