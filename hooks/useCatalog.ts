// hooks/useCatalog.ts
// Refresca datos publicados al regresar al tab: no depende solo del primer montaje.
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { productService } from '@/services/products.service';
import { restaurantService } from '@/services/restaurant.service';
import { publicationService } from '@/services/publication.service';
import { promotionService } from '@/services/promotion.service';
import type { Product } from '@/types/product.types';
import type { Restaurant } from '@/types/restaurant.types';
import type { Publication } from '@/types/publication.types';
import type { Promotion } from '@/types/promotion.types';

export function errorText(error: unknown): string {
  const response = (error as any)?.response;
  if (response?.status === 403) return 'Sin permiso para leer el contenido. Revisa los permisos de Público/Usuario autenticado en Strapi.';
  if (response?.status === 401) return 'Debes iniciar sesión para ver este contenido.';
  if (!response && (error as any)?.isAxiosError) return 'No se pudo conectar con Strapi. Comprueba la IP, el puerto y tu conexión Wi-Fi.';
  return response?.data?.error?.message || (error as Error)?.message || 'Ocurrió un error al cargar los datos.';
}

const loaders = {
  products: () => productService.findAll({ pageSize: 100, available: true, status: 'published' })
    .then(result => result.data.filter(product => product.isAvailable)),
  restaurants: () => restaurantService.findAll({ pageSize: 100, statusRes: 'ACTIVE' })
    .then(result => result.data.filter(restaurant => String(restaurant.statusRes).toUpperCase() === 'ACTIVE')),
  publications: () => publicationService.findAll({ pageSize: 100, status: 'published' }).then(result => result.data),
  promotions: () => promotionService.findAll({ pageSize: 100 })
    .then(result => result.data.filter(promo =>
      (!promo.startAt || Date.parse(promo.startAt) <= Date.now()) &&
      (!promo.endAt || Date.parse(promo.endAt) >= Date.now()))),
};

type Key = keyof typeof loaders;
type CatalogData = {
  products: Product[];
  restaurants: Restaurant[];
  publications: Publication[];
  promotions: Promotion[];
};

export function useCatalog<K extends Key>(type: K) {
  const [items, setItems] = useState<Array<Product | Restaurant | Publication | Promotion>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async (refresh = false) => {
    const current = ++requestId.current;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await loaders[type]();
      if (current !== requestId.current) return;
      setItems(data as Array<Product | Restaurant | Publication | Promotion>);
      setError(null);
    } catch (requestError) {
      if (current === requestId.current) setError(errorText(requestError));
    } finally {
      if (current === requestId.current) { setLoading(false); setRefreshing(false); }
    }
  }, [type]);

  useFocusEffect(useCallback(() => {
    void reload();
    return () => { requestId.current += 1; };
  }, [reload]));

  return { items: items as CatalogData[K], loading, refreshing, error, reload };
}
