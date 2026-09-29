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
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

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

  const [
    galleryImages,
    setGalleryImages,
  ] =
    useState<ProductImageUpload[]>(
      []
    );

  const {
    categories,
    saving,
    loadingCategories,

    loadCategories,
    createCategory,

    createProduct,

    createMainImage,
    addGalleryImages,
  } =
    useProduct({
      autoLoad: false,
    });

  // =====================================================
  // CATEGORÍAS
  // =====================================================

  useEffect(() => {
    void loadCategories().catch(
      () => {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudieron cargar las categorías',

          text2:
            'Intenta nuevamente.',

          position:
            'bottom',
        });
      }
    );
  }, [
    loadCategories,
  ]);

  useEffect(() => {
    if (
      !values.categoryDocumentId &&
      categories.length > 0
    ) {
      setValues(
        (
          current
        ) => ({
          ...current,

          categoryDocumentId:
            categories[0]
              .documentId,
        })
      );
    }
  }, [
    categories,
    values.categoryDocumentId,
  ]);

  // =====================================================
  // CREAR CATEGORÍA
  // =====================================================

  const handleCreateCategory =
    async (
      name: string
    ) => {
      return createCategory({
        name,

        isActive:
          true,
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

      // ===================================================
      // VALIDACIONES
      // ===================================================

      if (
        !restaurantDocumentId
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'Restaurante no disponible',

          text2:
            'No se pudo identificar el restaurante actual.',

          position:
            'bottom',
        });

        return;
      }

      if (!name) {
        Toast.show({
          type:
            'error',

          text1:
            'Nombre requerido',

          text2:
            'Escribe el nombre del producto.',

          position:
            'bottom',
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
          type:
            'error',

          text1:
            'Precio inválido',

          text2:
            'Ingresa un precio mayor a 0.',

          position:
            'bottom',
        });

        return;
      }

      if (
        !values
          .categoryDocumentId
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'Selecciona una categoría',

          text2:
            'El producto debe pertenecer a una categoría.',

          position:
            'bottom',
        });

        return;
      }

      // ===================================================
      // CREAR
      // ===================================================

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

            restaurant:
              restaurantDocumentId,

            category:
              values
                .categoryDocumentId,
          });

        const mediaErrors:
          string[] = [];

        // ===============================================
        // IMAGEN PRINCIPAL
        // ===============================================

        if (image) {
          try {
            await createMainImage(
              newProduct
                .documentId,
              image
            );
          } catch {
            mediaErrors.push(
              'imagen principal'
            );
          }
        }

        // ===============================================
        // GALERÍA
        // ===============================================

        if (
          galleryImages.length >
          0
        ) {
          try {
            await addGalleryImages(
              newProduct
                .documentId,
              galleryImages
            );
          } catch {
            mediaErrors.push(
              'galería'
            );
          }
        }

        // ===============================================
        // PARCIAL
        // ===============================================

        if (
          mediaErrors.length >
          0
        ) {
          Toast.show({
            type:
              'error',

            text1:
              'Producto creado parcialmente',

            text2:
              `El producto fue creado, pero no se pudo guardar: ${mediaErrors.join(
                ' y '
              )}.`,

            position:
              'bottom',

            visibilityTime:
              3500,
          });

          setTimeout(
            () => {
              router.back();
            },
            1500
          );

          return;
        }

        // ===============================================
        // TODO CORRECTO
        // ===============================================

        Toast.show({
          type:
            'success',

          text1:
            'Producto creado',

          text2:
            image ||
            galleryImages.length >
              0
              ? 'El producto y sus imágenes fueron guardados correctamente.'
              : 'El producto se agregó correctamente al catálogo.',

          position:
            'bottom',

          visibilityTime:
            2500,
        });

        setTimeout(
          () => {
            router.back();
          },
          800
        );
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo crear el producto',

          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'Intenta nuevamente.',

          position:
            'bottom',

          visibilityTime:
            3500,
        });
      }
    };

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
      edges={[
        'top',
      ]}
    >
      {/* =================================================
          HEADER
      ================================================= */}

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
          disabled={
            saving
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
            numberOfLines={1}
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

      {/* =================================================
          SCROLL
      ================================================= */}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingBottom:
            160,
        }}
      >
        <View
          className="
            px-5
            pt-6
          "
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

            galleryImages={
              galleryImages
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

            onGalleryImagesChange={
              setGalleryImages
            }

            onCreateCategory={
              handleCreateCategory
            }

            onSubmit={
              handleSubmit
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}