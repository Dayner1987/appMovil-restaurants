// hooks/useCart.tsx
// Carrito multi-restaurante con persistencia local.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '@/types/product.types';
import { calculatePromotionPrice, getProductActivePromotion } from '@/utils/promotion-pricing';

const STORAGE_KEY = 'restaurant_cart_v2';

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface CartGroup {
  restaurantId: string;
  restaurantName: string;
  lines: CartLine[];
  itemCount: number;
  originalSubtotal: number;
  discount: number;
  subtotal: number;
}

interface CartContextValue {
  lines: CartLine[];
  groups: CartGroup[];
  restaurantId: string | null; // Compatibilidad con consumidores antiguos.
  itemCount: number;
  total: number;
  hydrated: boolean;
  add: (product: Product) => boolean;
  change: (documentId: string, difference: number) => void;
  remove: (documentId: string) => void;
  clear: () => void;
  clearRestaurant: (restaurantId: string) => void;
}

const Context = createContext<CartContextValue | null>(null);

function validLine(value: unknown): value is CartLine {
  const item = value as CartLine | null;
  return Boolean(
    item && item.product?.documentId && item.product?.restaurant?.documentId &&
    Number.isFinite(Number(item.product.price)) &&
    Number.isInteger(item.quantity) && item.quantity > 0
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const linesRef = useRef<CartLine[]>([]);

  const commit = useCallback((next: CartLine[]) => {
    linesRef.current = next;
    setLines(next);
  }, []);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!active) return;
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          commit(parsed.filter(validLine).map(line => ({
            product: line.product,
            quantity: Math.max(1, Math.min(line.quantity, line.product.stock ?? line.quantity)),
          })));
        }
      }
    }).catch(() => {
      // Un carrito local corrupto no debe impedir iniciar la aplicación.
    }).finally(() => { if (active) setHydrated(true); });
    return () => { active = false; };
  }, [commit]);

  useEffect(() => {
    if (!hydrated) return;
    const handle = setTimeout(() => {
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lines)).catch(() => {});
    }, 200);
    return () => clearTimeout(handle);
  }, [lines, hydrated]);

  const add = useCallback((product: Product): boolean => {
    if (!hydrated || !product.documentId || !product.restaurant?.documentId ||
        !product.isAvailable || (product.stock != null && product.stock <= 0)) return false;
    const old = linesRef.current;
    const found = old.find(line => line.product.documentId === product.documentId);
    if (product.stock != null && (found?.quantity ?? 0) >= product.stock) return false;
    commit(found
      ? old.map(line => line.product.documentId === product.documentId
          ? { product, quantity: line.quantity + 1 }
          : line)
      : [...old, { product, quantity: 1 }]);
    return true;
  }, [commit, hydrated]);

  const change = useCallback((documentId: string, difference: number) => {
    if (!hydrated) return;
    commit(linesRef.current.map(line => line.product.documentId !== documentId
      ? line
      : { ...line, quantity: Math.max(0, Math.min(line.product.stock ?? 999999, line.quantity + difference)) }
    ).filter(line => line.quantity > 0));
  }, [commit, hydrated]);

  const remove = useCallback((documentId: string) => {
    commit(linesRef.current.filter(line => line.product.documentId !== documentId));
  }, [commit]);

  const clear = useCallback(() => commit([]), [commit]);
  const clearRestaurant = useCallback((restaurantId: string) => {
    commit(linesRef.current.filter(line => line.product.restaurant?.documentId !== restaurantId));
  }, [commit]);

  const groups = useMemo(() => {
    const grouped = new Map<string, CartGroup>();
    for (const line of lines) {
      const restaurant = line.product.restaurant;
      if (!restaurant?.documentId) continue;
      let group = grouped.get(restaurant.documentId);
      if (!group) {
        group = {
          restaurantId: restaurant.documentId,
          restaurantName: restaurant.name || 'Restaurante',
          lines: [], itemCount: 0, originalSubtotal: 0, discount: 0, subtotal: 0,
        };
        grouped.set(restaurant.documentId, group);
      }
      group.lines.push(line);
      group.itemCount += line.quantity;
      const price = Number(line.product.price) || 0;
      const promotion = getProductActivePromotion(line.product);
      const calculation = calculatePromotionPrice(promotion, line.quantity, price);
      group.originalSubtotal += calculation.originalTotal;
      group.discount += calculation.discount;
      group.subtotal += calculation.finalTotal;
    }
    return [...grouped.values()];
  }, [lines]);

  const itemCount = useMemo(() => groups.reduce((sum, group) => sum + group.itemCount, 0), [groups]);
  const total = useMemo(() => groups.reduce((sum, group) => sum + group.subtotal, 0), [groups]);
  const restaurantId = groups.length === 1 ? groups[0].restaurantId : null;

  const value = useMemo(() => ({
    lines, groups, restaurantId, itemCount, total, hydrated,
    add, change, remove, clear, clearRestaurant,
  }), [lines, groups, restaurantId, itemCount, total, hydrated, add, change, remove, clear, clearRestaurant]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('El carrito necesita CartProvider.');
  return context;
}
