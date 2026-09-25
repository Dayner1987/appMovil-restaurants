import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import type { Company } from '@/types/company.types';
import { api } from '@/services/api';

interface CompanyLogoEditorProps {
  company: Company;
  saving: boolean;
  onUpload: (
    documentId: string,
    imageUri: string,
    fileName?: string,
    mimeType?: string
  ) => Promise<Company>;
  onDelete: (
    documentId: string
  ) => Promise<Company>;
}

function getImageUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith('http')) {
    return url;
  }

  const baseUrl = api.defaults.baseURL
    ?.replace(/\/api\/?$/, '');

  return `${baseUrl}${url}`;
}

export default function CompanyLogoEditor({
  company,
  saving,
  onUpload,
  onDelete,
}: CompanyLogoEditorProps) {
  const logoUrl = getImageUrl(company.logoImg?.url);

  async function selectImage() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',
        'Debes permitir el acceso a tus imágenes.'
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const image = result.assets[0];

    try {
      await onUpload(
        company.documentId,
        image.uri,
        image.fileName || 'company-logo.jpg',
        image.mimeType || 'image/jpeg'
      );

      Toast.show({
        type: 'success',
        text1: 'Logo actualizado',
        text2: 'La imagen se guardó correctamente.',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo actualizar el logo.',
      });
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Eliminar logo',
      '¿Deseas eliminar el logo actual?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(company.documentId);

              Toast.show({
                type: 'success',
                text1: 'Logo eliminado',
                text2: 'El logo se eliminó correctamente.',
              });
            } catch {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo eliminar el logo.',
              });
            }
          },
        },
      ]
    );
  }

  return (
    <View className="rounded-[24px] border border-[#E9EBE3] bg-white p-5">
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#E8EEDC]">
          <Ionicons
            name="image-outline"
            size={22}
            color="#627A36"
          />
        </View>

        <View className="ml-3">
          <Text className="text-[17px] font-extrabold text-[#252A20]">
            Logo de la empresa
          </Text>

          <Text className="mt-1 text-[12px] text-[#858A7A]">
            Imagen representativa del sistema
          </Text>
        </View>
      </View>

      <View className="mt-6 items-center">
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            className="h-[150px] w-[150px] rounded-[28px]"
            resizeMode="cover"
          />
        ) : (
          <View className="h-[150px] w-[150px] items-center justify-center rounded-[28px] bg-[#EEF1E7]">
            <Ionicons
              name="business-outline"
              size={55}
              color="#7B9646"
            />
          </View>
        )}
      </View>

      <Pressable
        disabled={saving}
        onPress={() => void selectImage()}
        className="mt-6 flex-row items-center justify-center rounded-[16px] bg-[#7B9646] px-4 py-4 active:opacity-80"
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text className="ml-2 font-extrabold text-white">
              Cambiar logo
            </Text>
          </>
        )}
      </Pressable>

      {company.logoImg && (
        <Pressable
          disabled={saving}
          onPress={confirmDelete}
          className="mt-3 flex-row items-center justify-center rounded-[16px] border border-[#E7C3BE] px-4 py-3"
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color="#B65D51"
          />

          <Text className="ml-2 font-bold text-[#B65D51]">
            Eliminar logo
          </Text>
        </Pressable>
      )}
    </View>
  );
}