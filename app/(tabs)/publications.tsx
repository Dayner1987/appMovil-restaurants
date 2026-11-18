// app/(tabs)/publications.tsx
// Feed exclusivo de publicaciones publicadas, paginado y actualizado al volver.
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { PageHeading, MediaThumb, FetchStatus } from '@/components/client/CatalogUI';
import { publicationService } from '@/services/publication.service';
import { errorText } from '@/hooks/useCatalog';
import type { Publication } from '@/types/publication.types';

const PAGE_SIZE = 16;

function PublicationFeedCard({ publication }: { publication: Publication }) {
  const restaurant = publication.restaurant;
  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-[#E9EEE7] bg-white">
      <View className="flex-row items-center gap-3 px-4 py-4">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#E4F0E6]">
          <Ionicons name="storefront-outline" size={23} color="#2F6A46" />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="font-extrabold text-[#233728]">{restaurant?.name || 'Comunidad gastronómica'}</Text>
          <Text className="mt-1 text-xs text-[#7D8980]">{publication.publishedAt
            ? new Date(publication.publishedAt).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Novedad de nuestros restaurantes'}</Text>
        </View>
        {publication.featured ? <View className="rounded-full bg-[#FFF2D7] px-3 py-1"><Text className="text-xs font-bold text-[#98601C]">Destacada</Text></View> : null}
      </View>
      <MediaThumb src={publication.image} height={220} icon="newspaper-outline" />
      <View className="p-4">
        <Text className="text-xl font-extrabold text-[#233728]">{publication.title}</Text>
        <Text className="mt-2 text-sm leading-6 text-[#627267]">{publication.description}</Text>
        {restaurant?.documentId ? (
          <Pressable onPress={() => router.push({ pathname: '/restaurant/[documentId]', params: { documentId: restaurant.documentId! } })}
            className="mt-4 flex-row items-center justify-between rounded-2xl bg-[#E8F3E9] px-4 py-3">
            <Text className="font-bold text-[#2F6A46]">Explorar este restaurante</Text>
            <Ionicons name="arrow-forward" size={18} color="#2F6A46" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function PublicationsTab() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextPage = useRef(1);
  const hasMore = useRef(true);
  const busy = useRef(false);

  const load = useCallback(async (page = 1, mode: 'initial' | 'refresh' | 'more' | 'silent' = 'initial') => {
    if (busy.current) return;
    busy.current = true;
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    if (mode === 'more') setLoadingMore(true);
    try {
      const response = await publicationService.findAll({ page, pageSize: PAGE_SIZE, status: 'published', sort: 'publishedAt:desc' });
      setItems(previous => {
        const combined = page === 1 ? response.data : [...previous, ...response.data];
        return [...new Map(combined.map(item => [item.documentId, item])).values()];
      });
      const count = response.meta?.pagination?.pageCount;
      hasMore.current = typeof count === 'number' ? page < count : response.data.length === PAGE_SIZE;
      nextPage.current = page + 1;
      setError(null);
    } catch (requestError) { setError(errorText(requestError)); }
    finally { busy.current = false; setLoading(false); setRefreshing(false); setLoadingMore(false); }
  }, []);

  useFocusEffect(useCallback(() => {
    void load(1, 'initial');
    // Revalidación suave mientras el usuario lee el feed (solo con tab activo).
    const interval = setInterval(() => { void load(1, 'silent'); }, 45000);
    return () => clearInterval(interval);
  }, [load]));

  const loadNext = useCallback(() => {
    if (!loading && !busy.current && hasMore.current && items.length) void load(nextPage.current, 'more');
  }, [loading, items.length, load]);

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <PageHeading title="Publicaciones" subtitle="Lo nuevo de cada restaurante, en un solo lugar" />
      <FlatList
        data={items}
        keyExtractor={item => item.documentId}
        renderItem={({ item }) => <PublicationFeedCard publication={item} />}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 126 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadNext}
        onEndReachedThreshold={0.45}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(1, 'refresh')} tintColor="#2F6A46" />}
        ListHeaderComponent={<View className="mb-4 flex-row items-center gap-3 rounded-3xl bg-[#E5F1E6] p-4">
          <Ionicons name="sparkles-outline" size={26} color="#2F6A46" />
          <View className="flex-1"><Text className="font-extrabold text-[#2D5037]">Mantente al día</Text>
            <Text className="mt-1 text-xs leading-5 text-[#607A65]">Desliza hacia abajo para descubrir nuevas publicaciones.</Text></View>
        </View>}
        ListEmptyComponent={loading ? <FetchStatus loading /> : error ? <FetchStatus loading={false} error={error} retry={() => void load()} /> :
          <View className="items-center rounded-3xl bg-white px-5 py-12">
            {/* LOTTIE: assets/lotties/publicaciones-vacias.json */}
            <Ionicons name="newspaper-outline" size={58} color="#A8BCAE" />
            <Text className="mt-4 text-center font-bold text-[#526758]">Todavía no hay publicaciones visibles.</Text>
            <Text className="mt-2 text-center text-xs text-[#829087]">Aparecerán cuando los restaurantes las publiquen en Strapi.</Text>
          </View>}
        ListFooterComponent={loadingMore ? <ActivityIndicator color="#2F6A46" style={{ marginVertical: 16 }} /> :
          error && items.length ? <Pressable onPress={loadNext} className="items-center py-4"><Text className="font-bold text-[#2F6A46]">Reintentar carga de publicaciones</Text></Pressable> : null}
      />
    </View>
  );
}
