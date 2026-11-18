// app/my-orders.tsx
// Cada tarjeta representa un pedido independiente y abre su propio comprobante.
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/order.service';
import type { Order } from '@/types/orders.types';
import { PageHeading, money, FetchStatus } from '@/components/client/CatalogUI';
import { errorText } from '@/hooks/useCatalog';
import { statusLabel } from '@/utils/status-labels';

export default function MyOrders() {
  const { user } = useAuth();
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!user) { setLoading(false); setItems([]); return; }
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const response = await orderService.findAll({ userId: user.id, pageSize: 100 });
      setItems(response.data.filter(order => order.users?.some(other => other.id === user.id) ?? true));
      setError(null);
    } catch (requestError) { setError(errorText(requestError)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user?.id]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <PageHeading title="Mis pedidos" subtitle="Cada restaurante genera un comprobante" back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 128 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2F6A46" />}>
        {!user ? <Pressable onPress={() => router.push('/login')} className="rounded-3xl bg-white p-6">
          <Text className="text-center font-semibold text-[#2F6A46]">Inicia sesión para consultar tus pedidos.</Text>
        </Pressable> : (
          <>
            <View className="mb-5 flex-row gap-3 rounded-2xl bg-[#E6F1E6] p-4">
              <Ionicons name="receipt-outline" size={25} color="#2F6A46" />
              <Text className="flex-1 text-sm leading-5 text-[#477052]">Si compraste en varios restaurantes, verás cada pedido con su propio total y estado.</Text>
            </View>
            {items.map(order => (
              <Pressable key={order.documentId}
                onPress={() => router.push({ pathname: '/order/[documentId]', params: { documentId: order.documentId } })}
                className="mb-3 overflow-hidden rounded-3xl border border-[#E3EAE2] bg-white">
                <View className="flex-row items-center gap-3 p-4">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F1E7]">
                    <Ionicons name="storefront-outline" size={23} color="#2F6A46" />
                  </View>
                  <View className="flex-1"><Text className="text-base font-extrabold text-[#243528]" numberOfLines={2}>{order.restaurant?.name || 'Restaurante'}</Text>
                    <Text className="mt-1 text-xs text-[#778479]">Comprobante {order.orderCode || order.documentId.slice(0, 8)}</Text></View>
                  <Ionicons name="chevron-forward" size={20} color="#2F6A46" />
                </View>
                <View className="flex-row items-center justify-between border-t border-[#ECF1EB] px-4 py-3">
                  <View className="rounded-full bg-[#F0F4EB] px-3 py-1"><Text className="text-xs font-bold text-[#607A5E]">{statusLabel(order.statusOrder, 'Pendiente')}</Text></View>
                  <Text className="text-lg font-extrabold text-[#2F6A46]">{money(order.total)}</Text>
                </View>
              </Pressable>
            ))}
            {(loading || error) ? <FetchStatus loading={loading} error={error} retry={() => void load()} /> : null}
            {!loading && !error && !items.length ? <FetchStatus loading={false} empty="Todavía no realizaste pedidos." /> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
