// app/my-orders.tsx
// Cada tarjeta representa un pedido independiente y abre su propio comprobante.
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/order.service';
import type { Order, OrderStatus } from '@/types/orders.types';
import { PageHeading, money, FetchStatus } from '@/components/client/CatalogUI';
import { errorText } from '@/hooks/useCatalog';
import { statusLabel } from '@/utils/status-labels';

export default function MyOrders() {
  const { user } = useAuth();
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const requestId = useRef(0);
  const userId = user?.id;
  const load = useCallback(async (refresh = false, targetPage = 1) => {
    const request = ++requestId.current;
    if (targetPage === 1 && !refresh) { setItems([]); setPage(0); setPages(0); }
    setError(null);
    if (!userId) { setItems([]); setLoading(false); return; }
    setRefreshing(refresh);
    setLoading(!refresh);
    try {
      const response = await orderService.history({ state: filter, page: targetPage });
      if (request !== requestId.current) return;
      setItems(previous => targetPage === 1 ? response.data :
        Array.from(new Map([...previous, ...response.data].map(item => [item.documentId, item])).values()));
      setPage(targetPage);
      setPages(response.meta.pagination.pageCount);
    } catch (e) {
      if (request === requestId.current) setError(errorText(e));
    } finally {
      if (request === requestId.current) { setLoading(false); setRefreshing(false); }
    }
  }, [filter, userId]);
  useFocusEffect(useCallback(() => {
    void load();
    return () => { requestId.current += 1; };
  }, [load]));

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <PageHeading title="Historial de pedidos" subtitle="Del más reciente al más antiguo" back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 128 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2F6A46" />}>
        {!user ? <Pressable onPress={() => router.push('/login')} className="rounded-3xl bg-white p-6">
          <Text className="text-center font-semibold text-[#2F6A46]">Inicia sesión para consultar tus pedidos.</Text>
        </Pressable> : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {([undefined, 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as const).map(value => (
                <Pressable key={value || 'all'} onPress={() => setFilter(value)} accessibilityState={{ selected: value === filter }}
                  className={`mr-2 rounded-full px-4 py-2 ${value === filter ? 'bg-[#2F6A46]' : 'bg-white'}`}>
                  <Text className={value === filter ? 'font-bold text-white' : 'text-[#345541]'}>{value ? statusLabel(value) : 'Todos'}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {items.map(order => (
              <Pressable key={order.documentId}
                onPress={() => router.push({ pathname: '/order/[documentId]', params: { documentId: order.documentId } })}
                className="mb-3 overflow-hidden rounded-3xl border border-[#E3EAE2] bg-white">
                <View className="flex-row items-center gap-3 p-4">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F1E7]">
                    <Ionicons name="storefront-outline" size={23} color="#2F6A46" />
                  </View>
                  <View className="flex-1"><Text className="text-base font-extrabold text-[#243528]" numberOfLines={2}>{order.restaurant?.name || 'Restaurante'}</Text>
                    <Text className="mt-1 text-xs text-[#778479]">{new Date(order.orderedAt || order.createdAt).toLocaleDateString('es-BO')} · {order.orderCode || order.documentId.slice(0, 8)}</Text></View>
                  <Ionicons name="chevron-forward" size={20} color="#2F6A46" />
                </View>
                <View className="flex-row items-center justify-between border-t border-[#ECF1EB] px-4 py-3">
                  <View className="rounded-full bg-[#F0F4EB] px-3 py-1"><Text className="text-xs font-bold text-[#607A5E]">{statusLabel(order.statusOrder, 'Pendiente')}</Text></View>
                  <Text className="text-lg font-extrabold text-[#2F6A46]">{money(order.total)}</Text>
                </View>
              </Pressable>
            ))}
            {!loading && !refreshing && page < pages && <Pressable onPress={() => void load(false, page + 1)} className="rounded-xl bg-white p-3"><Text className="text-center font-bold text-[#2F6A46]">Ver más pedidos</Text></Pressable>}
            {(loading || error) ? <FetchStatus loading={loading} error={error} retry={() => void load()} /> : null}
            {!loading && !error && !items.length ? <FetchStatus loading={false} empty={filter ? 'No tienes pedidos con este estado.' : 'Todavía no realizaste pedidos.'} /> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
