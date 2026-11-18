// components/client/CatalogUI.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { mediaUrl } from '@/utils/media';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types/product.types';
import type { Restaurant } from '@/types/restaurant.types';
import type { Publication } from '@/types/publication.types';
import type { Promotion } from '@/types/promotion.types';
import { calculatePromotionPrice, getProductActivePromotion, promotionShortLabel } from '@/utils/promotion-pricing';

export const money = (value: unknown) => `Bs ${Number(value || 0).toFixed(2)}`;
export function MediaThumb({ src, height = 150, icon = 'image-outline' }: { src: unknown; height?: number; icon?: keyof typeof Ionicons.glyphMap }) {
  const uri = mediaUrl(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  return <View style={{ height, width: '100%' }} className="overflow-hidden items-center justify-center bg-[#EEF3E3]">
    {uri && !failed ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" onError={() => setFailed(true)} /> : <Ionicons name={icon} color="#82976B" size={40} />}
  </View>;
}
export function PageHeading({ title, subtitle, back = false }: { title: string; subtitle?: string; back?: boolean }) {
  return <View className="mb-4 flex-row items-center gap-3 px-5 pt-5">
    {back ? <Pressable accessibilityLabel="Volver" onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-2xl bg-white active:opacity-70"><Ionicons name="arrow-back" size={22} color="#252A20" /></Pressable> : null}
    <View className="flex-1"><Text className="text-[24px] font-extrabold text-[#252A20]">{title}</Text>{subtitle ? <Text className="mt-1 text-[13px] text-[#858A7A]">{subtitle}</Text> : null}</View>
  </View>;
}
export function CartShortcut() {
  const { itemCount } = useCart();
  return <Pressable onPress={() => router.push('/cart')} accessibilityLabel="Abrir carrito" className="h-11 min-w-11 flex-row items-center justify-center rounded-2xl bg-[#2F6A46] px-2 active:opacity-75">
    <Ionicons name="cart-outline" color="#FFFFFF" size={20} />
    {itemCount > 0 ? <Text className="ml-1 font-bold text-white">{itemCount}</Text> : null}
  </Pressable>;
}
export function FetchStatus({ loading, error, empty, retry }: { loading: boolean; error?: string | null; empty?: string; retry?: () => void }) {
  return <View className="m-5 items-center rounded-3xl bg-white px-5 py-10">
    {loading ? <ActivityIndicator size="large" color="#607B35" /> : <Ionicons name={error ? 'cloud-offline-outline' : 'restaurant-outline'} size={44} color="#A3B38D" />}
    <Text className="mt-3 text-center text-sm text-[#747A6E]">{loading ? 'Cargando desde Strapi...' : error || empty || 'Todavía no hay información.'}</Text>
    {!loading && error && retry ? <Pressable onPress={retry} className="mt-4 rounded-xl bg-[#607B35] px-5 py-3"><Text className="font-bold text-white">Reintentar</Text></Pressable> : null}
  </View>;
}
export function GuestNotice() {
  return <View className="mx-5 my-3 rounded-3xl border border-[#D7E5C1] bg-[#EEF3E3] p-5">
    <Text className="text-base font-extrabold text-[#343A30]">¿Te gustó lo que ves?</Text>
    <Text className="mt-1 text-[13px] leading-5 text-[#6F765F]">Crea tu cuenta para realizar pedidos y consultar su estado.</Text>
    <View className="mt-4 flex-row gap-2">
      <Pressable onPress={() => router.push('/register')} className="flex-1 items-center rounded-xl bg-[#607B35] py-3"><Text className="font-bold text-white">Crear cuenta</Text></Pressable>
      <Pressable onPress={() => router.push('/login')} className="flex-1 items-center rounded-xl border border-[#BAC4AA] bg-white py-3"><Text className="font-bold text-[#607B35]">Iniciar sesión</Text></Pressable>
    </View>
  </View>;
}
export function ProductTile({ product }: { product: Product }) {
  const { add } = useCart();
  const available = product.isAvailable && (product.stock == null || product.stock > 0);
  const promotion = getProductActivePromotion(product);
  const price = calculatePromotionPrice(promotion, 1, Number(product.price) || 0);
  const isPromoted = Boolean(price.appliedPromotion);
  return <Pressable onPress={() => router.push({ pathname: '/product/[documentId]', params: { documentId: product.documentId } })} className={`relative mb-3 flex-row overflow-hidden rounded-3xl bg-white active:opacity-85 ${isPromoted ? 'border-2 border-[#E56B37]' : 'border border-transparent'}`}>
    <View className="w-[116px]"><MediaThumb src={product.mainImage} height={142} icon="fast-food-outline" /></View>
    <View className="flex-1 justify-between p-3">
      <View>
        {isPromoted ? <View className="mb-1 self-start rounded-full bg-[#FFF0E8] px-2.5 py-1"><Text className="text-[9px] font-extrabold uppercase tracking-wide text-[#D45E2A]">{promotionShortLabel(price.appliedPromotion!)}</Text></View> : null}
        <Text className="text-[15px] font-extrabold text-[#252A20]" numberOfLines={2}>{product.name}</Text><Text className="mt-1 text-xs text-[#858A7A]" numberOfLines={1}>{product.restaurant?.name || 'Restaurante'}</Text><Text className="mt-1 text-[12px] text-[#929889]" numberOfLines={1}>{product.description || product.category?.name || 'Comida deliciosa'}</Text>
      </View>
      <View className="mt-2 flex-row items-center justify-between gap-2">
        <View className="flex-row flex-wrap items-center gap-2"><Text className={`font-extrabold ${isPromoted ? 'text-[#D45E2A]' : 'text-[#607B35]'}`}>{money(price.finalTotal)}</Text>{isPromoted ? <Text className="text-[10px] text-[#929889] line-through">{money(product.price)}</Text> : null}</View>
        <Pressable disabled={!available} onPress={e => { e.stopPropagation(); if (add(product)) Toast.show({ type: 'success', text1: 'Agregado a tu carrito', text2: 'Puedes comprar en varios restaurantes.' }); else Toast.show({ type: 'error', text1: 'No se puede agregar el producto', text2: 'Revisa la disponibilidad o el stock.' }); }} className={`h-9 w-9 items-center justify-center rounded-xl ${available ? 'bg-[#607B35]' : 'bg-[#DDE1D7]'}`}><Ionicons name={available ? 'add' : 'close'} color="#FFFFFF" size={23} /></Pressable>
      </View>
    </View>
  </Pressable>;
}
export function RestaurantTile({ restaurant }: { restaurant: Restaurant }) {
  return <Pressable onPress={() => router.push({ pathname: '/restaurant/[documentId]', params: { documentId: restaurant.documentId } })} className="mb-4 overflow-hidden rounded-3xl bg-white active:opacity-85"><MediaThumb src={restaurant.logo ?? restaurant.QRImage} icon="restaurant-outline" height={156} /><View className="p-4"><Text className="text-lg font-extrabold text-[#252A20]">{restaurant.name}</Text><Text className="mt-1 text-sm text-[#777D71]" numberOfLines={2}>{restaurant.description || restaurant.address || 'Explora su menú y realiza tu pedido'}</Text><Text className="mt-2 font-semibold text-[#607B35]">Ver restaurante y menú  →</Text></View></Pressable>;
}
export function PublicationTile({ publication }: { publication: Publication }) {
  return <View className="mb-4 overflow-hidden rounded-3xl bg-white"><MediaThumb src={publication.image} height={180} icon="newspaper-outline" /><View className="p-4"><Text className="text-xs font-bold uppercase tracking-wider text-[#607B35]">{publication.restaurant?.name || 'Novedades'}</Text><Text className="mt-2 text-lg font-extrabold text-[#252A20]">{publication.title}</Text><Text className="mt-2 text-sm leading-6 text-[#777D71]">{publication.description}</Text></View></View>;
}
export function PromotionTile({ promotion }: { promotion: Promotion }) {
  const discount = promotion.type === 'PERCENTAGE' ? `${promotion.percentage}% de descuento` : promotion.type === 'FIXED_AMOUNT' ? `${money(promotion.discountAmount)} de descuento` : promotion.type === 'TWO_FOR_ONE' ? 'Promoción por cantidad' : promotion.type;
  return <View className="mb-3 flex-row items-center gap-3 rounded-3xl bg-white p-4"><View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0DA]"><Ionicons name="pricetags-outline" size={25} color="#C27E20" /></View><View className="flex-1"><Text className="font-extrabold text-[#252A20]">{promotion.name}</Text><Text className="mt-1 text-sm font-bold text-[#B36B16]">{discount}</Text><Text className="mt-1 text-xs text-[#858A7A]">{promotion.restaurant?.name || 'Restaurante'}</Text>{promotion.description ? <Text className="mt-1 text-xs text-[#858A7A]">{promotion.description}</Text> : null}</View></View>;
}
