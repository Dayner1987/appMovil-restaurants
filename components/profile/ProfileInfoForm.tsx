// components/profile/ProfileInfoForm.tsx

import {
  useEffect,
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
  AppUser,
  UpdateMyProfileData,
} from '@/types/user.types';

interface ProfileInfoFormProps {
  user: AppUser;
  saving: boolean;

  onSave: (
    data: UpdateMyProfileData
  ) => Promise<AppUser>;
}

type Feedback = {
  type: 'success' | 'error';
  message: string;
} | null;

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

export default function ProfileInfoForm({
  user,
  saving,
  onSave,
}: ProfileInfoFormProps) {
  const [
    firstName,
    setFirstName,
  ] = useState('');

  const [
    middleName,
    setMiddleName,
  ] = useState('');

  const [
    lastName,
    setLastName,
  ] = useState('');

  const [
    secondLastName,
    setSecondLastName,
  ] = useState('');

  const [
    phone,
    setPhone,
  ] = useState('');

  const [
    ci,
    setCi,
  ] = useState('');

  const [
    feedback,
    setFeedback,
  ] = useState<Feedback>(null);

  useEffect(() => {
    setFirstName(
      user.firstName ?? ''
    );

    setMiddleName(
      user.middleName ?? ''
    );

    setLastName(
      user.lastName ?? ''
    );

    setSecondLastName(
      user.secondLastName ??
        ''
    );

    setPhone(
      user.phone ?? ''
    );

    setCi(
      user.ci ?? ''
    );
  }, [user]);

  async function handleSave() {
    setFeedback(null);

    if (!firstName.trim()) {
      setFeedback({
        type: 'error',
        message:
          'El nombre es obligatorio.',
      });

      return;
    }

    if (!lastName.trim()) {
      setFeedback({
        type: 'error',
        message:
          'El apellido es obligatorio.',
      });

      return;
    }

    try {
      await onSave({
        firstName:
          firstName.trim(),

        middleName:
          middleName.trim() ||
          null,

        lastName:
          lastName.trim(),

        secondLastName:
          secondLastName.trim() ||
          null,

        phone:
          phone.trim() ||
          null,

        ci:
          ci.trim() ||
          null,
      });

      setFeedback({
        type: 'success',
        message:
          'La información personal se actualizó correctamente.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',

        message: getErrorMessage(
          error,
          'No se pudo actualizar la información personal.'
        ),
      });
    }
  }

  return (
    <View className="mt-4 rounded-[28px] bg-white p-5">
      <Text className="text-[18px] font-extrabold text-[#252A20]">
        Información personal
      </Text>

      <Text className="mt-1 text-[12px] leading-5 text-[#8D9282]">
        Actualiza los datos principales de tu cuenta.
      </Text>

      <View className="mt-5">
        <FieldLabel text="Nombre" />

        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Tu nombre"
          placeholderTextColor="#A3A798"
          className="mb-4 min-h-[52px] rounded-[16px] border border-[#E5E7DF] bg-[#FAFBF7] px-4 text-[14px] text-[#30352A]"
        />

        <FieldLabel text="Segundo nombre" />

        <TextInput
          value={middleName}
          onChangeText={setMiddleName}
          placeholder="Opcional"
          placeholderTextColor="#A3A798"
          className="mb-4 min-h-[52px] rounded-[16px] border border-[#E5E7DF] bg-[#FAFBF7] px-4 text-[14px] text-[#30352A]"
        />

        <FieldLabel text="Apellido" />

        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Tu apellido"
          placeholderTextColor="#A3A798"
          className="mb-4 min-h-[52px] rounded-[16px] border border-[#E5E7DF] bg-[#FAFBF7] px-4 text-[14px] text-[#30352A]"
        />

        <FieldLabel text="Segundo apellido" />

        <TextInput
          value={secondLastName}
          onChangeText={
            setSecondLastName
          }
          placeholder="Opcional"
          placeholderTextColor="#A3A798"
          className="mb-4 min-h-[52px] rounded-[16px] border border-[#E5E7DF] bg-[#FAFBF7] px-4 text-[14px] text-[#30352A]"
        />

        <FieldLabel text="Teléfono" />

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Número de teléfono"
          placeholderTextColor="#A3A798"
          keyboardType="phone-pad"
          className="mb-4 min-h-[52px] rounded-[16px] border border-[#E5E7DF] bg-[#FAFBF7] px-4 text-[14px] text-[#30352A]"
        />

        <FieldLabel text="CI" />

        <TextInput
          value={ci}
          onChangeText={setCi}
          placeholder="Documento de identidad"
          placeholderTextColor="#A3A798"
          className="mb-4 min-h-[52px] rounded-[16px] border border-[#E5E7DF] bg-[#FAFBF7] px-4 text-[14px] text-[#30352A]"
        />

        <FieldLabel text="Usuario" />

        <View className="mb-4 min-h-[52px] flex-row items-center rounded-[16px] bg-[#F0F1EC] px-4">
          <Text className="flex-1 text-[14px] text-[#74796C]">
            {user.username}
          </Text>

          <Ionicons
            name="lock-closed-outline"
            size={16}
            color="#969B8D"
          />
        </View>

        <FieldLabel text="Correo electrónico" />

        <View className="min-h-[52px] flex-row items-center rounded-[16px] bg-[#F0F1EC] px-4">
          <Text className="flex-1 text-[14px] text-[#74796C]">
            {user.email}
          </Text>

          <Ionicons
            name="lock-closed-outline"
            size={16}
            color="#969B8D"
          />
        </View>

        <Text className="mt-2 text-[11px] leading-4 text-[#9A9E91]">
          El usuario y correo no se modifican desde esta sección.
        </Text>

        <Pressable
          disabled={saving}
          onPress={() =>
            void handleSave()
          }
          className={`mt-6 min-h-[54px] items-center justify-center rounded-[18px] bg-[#20251B] ${
            saving
              ? 'opacity-50'
              : 'active:opacity-80'
          }`}
        >
          {saving ? (
            <ActivityIndicator
              color="#B8D36F"
            />
          ) : (
            <Text className="text-[14px] font-extrabold text-white">
              Guardar información
            </Text>
          )}
        </Pressable>

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
              {feedback.message}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function FieldLabel({
  text,
}: {
  text: string;
}) {
  return (
    <Text className="mb-2 text-[12px] font-bold text-[#5F6557]">
      {text}
    </Text>
  );
}