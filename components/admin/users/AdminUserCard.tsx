// components/admin/users/AdminUserCard.tsx

import {
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { api } from '@/services/api';

import type {
  AppUser,
} from '@/types/user.types';

interface AdminUserCardProps {
  user: AppUser;

  onEdit: () => void;
  onDelete: () => void;
}

function getFullName(
  user: AppUser
) {
  const name = [
    user.firstName,
    user.middleName,
    user.lastName,
    user.secondLastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    name ||
    user.username
  );
}

function getInitials(
  user: AppUser
) {
  const first =
    user.firstName?.[0] ??
    user.username?.[0] ??
    'U';

  const last =
    user.lastName?.[0] ??
    '';

  return `${first}${last}`.toUpperCase();
}

function getAvatarUrl(
  user: AppUser
) {
  const url =
    user.avatar?.url;

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
      api.defaults
        .baseURL ?? ''
    ).replace(
      /\/$/,
      ''
    );

  return `${baseUrl}${url}`;
}

export default function AdminUserCard({
  user,
  onEdit,
  onDelete,
}: AdminUserCardProps) {
  const avatarUrl =
    getAvatarUrl(
      user
    );

  const roleName =
    user.role?.name ??
    'Sin rol';

  return (
    <View className="rounded-[24px] border border-[#E9EBE3] bg-white p-4">
      <View className="flex-row items-start">
        {avatarUrl ? (
          <Image
            source={{
              uri: avatarUrl,
            }}
            className="h-14 w-14 rounded-[18px] bg-[#EEF3E3]"
          />
        ) : (
          <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEF3E3]">
            <Text className="text-[16px] font-extrabold text-[#6F8C3E]">
              {getInitials(
                user
              )}
            </Text>
          </View>
        )}

        <View className="ml-3 min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="text-[15px] font-extrabold text-[#252A20]"
          >
            {getFullName(
              user
            )}
          </Text>

          <Text
            numberOfLines={1}
            className="mt-0.5 text-[12px] font-medium text-[#858A7A]"
          >
            @{user.username}
          </Text>

          <View className="mt-2 self-start rounded-full bg-[#EEF3E3] px-3 py-1">
            <Text className="text-[10px] font-bold text-[#6F8C3E]">
              {roleName}
            </Text>
          </View>
        </View>

        <View className="ml-2 flex-row gap-2">
          <Pressable
            onPress={
              onEdit
            }
            className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#EEF3E3] active:opacity-70"
          >
            <Ionicons
              name="create-outline"
              size={19}
              color="#6F8C3E"
            />
          </Pressable>

          <Pressable
            onPress={
              onDelete
            }
            className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#FBEDEA] active:opacity-70"
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#B65D51"
            />
          </Pressable>
        </View>
      </View>

      <View className="mt-4 flex-row items-center">
        <Ionicons
          name="mail-outline"
          size={16}
          color="#858A7A"
        />

        <Text
          numberOfLines={1}
          className="ml-2 flex-1 text-[12px] text-[#6F7468]"
        >
          {user.email}
        </Text>
      </View>

      {user.phone && (
        <View className="mt-2 flex-row items-center">
          <Ionicons
            name="call-outline"
            size={16}
            color="#858A7A"
          />

          <Text className="ml-2 text-[12px] text-[#6F7468]">
            {user.phone}
          </Text>
        </View>
      )}

      <View className="mt-4 flex-row flex-wrap gap-2">
        <View
          className={
            user.blocked
              ? 'rounded-full bg-[#FBEDEA] px-3 py-1.5'
              : 'rounded-full bg-[#EDF4E2] px-3 py-1.5'
          }
        >
          <Text
            className={
              user.blocked
                ? 'text-[10px] font-bold text-[#B65D51]'
                : 'text-[10px] font-bold text-[#6F8C3E]'
            }
          >
            {user.blocked
              ? 'Bloqueado'
              : 'Activo'}
          </Text>
        </View>

        <View
          className={
            user.confirmed
              ? 'rounded-full bg-[#EDF4E2] px-3 py-1.5'
              : 'rounded-full bg-[#F1F2ED] px-3 py-1.5'
          }
        >
          <Text
            className={
              user.confirmed
                ? 'text-[10px] font-bold text-[#6F8C3E]'
                : 'text-[10px] font-bold text-[#858A7A]'
            }
          >
            {user.confirmed
              ? 'Confirmado'
              : 'Sin confirmar'}
          </Text>
        </View>
      </View>
    </View>
  );
}