import {
  useCallback,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  ActivityIndicator,
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

const initialValues:
  RestaurantEmployeeFormValues = {
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
  };

function nullable(
  value: string,
) {
  return value.trim() || null;
}

export default function EditRestaurantEmployeeScreen() {
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
    selectedEmployee,
    loadEmployee,
    updateEmployee,
    loadingEmployees,
    saving,
    error,
  } =
    useRestaurantManagement({
      autoLoadRestaurant: false,
      autoLoadEmployees: false,
    });

  const [
    values,
    setValues,
  ] =
    useState<RestaurantEmployeeFormValues>(
      initialValues,
    );

  const [
    loadError,
    setLoadError,
  ] =
    useState<string | null>(
      null,
    );

  const reload =
    useCallback(
      async () => {
        if (
          !Number.isSafeInteger(
            numericId,
          ) ||
          numericId < 1
        ) {
          setLoadError(
            'Identificador de empleado inválido.',
          );

          return;
        }

        try {
          const employee =
            await loadEmployee(
              numericId,
            );

          setValues({
            username:
              employee.username ??
              '',
            email:
              employee.email ??
              '',
            firstName:
              employee.firstName ??
              '',
            middleName:
              employee.middleName ??
              '',
            lastName:
              employee.lastName ??
              '',
            secondLastName:
              employee.secondLastName ??
              '',
            ci:
              employee.ci ??
              '',
            phone:
              employee.phone ??
              '',
            password: '',
            passwordConfirmation:
              '',
          });

          setLoadError(null);
        } catch (error) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'No se pudieron consultar los datos del empleado.',
          );
        }
      },
      [
        loadEmployee,
        numericId,
      ],
    );

  useFocusEffect(
    useCallback(() => {
      void reload();

      return undefined;
    }, [reload]),
  );

  async function save() {
    if (saving) {
      return;
    }

    if (
      !Number.isSafeInteger(
        numericId,
      ) ||
      numericId < 1
    ) {
      return;
    }

    const username =
      values.username.trim();

    const email =
      values.email.trim().toLowerCase();

    if (
      !values.firstName.trim() ||
      !values.lastName.trim() ||
      !username ||
      !email
    ) {
      Toast.show({
        type: 'error',
        text1:
          'Completa los datos obligatorios',
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
        text1:
          'El usuario debe tener al menos 3 caracteres y no contener espacios',
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
          'Escribe un correo válido',
        position: 'bottom',
      });

      return;
    }

    try {
      await updateEmployee(
        numericId,
        {
          username,
          email,

          firstName:
            values.firstName.trim(),

          middleName:
            nullable(
              values.middleName,
            ),

          lastName:
            values.lastName.trim(),

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
        },
      );

      Toast.show({
        type: 'success',
        text1:
          'Datos del empleado actualizados',
        position: 'bottom',
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          'No se pudieron guardar los cambios',
        text2:
          error instanceof Error
            ? error.message
            : 'Vuelve a intentarlo.',
        position: 'bottom',
      });
    }
  }

  const loading = loadingEmployees;

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={['top']}
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
            color="#617D34"
            size={22}
          />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[21px] font-extrabold text-[#20291B]">
            Editar empleado
          </Text>

          <Text className="text-xs text-[#798575]">
            Actualiza sus datos personales y de acceso
          </Text>
        </View>
      </View>

      {loading &&
      !selectedEmployee ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            color="#617D34"
            size="large"
          />

          <Text className="mt-3 text-sm text-[#798575]">
            Cargando empleado...
          </Text>
        </View>
      ) : null}

      {loadError || error ? (
        <View className="mx-4 mt-4 rounded-2xl bg-[#FCEAE7] p-4">
          <Text className="text-sm text-[#A45750]">
            {loadError || error}
          </Text>

          <Pressable
            onPress={() =>
              void reload()
            }
          >
            <Text className="mt-2 font-bold text-[#A45750]">
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : null}

      {selectedEmployee &&
      !loadError ? (
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 80,
            }}
          >
            <View className="mb-4 rounded-[24px] bg-white p-5">
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3E3]">
                  <Ionicons
                    name="person-outline"
                    size={25}
                    color="#617D34"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-base font-extrabold text-[#20291B]">
                    Información de la cuenta
                  </Text>

                  <Text className="mt-1 text-xs text-[#7B8672]">
                    Datos administrados por el restaurante
                  </Text>
                </View>

                <View
                  className={`rounded-full px-3 py-1.5 ${
                    selectedEmployee.blocked
                      ? 'bg-[#FCEAE7]'
                      : 'bg-[#EAF2E0]'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      selectedEmployee.blocked
                        ? 'text-[#AF6057]'
                        : 'text-[#617D34]'
                    }`}
                  >
                    {selectedEmployee.blocked
                      ? 'Suspendido'
                      : 'Activo'}
                  </Text>
                </View>
              </View>

              <View className="mt-4 gap-2">
                <Text className="text-xs text-[#737B6C]">
                  Rol: {selectedEmployee.role?.name || 'Empleado'}
                </Text>

                <Text className="text-xs text-[#737B6C]">
                  Restaurante: {selectedEmployee.restaurant?.name || 'No informado'}
                </Text>

                <Text className="text-xs text-[#737B6C]">
                  ID de usuario: {selectedEmployee.id}
                </Text>
              </View>
            </View>

            <RestaurantEmployeeForm
              mode="edit"
              values={values}
              saving={saving}
              onChange={setValues}
              onSubmit={() =>
                void save()
              }
            />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}
    </SafeAreaView>
  );
}
