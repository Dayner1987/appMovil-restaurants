import {
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import {
  useRestaurantManagement,
} from '@/hooks/useRestaurantManagement';

export default function ResetEmployeePasswordScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const id =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const numericId =
    Number(id);

  const {
    resetEmployeePassword,
    saving,
    error,
  } =
    useRestaurantManagement();

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    confirm,
    setConfirm,
  ] = useState('');

  const [
    visible,
    setVisible,
  ] = useState(false);

  async function submit() {
    if (saving) {
      return;
    }

    if (
      !Number.isSafeInteger(
        numericId,
      ) ||
      numericId < 1
    ) {
      Toast.show({
        type: 'error',
        text1:
          'Empleado no válido',
        position: 'bottom',
      });

      return;
    }

    if (
      password.length < 6
    ) {
      Toast.show({
        type: 'error',
        text1:
          'La contraseña debe tener al menos 6 caracteres',
        position: 'bottom',
      });

      return;
    }

    if (
      password !==
      confirm
    ) {
      Toast.show({
        type: 'error',
        text1:
          'Las contraseñas no coinciden',
        position: 'bottom',
      });

      return;
    }

    try {
      await resetEmployeePassword(
        numericId,
        {
          password,
          passwordConfirmation:
            confirm,
        },
      );

      Toast.show({
        type: 'success',
        text1:
          'Contraseña actualizada',
        text2:
          'La nueva contraseña quedó guardada para el empleado.',
        position: 'bottom',
      });

      setPassword('');
      setConfirm('');

      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          'No se pudo actualizar la contraseña',
        text2:
          error instanceof Error
            ? error.message
            : 'Revisa los permisos.',
        position: 'bottom',
      });
    }
  }

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-[#F7F8F2]"
    >
      <View className="flex-row items-center bg-white px-4 py-4">
        <Pressable
          onPress={() =>
            router.back()
          }
          className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF3E3]"
          accessibilityLabel="Volver"
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#617D34"
          />
        </Pressable>

        <View className="ml-3">
          <Text className="text-[21px] font-extrabold text-[#20291B]">
            Cambiar contraseña
          </Text>

          <Text className="mt-0.5 text-xs text-[#798575]">
            Acceso del empleado
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 18,
            paddingBottom: 80,
          }}
        >
          <View className="rounded-3xl bg-white p-5">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3E3]">
              <Ionicons
                name="key-outline"
                size={30}
                color="#617D34"
              />
            </View>

            <Text className="mt-4 text-base font-bold text-[#20291B]">
              Nueva clave del empleado
            </Text>

            <Text className="mt-2 text-sm leading-5 text-[#7B8672]">
              La contraseña se reemplazará inmediatamente. Compártela de forma privada con el empleado.
            </Text>

            {error ? (
              <View className="mt-4 rounded-2xl bg-[#FFF1EF] p-3">
                <Text className="text-xs font-semibold text-[#A6514C]">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="mt-5 flex-row items-center rounded-2xl bg-[#F7F8F2] px-4">
              <TextInput
                value={password}
                onChangeText={
                  setPassword
                }
                placeholder="Nueva contraseña"
                placeholderTextColor="#9AA194"
                secureTextEntry={
                  !visible
                }
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 py-4 text-[#20291B]"
              />

              <Pressable
                onPress={() =>
                  setVisible(
                    value => !value,
                  )
                }
                accessibilityLabel={
                  visible
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
              >
                <Ionicons
                  name={
                    visible
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={21}
                  color="#617D34"
                />
              </Pressable>
            </View>

            <TextInput
              value={confirm}
              onChangeText={
                setConfirm
              }
              placeholder="Confirmar contraseña"
              placeholderTextColor="#9AA194"
              secureTextEntry={
                !visible
              }
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-3 rounded-2xl bg-[#F7F8F2] px-4 py-4 text-[#20291B]"
            />

            <Pressable
              disabled={
                saving ||
                !Number.isSafeInteger(
                  numericId,
                ) ||
                numericId < 1
              }
              onPress={() =>
                void submit()
              }
              className={`mt-5 flex-row items-center justify-center rounded-2xl py-4 ${
                saving
                  ? 'bg-[#AEB99B]'
                  : 'bg-[#617D34]'
              }`}
            >
              {saving ? (
                <ActivityIndicator
                  color="white"
                />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    color="white"
                    size={19}
                  />

                  <Text className="ml-2 font-bold text-white">
                    Guardar contraseña
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
