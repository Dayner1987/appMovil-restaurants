// app/others/CreatePublication.tsx

import {
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

export default function CreatePublicationScreen() {
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
    useState<PublicationFormValues>({
      title:
        '',

      description:
        '',

      featured:
        false,
    });

  const [
    image,
    setImage,
  ] =
    useState<PublicationImageUpload | null>(
      null
    );

  const {
    saving,

    createPublication,

    createImage,
  } =
    usePublication({
      autoLoad:
        false,

      restaurantDocumentId,
    });

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async () => {
      if (
        !restaurantDocumentId
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'Restaurante no disponible',

          text2:
            'No se pudo identificar el restaurante.',

          position:
            'bottom',
        });

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

      try {
        const newPublication =
          await createPublication({
            title,

            description,

            featured:
              values.featured,

            restaurant:
              restaurantDocumentId,
          });

        // ===============================================
        // IMAGE
        //
        // Nueva publicación:
        // siempre POST.
        // ===============================================

        if (image) {
          try {
            await createImage(
              newPublication
                .documentId,
              image
            );
          } catch (
            requestError
          ) {
            Toast.show({
              type:
                'error',

              text1:
                'Publicación creada sin imagen',

              text2:
                requestError instanceof
                  Error
                  ? requestError.message
                  : 'No se pudo guardar la imagen.',

              position:
                'bottom',

              visibilityTime:
                3500,
            });

            setTimeout(
              () => {
                router.back();
              },
              1300
            );

            return;
          }
        }

        Toast.show({
          type:
            'success',

          text1:
            'Publicación creada',

          text2:
            'La publicación fue guardada correctamente.',

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
            'No se pudo crear',

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
            Nueva publicación
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
              image
            }

            saving={
              saving
            }

            submitLabel="Crear publicación"

            onChange={
              setValues
            }

            onImageChange={
              setImage
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