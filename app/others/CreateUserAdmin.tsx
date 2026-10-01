// app/others/CreateUserAdmin.tsx

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
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
  useUser,
} from '@/hooks/useUsers';

import {
  userService,
} from '@/services/user.service';

import type {
  CreateUserData,
  UserRole,
} from '@/types/user.types';

// =====================================================
// HELPERS
// =====================================================

function cleanNullable(
  value:
    string
) {
  const cleaned =
    value.trim();

  return cleaned ||
    null;
}

function getErrorMessage(
  error:
    any
) {
  return (
    error?.response
      ?.data
      ?.error
      ?.message ??
    error?.response
      ?.data
      ?.message ??
    error?.message ??
    'No se pudo crear el usuario.'
  );
}

// =====================================================
// SCREEN
// =====================================================

export default function CreateUserAdminScreen() {
  const {
    createUser,
    saving,
  } =
    useUser({
      autoLoad:
        false,
    });

  const [
    username,
    setUsername,
  ] =
    useState('');

  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    firstName,
    setFirstName,
  ] =
    useState('');

  const [
    middleName,
    setMiddleName,
  ] =
    useState('');

  const [
    lastName,
    setLastName,
  ] =
    useState('');

  const [
    secondLastName,
    setSecondLastName,
  ] =
    useState('');

  const [
    ci,
    setCi,
  ] =
    useState('');

  const [
    phone,
    setPhone,
  ] =
    useState('');

  const [
    password,
    setPassword,
  ] =
    useState('');

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] =
    useState('');

  const [
    roles,
    setRoles,
  ] =
    useState<UserRole[]>(
      []
    );

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] =
    useState<
      number | null
    >(null);

  const [
    loadingRoles,
    setLoadingRoles,
  ] =
    useState(true);

  // ===================================================
  // ROLES
  // ===================================================

  useEffect(() => {
    let mounted =
      true;

    async function loadRoles() {
      try {
        setLoadingRoles(
          true
        );

        const response =
          await userService
            .findRoles();

        const allowedRoles =
          response.roles.filter(
            (
              role
            ) => {
              const type =
                String(
                  role.type ??
                  ''
                )
                  .trim()
                  .toLowerCase();

              return [
                'admin',
                'restaurant',
                'employee',
                'client',
              ].includes(
                type
              );
            }
          );

        if (
          !mounted
        ) {
          return;
        }

        setRoles(
          allowedRoles
        );

        const clientRole =
          allowedRoles.find(
            (
              role
            ) =>
              role.type ===
              'client'
          );

        setSelectedRoleId(
          clientRole
            ?.id ??
          allowedRoles[0]
            ?.id ??
          null
        );
      } catch {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudieron cargar los roles',

          position:
            'bottom',
        });
      } finally {
        if (
          mounted
        ) {
          setLoadingRoles(
            false
          );
        }
      }
    }

    void loadRoles();

    return () => {
      mounted =
        false;
    };
  }, []);

  const selectedRole =
    useMemo(
      () =>
        roles.find(
          (
            role
          ) =>
            role.id ===
            selectedRoleId
        ) ??
        null,
      [
        roles,
        selectedRoleId,
      ]
    );

  // ===================================================
  // VALIDATE
  // ===================================================

  function validate() {
    if (
      !firstName.trim()
    ) {
      return 'Escribe el nombre.';
    }

    if (
      !lastName.trim()
    ) {
      return 'Escribe el apellido.';
    }

    if (
      !username.trim()
    ) {
      return 'Escribe un nombre de usuario.';
    }

    if (
      !email.trim()
    ) {
      return 'Escribe un correo electrónico.';
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        email
          .trim()
          .toLowerCase()
      )
    ) {
      return 'El correo electrónico no es válido.';
    }

    if (
      password.length <
      6
    ) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (
      password !==
      passwordConfirmation
    ) {
      return 'Las contraseñas no coinciden.';
    }

    if (
      !selectedRoleId
    ) {
      return 'Selecciona un rol.';
    }

    return null;
  }

  // ===================================================
  // SAVE
  // ===================================================

  async function handleCreate() {
    if (
      saving
    ) {
      return;
    }

    const validationError =
      validate();

    if (
      validationError
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'Revisa los datos',

        text2:
          validationError,

        position:
          'bottom',
      });

      return;
    }

    try {
      const data:
        CreateUserData = {
          username:
            username.trim(),

          email:
            email
              .trim()
              .toLowerCase(),

          password,

          firstName:
            firstName.trim(),

          middleName:
            cleanNullable(
              middleName
            ),

          lastName:
            lastName.trim(),

          secondLastName:
            cleanNullable(
              secondLastName
            ),

          ci:
            cleanNullable(
              ci
            ),

          phone:
            cleanNullable(
              phone
            ),

          confirmed:
            true,

          blocked:
            false,

          role:
            selectedRoleId!,
        };

      await createUser(
        data
      );

      Toast.show({
        type:
          'success',

        text1:
          'Usuario creado correctamente',

        text2:
          `${firstName.trim()} ${lastName.trim()}`,

        position:
          'bottom',
      });

      router.back();
    } catch (
      error
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'No se pudo crear el usuario',

        text2:
          getErrorMessage(
            error
          ),

        position:
          'bottom',
      });
    }
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={[
        'top',
      ]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* HEADER */}

        <View className="flex-row items-center border-b border-[#E7EBDD] bg-white px-4 py-4">
          <Pressable
            onPress={() =>
              router.back()
            }
            className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#EEF3E3]"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#617D34"
            />
          </Pressable>

          <View className="ml-3 flex-1">
            <Text className="text-[20px] font-extrabold text-[#252A20]">
              Nuevo usuario
            </Text>

            <Text className="mt-0.5 text-[12px] text-[#858A7A]">
              Crea una nueva cuenta
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal:
              16,

            paddingTop:
              18,

            paddingBottom:
              50,
          }}
        >
          {/* INFORMACIÓN */}

          <View className="mb-5 rounded-[22px] bg-[#EEF3E3] p-4">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-white">
                <Ionicons
                  name="person-add-outline"
                  size={23}
                  color="#7B9646"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-extrabold text-[#252A20]">
                  Información de la cuenta
                </Text>

                <Text className="mt-1 text-[12px] leading-5 text-[#737A69]">
                  El usuario podrá iniciar sesión con el correo o nombre de usuario.
                </Text>
              </View>
            </View>
          </View>

          {/* DATOS PERSONALES */}

          <View className="rounded-[24px] bg-white p-5">
            <Text className="text-[17px] font-extrabold text-[#252A20]">
              Datos personales
            </Text>

            <Text className="mb-5 mt-1 text-[12px] text-[#858A7A]">
              Información básica del usuario
            </Text>

            <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
              Nombre
            </Text>

            <TextInput
              value={
                firstName
              }
              onChangeText={
                setFirstName
              }
              placeholder="Ej. Carlos"
              placeholderTextColor="#A4AA9A"
              className="mb-4 rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
            />

            <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
              Segundo nombre
            </Text>

            <TextInput
              value={
                middleName
              }
              onChangeText={
                setMiddleName
              }
              placeholder="Opcional"
              placeholderTextColor="#A4AA9A"
              className="mb-4 rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
            />

            <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
              Apellido
            </Text>

            <TextInput
              value={
                lastName
              }
              onChangeText={
                setLastName
              }
              placeholder="Ej. Mamani"
              placeholderTextColor="#A4AA9A"
              className="mb-4 rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
            />

            <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
              Segundo apellido
            </Text>

            <TextInput
              value={
                secondLastName
              }
              onChangeText={
                setSecondLastName
              }
              placeholder="Opcional"
              placeholderTextColor="#A4AA9A"
              className="mb-4 rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
                  CI
                </Text>

                <TextInput
                  value={
                    ci
                  }
                  onChangeText={
                    setCi
                  }
                  placeholder="Opcional"
                  placeholderTextColor="#A4AA9A"
                  keyboardType="number-pad"
                  className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
                />
              </View>

              <View className="flex-1">
                <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
                  Teléfono
                </Text>

                <TextInput
                  value={
                    phone
                  }
                  onChangeText={
                    setPhone
                  }
                  placeholder="Opcional"
                  placeholderTextColor="#A4AA9A"
                  keyboardType="phone-pad"
                  className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
                />
              </View>
            </View>
          </View>

          {/* CUENTA */}

          <View className="mt-4 rounded-[24px] bg-white p-5">
            <Text className="text-[17px] font-extrabold text-[#252A20]">
              Datos de acceso
            </Text>

            <Text className="mb-5 mt-1 text-[12px] text-[#858A7A]">
              Credenciales para iniciar sesión
            </Text>

            <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
              Nombre de usuario
            </Text>

            <TextInput
              value={
                username
              }
              onChangeText={
                setUsername
              }
              placeholder="nombre.usuario"
              placeholderTextColor="#A4AA9A"
              autoCapitalize="none"
              className="mb-4 rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
            />

            <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
              Correo electrónico
            </Text>

            <TextInput
              value={
                email
              }
              onChangeText={
                setEmail
              }
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#A4AA9A"
              keyboardType="email-address"
              autoCapitalize="none"
              className="mb-4 rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
            />

            <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
              Contraseña
            </Text>

            <TextInput
              value={
                password
              }
              onChangeText={
                setPassword
              }
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#A4AA9A"
              secureTextEntry
              autoCapitalize="none"
              className="mb-4 rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
            />

            <Text className="mb-2 text-[12px] font-bold text-[#5E6655]">
              Confirmar contraseña
            </Text>

            <TextInput
              value={
                passwordConfirmation
              }
              onChangeText={
                setPasswordConfirmation
              }
              placeholder="Repite la contraseña"
              placeholderTextColor="#A4AA9A"
              secureTextEntry
              autoCapitalize="none"
              className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
            />
          </View>

          {/* ROL */}

          <View className="mt-4 rounded-[24px] bg-white p-5">
            <Text className="text-[17px] font-extrabold text-[#252A20]">
              Rol del usuario
            </Text>

            <Text className="mb-4 mt-1 text-[12px] text-[#858A7A]">
              Selecciona los permisos principales de la cuenta
            </Text>

            {loadingRoles ? (
              <View className="items-center py-6">
                <ActivityIndicator
                  color="#7B9646"
                />

                <Text className="mt-3 text-[12px] text-[#858A7A]">
                  Cargando roles...
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {roles.map(
                  (
                    role
                  ) => {
                    const selected =
                      selectedRoleId ===
                      role.id;

                    return (
                      <Pressable
                        key={
                          role.id
                        }
                        onPress={() =>
                          setSelectedRoleId(
                            role.id
                          )
                        }
                        className={`flex-row items-center rounded-[16px] border px-4 py-3.5 ${
                          selected
                            ? 'border-[#7B9646] bg-[#EEF3E3]'
                            : 'border-[#E6E9DF] bg-[#FAFBF8]'
                        }`}
                      >
                        <View
                          className={`h-10 w-10 items-center justify-center rounded-[13px] ${
                            selected
                              ? 'bg-[#7B9646]'
                              : 'bg-[#EEF1E9]'
                          }`}
                        >
                          <Ionicons
                            name={
                              role.type ===
                              'admin'
                                ? 'shield-checkmark-outline'
                                : role.type ===
                                    'restaurant'
                                  ? 'restaurant-outline'
                                  : role.type ===
                                      'employee'
                                    ? 'briefcase-outline'
                                    : 'person-outline'
                            }
                            size={19}
                            color={
                              selected
                                ? '#FFFFFF'
                                : '#707866'
                            }
                          />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text
                            className={`text-[14px] font-bold ${
                              selected
                                ? 'text-[#617D34]'
                                : 'text-[#343A2F]'
                            }`}
                          >
                            {
                              role.name
                            }
                          </Text>

                          <Text className="mt-0.5 text-[11px] text-[#858A7A]">
                            {
                              role.type
                            }
                          </Text>
                        </View>

                        <Ionicons
                          name={
                            selected
                              ? 'radio-button-on'
                              : 'radio-button-off'
                          }
                          size={21}
                          color={
                            selected
                              ? '#7B9646'
                              : '#ACB1A5'
                          }
                        />
                      </Pressable>
                    );
                  }
                )}
              </View>
            )}

            {(
              selectedRole
                ?.type ===
                'employee' ||
              selectedRole
                ?.type ===
                'restaurant'
            ) && (
              <View className="mt-4 flex-row rounded-[16px] bg-[#F5F7EF] p-3">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#7B9646"
                />

                <Text className="ml-2 flex-1 text-[11px] leading-5 text-[#697160]">
                  Este rol puede necesitar posteriormente una relación con un restaurante.
                </Text>
              </View>
            )}
          </View>

          {/* SAVE */}

          <Pressable
            disabled={
              saving ||
              loadingRoles
            }
            onPress={() =>
              void handleCreate()
            }
            className={`mt-5 flex-row items-center justify-center rounded-[18px] py-4 ${
              saving ||
              loadingRoles
                ? 'bg-[#AEBB96]'
                : 'bg-[#7B9646]'
            }`}
          >
            {saving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text className="ml-2 text-[14px] font-extrabold text-white">
                  Crear usuario
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}