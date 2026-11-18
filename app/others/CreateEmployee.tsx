import {
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
} from 'expo-router';

import {
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

import RestaurantEmployeeForm from '@/components/restaurant/RestaurantEmployeeForm';

import type {
  RestaurantEmployeeFormValues,
} from '@/components/restaurant/RestaurantEmployeeForm';

import {
  useRestaurantManagement,
} from '@/hooks/useRestaurantManagement';

function nullable(
  value: string,
) {
  return value.trim() || null;
}

export default function CreateRestaurantEmployeeScreen() {
  const {
    createEmployee,
    saving,
  } =
    useRestaurantManagement();

  const [
    values,
    setValues,
  ] =
    useState<RestaurantEmployeeFormValues>({
      firstName: '',
      middleName: '',
      lastName: '',
      secondLastName: '',
      ci: '',
      phone: '',
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    });

  async function handleSubmit() {
    if (saving) {
      return;
    }

    const firstName =
      values.firstName.trim();

    const lastName =
      values.lastName.trim();

    const username =
      values.username.trim();

    const email =
      values.email.trim().toLowerCase();

    if (
      !firstName ||
      !lastName
    ) {
      Toast.show({
        type: 'error',
        text1: 'Datos incompletos',
        text2:
          'Nombre y apellido son obligatorios.',
        position: 'bottom',
      });

      return;
    }

    if (
      !username ||
      !email
    ) {
      Toast.show({
        type: 'error',
        text1:
          'Datos de acceso incompletos',
        text2:
          'Usuario y correo son obligatorios.',
        position: 'bottom',
      });

      return;
    }

    if (
      username.length < 3 ||
      username.includes(' ')
    ) {
      Toast.show({
        type: 'error',
        text1: 'Usuario no válido',
        text2:
          'Debe tener al menos 3 caracteres y no contener espacios.',
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
          'Correo electrónico no válido',
        position: 'bottom',
      });

      return;
    }

    if (
      values.password.length < 6
    ) {
      Toast.show({
        type: 'error',
        text1:
          'Contraseña muy corta',
        text2:
          'Debe tener al menos 6 caracteres.',
        position: 'bottom',
      });

      return;
    }

    if (
      values.password !==
      values.passwordConfirmation
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
      const employee =
        await createEmployee({
          username,
          email,
          password:
            values.password,

          firstName,

          middleName:
            nullable(
              values.middleName,
            ),

          lastName,

          secondLastName:
            nullable(
              values.secondLastName,
            ),

          ci:
            nullable(
              values.ci,
            ),

          phone:
            nullable(
              values.phone,
            ),
        });

      Toast.show({
        type: 'success',
        text1:
          'Empleado registrado',
        text2:
          employee.restaurant?.name
            ? `${employee.firstName} ${employee.lastName} quedó vinculado a ${employee.restaurant.name}.`
            : 'La cuenta fue creada correctamente.',
        position: 'bottom',
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          'No se pudo registrar el empleado',
        text2:
          error instanceof Error
            ? error.message
            : 'Intenta nuevamente.',
        position: 'bottom',
      });
    }
  }

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
              Nuevo empleado
            </Text>

            <Text className="mt-0.5 text-[11px] text-[#858A7A]">
              Crear cuenta Employee
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 18,
            paddingBottom: 150,
          }}
        >
          <RestaurantEmployeeForm
            values={values}
            saving={saving}
            mode="create"
            onChange={setValues}
            onSubmit={() =>
              void handleSubmit()
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
