// components/admin/users/DeleteUserModal.tsx

import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import type {
  AppUser,
} from '@/types/user.types';

interface DeleteUserModalProps {
  visible: boolean;

  user:
    | AppUser
    | null;

  deleting: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  visible,
  user,
  deleting,
  onCancel,
  onConfirm,
}: DeleteUserModalProps) {
  const name = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={
        onCancel
      }
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-5">
        <View className="w-full max-w-[420px] rounded-[26px] bg-[#F7F8F2] p-5">
          <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-[#FBEDEA]">
            <Ionicons
              name="trash-outline"
              size={22}
              color="#B65D51"
            />
          </View>

          <Text className="mt-4 text-[19px] font-extrabold text-[#252A20]">
            Eliminar usuario
          </Text>

          <Text className="mt-2 text-[13px] leading-5 text-[#858A7A]">
            ¿Estás seguro de que
            deseas eliminar a{' '}
            <Text className="font-bold text-[#30352A]">
              {name ||
                user?.username}
            </Text>
            ? Esta acción no se
            puede deshacer.
          </Text>

          <View className="mt-6 flex-row gap-3">
            <Pressable
              disabled={
                deleting
              }
              onPress={
                onCancel
              }
              className="h-12 flex-1 items-center justify-center rounded-[16px] border border-[#E9EBE3] bg-white active:opacity-70"
            >
              <Text className="text-[13px] font-bold text-[#59604F]">
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              disabled={
                deleting
              }
              onPress={
                onConfirm
              }
              className="h-12 flex-1 flex-row items-center justify-center rounded-[16px] bg-[#B65D51] active:opacity-80"
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text className="ml-2 text-[13px] font-bold text-white">
                    Eliminar
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}