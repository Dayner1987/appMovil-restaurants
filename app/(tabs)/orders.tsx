import ReceiptCompanyLogo from '@/components/orders/ReceiptCompanyLogo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/hooks/useAuth';
import { customerOrdersService } from '@/services/customer-orders.service';
import type { Order } from '@/types/orders.types';
import { errorText } from '@/hooks/useCatalog';
import { FetchStatus, PageHeading } from '@/components/client/CatalogUI';
import OrdersGuestState from '@/components/orders/OrdersGuestState';
import OrderStatusSelector, { type CustomerOrderTab } from '@/components/orders/OrderStatusSelector';
import CustomerOrderCard from '@/components/orders/CustomerOrderCard';
import { openCompletedOrderReceipt } from '@/config/generate.order-receipt';

function tabForOrder(order: Order): CustomerOrderTab {
  if (order.statusOrder === 'COMPLETED') return 'COMPLETED';
  if (order.statusOrder === 'CANCELLED') return 'CANCELLED';
  return 'PENDING';
}

export default function CustomerOrdersTab() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<CustomerOrderTab>('PENDING');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!user?.id) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const result = await customerOrdersService.findMine(user.id);
      setOrders(result);
      setError(null);
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const grouped = useMemo(() => ({
    PENDING: orders.filter(order => tabForOrder(order) === 'PENDING'),
    COMPLETED: orders.filter(order => tabForOrder(order) === 'COMPLETED'),
    CANCELLED: orders.filter(order => tabForOrder(order) === 'CANCELLED'),
  }), [orders]);

  const cancel = useCallback((order: Order) => {
    Alert.alert(
      'Cancelar pedido',
      `¿Deseas cancelar el pedido ${order.orderCode || ''}? Esta acción cambiará su estado a cancelado.`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setCancellingId(order.documentId);
              try {
                await customerOrdersService.cancelPending(order);
                Toast.show({ type: 'success', text1: 'Pedido cancelado', text2: 'Se actualizó el estado de tu orden.' });
                await load(true);
                setSelectedTab('CANCELLED');
              } catch (requestError) {
                Toast.show({ type: 'error', text1: 'No se pudo cancelar', text2: errorText(requestError) });
              } finally {
                setCancellingId(null);
              }
            })();
          },
        },
      ],
    );
  }, [load]);

  const downloadReceipt = useCallback(async (order: Order) => {
    setReceiptId(order.documentId);
    try {
      await openCompletedOrderReceipt(order);
      Toast.show({ type: 'success', text1: 'Recibo preparado', text2: 'Puedes guardar o compartir el PDF desde las opciones del dispositivo.' });
    } catch (requestError) {
      Toast.show({ type: 'error', text1: 'No se pudo generar el recibo', text2: errorText(requestError) });
    } finally {
      setReceiptId(null);
    }
  }, []);

  if (authLoading) {
    return <View className="flex-1 items-center justify-center bg-[#F7F8F2]"><ActivityIndicator size="large" color="#2F6A46" /><Text className="mt-3 text-sm text-[#788579]">Verificando tu sesión...</Text></View>;
  }

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <PageHeading title="Mis órdenes" subtitle="Consulta el estado y los recibos de tus pedidos" />
      {!user ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 125 }}><OrdersGuestState /></ScrollView> : (
        <>
          <View className="mx-5 mb-4 flex-row items-center gap-3 rounded-2xl bg-[#E8F1E7] p-4">
            <ReceiptCompanyLogo />
            <View className="flex-1"><Text className="font-extrabold text-[#2E5037]">Tu historial de compras</Text><Text className="mt-1 text-xs leading-5 text-[#718272]">Aquí solo aparecen las órdenes asociadas a tu cuenta.</Text></View>
          </View>
          <OrderStatusSelector selected={selectedTab} counts={{ PENDING: grouped.PENDING.length, COMPLETED: grouped.COMPLETED.length, CANCELLED: grouped.CANCELLED.length }} onSelect={setSelectedTab} />
          <ScrollView showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2F6A46" />}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 130 }}>
            {loading ? <FetchStatus loading /> : null}
            {!loading && error ? <FetchStatus loading={false} error={error} retry={() => void load()} /> : null}
            {!loading && !error && grouped[selectedTab].length === 0 ? (
              <View className="items-center rounded-[26px] border border-[#E5ECE3] bg-white px-6 py-10">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EAF2E9]"><Ionicons name={selectedTab === 'COMPLETED' ? 'checkmark-done-outline' : selectedTab === 'CANCELLED' ? 'close-circle-outline' : 'receipt-outline'} size={31} color="#5C8063" /></View>
                <Text className="mt-4 text-center text-base font-extrabold text-[#2B3D2E]">{selectedTab === 'PENDING' ? 'No tienes órdenes pendientes' : selectedTab === 'COMPLETED' ? 'Todavía no tienes órdenes completadas' : 'No tienes órdenes canceladas'}</Text>
                <Text className="mt-2 text-center text-sm leading-5 text-[#879287]">Cuando realices pedidos, aparecerán aquí automáticamente.</Text>
                <Pressable onPress={() => router.push('/(tabs)/restaurants')} className="mt-5 rounded-xl bg-[#2F6A46] px-5 py-3"><Text className="font-bold text-white">Explorar restaurantes</Text></Pressable>
              </View>
            ) : null}
            {!loading && !error ? grouped[selectedTab].map(order => (
              <CustomerOrderCard key={order.documentId} order={order}
                onOpen={() => router.push({ pathname: '/order/[documentId]', params: { documentId: order.documentId } })}
                onCancel={order.statusOrder === 'PENDING' && order.paymentStatus !== 'PAID' ? () => cancel(order) : undefined}
                onReceipt={order.statusOrder === 'COMPLETED' ? () => void downloadReceipt(order) : undefined}
                cancelling={cancellingId === order.documentId}
                generatingReceipt={receiptId === order.documentId}
              />
            )) : null}
          </ScrollView>
        </>
      )}
    </View>
  );
}
