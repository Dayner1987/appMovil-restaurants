// app/others/EditPublication.tsx

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
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import {
  api,
} from '@/services/api';

import PublicationForm from '@/components/restaurant/PublicationForm';

import type {
  PublicationFormValues,
} from '@/components/restaurant/PublicationForm';

import {
  usePublication,
} from '@/hooks/usePublication';

import type {
  PublicationImageUpload,
} from '@/types/publication.types';

// =====================================================
// IMAGE URL
// =====================================================

function getAbsoluteUrl(
  url?:
    | string
    | null
): string | null {
  if (!url) {
    return null;
  }

  if (
    url.startsWith(
      'http://'
    ) ||
    url.startsWith(
      'https://'
    )
  ) {
    return url;
  }

  const baseUrl =
    String(
      api.defaults.baseURL ??
      ''
    ).replace(
      /\/$/,
      ''
    );

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}${
    url.startsWith('/')
      ? url
      : `/${url}`
  }`;
}

// =====================================================
// SCREEN
// =====================================================

export default function EditPublicationScreen() {
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

  const restaurantDocumentId =
    Array.isArray(
      params.restaurantDocumentId
    )
      ? params.restaurantDocumentId[0]
      : params.restaurantDocumentId;

  const [
    values,
    setValues,
  ] =
    useState<PublicationFormValues>({
      title:
        '',

      description:
        '',

      featured:
        false,
    });

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<PublicationImageUpload | null>(
      null
    );

  const {
    publication,

    loading,
    saving,

    updatePublication,

    saveImage,

    deleteImage,
  } =
    usePublication({
      documentId,

      autoLoad:
        Boolean(
          documentId
        ),
    });

  // =====================================================
  // LOAD FORM
  // =====================================================

  useEffect(() => {
    if (
      !publication
    ) {
      return;
    }

    setValues({
      title:
        publication.title,

      description:
        publication.description,

      featured:
        Boolean(
          publication.featured
        ),
    });
  }, [
    publication,
  ]);

  // =====================================================
  // IMAGE URL
  // =====================================================

  const currentImageUrl =
    useMemo(
      () =>
        getAbsoluteUrl(
          publication
            ?.image
            ?.formats
            ?.medium
            ?.url ??
          publication
            ?.image
            ?.formats
            ?.small
            ?.url ??
          publication
            ?.image
            ?.url
        ),
      [
        publication
          ?.image,
      ]
    );

  // =====================================================
  // DELETE CURRENT IMAGE
  // =====================================================

  const handleDeleteCurrentImage =
    async () => {
      if (
        !documentId ||
        !publication?.image
      ) {
        return;
      }

      try {
        await deleteImage(
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
            'La imagen de la publicación fue eliminada.',

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

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async () => {
      if (
        !documentId
      ) {
        return;
      }

      const title =
        values.title.trim();

      const description =
        values.description
          .trim();

      if (!title) {
        Toast.show({
          type:
            'error',

          text1:
            'Título requerido',

          text2:
            'Escribe un título para la publicación.',

          position:
            'bottom',
        });

        return;
      }

      if (!description) {
        Toast.show({
          type:
            'error',

          text1:
            'Descripción requerida',

          text2:
            'Escribe el contenido de la publicación.',

          position:
            'bottom',
        });

        return;
      }

      /*
       * IMPORTANTE:
       *
       * Lo comprobamos ANTES
       * del PATCH de los datos.
       */
      const hadImageBeforeUpdate =
        Boolean(
          publication
            ?.image
            ?.id ||
          publication
            ?.image
            ?.documentId ||
          publication
            ?.image
            ?.url
        );

      try {
        // ===============================================
        // DATA
        // PATCH /publications/:documentId
        // ===============================================

        await updatePublication(
          documentId,
          {
            title,

            description,

            featured:
              values.featured,

            restaurant:
              restaurantDocumentId ??
              publication
                ?.restaurant
                ?.documentId ??
              null,
          }
        );

        // ===============================================
        // IMAGE
        //
        // existing -> PATCH
        // none     -> POST
        // ===============================================

        if (
          selectedImage
        ) {
          try {
            await saveImage(
              documentId,
              selectedImage,
              hadImageBeforeUpdate
            );
          } catch (
            requestError
          ) {
            Toast.show({
              type:
                'error',

              text1:
                'Publicación actualizada parcialmente',

              text2:
                requestError instanceof
                  Error
                  ? requestError.message
                  : 'Los datos se guardaron, pero la imagen no pudo actualizarse.',

              position:
                'bottom',

              visibilityTime:
                3500,
            });

            return;
          }
        }

        Toast.show({
          type:
            'success',

          text1:
            'Publicación actualizada',

          text2:
            'Los cambios fueron guardados correctamente.',

          position:
            'bottom',
        });

        setTimeout(
          () => {
            router.back();
          },
          700
        );
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

  // =====================================================
  // INVALID
  // =====================================================

  if (
    !documentId
  ) {
    return (
      <SafeAreaView
        className="
          flex-1
          items-center
          justify-center
          bg-[#F7F8F2]
          px-6
        "
        edges={[
          'top',
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={38}
          color="#D47A24"
        />

        <Text
          className="
            mt-4
            text-lg
            font-extrabold
            text-[#171A15]
          "
        >
          Publicación no encontrada
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
      </SafeAreaView>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading &&
    !publication
  ) {
    return (
      <SafeAreaView
        className="
          flex-1
          items-center
          justify-center
          bg-[#F7F8F2]
        "
        edges={[
          'top',
        ]}
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
          Cargando publicación...
        </Text>
      </SafeAreaView>
    );
  }

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
            Editar publicación
          </Text>

          <Text
            numberOfLines={1}
            className="
              mt-0.5
              text-xs
              text-[#858B80]
            "
          >
            {publication
              ?.title ??
              'Publicación'}
          </Text>
        </View>
      </View>

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
          <PublicationForm
            values={
              values
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

            submitLabel="Guardar cambios"

            onChange={
              setValues
            }

            onImageChange={
              setSelectedImage
            }

            onDeleteCurrentImage={
              handleDeleteCurrentImage
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