// components/admin/SalesChart.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { paymentService } from '@/services/payment.service';
import type { Payment } from '@/types/payment.types';
import { errorText } from '@/hooks/useCatalog';
import { money } from '@/components/client/CatalogUI';

/** Only approved payments count as revenue. No invented sales figures. */
export default function AdminSalesChart() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { const response = await paymentService.findAll({ pageSize: 100 }); setPayments(response.data); setError(null); }
    catch (e) { setError(errorText(e)); } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - 6 + i);
    const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
    const value = payments.filter(x => x.statusPayment === 'APPROVED' && (x.paidAt || x.createdAt || '').startsWith(key)).reduce((sum, x) => sum + Number(x.amount || 0), 0);
    return {key, label: ['D','L','M','M','J','V','S'][date.getDay()], value};
  }), [payments]);
  const max = Math.max(...days.map(x => x.value), 1);
  const total = days.reduce((n, x) => n + x.value, 0);
  return <View className="rounded-3xl bg-white p-5"><View className="flex-row items-center justify-between gap-3"><View className="flex-row items-center gap-3"><View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF3E3]"><Ionicons name="stats-chart-outline" size={23} color="#607B35" /></View><View><Text className="text-lg font-extrabold text-[#252A20]">Ventas de la semana</Text><Text className="text-xs text-[#858A7A]">Pagos aprobados · últimos 7 días</Text></View></View></View>
    {loading ? <ActivityIndicator color="#607B35" style={{marginVertical:24}}/> : error ? <Text className="my-5 text-sm text-[#B04C4C]">{error}</Text> : <><Text className="mt-4 text-2xl font-extrabold text-[#607B35]">{money(total)}</Text><View className="mt-5 h-[155px] flex-row items-end justify-around gap-2 rounded-2xl bg-[#FAFBF7] px-2 pb-3 pt-4">{days.map(x=><View key={x.key} className="flex-1 items-center justify-end"><View className="w-6 justify-end overflow-hidden rounded-full bg-[#DDE9C5]" style={{height:112}}><View className="w-full rounded-full bg-[#607B35]" style={{height:(x.value/max)*112}} /></View><Text className="mt-2 text-xs font-semibold text-[#777D71]">{x.label}</Text></View>)}</View><Text className="mt-3 text-xs text-[#858A7A]">{payments.length >= 100 ? 'Mostrando pagos entre los primeros 100 registros. Ajusta la paginación para informes completos.' : 'Los pagos pendientes no se contabilizan como ventas.'}</Text></>}
  </View>;
}
