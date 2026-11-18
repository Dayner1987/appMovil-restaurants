// app/promotions.tsx
import { RefreshControl, ScrollView, View } from 'react-native';
import { PageHeading, FetchStatus, PromotionTile } from '@/components/client/CatalogUI';
import { useCatalog } from '@/hooks/useCatalog';
export default function PromocionesScreen() {
  const { items, loading, error, refreshing, reload } = useCatalog('promotions');
  return <View className="flex-1 bg-[#F7F8F2]"><PageHeading title="Promociones" subtitle="Ofertas vigentes en los restaurantes" back />
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void reload(true)} />} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
      {items.map(item => <PromotionTile key={item.documentId} promotion={item} />)}
      {loading || error && !items.length ? <FetchStatus loading={loading} error={error} retry={() => void reload()} /> : !items.length ? <FetchStatus loading={false} empty="No hay promociones disponibles." /> : null}
    </ScrollView></View>;
}
