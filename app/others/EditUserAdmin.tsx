// app/others/EditUserAdmin.tsx

import {
  useEffect,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Ionicons from '@expo/vector-icons/Ionicons';

import * as ImagePicker from 'expo-image-picker';

import axios from 'axios';

import Toast from 'react-native-toast-message';

import {
  useUser,
} from '@/hooks/useUsers';

import {
  userService,
} from '@/services/user.service';

import {
  api,
} from '@/services/api';

import type {
  UpdateUserData,
  UserRole,
} from '@/types/user.types';

function getErrorMessage(
  error: unknown,
  fallback: string
) {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const data =
      error.response
        ?.data as
        | {
            error?: {
              message?: string;
            };

            message?: string;
          }
        | undefined;

    return (
      data?.error
        ?.message ??
      data?.message ??
      fallback
    );
  }

  return fallback;
}

function formatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return 'No disponible';
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    'es-BO',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );
}

export default function EditUserAdminScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const userId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;

  const {
    user,
    loading,
    saving,
    error,
    loadUser,
    updateUser,
  } = useUser({
    userId,
    autoLoad:
      Boolean(
        userId
      ),
  });

  const [
    roles,
    setRoles,
  ] =
    useState<UserRole[]>(
      []
    );

  const [
    rolesLoading,
    setRolesLoading,
  ] =
    useState(false);

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
    confirmed,
    setConfirmed,
  ] =
    useState(false);

  const [
    blocked,
    setBlocked,
  ] =
    useState(false);

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] =
    useState<
      number | null
    >(null);

  const [
    avatarSaving,
    setAvatarSaving,
  ] =
    useState(false);

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
    passwordSaving,
    setPasswordSaving,
  ] =
    useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setUsername(
      user.username ??
        ''
    );

    setEmail(
      user.email ??
        ''
    );

    setFirstName(
      user.firstName ??
        ''
    );

    setMiddleName(
      user.middleName ??
        ''
    );

    setLastName(
      user.lastName ??
        ''
    );

    setSecondLastName(
      user.secondLastName ??
        ''
    );

    setCi(
      user.ci ??
        ''
    );

    setPhone(
      user.phone ??
        ''
    );

    setConfirmed(
      user.confirmed
    );

    setBlocked(
      user.blocked
    );

    setSelectedRoleId(
      user.role?.id ??
        null
    );
  }, [
    user,
  ]);

  useEffect(() => {
    const loadRoles =
      async () => {
        setRolesLoading(
          true
        );

        try {
          const response =
            await userService.findRoles();

          setRoles(
            response.roles ??
              []
          );
        } catch (
          requestError
        ) {
          Toast.show({
            type: 'error',
            text1:
              getErrorMessage(
                requestError,
                'No se pudieron cargar los roles'
              ),
            position:
              'bottom',
          });
        } finally {
          setRolesLoading(
            false
          );
        }
      };

    void loadRoles();
  }, []);

  const avatarUrl =
    user?.avatar?.url
      ? user.avatar.url.startsWith(
          'http'
        )
        ? user.avatar.url
        : `${String(
            api.defaults
              .baseURL ??
              ''
          ).replace(
            /\/$/,
            ''
          )}${user.avatar.url}`
      : null;

  const handleSave =
    async () => {
      if (
        !userId
      ) {
        return;
      }

      if (
        !username.trim() ||
        !email.trim() ||
        !firstName.trim() ||
        !lastName.trim()
      ) {
        Toast.show({
          type: 'error',
          text1:
            'Completa los campos obligatorios',
          position:
            'bottom',
        });

        return;
      }

      const data: UpdateUserData =
        {
          username:
            username.trim(),

          email:
            email.trim(),

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

          ci:
            ci.trim() ||
            null,

          phone:
            phone.trim() ||
            null,

          confirmed,

          blocked,

          role:
            selectedRoleId,
        };

      try {
        await updateUser(
          userId,
          data
        );

        Toast.show({
          type: 'success',
          text1:
            'Usuario actualizado correctamente',
          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type: 'error',
          text1:
            getErrorMessage(
              requestError,
              'No se pudo actualizar el usuario'
            ),
          position:
            'bottom',
        });
      }
    };

  const handlePickAvatar =
    async () => {
      if (
        !userId
      ) {
        return;
      }

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        !permission.granted
      ) {
        Toast.show({
          type: 'error',
          text1:
            'Se necesita permiso para acceder a las imágenes',
          position:
            'bottom',
        });

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: [
              'images',
            ],

            allowsEditing:
              true,

            aspect: [
              1,
              1,
            ],

            quality:
              0.85,
          }
        );

      if (
        result.canceled
      ) {
        return;
      }

      const asset =
        result.assets[0];

      setAvatarSaving(
        true
      );

      try {
        await userService.uploadUserAvatar(
          userId,
          asset.uri,
          asset.fileName ??
            'avatar.jpg',
          asset.mimeType ??
            'image/jpeg'
        );

        await loadUser(
          userId
        );

        Toast.show({
          type: 'success',
          text1:
            'Avatar actualizado correctamente',
          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type: 'error',
          text1:
            getErrorMessage(
              requestError,
              'No se pudo actualizar el avatar'
            ),
          position:
            'bottom',
        });
      } finally {
        setAvatarSaving(
          false
        );
      }
    };

  const handleRemoveAvatar =
    async () => {
      if (
        !userId ||
        !user?.avatar
      ) {
        return;
      }

      setAvatarSaving(
        true
      );

      try {
        await userService.removeUserAvatar(
          userId
        );

        await loadUser(
          userId
        );

        Toast.show({
          type: 'success',
          text1:
            'Avatar eliminado correctamente',
          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type: 'error',
          text1:
            getErrorMessage(
              requestError,
              'No se pudo eliminar el avatar'
            ),
          position:
            'bottom',
        });
      } finally {
        setAvatarSaving(
          false
        );
      }
    };

  const handleResetPassword =
    async () => {
      if (
        !userId
      ) {
        return;
      }

      if (
        !password ||
        !passwordConfirmation
      ) {
        Toast.show({
          type: 'error',
          text1:
            'Completa ambas contraseñas',
          position:
            'bottom',
        });

        return;
      }

      if (
        password !==
        passwordConfirmation
      ) {
        Toast.show({
          type: 'error',
          text1:
            'Las contraseñas no coinciden',
          position:
            'bottom',
        });

        return;
      }

      if (
        password.length <
        6
      ) {
        Toast.show({
          type: 'error',
          text1:
            'La contraseña debe tener al menos 6 caracteres',
          position:
            'bottom',
        });

        return;
      }

      setPasswordSaving(
        true
      );

      try {
        const response =
          await userService.resetUserPassword(
            userId,
            {
              password,
              passwordConfirmation,
            }
          );

        setPassword('');

        setPasswordConfirmation(
          ''
        );

        Toast.show({
          type: 'success',
          text1:
            response.message ||
            'Contraseña actualizada correctamente',
          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type: 'error',
          text1:
            getErrorMessage(
              requestError,
              'No se pudo cambiar la contraseña'
            ),
          position:
            'bottom',
        });
      } finally {
        setPasswordSaving(
          false
        );
      }
    };

  if (
    !userId
  ) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={[
          'top',
        ]}
      >
        <Header />

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[14px] text-[#B65D51]">
            No se recibió el
            identificador del usuario.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    loading &&
    !user
  ) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={[
          'top',
        ]}
      >
        <Header />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#7B9646"
          />

          <Text className="mt-4 text-[13px] text-[#858A7A]">
            Cargando usuario...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={[
          'top',
        ]}
      >
        <Header />

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[14px] text-[#B65D51]">
            {error ||
              'No se pudo cargar el usuario.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Header />

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom:
              60,
          }}
        >
          <View className="w-full self-center gap-5 px-4 py-5 web:max-w-[760px]">
            <View>
              <Text className="text-[24px] font-extrabold text-[#252A20]">
                Editar usuario
              </Text>

              <Text className="mt-1 text-[13px] text-[#858A7A]">
                Administra los datos,
                permisos y acceso de
                la cuenta
              </Text>
            </View>

            <View className="items-center rounded-[24px] border border-[#E9EBE3] bg-white p-5">
              {avatarUrl ? (
                <Image
                  source={{
                    uri: avatarUrl,
                  }}
                  className="h-24 w-24 rounded-[28px] bg-[#EEF3E3]"
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-[28px] bg-[#EEF3E3]">
                  <Ionicons
                    name="person-outline"
                    size={38}
                    color="#7B9646"
                  />
                </View>
              )}

              <Text className="mt-3 text-[16px] font-extrabold text-[#252A20]">
                {user.username}
              </Text>

              <Text className="mt-1 text-[12px] text-[#858A7A]">
                {user.email}
              </Text>

              <View className="mt-4 flex-row gap-2">
                <Pressable
                  disabled={
                    avatarSaving
                  }
                  onPress={
                    handlePickAvatar
                  }
                  className="h-10 flex-row items-center justify-center rounded-[14px] bg-[#7B9646] px-4 active:opacity-80"
                >
                  {avatarSaving ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="image-outline"
                        size={17}
                        color="#FFFFFF"
                      />

                      <Text className="ml-2 text-[12px] font-bold text-white">
                        Cambiar
                      </Text>
                    </>
                  )}
                </Pressable>

                {user.avatar && (
                  <Pressable
                    disabled={
                      avatarSaving
                    }
                    onPress={
                      handleRemoveAvatar
                    }
                    className="h-10 flex-row items-center justify-center rounded-[14px] bg-[#FBEDEA] px-4 active:opacity-70"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color="#B65D51"
                    />

                    <Text className="ml-2 text-[12px] font-bold text-[#B65D51]">
                      Eliminar
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            <Section
              title="Información personal"
              subtitle="Datos principales de la cuenta"
            >
              <Field
                label="Usuario"
                value={
                  username
                }
                onChangeText={
                  setUsername
                }
              />

              <Field
                label="Correo electrónico"
                value={
                  email
                }
                onChangeText={
                  setEmail
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Field
                label="Primer nombre"
                value={
                  firstName
                }
                onChangeText={
                  setFirstName
                }
              />

              <Field
                label="Segundo nombre"
                value={
                  middleName
                }
                onChangeText={
                  setMiddleName
                }
              />

              <Field
                label="Primer apellido"
                value={
                  lastName
                }
                onChangeText={
                  setLastName
                }
              />

              <Field
                label="Segundo apellido"
                value={
                  secondLastName
                }
                onChangeText={
                  setSecondLastName
                }
              />

              <Field
                label="CI"
                value={
                  ci
                }
                onChangeText={
                  setCi
                }
                keyboardType="numeric"
              />

              <Field
                label="Teléfono"
                value={
                  phone
                }
                onChangeText={
                  setPhone
                }
                keyboardType="phone-pad"
              />
            </Section>

            <Section
              title="Estado de la cuenta"
              subtitle="Controla el acceso del usuario"
            >
              <OptionSwitch
                title="Cuenta confirmada"
                description="Indica si la cuenta ha sido confirmada."
                value={
                  confirmed
                }
                onValueChange={
                  setConfirmed
                }
              />

              <OptionSwitch
                title="Usuario bloqueado"
                description="Impide que el usuario pueda acceder al sistema."
                value={
                  blocked
                }
                onValueChange={
                  setBlocked
                }
                danger
              />
            </Section>

            <Section
              title="Rol"
              subtitle="Selecciona el nivel de acceso"
            >
              {rolesLoading ? (
                <View className="items-center py-4">
                  <ActivityIndicator
                    size="small"
                    color="#7B9646"
                  />
                </View>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {roles.map(
                    (role) => {
                      const selected =
                        String(
                          selectedRoleId
                        ) ===
                        String(
                          role.id
                        );

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
                          className={
                            selected
                              ? 'rounded-full bg-[#7B9646] px-4 py-2.5'
                              : 'rounded-full border border-[#E9EBE3] bg-[#F7F8F2] px-4 py-2.5'
                          }
                        >
                          <Text
                            className={
                              selected
                                ? 'text-[12px] font-bold text-white'
                                : 'text-[12px] font-bold text-[#5F684F]'
                            }
                          >
                            {role.name}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>
              )}
            </Section>

            <Pressable
              disabled={
                saving
              }
              onPress={
                handleSave
              }
              className="h-[52px] flex-row items-center justify-center rounded-[18px] bg-[#7B9646] active:opacity-80"
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text className="ml-2 text-[14px] font-extrabold text-white">
                    Guardar cambios
                  </Text>
                </>
              )}
            </Pressable>

            <Section
              title="Cambiar contraseña"
              subtitle="Establece una nueva contraseña para este usuario"
            >
              <Field
                label="Nueva contraseña"
                value={
                  password
                }
                onChangeText={
                  setPassword
                }
                secureTextEntry
              />

              <Field
                label="Confirmar contraseña"
                value={
                  passwordConfirmation
                }
                onChangeText={
                  setPasswordConfirmation
                }
                secureTextEntry
              />

              <Pressable
                disabled={
                  passwordSaving
                }
                onPress={
                  handleResetPassword
                }
                className="h-[48px] flex-row items-center justify-center rounded-[16px] bg-[#252A20] active:opacity-80"
              >
                {passwordSaving ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="key-outline"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text className="ml-2 text-[13px] font-bold text-white">
                      Cambiar contraseña
                    </Text>
                  </>
                )}
              </Pressable>
            </Section>

            <Section
              title="Información del sistema"
              subtitle="Datos relacionados con la cuenta"
            >
              <InfoRow
                label="ID"
                value={String(
                  user.id
                )}
              />

              <InfoRow
                label="Document ID"
                value={
                  user.documentId ??
                  'No disponible'
                }
              />

              <InfoRow
                label="Proveedor"
                value={
                  user.provider ??
                  'No disponible'
                }
              />

              <InfoRow
                label="Restaurante"
                value={
                  user.restaurant
                    ?.name ??
                  'Sin restaurante'
                }
              />

              <InfoRow
                label="Pedidos"
                value={String(
                  user.orders
                    ?.length ??
                    0
                )}
              />

              <InfoRow
                label="Solicitud"
                value={
                  user.restaurant_application
                    ?.status ??
                  'Sin solicitud'
                }
              />

              <InfoRow
                label="Fecha de creación"
                value={formatDate(
                  user.createdAt
                )}
              />

              <InfoRow
                label="Última actualización"
                value={formatDate(
                  user.updatedAt
                )}
              />
            </Section>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View className="min-h-[64px] flex-row items-center border-b border-[#E9EBE3] bg-[#F7F8F2] px-4">
      <Pressable
        onPress={() =>
          router.back()
        }
        className="h-11 w-11 items-center justify-center rounded-[16px] bg-white active:opacity-70"
      >
        <Ionicons
          name="arrow-back"
          size={21}
          color="#30352A"
        />
      </Pressable>

      <View className="ml-3">
        <Text className="text-[19px] font-extrabold text-[#252A20]">
          Usuario
        </Text>

        <Text className="mt-0.5 text-[11px] text-[#858A7A]">
          Administración de cuenta
        </Text>
      </View>
    </View>
  );
}

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function Section({
  title,
  subtitle,
  children,
}: SectionProps) {
  return (
    <View className="gap-4 rounded-[24px] border border-[#E9EBE3] bg-white p-4">
      <View>
        <Text className="text-[16px] font-extrabold text-[#252A20]">
          {title}
        </Text>

        {subtitle && (
          <Text className="mt-1 text-[12px] text-[#858A7A]">
            {subtitle}
          </Text>
        )}
      </View>

      {children}
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;

  onChangeText: (
    value: string
  ) => void;

  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad';

  autoCapitalize?:
    | 'none'
    | 'sentences'
    | 'words'
    | 'characters';

  secureTextEntry?: boolean;
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
}: FieldProps) {
  return (
    <View>
      <Text className="mb-2 text-[12px] font-bold text-[#59604F]">
        {label}
      </Text>

      <TextInput
        value={
          value
        }
        onChangeText={
          onChangeText
        }
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        secureTextEntry={
          secureTextEntry
        }
        placeholderTextColor="#A6AA9C"
        className="h-[50px] rounded-[16px] border border-[#E9EBE3] bg-[#F7F8F2] px-4 text-[14px] text-[#252A20]"
      />
    </View>
  );
}

interface OptionSwitchProps {
  title: string;
  description: string;
  value: boolean;

  onValueChange: (
    value: boolean
  ) => void;

  danger?: boolean;
}

function OptionSwitch({
  title,
  description,
  value,
  onValueChange,
  danger = false,
}: OptionSwitchProps) {
  return (
    <View className="flex-row items-center rounded-[18px] bg-[#F7F8F2] p-4">
      <View className="mr-4 flex-1">
        <Text
          className={
            danger
              ? 'text-[13px] font-bold text-[#B65D51]'
              : 'text-[13px] font-bold text-[#30352A]'
          }
        >
          {title}
        </Text>

        <Text className="mt-1 text-[11px] leading-4 text-[#858A7A]">
          {description}
        </Text>
      </View>

      <Switch
        value={
          value
        }
        onValueChange={
          onValueChange
        }
        trackColor={{
          false:
            '#DDE0D6',
          true:
            danger
              ? '#E4B2AC'
              : '#B9CA95',
        }}
        thumbColor={
          value
            ? danger
              ? '#B65D51'
              : '#7B9646'
            : '#FFFFFF'
        }
      />
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {
  return (
    <View className="flex-row items-start justify-between gap-4 rounded-[15px] bg-[#F7F8F2] px-4 py-3">
      <Text className="flex-1 text-[11px] font-semibold text-[#858A7A]">
        {label}
      </Text>

      <Text className="max-w-[55%] text-right text-[11px] font-bold text-[#30352A]">
        {value}
      </Text>
    </View>
  );
}