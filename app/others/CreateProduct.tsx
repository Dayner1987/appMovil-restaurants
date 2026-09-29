// app/others/CreateProduct.tsx

import {
  useEffect,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import Toast from 'react-native-toast-message';

import ProductForm from '@/components/restaurant/ProductForm';

import type {
  ProductFormValues,
} from '@/components/restaurant/ProductForm';

import {
  useProduct,
} from '@/hooks/useProduct';

import type {
  ProductImageUpload,
} from '@/types/product.types';

export default function CreateProductScreen() {
  const params =
    useLocalSearchParams<{
      restaurantDocumentId?: string;
      restaurantName?: string;
    }>();

  const restaurantDocumentId =
    Array.isArray(
      params.restaurantDocumentId
    )
      ? params.restaurantDocumentId[0]
      : params.restaurantDocumentId;

  const restaurantName =
    Array.isArray(
      params.restaurantName
    )
      ? params.restaurantName[0]
      : params.restaurantName;

  const [
    values,
    setValues,
  ] =
    useState<ProductFormValues>({
      name: '',
      description: '',
      price: '',
      stock: '0',
      categoryDocumentId: '',
      isAvailable: true,
    });

  const [
    image,
    setImage,
  ] =
    useState<ProductImageUpload | null>(
      null
    );

  const {
    categories,
    saving,
    loadingCategories,

    loadCategories,
    createCategory,
    createProduct,
    createMainImage,
  } =
    useProduct({
      autoLoad: false,
    });

  // =====================================================
  // CATEGORÍAS GLOBALES
  // =====================================================

  useEffect(() => {
    void loadCategories();
  }, [
    loadCategories,
  ]);

  // Seleccionamos la primera categoría automáticamente.
  useEffect(() => {
    if (
      !values.categoryDocumentId &&
      categories.length > 0
    ) {
      setValues((current) => ({
        ...current,

        categoryDocumentId:
          categories[0].documentId,
      }));
    }
  }, [
    categories,
    values.categoryDocumentId,
  ]);

  // =====================================================
  // CREAR CATEGORÍA GLOBAL
  // =====================================================

  const handleCreateCategory =
    async (
      name: string
    ) => {
      return createCategory({
        name,
        isActive: true,
      });
    };

  // =====================================================
  // CREAR PRODUCTO
  // =====================================================

  const handleSubmit =
    async () => {
      const name =
        values.name.trim();

      const price =
        Number(
          values.price
        );

      const stock =
        Number(
          values.stock
        );

      if (
        !restaurantDocumentId
      ) {
        Toast.show({
          type: 'error',
          text1:
            'Restaurante no disponible',
          text2:
            'No se pudo identificar el restaurante actual.',
          position: 'bottom',
        });

        return;
      }

      if (!name) {
        Toast.show({
          type: 'error',
          text1:
            'Nombre requerido',
          text2:
            'Escribe el nombre del producto.',
          position: 'bottom',
        });

        return;
      }

      if (
        !Number.isFinite(
          price
        ) ||
        price <= 0
      ) {
        Toast.show({
          type: 'error',
          text1:
            'Precio inválido',
          text2:
            'Ingresa un precio mayor a 0.',
          position: 'bottom',
        });

        return;
      }

      if (
        !values.categoryDocumentId
      ) {
        Toast.show({
          type: 'error',
          text1:
            'Selecciona una categoría',
          text2:
            'El producto debe pertenecer a una categoría.',
          position: 'bottom',
        });

        return;
      }

      try {
        const newProduct =
          await createProduct({
            name,

            description:
              values.description
                .trim() ||
              null,

            price,

            stock:
              Number.isFinite(
                stock
              )
                ? Math.max(
                    0,
                    Math.floor(
                      stock
                    )
                  )
                : 0,

            isAvailable:
              values.isAvailable,

            // AQUÍ SÍ va el documentId
            // del restaurante.
            restaurant:
              restaurantDocumentId,

            // La categoría es global,
            // pero el producto se relaciona con ella.
            category:
              values.categoryDocumentId,
          });

        if (image) {
          await createMainImage(
            newProduct.documentId,
            image
          );
        }

        Toast.show({
          type: 'success',
          text1:
            'Producto creado',
          text2:
            'El producto se agregó al catálogo.',
          position: 'bottom',
        });

        router.back();
      } catch (
        requestError
      ) {
        Toast.show({
          type: 'error',
          text1:
            'No se pudo crear el producto',
          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'Intenta nuevamente.',
          position: 'bottom',
        });
      }
    };

  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
    >
      <View
        className="
          flex-row
          items-center
          border-b
          border-[#E5E8DE]
          bg-white
          px-5
          py-4
        "
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          className="
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-[#F2F3EE]
          "
        >
          <Ionicons
            name="arrow-back-outline"
            size={23}
            color="#171A15"
          />
        </Pressable>

        <View
          className="
            ml-4
            flex-1
          "
        >
          <Text
            className="
              text-xl
              font-extrabold
              text-[#171A15]
            "
          >
            Nuevo producto
          </Text>

          <Text
            className="
              mt-0.5
              text-xs
              text-[#858B80]
            "
          >
            {restaurantName ||
              'Restaurante'}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="
          grow
          px-5
          pb-20
          pt-6
        "
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <ProductForm
          values={
            values
          }
          categories={
            categories
          }
          image={
            image
          }
          saving={
            saving
          }
          categorySaving={
            loadingCategories ||
            saving
          }
          submitLabel="Crear producto"
          onChange={
            setValues
          }
          onImageChange={
            setImage
          }
          onCreateCategory={
            handleCreateCategory
          }
          onSubmit={
            handleSubmit
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}