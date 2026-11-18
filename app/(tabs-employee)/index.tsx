import { useCallback, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmployeeScreenHeader from '@/components/employee/EmployeeScreenHeader';
import { useEmployeeContext } from '@/hooks/useEmployeeContext';
import { useEmployeeShift } from '@/hooks/useEmployeeShift';
import Toast from 'react-native-toast-message';
import { employeeOperationsService } from '@/services/employee-operations.service';
import type { EmployeeOrder } from '@/types/employee.types';

const GREEN = '#617D34';
const money = (value: unknown) => `Bs ${Number(value ?? 0).toFixed(2)}`;
const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmada', PREPARING: 'Preparando',
  READY: 'Lista', COMPLETED: 'Completada', CANCELLED: 'Cancelada',
};

export default function EmployeeHomeScreen() {
  const { user, restaurantDocumentId, restaurantName, loading: contextLoading } = useEmployeeContext();
  const {
    shift,
    hasOpenShift,
    loading: shiftLoading,
    saving: shiftSaving,
    error: shiftError,
    refresh: refreshShift,
    startShift,
    closeShift,
  } = useEmployeeShift({ autoLoad: true });
  const [orders, setOrders] = useState<EmployeeOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!restaurantDocumentId) { setOrders([]); return; }
    setLoading(true);
    try {
      const response = await employeeOperationsService.findOrders({
        restaurantDocumentId, page: 1, pageSize: 100,
      });
      setOrders(response.data);
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron consultar las órdenes.'); }
    finally { setLoading(false); }
  }, [restaurantDocumentId]);

  useFocusEffect(useCallback(() => {
    void load();
    void refreshShift().catch(() => undefined);
    return undefined;
  }, [load, refreshShift]));

  const handleShiftAction = async () => {
    try {
      if (hasOpenShift) {
        await closeShift();
        Toast.show({ type: 'success', text1: 'Jornada cerrada', text2: 'Tu jornada se cerró correctamente.', position: 'bottom' });
      } else {
        await startShift();
        Toast.show({ type: 'success', text1: 'Jornada iniciada', text2: 'Tu jornada está abierta. Ya puedes gestionar órdenes.', position: 'bottom' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No se pudo actualizar la jornada', text2: e instanceof Error ? e.message : 'Intenta nuevamente.', position: 'bottom' });
    }
  };
  const activeOrders = orders.filter(item => item.statusOrder !== 'COMPLETED' && item.statusOrder !== 'CANCELLED');
  const pendingOrders = activeOrders.filter(item => item.statusOrder === 'PENDING').length;
  const readyOrders = activeOrders.filter(item => item.statusOrder === 'READY').length;
  const name = user?.firstName?.trim() || user?.username || 'Equipo';

  return <SafeAreaView edges={['top']} className="flex-1 bg-[#F7F8F2]">
    <EmployeeScreenHeader title="Mi jornada" subtitle={restaurantName} icon="briefcase-outline" onAction={() => { void load(); void refreshShift().catch(() => undefined); }} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 55 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); try { await Promise.all([load(), refreshShift().catch(() => undefined)]); } finally { setRefreshing(false); } }} tintColor={GREEN} />}
    >
      <View className="overflow-hidden rounded-[28px] bg-[#617D34] p-5">
        <View className="absolute -right-5 -top-9 h-36 w-36 rounded-full bg-white/10" />
        <View className="flex-row items-center"><Ionicons name="sunny-outline" color="#FFFFFF" size={21} /><Text className="ml-2 text-xs font-semibold text-white/80">Panel del empleado</Text></View>
        <Text className="mt-3 text-[27px] font-extrabold text-white">¡Hola, {name}!</Text>
        <Text className="mt-2 text-sm leading-5 text-white/85">Gestiona tus pedidos, productos y ventas desde un solo lugar.</Text>
        <View className="mt-4 flex-row items-center rounded-2xl bg-white/15 p-3">
          <Ionicons name="storefront-outline" size={21} color="#FFFFFF" />
          <Text numberOfLines={1} className="ml-2 flex-1 font-bold text-white">{restaurantName}</Text>
        </View>
      </View>

      <View className="mt-4 rounded-[24px] bg-white p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#20291B]">Estado de mi jornada</Text>
            <Text className="mt-1 text-sm text-[#788473]">
              {shiftLoading
                ? 'Consultando jornada...'
                : hasOpenShift
                  ? `Abierta desde ${shift?.startedAt ? new Date(shift.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'hoy'}`
                  : 'No tienes una jornada abierta.'}
            </Text>
          </View>
          <View className={`h-3 w-3 rounded-full ${hasOpenShift ? 'bg-[#5E9B55]' : 'bg-[#D6A34A]'}`} />
        </View>

        {shiftError ? (
          <Pressable onPress={() => void refreshShift().catch(() => undefined)} className="mt-3 rounded-xl bg-[#FFF1EF] p-3">
            <Text className="text-sm font-semibold text-[#A95651]">{shiftError}</Text>
            <Text className="mt-1 text-xs font-bold text-[#A95651]">Toca para volver a consultar.</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => void handleShiftAction()}
          disabled={shiftLoading || shiftSaving || contextLoading || !restaurantDocumentId}
          className={`mt-4 flex-row items-center justify-center rounded-2xl py-3.5 ${hasOpenShift ? 'bg-[#FBECEA]' : 'bg-[#617D34]'} ${(shiftLoading || shiftSaving || !restaurantDocumentId) ? 'opacity-60' : ''}`}
        >
          {(shiftLoading || shiftSaving) ? (
            <ActivityIndicator size="small" color={hasOpenShift ? '#A95651' : '#FFFFFF'} />
          ) : (
            <Ionicons name={hasOpenShift ? 'lock-closed-outline' : 'play-circle-outline'} size={19} color={hasOpenShift ? '#A95651' : '#FFFFFF'} />
          )}
          <Text className={`ml-2 font-extrabold ${hasOpenShift ? 'text-[#A95651]' : 'text-white'}`}>
            {shiftSaving ? 'Procesando...' : hasOpenShift ? 'Cerrar jornada' : 'Abrir jornada'}
          </Text>
        </Pressable>
      </View>

      {!contextLoading && !restaurantDocumentId ? (
        <View className="mt-4 rounded-2xl bg-[#FFF0DC] p-4">
          <Text className="font-bold text-[#96621E]">No aparece un restaurante asignado</Text>
          <Text className="mt-1 text-sm text-[#96621E]">Solicita al propietario que revise la asociación de tu cuenta.</Text>
        </View>
      ) : null}

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 rounded-[22px] bg-white p-4"><Ionicons name="time-outline" size={23} color={GREEN}/><Text className="mt-2 text-[27px] font-extrabold text-[#20291B]">{pendingOrders}</Text><Text className="text-xs font-medium text-[#788473]">Por confirmar</Text></View>
        <View className="flex-1 rounded-[22px] bg-white p-4"><Ionicons name="checkmark-done-outline" size={23} color={GREEN}/><Text className="mt-2 text-[27px] font-extrabold text-[#20291B]">{readyOrders}</Text><Text className="text-xs font-medium text-[#788473]">Listas para entregar</Text></View>
      </View>

      <Text className="mb-3 mt-6 text-lg font-extrabold text-[#20291B]">Accesos rápidos</Text>
      <View className="flex-row flex-wrap justify-between">
        {[
          { label: 'Órdenes', detail: 'Gestionar pedidos', icon: 'receipt-outline' as const, url: '/(tabs-employee)/orders' as const },
          { label: 'Productos', detail: 'Ver disponibilidad', icon: 'fast-food-outline' as const, url: '/(tabs-employee)/products' as const },
          { label: 'Ventas', detail: 'Ver cobros', icon: 'wallet-outline' as const, url: '/(tabs-employee)/sales' as const },
          { label: 'Nueva orden', detail: 'Registrar venta', icon: 'add-circle-outline' as const, url: '/others/employee/CreateOrder' as const },
        ].map(link => (
          <Pressable key={link.label} onPress={() => router.push(link.url)} className="mb-3 w-[48%] rounded-[22px] bg-white p-4 active:opacity-80">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF3E6]"><Ionicons name={link.icon} size={23} color={GREEN} /></View>
            <Text className="mt-3 text-[15px] font-extrabold text-[#20291B]">{link.label}</Text>
            <Text className="mt-1 text-[11px] text-[#8A9285]">{link.detail}</Text>
          </Pressable>
        ))}
      </View>

      <View className="mb-3 mt-3 flex-row items-center justify-between">
        <Text className="text-lg font-extrabold text-[#20291B]">Órdenes activas</Text>
        <Pressable onPress={() => router.push('/(tabs-employee)/orders')}><Text className="text-xs font-bold text-[#617D34]">Ver todas</Text></Pressable>
      </View>
      {loading && orders.length === 0 ? <ActivityIndicator color={GREEN} className="my-6" /> : null}
      {error ? <Pressable onPress={() => void load()} className="rounded-2xl bg-[#FFF1EF] p-4"><Text className="font-semibold text-[#A95651]">{error}</Text><Text className="mt-1 text-xs font-bold text-[#A95651]">Toca para reintentar</Text></Pressable> : null}
      {!loading && !error && activeOrders.length === 0 ? <View className="items-center rounded-3xl bg-white p-7"><Ionicons name="checkmark-circle-outline" size={34} color={GREEN}/><Text className="mt-2 font-bold text-[#20291B]">No hay órdenes activas</Text><Text className="mt-1 text-center text-xs text-[#8A9285]">Las nuevas órdenes aparecerán aquí.</Text></View> : null}
      {activeOrders.slice(0, 4).map(order => (
        <Pressable key={order.documentId} onPress={() => router.push('/(tabs-employee)/orders')} className="mb-3 flex-row items-center rounded-[20px] bg-white p-4 active:opacity-80">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF3E6]"><Ionicons name="receipt-outline" size={21} color={GREEN}/></View>
          <View className="ml-3 flex-1"><Text className="font-bold text-[#20291B]">{order.orderCode}</Text><Text className="mt-1 text-xs text-[#889284]">{statusLabel[order.statusOrder ?? ''] || order.statusOrder || 'Pendiente'}</Text></View>
          <Text className="font-extrabold text-[#617D34]">{money(order.total)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  </SafeAreaView>;
}
