// app/(tabs)/products.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { PageHeading, ProductTile, FetchStatus } from '@/components/client/CatalogUI';
import { CategoryChips } from '@/components/client/CategoryChips';
import { useCatalog } from '@/hooks/useCatalog';
import type { Product } from '@/types/product.types';

const ALL = '__all__';
const OTHER = '__other__';
const categoryKey = (product: Product) => product.category?.documentId || OTHER;
const categoryName = (product: Product) => product.category?.name || 'Otros productos';

export default function ProductsScreen() {
  const { items, loading, refreshing, error, reload } = useCatalog('products');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    items.forEach(product => {
      const id = categoryKey(product);
      const current = map.get(id);
      if (current) current.count += 1;
      else map.set(id, { id, name: categoryName(product), count: 1 });
    });
    return [{ id: ALL, name: 'Todos', count: items.length }, ...[...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))];
  }, [items]);

  const groups = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('es');
    const list = items.filter(product =>
      (category === ALL || categoryKey(product) === category) &&
      `${product.name} ${product.restaurant?.name || ''} ${categoryName(product)} ${product.description || ''}`
        .toLocaleLowerCase('es').includes(needle));
    const map = new Map<string, { name: string; products: Product[] }>();
    list.forEach(product => {
      const key = categoryKey(product);
      if (!map.has(key)) map.set(key, { name: categoryName(product), products: [] });
      map.get(key)!.products.push(product);
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [items, search, category]);

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <PageHeading title="Explora productos" subtitle="Busca por categoría, plato o restaurante" />
      <View className="mx-5 mb-2 flex-row items-center rounded-2xl border border-[#E3EAE1] bg-white px-4">
        <Ionicons name="search" size={21} color="#738778" />
        <TextInput value={search} onChangeText={setSearch} placeholder="¿Qué se te antoja hoy?"
          placeholderTextColor="#919F94" accessibilityLabel="Buscar productos"
          className="ml-3 flex-1 py-4 text-[#243528]" />
      </View>
      <CategoryChips choices={categories} selected={category} onSelect={setCategory} />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void reload(true)} tintColor="#2F6A46" />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 126 }}>
        {groups.map(group => (
          <View key={group.name} className="mb-3">
            <View className="mx-5 mb-3 mt-4 flex-row items-center justify-between">
              <Text className="text-xl font-extrabold text-[#243528]">{group.name}</Text>
              <Text className="text-xs font-semibold text-[#748576]">{group.products.length} productos</Text>
            </View>
            <View className="px-5">{group.products.map(product => <ProductTile key={product.documentId} product={product} />)}</View>
          </View>
        ))}
        {(loading || (error && !items.length)) ? <FetchStatus loading={loading} error={error} retry={() => void reload()} /> : null}
        {!loading && !groups.length && !error ? <FetchStatus loading={false} empty="No encontramos productos en esta categoría." /> : null}
      </ScrollView>
    </View>
  );
}
