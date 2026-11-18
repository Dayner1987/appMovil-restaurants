// app/publications.tsx
import { RefreshControl, ScrollView, View } from 'react-native';
import { PageHeading, FetchStatus, PublicationTile } from '@/components/client/CatalogUI';
import { useCatalog } from '@/hooks/useCatalog';
export default function PublicacionesScreen() {
  const { items, loading, error, refreshing, reload } = useCatalog('publications');
  return <View className="flex-1 bg-[#F7F8F2]"><PageHeading title="Publicaciones" subtitle="Noticias y novedades de nuestros restaurantes" back />
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void reload(true)} />} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
      {items.map(item => <PublicationTile key={item.documentId} publication={item} />)}
      {loading || error && !items.length ? <FetchStatus loading={loading} error={error} retry={() => void reload()} /> : !items.length ? <FetchStatus loading={false} empty="No hay publications disponibles." /> : null}
    </ScrollView></View>;
}
