import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import type { Order } from '@/types/orders.types';
import { money } from '@/components/client/CatalogUI';
import { statusLabel } from '@/utils/status-labels';

interface Props {
  order: Order;
  onOpen: () => void;
  onCancel?: () => void;
  onReceipt?: () => void;
  cancelling?: boolean;
  generatingReceipt?: boolean;
}

function formatDate(value?: string | null) {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return date.toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CustomerOrderCard({ order, onOpen, onCancel, onReceipt, cancelling = false, generatingReceipt = false }: Props) {
  const isCompleted = order.statusOrder === 'COMPLETED';
  const isCancelled = order.statusOrder === 'CANCELLED';
  const canCancel = order.statusOrder === 'PENDING' && order.paymentStatus !== 'PAID' && Boolean(onCancel);
  const itemCount = order.order_items?.reduce((total, item) => total + Math.max(0, Number(item.quantity) || 0), 0) ?? 0;
  const statusColor = isCompleted ? '#2F6A46' : isCancelled ? '#A34E48' : '#A66B24';
  const statusBg = isCompleted ? '#E8F3E9' : isCancelled ? '#F9ECEA' : '#FFF4E2';

  return (
    <View className="mb-4 overflow-hidden rounded-[26px] border border-[#E5ECE3] bg-white">
      <Pressable onPress={onOpen} className="p-4 active:opacity-80">
        <View className="flex-row items-start gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2E9]">
            <Ionicons name="storefront-outline" size={23} color="#2F6A46" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#26382A]" numberOfLines={1}>{order.restaurant?.name || 'Restaurante'}</Text>
            <Text className="mt-1 text-xs text-[#839084]">{order.orderCode || `Pedido ${order.documentId.slice(0, 8)}`}</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color="#829184" />
        </View>
        <View className="mt-4 flex-row flex-wrap items-center gap-2">
          <View style={{ backgroundColor: statusBg }} className="rounded-full px-3 py-1.5">
            <Text style={{ color: statusColor }} className="text-xs font-extrabold">{statusLabel(order.statusOrder, 'Pendiente')}</Text>
          </View>
          <View className="rounded-full bg-[#F2F4EF] px-3 py-1.5">
            <Text className="text-xs font-semibold text-[#68776B]">Pago: {statusLabel(order.paymentStatus, 'Pendiente')}</Text>
          </View>
        </View>
        <View className="mt-4 flex-row items-center justify-between border-t border-[#EEF1EC] pt-3">
          <View>
            <Text className="text-xs text-[#8A958B]">{formatDate(order.orderedAt || order.createdAt)}</Text>
            <Text className="mt-1 text-xs text-[#758277]">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</Text>
          </View>
          <Text className="text-lg font-extrabold text-[#2F6A46]">{money(order.total)}</Text>
        </View>
      </Pressable>

      {(canCancel || (isCompleted && onReceipt)) ? (
        <View className="flex-row gap-2 border-t border-[#EEF1EC] p-3">
          {canCancel ? (
            <Pressable disabled={cancelling} onPress={onCancel} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#F9ECEA] py-3">
              <Ionicons name="close-circle-outline" size={17} color="#A34E48" />
              <Text className="text-xs font-extrabold text-[#A34E48]">{cancelling ? 'Cancelando...' : 'Cancelar pedido'}</Text>
            </Pressable>
          ) : null}
          {isCompleted && onReceipt ? (
            <Pressable disabled={generatingReceipt} onPress={onReceipt} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#2F6A46] py-3">
              <Ionicons name="download-outline" size={17} color="#FFFFFF" />
              <Text className="text-xs font-extrabold text-white">{generatingReceipt ? 'Preparando PDF...' : 'Descargar recibo'}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {order.statusOrder === 'PENDING' && order.paymentStatus === 'PAID' ? (
        <View className="border-t border-[#EEF1EC] bg-[#FFFAF0] px-4 py-3">
          <Text className="text-xs leading-5 text-[#8A6A3D]">El pago ya fue aprobado. Para cancelar esta orden, comunícate con el restaurante.</Text>
        </View>
      ) : null}
    </View>
  );
}
