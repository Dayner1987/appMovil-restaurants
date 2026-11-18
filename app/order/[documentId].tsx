import { openCompletedOrderReceipt } from '@/config/generate.order-receipt';
import Toast from 'react-native-toast-message';
import RestaurantPaymentQR from '@/components/RestaurantPaymentQR';
// app/order/[documentId].tsx
// Recibo independiente por restaurante (pago pendiente, no factura fiscal).
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { orderService } from '@/services/order.service';
import { useAuth } from '@/hooks/useAuth';
import type { Order } from '@/types/orders.types';
import { PageHeading, FetchStatus, money } from '@/components/client/CatalogUI';
import { errorText } from '@/hooks/useCatalog';
import { statusLabel } from '@/utils/status-labels';

export default function MyOrderDetails() {
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!documentId || !user) { setLoading(false); return; }
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const response = await orderService.history({ documentId });
      const result = response.data[0];
      if (!result) throw new Error('No se encontró este pedido en tu historial.');
      setOrder(result);
      setError(null);
    } catch (requestError) { setOrder(null); setError(errorText(requestError)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [documentId, user?.id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <PageHeading title="Detalle del pedido" subtitle="Comprobante de un solo restaurante" back />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 126 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2F6A46" />}>
        {!user ? <Pressable onPress={() => router.push('/login')} className="rounded-2xl bg-white p-5">
          <Text className="font-semibold text-[#2F6A46]">Debes iniciar sesión para ver este comprobante.</Text>
        </Pressable> : order ? (
          <>
            <View className="overflow-hidden rounded-3xl border border-[#E6EDE5] bg-white">
              <View className="items-center bg-[#234C34] px-5 py-6">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#3D6F4E]">
                  <Ionicons name="receipt-outline" size={30} color="white" />
                </View>
                <Text className="mt-3 text-xl font-extrabold text-white">Comprobante de pedido</Text>
                <Text className="mt-2 text-sm text-[#CCE3D2]">{order.orderCode || order.documentId}</Text>
              </View>
              <View className="p-5">
                <Text className="text-xs font-bold uppercase tracking-widest text-[#758878]">Restaurante</Text>
                <Text className="mt-2 text-xl font-extrabold text-[#253728]">{order.restaurant?.name || 'Restaurante'}</Text>
                <View className="mt-5 flex-row justify-between"><Text className="text-sm text-[#6C7D70]">Estado del pedido</Text>
                  <Text className="font-bold text-[#2F6A46]">{statusLabel(order.statusOrder, 'Pendiente')}</Text></View>
                <View className="mt-3 flex-row justify-between"><Text className="text-sm text-[#6C7D70]">Estado del pago</Text>
                  <Text className="font-bold text-[#2F6A46]">{statusLabel(order.paymentStatus, 'Pendiente')}</Text></View>
                <View className="mt-5 border-t border-dashed border-[#CCD9CC] pt-5">
                  <Text className="mb-3 text-base font-extrabold text-[#253728]">Productos</Text>
                  {order.order_items?.map((line, index) => (
                    <View key={line.documentId || String(index)} className="mb-3 flex-row justify-between gap-3">
                      <Text className="flex-1 text-sm text-[#647366]">{line.quantity} × {line.productName || 'Producto'}</Text>
                      <Text className="font-semibold text-[#28392C]">{money(line.subtotal)}</Text>
                    </View>
                  ))}
                  {!order.order_items?.length ? <Text className="text-sm text-[#859287]">Sin detalle de productos.</Text> : null}
                </View>
                <View className="mt-3 flex-row items-center justify-between border-t border-dashed border-[#CCD9CC] pt-5">
                  <Text className="text-base font-bold text-[#253728]">Total</Text>
                  <Text className="text-2xl font-extrabold text-[#2F6A46]">{money(order.total)}</Text>
                </View>
              </View>
            </View>
            {order.paymentStatus !== 'PAID' && order.payments?.some(payment => payment.method === 'QR') && order.restaurant?.documentId ? <RestaurantPaymentQR restaurantId={order.restaurant.documentId} /> : null}
            {order.statusOrder === 'COMPLETED' && (
              <Pressable disabled={exporting} onPress={async () => {
                setExporting(true);
                try { await openCompletedOrderReceipt(order, true); }
                catch (e) { Toast.show({ type: 'error', text1: 'No se pudo guardar el recibo', text2: errorText(e) }); }
                finally { setExporting(false); }
              }} className="mt-4 items-center rounded-2xl bg-[#2F6A46] py-4">
                <Text className="font-bold text-white">{exporting ? 'Preparando PDF…' : 'Descargar recibo PDF'}</Text>
              </Pressable>
            )}
            <Text className="mt-4 text-center text-xs leading-5 text-[#829083]">Este es un comprobante de pedido, no una factura fiscal. {order.paymentStatus === 'PAID' ? 'Pago confirmado.' : 'Pago pendiente de confirmación.'}</Text>
            <Pressable onPress={() => router.push('/my-orders')} className="mt-5 items-center rounded-2xl bg-[#E3F0E4] py-4">
              <Text className="font-extrabold text-[#2F6A46]">Ver todos mis pedidos</Text>
            </Pressable>
          </>
        ) : null}
        {(loading || error) ? <FetchStatus loading={loading} error={error} retry={() => void load()} /> : null}
      </ScrollView>
    </View>
  );
}
