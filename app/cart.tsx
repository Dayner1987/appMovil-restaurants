import RestaurantPaymentQR from '@/components/RestaurantPaymentQR';
// app/cart.tsx
// Cada restaurante genera su propio pedido y recibo; jamás se mezclan cobros.
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useOrderCheckout } from '@/hooks/useOrderCheckout';
import type { PaymentMethod } from '@/types/payment.types';
import { PageHeading, MediaThumb, money, FetchStatus } from '@/components/client/CatalogUI';
import { calculatePromotionPrice, getProductActivePromotion, promotionShortLabel } from '@/utils/promotion-pricing';

const paymentOptions: { method: PaymentMethod; label: string; note: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { method: 'CASH', label: 'Efectivo', icon: 'cash-outline', note: 'Pago pendiente de confirmación' },
  { method: 'QR', label: 'Código QR', icon: 'qr-code-outline', note: 'Paga con el QR de cada restaurante' },
];

export default function CartScreen() {
  const { user } = useAuth();
  const { groups, itemCount, total, hydrated, change, remove, clearRestaurant } = useCart();
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);
  const { createOrderWithPayment } = useOrderCheckout();

  async function confirmOrders() {
    if (!user) { router.push('/login'); return; }
    if (!groups.length || !hydrated || lock.current) return;
    lock.current = true;
    setSubmitting(true);
    const completed: { restaurantId: string; orderId: string }[] = [];
    let failedRestaurant = '';
    let failedMessage = '';
    try {
      // Secuencial: si falla un restaurante, los que aún no se enviaron quedan intactos.
      // No reintentamos automáticamente una compra para evitar órdenes duplicadas.
      for (const group of groups) {
        try {
          const result = await createOrderWithPayment({
            restaurantDocumentId: group.restaurantId,
            userId: user.id,
            orderType: 'ONLINE',
            lines: group.lines.map(line => ({ product: line.product, quantity: line.quantity })),
            paymentMethod: method,
          });
          completed.push({ restaurantId: group.restaurantId, orderId: result.order.documentId });
          clearRestaurant(group.restaurantId);
        } catch (error) {
          failedRestaurant = group.restaurantName;
          failedMessage = error instanceof Error ? error.message : 'Error desconocido';
          break;
        }
      }
      if (completed.length === groups.length) {
        Toast.show({ type: 'success', text1: `${completed.length} pedido(s) registrados`, text2: 'Cada restaurante tiene su comprobante independiente.' });
        if (completed.length === 1) {
          router.replace({ pathname: '/order/[documentId]', params: { documentId: completed[0].orderId } });
        } else {
          router.replace('/(tabs)/orders');
        }
      } else if (completed.length) {
        Toast.show({ type: 'error', text1: `${completed.length} pedido(s) guardados`,
          text2: `No se pudo completar ${failedRestaurant}. Revisa Mis pedidos antes de reintentar.` });
      } else {
        Toast.show({ type: 'error', text1: `No se registró el pedido de ${failedRestaurant}`,
          text2: failedMessage || 'Verifica los productos y vuelve a intentar.' });
      }
    } finally {
      lock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <PageHeading title="Tu carrito" subtitle={`${itemCount} producto(s) · ${groups.length} restaurante(s)`} back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 46 }}>
        {!hydrated ? <FetchStatus loading /> : !groups.length ? (
          <View className="rounded-3xl bg-white px-4 py-8">
            {/* LOTTIE: Reemplaza este ícono por assets/lotties/carrito-vacio.json */}
            <Ionicons name="bag-outline" size={68} color="#9FB6A2" style={{ alignSelf: 'center' }} />
            <Text className="mt-4 text-center text-xl font-extrabold text-[#243528]">Tu carrito está esperando</Text>
            <Text className="mt-2 text-center text-sm text-[#748376]">Agrega productos de uno o más restaurantes.</Text>
            <Pressable onPress={() => router.push('/(tabs)/products')} className="mt-6 items-center rounded-2xl bg-[#2F6A46] py-4">
              <Text className="font-extrabold text-white">Explorar productos</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/orders')} className="mt-4 items-center py-3">
              <Text className="font-bold text-[#2F6A46]">Ver mis pedidos anteriores</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="mb-4 flex-row items-center gap-3 rounded-2xl bg-[#E6F2E7] p-4">
              <Ionicons name="receipt-outline" color="#2F6A46" size={25} />
              <Text className="flex-1 text-sm leading-5 text-[#375742]">
                {groups.length === 1 ? 'Recibirás un pedido de este restaurante.' : `Prepararemos ${groups.length} pedidos y comprobantes por separado, uno por restaurante.`}
              </Text>
            </View>
            {groups.map((group, index) => (
              <View key={group.restaurantId} className="mb-5 overflow-hidden rounded-3xl border border-[#E4EAE3] bg-white">
                <View className="flex-row items-center gap-3 bg-[#F0F5EE] p-4">
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#2F6A46]">
                    <Ionicons name="storefront-outline" size={23} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold uppercase tracking-widest text-[#718174]">Pedido {index + 1}</Text>
                    <Text className="text-base font-extrabold text-[#243528]">{group.restaurantName}</Text>
                  </View>
                  <Text className="text-sm font-bold text-[#2F6A46]">{group.itemCount} un.</Text>
                </View>
                {group.lines.map(line => (
                  <View key={line.product.documentId} className="flex-row gap-3 border-b border-[#F0F2EF] px-3 py-4">
                    <View style={{ width: 79, borderRadius: 15, overflow: 'hidden' }}>
                      <MediaThumb src={line.product.mainImage} height={86} icon="fast-food-outline" />
                    </View>
                    <View className="flex-1">
                      <Text numberOfLines={2} className="font-bold text-[#233127]">{line.product.name}</Text>
                      {(() => {
                        const promotion = getProductActivePromotion(line.product);
                        const pricing = calculatePromotionPrice(promotion, line.quantity, Number(line.product.price) || 0);
                        return (
                          <View className="mt-1">
                            {pricing.appliedPromotion ? <View className="mb-1 self-start rounded-full bg-[#FFF0E8] px-2 py-1"><Text className="text-[9px] font-extrabold text-[#D45E2A]">{promotionShortLabel(pricing.appliedPromotion)}</Text></View> : null}
                            <View className="flex-row flex-wrap items-center gap-2">
                              <Text className={`font-extrabold ${pricing.appliedPromotion ? 'text-[#D45E2A]' : 'text-[#2F6A46]'}`}>{money(pricing.finalTotal)}</Text>
                              {pricing.appliedPromotion ? <Text className="text-[10px] text-[#879188] line-through">{money(pricing.originalTotal)}</Text> : null}
                            </View>
                          </View>
                        );
                      })()}
                      <View className="mt-3 flex-row items-center gap-3">
                        <Pressable disabled={submitting} accessibilityLabel={`Quitar una unidad de ${line.product.name}`}
                          onPress={() => change(line.product.documentId, -1)} className="h-9 w-9 items-center justify-center rounded-xl bg-[#E7EFE6]">
                          <Ionicons name="remove" size={19} color="#2F6A46" />
                        </Pressable>
                        <Text className="min-w-5 text-center font-extrabold">{line.quantity}</Text>
                        <Pressable disabled={submitting || (line.product.stock != null && line.quantity >= line.product.stock)}
                          accessibilityLabel={`Agregar una unidad de ${line.product.name}`}
                          onPress={() => change(line.product.documentId, 1)} className="h-9 w-9 items-center justify-center rounded-xl bg-[#E7EFE6]">
                          <Ionicons name="add" size={19} color="#2F6A46" />
                        </Pressable>
                        <Pressable disabled={submitting} accessibilityLabel={`Eliminar ${line.product.name}`}
                          onPress={() => remove(line.product.documentId)} className="ml-auto p-2">
                          <Ionicons name="trash-outline" size={20} color="#A74E50" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
                <View className="flex-row items-center justify-between px-4 py-4">
                  <Text className="font-bold text-[#536155]">Subtotal del restaurante</Text>
                  <Text className="text-lg font-extrabold text-[#2F6A46]">{money(group.subtotal)}</Text>
                </View>
              </View>
            ))}
            <View className="rounded-3xl bg-white p-5">
              <Text className="text-lg font-extrabold text-[#243528]">¿Cómo quieres pagar?</Text>
              {paymentOptions.map(option => (
                <Pressable key={option.method} disabled={submitting} onPress={() => setMethod(option.method)}
                  className={`mt-3 flex-row items-center gap-3 rounded-2xl border p-3 ${method === option.method ? 'border-[#2F6A46] bg-[#ECF5ED]' : 'border-[#E6ECE5]'}`}>
                  <Ionicons name={option.icon} size={25} color="#2F6A46" />
                  <View className="flex-1">
                    <Text className="font-bold text-[#243528]">{option.label}</Text>
                    <Text className="mt-1 text-xs text-[#768279]">{option.note}</Text>
                  </View>
                  <Ionicons name={method === option.method ? 'radio-button-on' : 'radio-button-off'} color="#2F6A46" size={23} />
                </Pressable>
              ))}
            </View>
            {method === 'QR' ? groups.map(group => <RestaurantPaymentQR key={group.restaurantId} restaurantId={group.restaurantId} />) : null}
            <View className="mt-4 rounded-3xl bg-[#223F2F] p-5">
              <Text className="font-semibold text-[#D4EBDD]">Resumen · {groups.length} restaurante(s)</Text>
              {groups.map(group => <View key={group.restaurantId} className="mt-3 flex-row justify-between gap-3">
                <Text numberOfLines={1} className="flex-1 text-sm text-[#E9F2EC]">{group.restaurantName}</Text>
                <View className="items-end">
                  <Text className="font-bold text-white">{money(group.subtotal)}</Text>
                  {group.discount > 0 ? <Text className="text-[10px] text-[#F4C95D] line-through">{money(group.originalSubtotal)}</Text> : null}
                </View>
              </View>)}
              {groups.some(group => group.discount > 0) ? <View className="mt-3 flex-row justify-between border-t border-[#52715E] pt-3"><Text className="text-sm font-semibold text-[#F4C95D]">Ahorro por promociones</Text><Text className="font-bold text-[#F4C95D]">- {money(groups.reduce((sum, group) => sum + group.discount, 0))}</Text></View> : null}
              <View className="mt-4 flex-row items-center justify-between border-t border-[#52715E] pt-4">
                <Text className="text-lg font-bold text-white">Total productos</Text>
                <Text className="text-xl font-extrabold text-[#F4C95D]">{money(total)}</Text>
              </View>
              <Text className="mt-3 text-xs leading-5 text-[#CEDFD2]">Los gastos de envío, si corresponden, requieren cálculo y confirmación del restaurante. Este importe no incluye envío.</Text>
            </View>
            {!user ? (
              <View className="mt-4 rounded-2xl bg-[#E7F0E6] p-4">
                <Text className="text-center font-semibold text-[#2F6A46]">Tu carrito se conservará mientras ingresas o creas tu cuenta.</Text>
                <View className="mt-3 flex-row gap-2">
                  <Pressable onPress={() => router.push('/login')} className="flex-1 items-center rounded-xl border border-[#2F6A46] bg-white py-3">
                    <Text className="font-bold text-[#2F6A46]">Iniciar sesión</Text>
                  </Pressable>
                  <Pressable onPress={() => router.push('/register')} className="flex-1 items-center rounded-xl bg-[#2F6A46] py-3">
                    <Text className="font-bold text-white">Crear cuenta</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
            <Pressable disabled={submitting} onPress={() => void confirmOrders()}
              className={`mt-4 min-h-16 flex-row items-center justify-center rounded-2xl px-4 ${submitting ? 'bg-[#799985]' : 'bg-[#2F6A46]'}`}>
              {submitting ? <ActivityIndicator color="white" /> : <Ionicons name="checkmark-circle-outline" color="white" size={22} />}
              <Text className="ml-2 text-center text-base font-extrabold text-white">
                {submitting ? 'Registrando pedidos...' : user ? `Confirmar ${groups.length} pedido(s)` : 'Iniciar sesión para pedir'}
              </Text>
            </Pressable>
            <Text className="mt-3 text-center text-xs leading-5 text-[#7E8A80]">Cada pedido se crea con un pago pendiente. No se efectúa ningún cobro automático.</Text>
            <Pressable onPress={() => router.push('/(tabs)/orders')} className="mt-3 items-center py-3"><Text className="font-bold text-[#2F6A46]">Consultar mis pedidos</Text></Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
