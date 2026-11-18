import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { restaurantService } from '@/services/restaurant.service';
import type { Restaurant } from '@/types/restaurant.types';
import { RestaurantTile } from '@/components/client/CatalogUI';

export default function NewRestaurantsSection() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await restaurantService.findAll({
        page: 1,
        pageSize: 6,
        statusRes: 'ACTIVE',
        sort: 'createdAt:desc',
      });
      const recent = (response.data ?? [])
        .filter(item => String(item.statusRes).toUpperCase() === 'ACTIVE')
        .sort((a, b) => (Date.parse(b.createdAt || '') || 0) - (Date.parse(a.createdAt || '') || 0));
      setRestaurants(recent.slice(0, 6));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View className="mt-7">
      <View className="mb-2 px-5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="sparkles-outline" size={21} color="#2F6A46" />
          <Text className="flex-1 text-xl font-extrabold text-[#273A2B]">¡Felicidades a nuestros nuevos restaurantes registrados!</Text>
        </View>
        <Text className="mt-2 text-sm leading-5 text-[#7B887C]">Damos la bienvenida a los locales que se han sumado recientemente a CochaStore.</Text>
      </View>

      {loading ? (
        <View className="mx-5 mt-3 items-center rounded-2xl bg-white py-7"><ActivityIndicator color="#2F6A46" /><Text className="mt-2 text-xs text-[#849084]">Buscando nuevos restaurantes...</Text></View>
      ) : error ? (
        <View className="mx-5 mt-3 rounded-2xl bg-white p-4"><Text className="text-sm text-[#788579]">No pudimos cargar los nuevos restaurantes en este momento.</Text></View>
      ) : restaurants.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}>
          {restaurants.map(restaurant => <View key={restaurant.documentId} style={{ width: 245 }}><RestaurantTile restaurant={restaurant} /></View>)}
        </ScrollView>
      ) : (
        <View className="mx-5 mt-3 rounded-2xl border border-[#E5ECE3] bg-white p-4"><Text className="text-sm leading-5 text-[#788579]">Pronto anunciaremos a los nuevos restaurantes que se unan a nuestra comunidad.</Text></View>
      )}
    </View>
  );
}
