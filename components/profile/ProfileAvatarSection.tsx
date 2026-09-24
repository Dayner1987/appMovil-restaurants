// components/profile/ProfileAvatarSection.tsx

import { useState } from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

import type {
  AppUser,
  UserImage,
} from '@/types/user.types';

interface ProfileAvatarSectionProps {
  user: AppUser;

  avatar: UserImage | null;

  saving: boolean;

  onUpload: (
    imageUri: string,
    fileName?: string,
    mimeType?: string
  ) => Promise<UserImage | null>;

  onRemove: () => Promise<unknown>;
}

type Feedback = {
  type: 'success' | 'error';
  message: string;
} | null;

const API_URL =
  'http://localhost:1337';

function getAvatarUrl(
  avatar: UserImage | null
) {
  if (!avatar?.url) {
    return null;
  }

  if (
    avatar.url.startsWith('http')
  ) {
    return avatar.url;
  }

  return `${API_URL}${avatar.url}`;
}

function getErrorMessage(
  error: unknown,
  fallback: string
) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      fallback
    );
  }

  return fallback;
}

export default function ProfileAvatarSection({
  user,
  avatar,
  saving,
  onUpload,
  onRemove,
}: ProfileAvatarSectionProps) {
  const [
    localLoading,
    setLocalLoading,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] = useState<Feedback>(null);

  const avatarUrl =
    getAvatarUrl(avatar);

  const initial =
    (
      user.firstName ||
      user.username ||
      'U'
    )
      .charAt(0)
      .toUpperCase();

  async function handleSelectImage() {
    setFeedback(null);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setFeedback({
          type: 'error',
          message:
            'Debes permitir el acceso a tus imágenes.',
        });

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (result.canceled) {
        return;
      }

      const selectedImage =
        result.assets[0];

      setLocalLoading(true);

      await onUpload(
        selectedImage.uri,
        selectedImage.fileName ??
          'avatar.jpg',
        selectedImage.mimeType ??
          'image/jpeg'
      );

      setFeedback({
        type: 'success',
        message:
          'La foto de perfil se actualizó correctamente.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',

        message: getErrorMessage(
          error,
          'No se pudo actualizar la foto de perfil.'
        ),
      });
    } finally {
      setLocalLoading(false);
    }
  }

  async function handleRemoveImage() {
    if (!avatar) {
      return;
    }

    setFeedback(null);

    try {
      setLocalLoading(true);

      await onRemove();

      setFeedback({
        type: 'success',
        message:
          'La foto de perfil fue eliminada correctamente.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',

        message: getErrorMessage(
          error,
          'No se pudo eliminar la foto de perfil.'
        ),
      });
    } finally {
      setLocalLoading(false);
    }
  }

  const isLoading =
    saving || localLoading;

  return (
    <View className="rounded-[28px] bg-white p-5">
      <Text className="text-[18px] font-extrabold text-[#252A20]">
        Foto de perfil
      </Text>

      <Text className="mt-1 text-[12px] leading-5 text-[#8D9282]">
        Esta imagen será visible en tu cuenta.
      </Text>

      <View className="mt-5 items-center">
        <View className="h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full border-[5px] border-[#EEF3DF] bg-[#20251B]">
          {avatarUrl ? (
            <Image
              source={{
                uri: avatarUrl,
              }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-[42px] font-extrabold text-[#B8D36F]">
              {initial}
            </Text>
          )}

          {isLoading && (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <ActivityIndicator
                color="#B8D36F"
              />
            </View>
          )}
        </View>

        <Pressable
          disabled={isLoading}
          onPress={() =>
            void handleSelectImage()
          }
          className={`mt-4 min-h-[44px] flex-row items-center justify-center rounded-[16px] bg-[#20251B] px-5 active:opacity-80 ${
            isLoading
              ? 'opacity-50'
              : ''
          }`}
        >
          <Ionicons
            name="camera-outline"
            size={18}
            color="#B8D36F"
          />

          <Text className="ml-2 text-[13px] font-extrabold text-white">
            {avatar
              ? 'Cambiar foto'
              : 'Agregar foto'}
          </Text>
        </Pressable>

        {avatar && (
          <Pressable
            disabled={isLoading}
            onPress={() =>
              void handleRemoveImage()
            }
            className="mt-2 min-h-[40px] items-center justify-center px-4 active:opacity-60"
          >
            <Text className="text-[12px] font-bold text-[#B65D51]">
              Quitar foto
            </Text>
          </Pressable>
        )}

        {feedback && (
          <View
            className={`mt-4 w-full rounded-[16px] px-4 py-3 ${
              feedback.type ===
              'success'
                ? 'bg-[#ECF6DE]'
                : 'bg-[#FDE8E5]'
            }`}
          >
            <Text
              className={`text-center text-[12px] font-bold leading-5 ${
                feedback.type ===
                'success'
                  ? 'text-[#63863A]'
                  : 'text-[#B6534A]'
              }`}
            >
              {feedback.message}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}