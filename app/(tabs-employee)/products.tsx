// app/(tabs-employee)/products.tsx

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  useFocusEffect,
} from 'expo-router';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import EmployeeScreenHeader from '@/components/employee/EmployeeScreenHeader';
import EmployeeProductCard from '@/components/employee/EmployeeProductCard';

import {
  useEmployeeContext,
} from '@/hooks/useEmployeeContext';

import {
  useProduct,
} from '@/hooks/useProduct';

import type {
  Product,
} from '@/types/product.types';

export default function EmployeeProductsScreen() {
  const {
    restaurantDocumentId,

    restaurantName,

    loading:
      contextLoading,
  } =
    useEmployeeContext();

  const {
    products,

    loading,

    loadProducts,

    updateProduct,
  } =
    useProduct({
      autoLoad:
        false,
    });

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const groups = new Map<string, string>();
    products.forEach(product => {
      const key = product.category?.documentId || String(product.category?.id ?? 'none');
      groups.set(key, product.category?.name || 'Sin categoría');
    });
    return [...groups.entries()].map(([key, name]) => ({ key, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [products]);

  const [
    savingId,
    setSavingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const loadData =
    useCallback(
      async () => {
        if (
          !restaurantDocumentId
        ) {
          return;
        }

        try {
          await loadProducts({
            page:
              1,

            pageSize:
              100,

            sort:
              'name:asc',

            restaurantDocumentId,
          });
        } catch {
          Toast.show({
            type:
              'error',

            text1:
              'No se pudieron cargar los productos',

            position:
              'bottom',
          });
        }
      },
      [
        restaurantDocumentId,
        loadProducts,
      ]
    );

  useFocusEffect(
    useCallback(() => {
      void loadData();

      return undefined;
    }, [
      loadData,
    ])
  );

  const filteredProducts =
    useMemo(
      () => {
        const normalized =
          search
            .trim()
            .toLowerCase();

        if (
          !normalized
        ) {
          return products.filter(product => selectedCategory === 'all' ||
            (product.category?.documentId || String(product.category?.id ?? 'none')) === selectedCategory);
        }

        return products.filter(product =>
          (selectedCategory === 'all' || (product.category?.documentId || String(product.category?.id ?? 'none')) === selectedCategory)
          && product.name.toLowerCase().includes(normalized)
        );
      },
      [
        products,
        search,
        selectedCategory,
      ]
    );

  async function toggleAvailability(
    product:
      Product
  ) {
    const next =
      !product.isAvailable;

    const stock =
      Number(
        product.stock ??
        0
      );

    if (
      next &&
      stock <=
        0
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'Producto sin stock',

        text2:
          'No puedes marcarlo disponible mientras el stock sea 0.',

        position:
          'bottom',
      });

      return;
    }

    try {
      setSavingId(
        product.documentId
      );

      await updateProduct(
        product.documentId,
        {
          isAvailable:
            next,
        }
      );

      // Recupera relaciones (imagen/categoría) y estado real del servidor.
      await loadData();

      Toast.show({
        type:
          'success',

        text1:
          next
            ? 'Producto disponible'
            : 'Producto no disponible',

        text2:
          `${product.name} fue actualizado correctamente.`,

        position:
          'bottom',
      });
    } catch (
      error
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'No se pudo actualizar el producto',

        text2:
          error instanceof
            Error
            ? error.message
            : 'Intenta nuevamente.',

        position:
          'bottom',
      });
    } finally {
      setSavingId(
        null
      );
    }
  }

  if (
    contextLoading
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F7F8F2]">
        <ActivityIndicator
          size="large"
          color="#7B9646"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={['top']}
    >
      <EmployeeScreenHeader
        title="Productos"
        subtitle={
          restaurantName
        }
        icon="fast-food-outline"
        onAction={() =>
          void loadData()
        }
      />

      <FlatList
        data={
          filteredProducts
        }
        keyExtractor={(
          item
        ) =>
          item.documentId
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            tintColor="#7B9646"
            onRefresh={
              async () => {
                setRefreshing(
                  true
                );

                try {
                  await loadData();
                } finally {
                  setRefreshing(
                    false
                  );
                }
              }
            }
          />
        }
        contentContainerStyle={{
          paddingHorizontal:
            16,

          paddingTop:
            18,

          paddingBottom:
            140,
        }}
        ItemSeparatorComponent={() => (
          <View className="h-3" />
        )}
        ListHeaderComponent={
          <View className="mb-5">
            {!restaurantDocumentId && (
              <View className="mb-4 rounded-2xl bg-[#FFF0DC] p-4">
                <Text className="font-bold text-[#956322]">No hay un restaurante asociado</Text>
                <Text className="mt-1 text-xs leading-5 text-[#956322]">El propietario debe revisar la asociación de tu cuenta de empleado.</Text>
              </View>
            )}

            <Text className="text-[18px] font-extrabold text-[#252A20]">
              Disponibilidad
            </Text>

            <Text className="mt-1 text-[12px] leading-5 text-[#858A7A]">
              Marca los productos que pueden venderse en este momento.
            </Text>

            <View className="mt-4 flex-row items-center rounded-[17px] bg-white px-4">
              <Ionicons
                name="search-outline"
                size={19}
                color="#8D9384"
              />

              <TextInput
                value={
                  search
                }
                onChangeText={
                  setSearch
                }
                placeholder="Buscar producto"
                placeholderTextColor="#A2A89A"
                className="ml-3 flex-1 py-4 text-[13px] text-[#252A20]"
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
              {[{ key: 'all', name: 'Todos' }, ...categories].map(category => (
                <Pressable
                  key={category.key}
                  onPress={() => setSelectedCategory(category.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedCategory === category.key }}
                  className={`rounded-full border px-4 py-2.5 ${selectedCategory === category.key ? 'border-[#617D34] bg-[#617D34]' : 'border-[#DEE5D5] bg-white'}`}
                >
                  <Text className={`text-[12px] font-bold ${selectedCategory === category.key ? 'text-white' : 'text-[#617D34]'}`}>{category.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 rounded-[18px] bg-[#EEF3E3] p-4">
                <Text className="text-[10px] font-semibold text-[#7C8373]">
                  Disponibles
                </Text>

                <Text className="mt-1 text-[22px] font-extrabold text-[#617D34]">
                  {
                    products.filter(
                      (
                        product
                      ) =>
                        product.isAvailable
                    ).length
                  }
                </Text>
              </View>

              <View className="flex-1 rounded-[18px] bg-white p-4">
                <Text className="text-[10px] font-semibold text-[#7C8373]">
                  No disponibles
                </Text>

                <Text className="mt-1 text-[22px] font-extrabold text-[#8A625E]">
                  {
                    products.filter(
                      (
                        product
                      ) =>
                        !product.isAvailable
                    ).length
                  }
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-16">
              <ActivityIndicator
                size="large"
                color="#7B9646"
              />
            </View>
          ) : (
            <View className="items-center py-16">
              <Ionicons
                name="fast-food-outline"
                size={38}
                color="#A1A798"
              />

              <Text className="mt-4 text-[15px] font-extrabold text-[#252A20]">
                No hay productos
              </Text>
            </View>
          )
        }
        renderItem={({
          item,
        }) => (
          <EmployeeProductCard
            product={
              item
            }
            saving={
              savingId ===
              item.documentId
            }
            onToggle={() =>
              void toggleAvailability(
                item
              )
            }
          />
        )}
      />
    </SafeAreaView>
  );
}