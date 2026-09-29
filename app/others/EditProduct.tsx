// app/others/EditProduct.tsx

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import Toast from 'react-native-toast-message';

import {
  api,
} from '@/services/api';

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

// =====================================================
// IMAGE URL
// =====================================================

function getAbsoluteUrl(
  url?: string | null
): string | null {
  if (!url) {
    return null;
  }

  if (
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  const baseUrl =
    String(
      api.defaults.baseURL ?? ''
    ).replace(
      /\/$/,
      ''
    );

  return `${baseUrl}${
    url.startsWith('/')
      ? url
      : `/${url}`
  }`;
}

// =====================================================
// SCREEN
// =====================================================

export default function EditProductScreen() {
  // ===================================================
  // PARAMS
  // ===================================================

  const params =
    useLocalSearchParams<{
      documentId?: string;
      restaurantDocumentId?: string;
    }>();

  const documentId =
    Array.isArray(
      params.documentId
    )
      ? params.documentId[0]
      : params.documentId;

  const restaurantDocumentIdParam =
    Array.isArray(
      params.restaurantDocumentId
    )
      ? params.restaurantDocumentId[0]
      : params.restaurantDocumentId;

  // ===================================================
  // FORM
  // ===================================================

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
    selectedImage,
    setSelectedImage,
  ] =
    useState<ProductImageUpload | null>(
      null
    );

  // ===================================================
  // PRODUCT
  //
  // IMPORTANTE:
  // Ya NO mandamos restaurantId al hook.
  // Las categorías también son globales.
  // ===================================================

  const {
    product,
    categories,

    loading,
    loadingCategories,
    saving,

    loadCategories,

    createCategory,

    updateProduct,

    createMainImage,
    updateMainImage,
    deleteMainImage,
  } =
    useProduct({
      documentId,

      autoLoad:
        Boolean(
          documentId
        ),
    });

  // ===================================================
  // RESTAURANT REAL
  //
  // Primero usamos el param.
  // Si no existe, usamos el restaurante del producto.
  // ===================================================

  const restaurantDocumentId =
    restaurantDocumentIdParam ??
    product?.restaurant?.documentId ??
    null;

  // ===================================================
  // CATEGORÍAS GLOBALES
  // ===================================================

  useEffect(() => {
    void loadCategories();
  }, [
    loadCategories,
  ]);

  // ===================================================
  // CARGAR DATOS DEL PRODUCTO AL FORM
  // ===================================================

  useEffect(() => {
    if (!product) {
      return;
    }

    setValues({
      name:
        product.name,

      description:
        product.description ??
        '',

      price:
        String(
          product.price
        ),

      stock:
        String(
          product.stock ??
            0
        ),

      categoryDocumentId:
        product.category
          ?.documentId ??
        '',

      isAvailable:
        product.isAvailable,
    });
  }, [
    product,
  ]);

  // ===================================================
  // CURRENT IMAGE
  // ===================================================

  const currentImageUrl =
    useMemo(
      () =>
        getAbsoluteUrl(
          product
            ?.mainImage
            ?.url
        ),
      [
        product
          ?.mainImage
          ?.url,
      ]
    );

  // ===================================================
  // CREATE GLOBAL CATEGORY
  //
  // Ya NO mandamos restaurant.
  // ===================================================

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

  // ===================================================
  // DELETE CURRENT IMAGE
  // ===================================================

  const handleDeleteImage =
    async () => {
      if (
        !documentId ||
        !product?.mainImage
      ) {
        return;
      }

      try {
        await deleteMainImage(
          documentId
        );

        setSelectedImage(
          null
        );

        Toast.show({
          type:
            'success',

          text1:
            'Imagen eliminada',

          text2:
            'La imagen del producto fue eliminada.',

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
            'No se pudo eliminar la imagen',

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

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit =
    async () => {
      if (!documentId) {
        Toast.show({
          type:
            'error',

          text1:
            'Producto no encontrado',

          text2:
            'No se pudo identificar el producto.',

          position:
            'bottom',
        });

        return;
      }

      if (
        !restaurantDocumentId
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'Restaurante no encontrado',

          text2:
            'No se pudo identificar el restaurante del producto.',

          position:
            'bottom',
        });

        return;
      }

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

      // ===============================================
      // VALIDACIONES
      // ===============================================

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

      // ===============================================
      // UPDATE
      // ===============================================

      try {
        const updatedProduct =
          await updateProduct(
            documentId,
            {
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

              // documentId categoría global
              category:
                values
                  .categoryDocumentId,

              // documentId restaurante real
              restaurant:
                restaurantDocumentId,
            }
          );

        // =============================================
        // UPDATE IMAGE
        // =============================================

        if (
          selectedImage
        ) {
          if (
            updatedProduct.mainImage ||
            product?.mainImage
          ) {
            await updateMainImage(
              documentId,
              selectedImage
            );
          } else {
            await createMainImage(
              documentId,
              selectedImage
            );
          }
        }

        Toast.show({
          type:
            'success',

          text1:
            'Producto actualizado',

          text2:
            'Los cambios fueron guardados correctamente.',

          position:
            'bottom',
        });

        router.back();
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo actualizar',

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

  // ===================================================
  // INVALID ID
  // ===================================================

  if (!documentId) {
    return (
      <SafeAreaView
        className="
          flex-1
          bg-[#F7F8F2]
        "
      >
        <View
          className="
            flex-1
            items-center
            justify-center
            px-6
          "
        >
          <View
            className="
              h-16
              w-16
              items-center
              justify-center
              rounded-3xl
              bg-[#FFF0DD]
            "
          >
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color="#D47A24"
            />
          </View>

          <Text
            className="
              mt-4
              text-center
              text-xl
              font-extrabold
              text-[#171A15]
            "
          >
            Producto no encontrado
          </Text>

          <Text
            className="
              mt-2
              text-center
              text-sm
              text-[#777D71]
            "
          >
            No se recibió el identificador del producto.
          </Text>

          <Pressable
            onPress={() =>
              router.back()
            }
            className="
              mt-5
              rounded-2xl
              bg-[#6F8C3E]
              px-6
              py-3
            "
          >
            <Text
              className="
                font-bold
                text-white
              "
            >
              Volver
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // LOADING
  // ===================================================

  if (
    loading &&
    !product
  ) {
    return (
      <SafeAreaView
        className="
          flex-1
          items-center
          justify-center
          bg-[#F7F8F2]
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
          Cargando producto...
        </Text>
      </SafeAreaView>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
    >
      {/* HEADER */}

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
            Editar producto
          </Text>

          <Text
            numberOfLines={1}
            className="
              mt-0.5
              text-xs
              text-[#858B80]
            "
          >
            {product?.name ??
              'Producto'}
          </Text>
        </View>

        {saving ? (
          <ActivityIndicator
            size="small"
            color="#6F8C3E"
          />
        ) : null}
      </View>

      {/* FORM */}

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        showsVerticalScrollIndicator
        contentContainerClassName="
          grow
          px-5
          pb-24
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
            selectedImage
          }

          currentImageUrl={
            currentImageUrl
          }

          saving={
            saving
          }

          categorySaving={
            loadingCategories ||
            saving
          }

          submitLabel="Guardar cambios"

          onChange={
            setValues
          }

          onImageChange={
            setSelectedImage
          }

          onCreateCategory={
            handleCreateCategory
          }

          onDeleteCurrentImage={
            handleDeleteImage
          }

          onSubmit={
            handleSubmit
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}