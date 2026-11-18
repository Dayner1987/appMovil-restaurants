import {
  useEffect,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import * as ImagePicker from 'expo-image-picker';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import { mediaUrl } from '@/utils/media';

import {
  useRestaurantManagement,
} from '@/hooks/useRestaurantManagement';

import RestaurantEditForm from '@/components/restaurant/RestaurantEditForm';

import type {
  RestaurantEditFormValues,
} from '@/components/restaurant/RestaurantEditForm';

function nullable(
  value: string,
) {
  return value.trim() || null;
}

export default function EditRestaurantScreen() {
  const params =
    useLocalSearchParams<{
      documentId?: string;
    }>();

  const documentId =
    Array.isArray(
      params.documentId,
    )
      ? params.documentId[0]
      : params.documentId;

  const {
    restaurant,
    loadingRestaurant,
    saving,
    error,
    loadRestaurant,
    updateRestaurant,
    uploadRestaurantMedia,
    deleteRestaurantMedia,
  } =
    useRestaurantManagement({
      restaurantDocumentId:
        documentId,
      autoLoadRestaurant:
        Boolean(documentId),
    });

  const [
    values,
    setValues,
  ] =
    useState<RestaurantEditFormValues>({
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      nit: '',
    });

  const [
    uploadingType,
    setUploadingType,
  ] = useState<
    'logo' | 'QRImage' | null
  >(null);

  useEffect(() => {
    if (!restaurant) {
      return;
    }

    setValues({
      name:
        restaurant.name ?? '',
      description:
        restaurant.description ?? '',
      email:
        restaurant.email ?? '',
      phone:
        restaurant.phone ?? '',
      address:
        restaurant.address ?? '',
      nit:
        restaurant.nit ?? '',
    });
  }, [restaurant]);

  async function pickImage(
    type: 'logo' | 'QRImage',
  ) {
    if (
      !documentId ||
      uploadingType
    ) {
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Toast.show({
        type: 'error',
        text1:
          'Permiso requerido',
        text2:
          'Permite el acceso a tus imágenes para continuar.',
      });

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing:
          type === 'logo',
        aspect:
          type === 'logo'
            ? [1, 1]
            : undefined,
        quality:
          type === 'logo'
            ? 0.9
            : 1,
      });

    if (
      result.canceled ||
      !result.assets[0]
    ) {
      return;
    }

    const image =
      result.assets[0];

    setUploadingType(type);

    try {
      const upload = {
        uri: image.uri,
        fileName:
          image.fileName ??
          (type === 'logo'
            ? 'restaurant-logo.jpg'
            : 'restaurant-qr.jpg'),
        mimeType:
          image.mimeType ??
          'image/jpeg',
      };

      const exists =
        type === 'logo'
          ? Boolean(
              restaurant?.logo?.id,
            )
          : Boolean(
              restaurant?.QRImage?.id,
            );

      await uploadRestaurantMedia(
        type,
        upload,
        documentId,
        exists,
      );

      Toast.show({
        type: 'success',
        text1:
          type === 'logo'
            ? 'Logo actualizado'
            : 'QR actualizado',
        text2:
          'La imagen se guardó correctamente.',
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          type === 'logo'
            ? 'No se pudo cambiar el logo'
            : 'No se pudo cambiar el QR',
        text2:
          error instanceof Error
            ? error.message
            : 'Intenta nuevamente.',
        position: 'bottom',
      });
    } finally {
      setUploadingType(null);
    }
  }

  async function removeMedia(
    type: 'logo' | 'QRImage',
  ) {
    if (
      !documentId ||
      saving
    ) {
      return;
    }

    try {
      await deleteRestaurantMedia(
        type,
        documentId,
      );

      Toast.show({
        type: 'success',
        text1:
          type === 'logo'
            ? 'Logo eliminado'
            : 'QR eliminado',
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          'No se pudo eliminar la imagen',
        text2:
          error instanceof Error
            ? error.message
            : 'Intenta nuevamente.',
        position: 'bottom',
      });
    }
  }

  async function handleSubmit() {
    if (
      !documentId ||
      saving
    ) {
      return;
    }

    const name =
      values.name.trim();

    const email =
      values.email.trim().toLowerCase();

    if (!name) {
      Toast.show({
        type: 'error',
        text1:
          'Nombre requerido',
        text2:
          'Escribe el nombre del restaurante.',
        position: 'bottom',
      });

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      Toast.show({
        type: 'error',
        text1:
          'Correo no válido',
        position: 'bottom',
      });

      return;
    }

    try {
      await updateRestaurant(
        {
          name,
          description:
            values.description.trim() ||
            null,
          email,
          phone:
            nullable(values.phone),
          address:
            nullable(values.address),
          nit:
            nullable(values.nit),
        },
        documentId,
      );

      Toast.show({
        type: 'success',
        text1:
          'Restaurante actualizado',
        text2:
          'La información se guardó correctamente.',
        position: 'bottom',
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          'No se pudo actualizar',
        text2:
          error instanceof Error
            ? error.message
            : 'Intenta nuevamente.',
        position: 'bottom',
      });
    }
  }

  const logoUrl =
    mediaUrl(
      restaurant?.logo,
    );

  const qrUrl =
    mediaUrl(
      restaurant?.QRImage,
    );

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={[
        'top',
        'bottom',
      ]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View className="flex-row items-center bg-white px-4 py-4">
          <Pressable
            onPress={() =>
              router.back()
            }
            className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#EEF3E3]"
            accessibilityLabel="Volver"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#617D34"
            />
          </Pressable>

          <View className="ml-3">
            <Text className="text-[20px] font-extrabold text-[#252A20]">
              Editar restaurante
            </Text>

            <Text className="mt-0.5 text-[11px] text-[#858A7A]">
              Información, logo y QR del negocio
            </Text>
          </View>
        </View>

        {loadingRestaurant &&
        !restaurant ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color="#6F8C3E"
            />

            <Text className="mt-3 text-sm text-[#777D71]">
              Cargando información...
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 18,
              paddingBottom: 140,
            }}
          >
            {error ? (
              <View className="mb-4 rounded-2xl bg-[#FFF1EF] p-4">
                <Text className="text-sm font-semibold text-[#A6514C]">
                  {error}
                </Text>

                <Pressable
                  onPress={() =>
                    void loadRestaurant(
                      documentId,
                    ).catch(
                      () => undefined,
                    )
                  }
                  className="mt-2"
                >
                  <Text className="font-bold text-[#A6514C]">
                    Reintentar
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {restaurant ? (
              <>
                <View className="mb-4 rounded-[26px] border border-[#E7EAE1] bg-white p-5">
                  <Text className="text-[16px] font-extrabold text-[#252A20]">
                    Información del sistema
                  </Text>

                  <View className="mt-4 gap-3">
                    <View className="rounded-2xl bg-[#F7F8F2] p-4">
                      <Text className="text-[10px] font-semibold uppercase tracking-wide text-[#989E8F]">
                        Slug
                      </Text>

                      <Text className="mt-1 text-sm font-bold text-[#30352A]">
                        {restaurant.slug ||
                          'Se generará automáticamente'}
                      </Text>
                    </View>

                    <View className="rounded-2xl bg-[#F7F8F2] p-4">
                      <Text className="text-[10px] font-semibold uppercase tracking-wide text-[#989E8F]">
                        Estado
                      </Text>

                      <Text className="mt-1 text-sm font-bold text-[#617D34]">
                        {restaurant.statusRes}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mb-4 rounded-[26px] bg-white p-5">
                  <Text className="text-[16px] font-extrabold text-[#252A20]">
                    Logo principal
                  </Text>

                  <View className="mt-4 items-center">
                    {logoUrl ? (
                      <Image
                        key={`${logoUrl}-${restaurant.logo?.updatedAt ?? ''}`}
                        source={{
                          uri: logoUrl,
                        }}
                        resizeMode="contain"
                        className="h-36 w-36 rounded-[28px] bg-[#EEF3E3]"
                      />
                    ) : (
                      <View className="h-36 w-36 items-center justify-center rounded-[28px] bg-[#EEF3E3]">
                        <Ionicons
                          name="restaurant-outline"
                          size={42}
                          color="#6F8C3E"
                        />
                      </View>
                    )}
                  </View>

                  <Pressable
                    disabled={
                      Boolean(
                        uploadingType,
                      ) ||
                      saving
                    }
                    onPress={() =>
                      void pickImage(
                        'logo',
                      )
                    }
                    className="mt-4 flex-row items-center justify-center rounded-[16px] bg-[#6F8C3E] py-4"
                  >
                    {uploadingType ===
                    'logo' ? (
                      <ActivityIndicator
                        color="#FFFFFF"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="cloud-upload-outline"
                          size={19}
                          color="#FFFFFF"
                        />

                        <Text className="ml-2 font-extrabold text-white">
                          {restaurant.logo
                            ? 'Cambiar logo'
                            : 'Subir logo'}
                        </Text>
                      </>
                    )}
                  </Pressable>

                  {restaurant.logo ? (
                    <Pressable
                      disabled={
                        saving ||
                        Boolean(
                          uploadingType,
                        )
                      }
                      onPress={() =>
                        void removeMedia(
                          'logo',
                        )
                      }
                      className="mt-2 items-center py-2"
                    >
                      <Text className="text-xs font-bold text-[#A45750]">
                        Eliminar logo
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                <View className="mb-4 rounded-[26px] bg-white p-5">
                  <Text className="text-[16px] font-extrabold text-[#252A20]">
                    QR para recibir pagos
                  </Text>

                  <Text className="mt-1 text-xs leading-5 text-[#7B8672]">
                    Esta imagen se utilizará como QR de pago del restaurante.
                  </Text>

                  <View className="mt-4 items-center rounded-2xl bg-[#F7F8F2] p-4">
                    {qrUrl ? (
                      <Image
                        key={`${qrUrl}-${restaurant.QRImage?.updatedAt ?? ''}`}
                        source={{
                          uri: qrUrl,
                        }}
                        resizeMode="contain"
                        style={{
                          width: '100%',
                          height: 280,
                        }}
                      />
                    ) : (
                      <View className="h-56 w-full items-center justify-center">
                        <Ionicons
                          name="qr-code-outline"
                          size={60}
                          color="#91A37D"
                        />

                        <Text className="mt-3 text-xs text-[#7B8672]">
                          Todavía no hay un QR cargado.
                        </Text>
                      </View>
                    )}
                  </View>

                  <Pressable
                    disabled={
                      Boolean(
                        uploadingType,
                      ) ||
                      saving
                    }
                    onPress={() =>
                      void pickImage(
                        'QRImage',
                      )
                    }
                    className="mt-4 flex-row items-center justify-center rounded-[16px] bg-[#6F8C3E] py-4"
                  >
                    {uploadingType ===
                    'QRImage' ? (
                      <ActivityIndicator
                        color="#FFFFFF"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="cloud-upload-outline"
                          size={19}
                          color="#FFFFFF"
                        />

                        <Text className="ml-2 font-extrabold text-white">
                          {restaurant.QRImage
                            ? 'Cambiar QR'
                            : 'Subir QR'}
                        </Text>
                      </>
                    )}
                  </Pressable>

                  {restaurant.QRImage ? (
                    <Pressable
                      disabled={
                        saving ||
                        Boolean(
                          uploadingType,
                        )
                      }
                      onPress={() =>
                        void removeMedia(
                          'QRImage',
                        )
                      }
                      className="mt-2 items-center py-2"
                    >
                      <Text className="text-xs font-bold text-[#A45750]">
                        Eliminar QR
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                <RestaurantEditForm
                  values={values}
                  saving={saving}
                  onChange={setValues}
                  onSubmit={() =>
                    void handleSubmit()
                  }
                />
              </>
            ) : null}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
