// app/(tabs-restaurant)/products.tsx

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import Toast from 'react-native-toast-message';

import DashboardNavbar from '@/components/DashboardNavbar';

import ProductCategoryAccordion from '@/components/restaurant/ProductCategoryAccordion';

import DeleteProductModal from '@/components/restaurant/DeleteProductModal';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useRestaurant,
} from '@/hooks/useRestaurant';

import {
  useProduct,
} from '@/hooks/useProduct';

import type {
  Product,
} from '@/types/product.types';

export default function RestaurantProductsScreen() {
  // =====================================================
  // AUTH
  // =====================================================

  const {
    user,
    loading: authLoading,
  } =
    useAuth();

  // =====================================================
  // RESTAURANTE DEL USUARIO
  //
  // API comprobada:
  // /api/restaurants
  // ?filters[users][id][$eq]=17
  // =====================================================

  const {
    restaurant,
    loading:
      restaurantLoading,
    refresh:
      refreshRestaurant,
  } =
    useRestaurant({
      autoLoad:
        Boolean(
          user?.id
        ),

      query: {
        page: 1,
        pageSize: 1,
        userId:
          user?.id,
      },
    });

  const restaurantDocumentId =
    restaurant
      ?.documentId;

  // =====================================================
  // PRODUCTOS DEL RESTAURANTE
  // =====================================================

  const {
    products,
    loading:
      productsLoading,
    saving,

    loadProducts,
    deleteProduct,
  } =
    useProduct({
      autoLoad:
        Boolean(
          restaurantDocumentId
        ),

      query: {
        page: 1,
        pageSize: 100,
        sort: 'name:asc',

        restaurantDocumentId,
      },
    });

  const [
    productToDelete,
    setProductToDelete,
  ] =
    useState<Product | null>(
      null
    );

  // =====================================================
  // REFRESH PRODUCTOS
  // =====================================================

  const refreshProducts =
    useCallback(
      async () => {
        if (
          !restaurantDocumentId
        ) {
          return;
        }

        await loadProducts({
          page: 1,
          pageSize: 100,
          sort: 'name:asc',

          restaurantDocumentId,
        });
      },
      [
        restaurantDocumentId,
        loadProducts,
      ]
    );

  const refreshAll =
    useCallback(
      async () => {
        await refreshRestaurant();

        if (
          restaurantDocumentId
        ) {
          await refreshProducts();
        }
      },
      [
        refreshRestaurant,
        restaurantDocumentId,
        refreshProducts,
      ]
    );

  // =====================================================
  // REFRESCAR AL VOLVER
  //
  // Esto actualiza:
  // - creación
  // - edición
  // - imagen
  // - categoría
  // - eliminación
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      void refreshRestaurant();

      if (
        restaurantDocumentId
      ) {
        void refreshProducts();
      }

      return undefined;
    }, [
      refreshRestaurant,
      restaurantDocumentId,
      refreshProducts,
    ])
  );

  // =====================================================
  // AGRUPAR POR CATEGORÍA
  //
  // Solo mostramos categorías utilizadas
  // por productos de ESTE restaurante.
  // =====================================================

  const categoryGroups =
    useMemo(() => {
      const groups =
        new Map<
          string,
          {
            title: string;
            products:
              Product[];
          }
        >();

      products.forEach(
        (
          product
        ) => {
          const category =
            product.category;

          if (!category) {
            return;
          }

          const key =
            category.documentId ||
            String(
              category.id
            );

          const current =
            groups.get(
              key
            );

          if (current) {
            current.products.push(
              product
            );

            return;
          }

          groups.set(
            key,
            {
              title:
                category.name,

              products: [
                product,
              ],
            }
          );
        }
      );

      return Array.from(
        groups.entries()
      )
        .map(
          ([
            key,
            value,
          ]) => ({
            key,
            ...value,
          })
        )
        .sort(
          (
            a,
            b
          ) =>
            a.title.localeCompare(
              b.title,
              'es',
              {
                sensitivity:
                  'base',
              }
            )
        );
    }, [
      products,
    ]);

  const uncategorizedProducts =
    useMemo(
      () =>
        products.filter(
          (
            product
          ) =>
            !product.category
        ),
      [
        products,
      ]
    );

  // =====================================================
  // CREATE
  // =====================================================

  const handleCreateProduct =
    () => {
      if (
        !restaurantDocumentId
      ) {
        Toast.show({
          type: 'error',
          text1:
            'Restaurante no disponible',
          text2:
            'No se pudo recuperar la información del restaurante.',
          position:
            'bottom',
        });

        return;
      }

      router.push({
        pathname:
          '/others/CreateProduct',

        params: {
          restaurantDocumentId,

          restaurantName:
            restaurant
              ?.name ??
            '',
        },
      });
    };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit =
    (
      product:
        Product
    ) => {
      if (
        !restaurantDocumentId
      ) {
        return;
      }

      router.push({
        pathname:
          '/others/EditProduct',

        params: {
          documentId:
            product.documentId,

          restaurantDocumentId,
        },
      });
    };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete =
    async () => {
      if (
        !productToDelete
      ) {
        return;
      }

      try {
        await deleteProduct(
          productToDelete
            .documentId
        );

        setProductToDelete(
          null
        );

        Toast.show({
          type:
            'success',

          text1:
            'Producto eliminado',

          text2:
            'El producto fue eliminado correctamente.',

          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo eliminar',

          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'Intenta nuevamente.',

          position:
            'bottom',
        });
      }
    };

  const loading =
    authLoading ||
    restaurantLoading;

  const refreshing =
    restaurantLoading ||
    productsLoading;

  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
    >
      <DashboardNavbar
        title="Productos"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              void refreshAll()
            }
            tintColor="#6F8C3E"
          />
        }
        contentContainerClassName="
          px-5
          pb-12
          pt-5
        "
      >
        <View
          className="
            flex-row
            items-start
            justify-between
          "
        >
          <View
            className="
              flex-1
              pr-4
            "
          >
            <Text
              className="
                text-3xl
                font-extrabold
                text-[#171A15]
              "
            >
              Productos
            </Text>

            <Text
              className="
                mt-2
                text-sm
                leading-6
                text-[#747A6E]
              "
            >
              {restaurant?.name
                ? `Administra el catálogo de ${restaurant.name}.`
                : 'Administra el catálogo de tu restaurante.'}
            </Text>
          </View>

          <View
            className="
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-[#EEF3E3]
            "
          >
            <Ionicons
              name="fast-food-outline"
              size={24}
              color="#6F8C3E"
            />
          </View>
        </View>

        <Pressable
          onPress={
            handleCreateProduct
          }
          disabled={
            !restaurantDocumentId
          }
          className={`
            mt-6
            flex-row
            items-center
            justify-center
            rounded-2xl
            py-4
            ${
              restaurantDocumentId
                ? 'bg-[#6F8C3E]'
                : 'bg-[#AEB7A0]'
            }
          `}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text
            className="
              ml-2
              text-base
              font-extrabold
              text-white
            "
          >
            Agregar producto
          </Text>
        </Pressable>

        {loading ? (
          <View
            className="
              items-center
              py-16
            "
          >
            <ActivityIndicator
              size="large"
              color="#6F8C3E"
            />

            <Text
              className="
                mt-3
                text-sm
                text-[#777D71]
              "
            >
              Cargando restaurante...
            </Text>
          </View>
        ) : null}

        {!loading &&
        !restaurantDocumentId ? (
          <View
            className="
              mt-5
              flex-row
              items-center
              rounded-2xl
              bg-[#FFF0DD]
              px-4
              py-3
            "
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color="#D47A24"
            />

            <Text
              className="
                ml-3
                flex-1
                text-sm
                text-[#94551D]
              "
            >
              No se pudo recuperar la información del restaurante.
            </Text>

            <Pressable
              onPress={() =>
                void refreshRestaurant()
              }
            >
              <Text
                className="
                  font-bold
                  text-[#D47A24]
                "
              >
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {restaurantDocumentId ? (
          <>
            <View
              className="
                mt-7
                flex-row
                items-center
                justify-between
              "
            >
              <View>
                <Text
                  className="
                    text-lg
                    font-extrabold
                    text-[#171A15]
                  "
                >
                  Catálogo
                </Text>

                <Text
                  className="
                    mt-1
                    text-sm
                    text-[#858B80]
                  "
                >
                  {products.length}{' '}
                  {products.length ===
                  1
                    ? 'producto registrado'
                    : 'productos registrados'}
                </Text>
              </View>

              <View
                className="
                  rounded-full
                  bg-[#EEF3E3]
                  px-3
                  py-2
                "
              >
                <Text
                  className="
                    text-xs
                    font-bold
                    text-[#607B35]
                  "
                >
                  {categoryGroups.length}{' '}
                  {categoryGroups.length ===
                  1
                    ? 'categoría'
                    : 'categorías'}
                </Text>
              </View>
            </View>

            {productsLoading &&
            products.length ===
              0 ? (
              <View
                className="
                  items-center
                  py-16
                "
              >
                <ActivityIndicator
                  size="large"
                  color="#6F8C3E"
                />

                <Text
                  className="
                    mt-3
                    text-sm
                    text-[#777D71]
                  "
                >
                  Cargando productos...
                </Text>
              </View>
            ) : (
              <View
                className="
                  mt-5
                  gap-4
                "
              >
                {categoryGroups.map(
                  (
                    group,
                    index
                  ) => (
                    <ProductCategoryAccordion
                      key={
                        group.key
                      }
                      title={
                        group.title
                      }
                      products={
                        group.products
                      }
                      defaultOpen={
                        index ===
                        0
                      }
                      onEdit={
                        handleEdit
                      }
                      onDelete={
                        setProductToDelete
                      }
                    />
                  )
                )}

                {uncategorizedProducts.length >
                0 ? (
                  <ProductCategoryAccordion
                    title="Sin categoría"
                    products={
                      uncategorizedProducts
                    }
                    defaultOpen={
                      categoryGroups.length ===
                      0
                    }
                    onEdit={
                      handleEdit
                    }
                    onDelete={
                      setProductToDelete
                    }
                  />
                ) : null}

                {products.length ===
                  0 &&
                !productsLoading ? (
                  <View
                    className="
                      items-center
                      rounded-3xl
                      bg-white
                      px-6
                      py-12
                    "
                  >
                    <View
                      className="
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-3xl
                        bg-[#EEF3E3]
                      "
                    >
                      <Ionicons
                        name="fast-food-outline"
                        size={30}
                        color="#6F8C3E"
                      />
                    </View>

                    <Text
                      className="
                        mt-4
                        text-lg
                        font-extrabold
                        text-[#171A15]
                      "
                    >
                      Aún no tienes productos
                    </Text>

                    <Text
                      className="
                        mt-2
                        text-center
                        text-sm
                        leading-6
                        text-[#858B80]
                      "
                    >
                      Agrega tu primer producto para comenzar a construir el catálogo.
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      <DeleteProductModal
        visible={
          Boolean(
            productToDelete
          )
        }
        productName={
          productToDelete
            ?.name
        }
        deleting={
          saving
        }
        onClose={() =>
          setProductToDelete(
            null
          )
        }
        onConfirm={
          handleDelete
        }
      />
    </SafeAreaView>
  );
}