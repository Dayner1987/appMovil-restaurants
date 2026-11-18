// app/(tabs)/restaurants.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { PageHeading, RestaurantTile, FetchStatus } from '@/components/client/CatalogUI';
import { useCatalog } from '@/hooks/useCatalog';

export default function RestaurantsScreen() {
  const { items, loading, refreshing, error, reload } = useCatalog('restaurants');
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => items.filter(restaurant =>
    `${restaurant.name} ${restaurant.address || ''} ${restaurant.description || ''}`
      .toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es'))), [items, search]);

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <PageHeading title="Restaurantes" subtitle="Explora los locales y descubre su menú" />
      <View className="mx-5 mb-3 flex-row items-center rounded-2xl border border-[#E3EAE1] bg-white px-4">
        <Ionicons name="search" size={21} color="#748676" />
        <TextInput value={search} onChangeText={setSearch} placeholder="Buscar restaurante o ubicación"
          accessibilityLabel="Buscar restaurante" placeholderTextColor="#929E94"
          className="ml-3 flex-1 py-4 text-[#243528]" />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void reload(true)} tintColor="#2F6A46" />}
        contentContainerStyle={{ paddingBottom: 126, paddingHorizontal: 20 }}>
        <View className="mb-4 mt-2 flex-row items-center gap-2">
          <Ionicons name="storefront-outline" size={19} color="#2F6A46" />
          <Text className="font-semibold text-[#617765]">{filtered.length} restaurantes para explorar</Text>
        </View>
        {filtered.map(restaurant => <RestaurantTile key={restaurant.documentId} restaurant={restaurant} />)}
        {(loading || (error && !items.length)) ? <FetchStatus loading={loading} error={error} retry={() => void reload()} /> : null}
        {!loading && !filtered.length && !error ? <FetchStatus loading={false} empty="No encontramos restaurantes con ese nombre." /> : null}
        {/* LOTTIE: assets/lotties/restaurantes-vacios.json */}
      </ScrollView>
    </View>
  );
}
