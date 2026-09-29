// components/restaurant/PublicationForm.tsx

import {
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import * as ImagePicker from 'expo-image-picker';

import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import Toast from 'react-native-toast-message';

import type {
  PublicationImageUpload,
} from '@/types/publication.types';

export interface PublicationFormValues {
  title:
    string;

  description:
    string;

  featured:
    boolean;
}

interface PublicationFormProps {
  values:
    PublicationFormValues;

  image:
    | PublicationImageUpload
    | null;

  currentImageUrl?:
    | string
    | null;

  saving?:
    boolean;

  submitLabel:
    string;

  onChange:
    (
      values:
        PublicationFormValues
    ) => void;

  onImageChange:
    (
      image:
        | PublicationImageUpload
        | null
    ) => void;

  onDeleteCurrentImage?:
    () => Promise<void>;

  onSubmit:
    () => Promise<void>;
}

export default function PublicationForm({
  values,
  image,
  currentImageUrl,
  saving = false,
  submitLabel,
  onChange,
  onImageChange,
  onDeleteCurrentImage,
  onSubmit,
}: PublicationFormProps) {
  const [
    deletingImage,
    setDeletingImage,
  ] =
    useState(false);

  const previewUri =
    image?.uri ??
    currentImageUrl ??
    null;

  const updateField =
    <
      K extends keyof PublicationFormValues,
    >(
      field: K,

      value:
        PublicationFormValues[K]
    ) => {
      onChange({
        ...values,

        [field]:
          value,
      });
    };

  // =====================================================
  // SELECT IMAGE
  // =====================================================

  const selectImage =
    async () => {
      if (
        Platform.OS !==
        'web'
      ) {
        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          Toast.show({
            type:
              'error',

            text1:
              'Permiso requerido',

            text2:
              'Debes permitir el acceso a tus imágenes.',

            position:
              'bottom',
          });

          return;
        }
      }

      const result =
        await ImagePicker
          .launchImageLibraryAsync({
            mediaTypes: [
              'images',
            ],

            allowsEditing:
              true,

            aspect: [
              16,
              9,
            ],

            quality:
              0.85,
          });

      if (
        result.canceled ||
        !result.assets
          ?.length
      ) {
        return;
      }

      const asset =
        result.assets[0];

      onImageChange({
        uri:
          asset.uri,

        fileName:
          asset.fileName ??
          'publication-image.jpg',

        mimeType:
          asset.mimeType ??
          'image/jpeg',

        file:
          asset.file ??
          undefined,
      });
    };

  // =====================================================
  // DELETE IMAGE
  // =====================================================

  const handleDeleteImage =
    async () => {
      if (image) {
        onImageChange(
          null
        );

        return;
      }

      if (
        !onDeleteCurrentImage
      ) {
        return;
      }

      setDeletingImage(
        true
      );

      try {
        await onDeleteCurrentImage();
      } finally {
        setDeletingImage(
          false
        );
      }
    };

  return (
    <View
      className="
        gap-5
      "
    >
      {/* IMAGE */}

      <View>
        <Text
          className="
            mb-2
            text-sm
            font-bold
            text-[#343A30]
          "
        >
          Imagen
        </Text>

        <Pressable
          onPress={() =>
            void selectImage()
          }
          disabled={
            saving
          }
          className="
            h-44
            overflow-hidden
            rounded-3xl
            border
            border-dashed
            border-[#BAC4AA]
            bg-[#EEF3E3]
          "
        >
          {previewUri ? (
            <Image
              source={{
                uri:
                  previewUri,
              }}
              resizeMode="cover"
              className="
                h-full
                w-full
              "
            />
          ) : (
            <View
              className="
                flex-1
                items-center
                justify-center
              "
            >
              <Ionicons
                name="image-outline"
                size={34}
                color="#6F8C3E"
              />

              <Text
                className="
                  mt-2
                  font-bold
                  text-[#607B35]
                "
              >
                Seleccionar imagen
              </Text>

              <Text
                className="
                  mt-1
                  text-xs
                  text-[#7B8175]
                "
              >
                Puedes agregarla ahora o después
              </Text>
            </View>
          )}
        </Pressable>

        {previewUri ? (
          <View
            className="
              mt-3
              flex-row
              gap-2
            "
          >
            <Pressable
              onPress={() =>
                void selectImage()
              }
              disabled={
                saving
              }
              className="
                flex-1
                flex-row
                items-center
                justify-center
                rounded-2xl
                bg-[#EEF3E3]
                py-3
              "
            >
              <Ionicons
                name="image-outline"
                size={18}
                color="#607B35"
              />

              <Text
                className="
                  ml-2
                  font-bold
                  text-[#607B35]
                "
              >
                Cambiar
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                void handleDeleteImage()
              }
              disabled={
                saving ||
                deletingImage
              }
              className="
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#FBECEA]
              "
            >
              {deletingImage ? (
                <ActivityIndicator
                  size="small"
                  color="#B65D51"
                />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="#B65D51"
                />
              )}
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* TITLE */}

      <View>
        <Text
          className="
            mb-2
            text-sm
            font-bold
            text-[#343A30]
          "
        >
          Título
        </Text>

        <TextInput
          value={
            values.title
          }
          onChangeText={(
            value
          ) =>
            updateField(
              'title',
              value
            )
          }
          placeholder="Ej. Promoción especial"
          placeholderTextColor="#A1A69B"
          className="
            rounded-2xl
            border
            border-[#DDE1D7]
            bg-white
            px-4
            py-3.5
            text-base
            text-[#171A15]
          "
        />
      </View>

      {/* DESCRIPTION */}

      <View>
        <Text
          className="
            mb-2
            text-sm
            font-bold
            text-[#343A30]
          "
        >
          Descripción
        </Text>

        <TextInput
          value={
            values.description
          }
          onChangeText={(
            value
          ) =>
            updateField(
              'description',
              value
            )
          }
          placeholder="Escribe el contenido de la publicación"
          placeholderTextColor="#A1A69B"
          multiline
          textAlignVertical="top"
          className="
            min-h-32
            rounded-2xl
            border
            border-[#DDE1D7]
            bg-white
            px-4
            py-3.5
            text-base
            text-[#171A15]
          "
        />
      </View>

      {/* FEATURED */}

      <View
        className="
          flex-row
          items-center
          justify-between
          rounded-2xl
          bg-white
          px-4
          py-4
        "
      >
        <View
          className="
            flex-1
            pr-4
          "
        >
          <View
            className="
              flex-row
              items-center
            "
          >
            <Ionicons
              name="star-outline"
              size={19}
              color="#D47A24"
            />

            <Text
              className="
                ml-2
                font-bold
                text-[#171A15]
              "
            >
              Publicación destacada
            </Text>
          </View>

          <Text
            className="
              mt-1
              text-xs
              leading-5
              text-[#858B80]
            "
          >
            Permite identificar contenido importante.
          </Text>
        </View>

        <Switch
          value={
            values.featured
          }
          onValueChange={(
            value
          ) =>
            updateField(
              'featured',
              value
            )
          }
          trackColor={{
            false:
              '#D8DBD3',

            true:
              '#AFBE8E',
          }}
          thumbColor={
            values.featured
              ? '#6F8C3E'
              : '#FFFFFF'
          }
        />
      </View>

      {/* SUBMIT */}

      <Pressable
        onPress={() =>
          void onSubmit()
        }
        disabled={
          saving
        }
        className={`
          flex-row
          items-center
          justify-center
          rounded-2xl
          py-4
          ${
            saving
              ? 'bg-[#9EAE82]'
              : 'bg-[#6F8C3E]'
          }
        `}
      >
        {saving ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <>
            <Ionicons
              name="checkmark-circle-outline"
              size={21}
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
              {submitLabel}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}