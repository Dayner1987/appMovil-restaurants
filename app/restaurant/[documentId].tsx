// app/restaurant/[documentId].tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { PageHeading, MediaThumb, ProductTile, FetchStatus } from '@/components/client/CatalogUI';
import { CategoryChips } from '@/components/client/CategoryChips';
import { restaurantService } from '@/services/restaurant.service';
import { productService } from '@/services/products.service';
import { errorText } from '@/hooks/useCatalog';
import type { Restaurant } from '@/types/restaurant.types';
import type { Product } from '@/types/product.types';

const ALL = '__all__';
const OTHER = '__other__';
const keyOf = (product: Product) => product.category?.documentId || OTHER;

export default function RestaurantDetailScreen() {
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState(ALL);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!documentId) return;
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const [restaurantResult, productsResult] = await Promise.all([
        restaurantService.findOne(documentId),
        productService.findAll({ restaurantDocumentId: documentId, available: true, pageSize: 100, status: 'published' }),
      ]);
      setRestaurant(restaurantResult.data);
      setProducts(productsResult.data.filter(product => product.isAvailable));
      setError(null);
    } catch (requestError) { setError(errorText(requestError)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [documentId]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    products.forEach(product => {
      const id = keyOf(product);
      const old = map.get(id);
      if (old) old.count += 1;
      else map.set(id, { id, name: product.category?.name || 'Otros', count: 1 });
    });
    return [{ id: ALL, name: 'Todo el menú', count: products.length },
      ...[...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))];
  }, [products]);

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    products.filter(product => category === ALL || keyOf(product) === category).forEach(product => {
      const name = product.category?.name || 'Otros productos';
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push(product);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'));
  }, [products, category]);

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <PageHeading title={restaurant?.name || 'Restaurante'} subtitle="Menú organizado por categorías" back />
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2F6A46" />}
        contentContainerStyle={{ paddingBottom: 126 }}>
        {restaurant ? (
          <>
            <View style={{ marginHorizontal: 20, borderRadius: 26, overflow: 'hidden' }}>
              <MediaThumb src={restaurant.logo} icon="storefront-outline" height={220} resizeMode="contain" imageBackground="#FFFFFF" />
            </View>
            <View className="mx-5 mt-4 rounded-3xl bg-white p-5">
              <Text className="text-lg font-extrabold text-[#243528]">{restaurant.name}</Text>
              <Text className="mt-2 text-sm leading-6 text-[#68776A]">
                {restaurant.description || 'Explora los sabores de este restaurante.'}
              </Text>
              {restaurant.address ? <View className="mt-3 flex-row items-start gap-2"><Ionicons name="location-outline" size={17} color="#2F6A46" /><Text className="flex-1 text-sm text-[#738174]">{restaurant.address}</Text></View> : null}
              {restaurant.phone ? <View className="mt-2 flex-row items-center gap-2"><Ionicons name="call-outline" size={17} color="#2F6A46" /><Text className="text-sm text-[#738174]">{restaurant.phone}</Text></View> : null}
            </View>
            <View className="mx-5 mb-2 mt-7 flex-row items-center justify-between">
              <Text className="text-2xl font-extrabold text-[#243528]">Nuestro menú</Text>
              <Text className="font-semibold text-[#718672]">{products.length} productos</Text>
            </View>
            <CategoryChips choices={categories} selected={category} onSelect={setCategory} />
            {grouped.map(([name, items]) => (
              <View key={name} className="mt-4 px-5">
                <View className="mb-3 flex-row items-center gap-2">
                  <View className="h-7 w-1 rounded-full bg-[#2F6A46]" />
                  <Text className="text-xl font-extrabold text-[#243528]">{name}</Text>
                  <Text className="ml-auto text-xs text-[#748576]">{items.length}</Text>
                </View>
                {items.map(product => <ProductTile key={product.documentId} product={product} />)}
              </View>
            ))}
            {/* LOTTIE: Espacio opcional para una animación suave al final del menú. */}
          </>
        ) : null}
        {(loading || error) ? <FetchStatus loading={loading} error={error} retry={() => void load()} /> : null}
        {!loading && !error && !products.length ? <FetchStatus loading={false} empty="Este restaurante todavía no tiene productos publicados." /> : null}
        {!loading && !error && products.length > 0 && !grouped.length ? <FetchStatus loading={false} empty="No hay productos en la categoría elegida." /> : null}
        {!restaurant && !loading && !error ? <Pressable onPress={() => router.back()} className="mx-5 rounded-2xl bg-white p-4"><Text className="text-center font-semibold text-[#2F6A46]">Regresar</Text></Pressable> : null}
      </ScrollView>
    </View>
  );
}
