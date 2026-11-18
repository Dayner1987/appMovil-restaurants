// app/(tabs)/index.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAuth } from '@/hooks/useAuth';
import { productService } from '@/services/products.service';
import { restaurantService } from '@/services/restaurant.service';
import { promotionService } from '@/services/promotion.service';
import { errorText } from '@/hooks/useCatalog';
import { PageHeading, GuestNotice, ProductTile, RestaurantTile, PromotionTile, FetchStatus } from '@/components/client/CatalogUI';
import type { Product } from '@/types/product.types';
import type { Restaurant } from '@/types/restaurant.types';
import type { Promotion } from '@/types/promotion.types';

export default function HomeClient() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    const results = await Promise.allSettled([
      productService.findAll({ available: true, pageSize: 8, status: 'published' }),
      restaurantService.findAll({ statusRes: 'ACTIVE', pageSize: 8 }),
      promotionService.findAll({ pageSize: 8, status: 'published' }),
    ]);
    if (results[0].status === 'fulfilled') setProducts(results[0].value.data.filter(x => x.isAvailable));
    if (results[1].status === 'fulfilled') setRestaurants(results[1].value.data.filter(x => String(x.statusRes).toUpperCase() === 'ACTIVE'));
    if (results[2].status === 'fulfilled') setPromotions(results[2].value.data.filter(x =>
      (!x.startAt || Date.parse(x.startAt) <= Date.now()) && (!x.endAt || Date.parse(x.endAt) >= Date.now())));
    const firstError = results.find(result => result.status === 'rejected');
    setError(firstError?.status === 'rejected' ? errorText(firstError.reason) : null);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2F6A46" />}
        showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 126 }}>
        <PageHeading title={user ? `¡Hola, ${user.firstName || user.username}!` : '¿Qué se te antoja?'}
          subtitle="Tu espacio para descubrir sabores y novedades" />

        <View className="mx-5 mt-2 overflow-hidden rounded-[30px] bg-[#224D35] px-5 py-5">
          <View className="flex-row items-center">
            <View className="flex-1">
              <View className="self-start rounded-full bg-[#3B7050] px-3 py-1">
                <Text className="text-[11px] font-bold uppercase tracking-widest text-[#E7F7EA]">Tu próxima comida</Text>
              </View>
              <Text className="mt-3 text-[26px] font-extrabold leading-8 text-white">Elige tu antojo, nosotros lo organizamos</Text>
              <Text className="mt-2 text-xs leading-5 text-[#D3E8D9]">Explora productos de distintos restaurantes en un solo carrito.</Text>
            </View>
            <View style={{ width: 110, height: 145, justifyContent: 'center', alignItems: 'center' }}>
              {/* LOTTIE HERO: Puedes sustituir Shopping.json por assets/lotties/hero-comida.json */}
              <LottieView source={require('../../assets/fonts/Buys.json')} autoPlay loop style={{ width: 142, height: 142 }} />
            </View>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/products')} className="mt-4 flex-row items-center justify-center gap-2 self-start rounded-2xl bg-[#F1C66A] px-5 py-3">
            <Text className="font-extrabold text-[#263E2B]">Ver productos</Text>
            <Ionicons name="arrow-forward" color="#263E2B" size={17} />
          </Pressable>
        </View>

        <View className="mx-5 mt-5 flex-row gap-3">
          <QuickAction title="Restaurantes" detail="Explorar locales" icon="storefront-outline" onPress={() => router.push('/(tabs)/restaurants')} />
          <QuickAction title="Publicaciones" detail="Nuevas historias" icon="newspaper-outline" onPress={() => router.push('/(tabs)/publications')} />
        </View>

        {!user ? <GuestNotice /> : (
          <Pressable onPress={() => router.push('/my-orders')} className="mx-5 mt-4 flex-row items-center justify-between rounded-2xl border border-[#E4EAE2] bg-white p-4">
            <View className="flex-row items-center gap-3"><Ionicons name="receipt-outline" size={22} color="#2F6A46" />
              <View><Text className="font-extrabold text-[#273A2B]">Mis pedidos</Text>
                <Text className="mt-1 text-xs text-[#7B8B7E]">Consulta cada recibo por restaurante</Text></View></View>
            <Ionicons name="chevron-forward" size={20} color="#2F6A46" />
          </Pressable>
        )}

        <Section title="Restaurantes para ti" onPress={() => router.push('/(tabs)/restaurants')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {restaurants.map(restaurant => <View key={restaurant.documentId} style={{ width: 235 }}><RestaurantTile restaurant={restaurant} /></View>)}
        </ScrollView>

        <Section title="Descubre productos" onPress={() => router.push('/(tabs)/products')} />
        <View className="px-5">{products.slice(0, 4).map(product => <ProductTile key={product.documentId} product={product} />)}</View>

        <Section title="Ofertas disponibles" onPress={() => router.push('/promotions')} />
        <View className="px-5">{promotions.slice(0, 3).map(promotion => <PromotionTile promotion={promotion} key={promotion.documentId} />)}</View>

        <Pressable onPress={() => router.push('/(tabs)/publications')} className="mx-5 mt-3 flex-row items-center gap-3 rounded-3xl bg-[#E5EFE3] p-5">
          <Ionicons name="megaphone-outline" size={27} color="#2F6A46" />
          <View className="flex-1"><Text className="font-extrabold text-[#2D5137]">Todas las publicaciones</Text>
            <Text className="mt-1 text-xs text-[#6D806F]">Entérate de lo nuevo en tu comunidad</Text></View>
          <Ionicons name="arrow-forward" color="#2F6A46" size={20} />
        </Pressable>
        {/* LOTTIE EXTRA: assets/lotties/inicio-footer.json. Recomendado mostrar solo si hay contenido. */}
        {(loading || error) ? <FetchStatus loading={loading} error={error} retry={() => void load()} /> : null}
        {!loading && !error && !products.length && !restaurants.length && !promotions.length ?
          <FetchStatus loading={false} empty="Pronto habrá nuevos restaurantes y productos." /> : null}
      </ScrollView>
    </View>
  );
}

function QuickAction({ title, detail, icon, onPress }: {
  title: string; detail: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void;
}) {
  return <Pressable onPress={onPress} className="flex-1 rounded-3xl border border-[#E5ECE4] bg-white p-4">
    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#E4F0E5]"><Ionicons name={icon} size={24} color="#2F6A46" /></View>
    <Text className="mt-3 font-extrabold text-[#273A2B]">{title}</Text>
    <Text className="mt-1 text-xs text-[#879188]">{detail}</Text>
  </Pressable>;
}

function Section({ title, onPress }: { title: string; onPress: () => void }) {
  return <View className="mb-3 mt-7 flex-row items-center justify-between px-5">
    <Text className="flex-1 text-xl font-extrabold text-[#273A2B]">{title}</Text>
    <Pressable onPress={onPress} className="flex-row items-center gap-1 rounded-xl px-2 py-2">
      <Text className="text-sm font-bold text-[#2F6A46]">Ver todos</Text>
      <Ionicons name="arrow-forward" color="#2F6A46" size={16} />
    </Pressable>
  </View>;
}
