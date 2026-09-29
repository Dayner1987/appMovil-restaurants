// components/restaurant/ProductForm.tsx

import {
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import * as ImagePicker from 'expo-image-picker';

import {
  ActivityIndicator,
  Image,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Picker,
} from '@react-native-picker/picker';

import Toast from 'react-native-toast-message';

import type {
  Category,
} from '@/types/category.types';

import type {
  ProductImageUpload,
} from '@/types/product.types';

import CreateCategoryModal from './CreateCategoryModal';

export interface ProductFormValues {
  name:
    string;

  description:
    string;

  price:
    string;

  stock:
    string;

  categoryDocumentId:
    string;

  isAvailable:
    boolean;
}

interface ProductFormProps {
  values:
    ProductFormValues;

  categories:
    Category[];

  image:
    ProductImageUpload | null;

  currentImageUrl?:
    | string
    | null;

  saving?:
    boolean;

  categorySaving?:
    boolean;

  submitLabel:
    string;

  onChange:
    (
      values:
        ProductFormValues
    ) => void;

  onImageChange:
    (
      image:
        ProductImageUpload
        | null
    ) => void;

  onCreateCategory:
    (
      name: string
    ) => Promise<Category>;

  onDeleteCurrentImage?:
    () => Promise<void>;

  onSubmit:
    () => Promise<void>;
}

export default function ProductForm({
  values,
  categories,
  image,
  currentImageUrl,
  saving = false,
  categorySaving = false,
  submitLabel,
  onChange,
  onImageChange,
  onCreateCategory,
  onDeleteCurrentImage,
  onSubmit,
}: ProductFormProps) {
  const [
    showCategoryModal,
    setShowCategoryModal,
  ] =
    useState(false);

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
      K extends keyof ProductFormValues,
    >(
      field: K,
      value:
        ProductFormValues[K]
    ) => {
      onChange({
        ...values,
        [field]:
          value,
      });
    };

  const selectImage =
    async () => {
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
        });

        return;
      }

      const result =
        await ImagePicker
          .launchImageLibraryAsync({
            mediaTypes:
              [
                'images',
              ],

            allowsEditing:
              true,

            aspect:
              [
                1,
                1,
              ],

            quality:
              0.85,
          });

      if (
        result.canceled
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
          'product-image.jpg',

        mimeType:
          asset.mimeType ??
          'image/jpeg',
      });
    };

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

  const handleCreateCategory =
    async (
      name: string
    ) => {
      const newCategory =
        await onCreateCategory(
          name
        );

      updateField(
        'categoryDocumentId',
        newCategory.documentId
      );

      setShowCategoryModal(
        false
      );

      Toast.show({
        type:
          'success',

        text1:
          'Categoría creada',

        text2:
          newCategory.name,
      });
    };

  return (
    <>
      <View
        className="
          gap-5
        "
      >
        <View>
          <Text
            className="
              mb-2
              text-sm
              font-bold
              text-[#343A30]
            "
          >
            Imagen del producto
          </Text>

          <Pressable
            onPress={
              selectImage
            }
            className="
              h-52
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
                  size={38}
                  color="#6F8C3E"
                />

                <Text
                  className="
                    mt-3
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
                  Toca para elegir una imagen
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
                onPress={
                  selectImage
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
                  size={19}
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

        <View>
          <Text
            className="
              mb-2
              text-sm
              font-bold
              text-[#343A30]
            "
          >
            Nombre
          </Text>

          <TextInput
            value={
              values.name
            }
            onChangeText={(
              value
            ) =>
              updateField(
                'name',
                value
              )
            }
            placeholder="Ej. Hamburguesa clásica"
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
            placeholder="Describe brevemente el producto"
            placeholderTextColor="#A1A69B"
            multiline
            textAlignVertical="top"
            className="
              min-h-28
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

        <View
          className="
            flex-row
            gap-3
          "
        >
          <View
            className="
              flex-1
            "
          >
            <Text
              className="
                mb-2
                text-sm
                font-bold
                text-[#343A30]
              "
            >
              Precio
            </Text>

            <TextInput
              value={
                values.price
              }
              onChangeText={(
                value
              ) =>
                updateField(
                  'price',
                  value
                )
              }
              keyboardType="decimal-pad"
              placeholder="0.00"
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

          <View
            className="
              flex-1
            "
          >
            <Text
              className="
                mb-2
                text-sm
                font-bold
                text-[#343A30]
              "
            >
              Stock
            </Text>

            <TextInput
              value={
                values.stock
              }
              onChangeText={(
                value
              ) =>
                updateField(
                  'stock',
                  value
                )
              }
              keyboardType="number-pad"
              placeholder="0"
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
        </View>

        <View>
          <View
            className="
              mb-2
              flex-row
              items-center
              justify-between
            "
          >
            <Text
              className="
                text-sm
                font-bold
                text-[#343A30]
              "
            >
              Categoría
            </Text>

            <Pressable
              onPress={() =>
                setShowCategoryModal(
                  true
                )
              }
              className="
                flex-row
                items-center
              "
            >
              <Ionicons
                name="add-circle-outline"
                size={18}
                color="#D47A24"
              />

              <Text
                className="
                  ml-1
                  text-sm
                  font-bold
                  text-[#D47A24]
                "
              >
                Nueva categoría
              </Text>
            </Pressable>
          </View>

          <View
            className="
              overflow-hidden
              rounded-2xl
              border
              border-[#DDE1D7]
              bg-white
            "
          >
            <Picker
              selectedValue={
                values.categoryDocumentId
              }
              onValueChange={(
                value
              ) =>
                updateField(
                  'categoryDocumentId',
                  String(
                    value ??
                      ''
                  )
                )
              }
              style={{
                color:
                  '#171A15',
              }}
            >
              <Picker.Item
                label={
                  categories.length >
                  0
                    ? 'Selecciona una categoría'
                    : 'No hay categorías'
                }
                value=""
              />

              {categories.map(
                (
                  category
                ) => (
                  <Picker.Item
                    key={
                      category.documentId
                    }
                    label={
                      category.name
                    }
                    value={
                      category.documentId
                    }
                  />
                )
              )}
            </Picker>
          </View>

          {categories.length ===
          0 ? (
            <View
              className="
                mt-3
                flex-row
                items-center
                rounded-2xl
                bg-[#FFF0DD]
                px-4
                py-3
              "
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#D47A24"
              />

              <Text
                className="
                  ml-2
                  flex-1
                  text-sm
                  text-[#9A591E]
                "
              >
                Aún no tienes categorías.
                Crea una para poder registrar
                el producto.
              </Text>
            </View>
          ) : null}
        </View>

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
              pr-3
            "
          >
            <Text
              className="
                font-bold
                text-[#171A15]
              "
            >
              Producto disponible
            </Text>

            <Text
              className="
                mt-1
                text-xs
                text-[#858B80]
              "
            >
              Permite que el producto aparezca
              disponible para la venta.
            </Text>
          </View>

          <Switch
            value={
              values.isAvailable
            }
            onValueChange={(
              value
            ) =>
              updateField(
                'isAvailable',
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
              values.isAvailable
                ? '#6F8C3E'
                : '#FFFFFF'
            }
          />
        </View>

        <Pressable
          onPress={() =>
            void onSubmit()
          }
          disabled={
            saving
          }
          className="
            mt-2
            flex-row
            items-center
            justify-center
            rounded-2xl
            bg-[#6F8C3E]
            py-4
          "
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

      <CreateCategoryModal
        visible={
          showCategoryModal
        }
        saving={
          categorySaving
        }
        onClose={() =>
          setShowCategoryModal(
            false
          )
        }
        onCreate={
          handleCreateCategory
        }
      />
    </>
  );
}