// components/profile/ProfilePasswordForm.tsx

import {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';

import type {
  ChangePasswordData,
  ChangePasswordResponse,
} from '@/types/user.types';

interface ProfilePasswordFormProps {
  saving: boolean;

  onChangePassword: (
    data: ChangePasswordData
  ) => Promise<ChangePasswordResponse>;
}

type Feedback = {
  type: 'success' | 'error';
  message: string;
} | null;

// =====================================================
// TRADUCIR MENSAJES DEL BACKEND
// =====================================================

function translateBackendMessage(
  message: string
) {
  const normalized =
    message
      .trim()
      .toLowerCase();

  if (
    normalized.includes(
      'forbidden'
    )
  ) {
    return 'No tienes permiso para cambiar la contraseña.';
  }

  if (
    normalized.includes(
      'current password is invalid'
    ) ||
    normalized.includes(
      'current password is incorrect'
    ) ||
    normalized.includes(
      'invalid current password'
    )
  ) {
    return 'La contraseña actual es incorrecta.';
  }

  if (
    normalized.includes(
      'passwords do not match'
    ) ||
    normalized.includes(
      'password confirmation'
    )
  ) {
    return 'La nueva contraseña y su confirmación no coinciden.';
  }

  if (
    normalized.includes(
      'password must be'
    ) ||
    normalized.includes(
      'password is too short'
    )
  ) {
    return 'La nueva contraseña no cumple con los requisitos de seguridad.';
  }

  if (
    normalized.includes(
      'unauthorized'
    )
  ) {
    return 'Tu sesión no es válida. Inicia sesión nuevamente.';
  }

  return 'No se pudo cambiar la contraseña.';
}

// =====================================================
// OBTENER MENSAJE DEL ERROR
// =====================================================

function getErrorMessage(
  error: unknown
) {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const backendMessage =
      error.response
        ?.data
        ?.error
        ?.message ??
      error.response
        ?.data
        ?.message;

    if (
      typeof backendMessage ===
      'string'
    ) {
      return translateBackendMessage(
        backendMessage
      );
    }
  }

  return 'No se pudo cambiar la contraseña.';
}

export default function ProfilePasswordForm({
  saving,
  onChangePassword,
}: ProfilePasswordFormProps) {
  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  // Solo la contraseña actual puede mostrarse
  const [
    showCurrent,
    setShowCurrent,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] = useState<Feedback>(
    null
  );

  // ===================================================
  // CAMBIAR CONTRASEÑA
  // ===================================================

  async function handleChangePassword() {
    setFeedback(null);

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setFeedback({
        type: 'error',
        message:
          'Completa todos los campos de contraseña.',
      });

      return;
    }

    if (
      newPassword.length <
      6
    ) {
      setFeedback({
        type: 'error',
        message:
          'La nueva contraseña debe tener al menos 6 caracteres.',
      });

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setFeedback({
        type: 'error',
        message:
          'La nueva contraseña y su confirmación no coinciden.',
      });

      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setFeedback({
        type: 'error',
        message:
          'La nueva contraseña debe ser diferente a la contraseña actual.',
      });

      return;
    }

    try {
      await onChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setShowCurrent(false);

      setFeedback({
        type: 'success',
        message:
          'La contraseña se actualizó correctamente.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          getErrorMessage(
            error
          ),
      });
    }
  }

  return (
    <View className="mt-4 rounded-[28px] bg-white p-5">
      <Text className="text-[18px] font-extrabold text-[#252A20]">
        Contraseña
      </Text>

      <Text className="mt-1 text-[12px] leading-5 text-[#8D9282]">
        Cambia tu contraseña cuando lo necesites.
      </Text>

      <View className="mt-5">
        {/* CONTRASEÑA ACTUAL */}

        <PasswordInput
          label="Contraseña actual"
          value={
            currentPassword
          }
          onChangeText={
            setCurrentPassword
          }
          visible={
            showCurrent
          }
          canToggle
          onToggle={() =>
            setShowCurrent(
              (
                current
              ) =>
                !current
            )
          }
        />

        {/* NUEVA CONTRASEÑA */}

        <PasswordInput
          label="Nueva contraseña"
          value={
            newPassword
          }
          onChangeText={
            setNewPassword
          }
        />

        {/* CONFIRMAR CONTRASEÑA */}

        <PasswordInput
          label="Confirmar contraseña"
          value={
            confirmPassword
          }
          onChangeText={
            setConfirmPassword
          }
        />

        {/* BOTÓN */}

        <Pressable
          disabled={saving}
          onPress={() =>
            void handleChangePassword()
          }
          className={`mt-2 min-h-[54px] items-center justify-center rounded-[18px] bg-[#D98B4F] ${
            saving
              ? 'opacity-50'
              : 'active:opacity-80'
          }`}
        >
          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text className="text-[14px] font-extrabold text-white">
              Cambiar contraseña
            </Text>
          )}
        </Pressable>

        {/* MENSAJE */}

        {feedback && (
          <View
            className={`mt-3 rounded-[16px] px-4 py-3 ${
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
              {
                feedback.message
              }
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// =====================================================
// INPUT DE CONTRASEÑA
// =====================================================

function PasswordInput({
  label,
  value,
  onChangeText,
  visible = false,
  canToggle = false,
  onToggle,
}: {
  label: string;

  value: string;

  onChangeText: (
    value: string
  ) => void;

  visible?: boolean;

  canToggle?: boolean;

  onToggle?: () => void;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[12px] font-bold text-[#5F6557]">
        {label}
      </Text>

      <View className="min-h-[52px] flex-row items-center rounded-[16px] border border-[#E5E7DF] bg-[#FAFBF7] px-4">
        <TextInput
          value={value}
          onChangeText={
            onChangeText
          }
          secureTextEntry={
            canToggle
              ? !visible
              : true
          }
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="••••••••"
          placeholderTextColor="#A3A798"
          className="flex-1 text-[14px] text-[#30352A]"
        />

        {canToggle &&
          onToggle && (
            <Pressable
              onPress={
                onToggle
              }
              className="ml-2 h-9 w-9 items-center justify-center"
            >
              <Ionicons
                name={
                  visible
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={19}
                color="#7F8576"
              />
            </Pressable>
          )}
      </View>
    </View>
  );
}