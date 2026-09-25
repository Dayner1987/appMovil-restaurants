// app/(tabs-admin)/profile.tsx

import {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
} from 'expo-router';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  api,
} from '@/services/api';

import type {
  AppUser,
} from '@/types/user.types';

// =====================================================
// HELPERS
// =====================================================

function getAvatarUrl(
  url?:
    | string
    | null
): string | null {
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

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}${
    url.startsWith('/')
      ? url
      : `/${url}`
  }`;
}

// =====================================================
// SCREEN
// =====================================================

export default function ProfileScreen() {
  const {
    user,
    loading,
    isAuthenticated,
    logout,
  } = useAuth();

  const [
    logoutVisible,
    setLogoutVisible,
  ] =
    useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  // ===================================================
  // NAVEGACIÓN
  // ===================================================

  const handleLogin = () => {
    router.push(
      '/login'
    );
  };

  const handleRegister = () => {
    router.push(
      '/register'
    );
  };

  const handleRegisterRestaurant =
    () => {
      router.push(
        '/registerRes'
      );
    };

  const handleEditProfile =
    () => {
      router.push(
        '/edit-profile'
      );
    };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout =
    () => {
      setLogoutVisible(
        true
      );
    };

  const performLogout =
    async () => {
      if (
        loggingOut
      ) {
        return;
      }

      setLoggingOut(
        true
      );

      try {
        await logout();

        setLogoutVisible(
          false
        );

        router.replace(
          '/(tabs)'
        );
      } catch (
        error
      ) {
        console.error(
          'Error al cerrar sesión:',
          error
        );

        Toast.show({
          type: 'error',
          text1:
            'No se pudo cerrar la sesión',
          position:
            'bottom',
        });
      } finally {
        setLoggingOut(
          false
        );
      }
    };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={[
          'top',
        ]}
      >
        <View className="flex-1 items-center justify-center">
          <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF3E3]">
            <ActivityIndicator
              size="large"
              color="#7B9646"
            />
          </View>

          <Text className="mt-4 text-[13px] font-medium text-[#858A7A]">
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
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
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom:
            120,
        }}
      >
        {/* =========================================== */}
        {/* HEADER */}
        {/* =========================================== */}

        <View className="flex-row items-center justify-between px-5 pb-4 pt-4">
          <View>
            <Text className="text-[25px] font-extrabold text-[#252A20]">
              Perfil
            </Text>

            <Text className="mt-1 text-[12px] text-[#858A7A]">
              Información de tu cuenta
            </Text>
          </View>

          <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#EEF3E3]">
            <Ionicons
              name="person-outline"
              size={21}
              color="#6F8C3E"
            />
          </View>
        </View>

        {isAuthenticated &&
        user ? (
          <AuthenticatedProfile
            user={user}
            onEditProfile={
              handleEditProfile
            }
            onLogout={
              handleLogout
            }
          />
        ) : (
          <GuestProfile
            onLogin={
              handleLogin
            }
            onRegister={
              handleRegister
            }
            onRegisterRestaurant={
              handleRegisterRestaurant
            }
          />
        )}
      </ScrollView>

      {/* ============================================= */}
      {/* MODAL LOGOUT */}
      {/* ============================================= */}

      <Modal
        visible={
          logoutVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (
            !loggingOut
          ) {
            setLogoutVisible(
              false
            );
          }
        }}
      >
        <View className="flex-1 items-center justify-center bg-black/55 px-5">
          <View className="w-full max-w-[410px] rounded-[26px] bg-[#F7F8F2] p-5">
            <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-[#FFF0DD]">
              <Ionicons
                name="log-out-outline"
                size={22}
                color="#D47A24"
              />
            </View>

            <Text className="mt-4 text-[19px] font-extrabold text-[#252A20]">
              Cerrar sesión
            </Text>

            <Text className="mt-2 text-[13px] leading-5 text-[#858A7A]">
              ¿Estás seguro de que deseas cerrar tu sesión actual?
            </Text>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                disabled={
                  loggingOut
                }
                onPress={() =>
                  setLogoutVisible(
                    false
                  )
                }
                className="h-12 flex-1 items-center justify-center rounded-[16px] border border-[#E3E6DC] bg-white active:opacity-70"
              >
                <Text className="text-[13px] font-bold text-[#555C4E]">
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                disabled={
                  loggingOut
                }
                onPress={() =>
                  void performLogout()
                }
                className="h-12 flex-1 flex-row items-center justify-center rounded-[16px] bg-[#171A15] active:opacity-80"
              >
                {loggingOut ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="log-out-outline"
                      size={17}
                      color="#FFFFFF"
                    />

                    <Text className="ml-2 text-[13px] font-bold text-white">
                      Cerrar sesión
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// =====================================================
// PERFIL INVITADO
// =====================================================

interface GuestProfileProps {
  onLogin: () => void;

  onRegister: () => void;

  onRegisterRestaurant:
    () => void;
}

function GuestProfile({
  onLogin,
  onRegister,
  onRegisterRestaurant,
}: GuestProfileProps) {
  return (
    <View className="items-center px-5 pb-10 pt-8">
      {/* ============================================= */}
      {/* ICONO */}
      {/* ============================================= */}

      <View className="h-32 w-32 items-center justify-center rounded-full border-[5px] border-[#C8D8A8] bg-[#EEF3E3]">
        <Ionicons
          name="person-outline"
          size={58}
          color="#6F8C3E"
        />
      </View>

      {/* ============================================= */}
      {/* PRESENTACIÓN */}
      {/* ============================================= */}

      <Text className="mt-6 text-center text-[26px] font-extrabold text-[#252A20]">
        Bienvenido
      </Text>

      <Text className="mt-2 max-w-[360px] text-center text-[14px] leading-6 text-[#858A7A]">
        Inicia sesión o crea una cuenta para realizar
        pedidos, guardar tus favoritos y administrar tu
        perfil.
      </Text>

      {/* ============================================= */}
      {/* CARACTERÍSTICAS */}
      {/* ============================================= */}

      <View className="mt-7 w-full max-w-[560px] gap-3 rounded-[24px] border border-[#E6E9E0] bg-white p-4">
        <Feature
          icon="fast-food-outline"
          text="Realiza pedidos fácilmente"
          color="green"
        />

        <Feature
          icon="receipt-outline"
          text="Consulta el estado de tus pedidos"
          color="orange"
        />

        <Feature
          icon="heart-outline"
          text="Guarda tus productos favoritos"
          color="green"
        />
      </View>

      {/* ============================================= */}
      {/* LOGIN */}
      {/* ============================================= */}

      <Pressable
        onPress={
          onLogin
        }
        className="mt-7 h-[54px] w-full max-w-[560px] flex-row items-center justify-center rounded-[18px] bg-[#171A15] active:opacity-80"
      >
        <Ionicons
          name="log-in-outline"
          size={20}
          color="#FFFFFF"
        />

        <Text className="ml-2 text-[15px] font-extrabold text-white">
          Iniciar sesión
        </Text>
      </Pressable>

      {/* ============================================= */}
      {/* REGISTRO CLIENTE */}
      {/* ============================================= */}

      <Pressable
        onPress={
          onRegister
        }
        className="mt-3 h-[54px] w-full max-w-[560px] flex-row items-center justify-center rounded-[18px] border border-[#B9C99A] bg-[#EEF3E3] active:opacity-75"
      >
        <Ionicons
          name="person-add-outline"
          size={20}
          color="#6F8C3E"
        />

        <Text className="ml-2 text-[15px] font-extrabold text-[#607A35]">
          Crear una cuenta
        </Text>
      </Pressable>

      {/* ============================================= */}
      {/* REGISTRO RESTAURANTE */}
      {/* ============================================= */}

      <Pressable
        onPress={
          onRegisterRestaurant
        }
        className="mt-3 h-[54px] w-full max-w-[560px] flex-row items-center justify-center rounded-[18px] border border-[#F0CC9F] bg-[#FFF0DD] active:opacity-75"
      >
        <Ionicons
          name="restaurant-outline"
          size={20}
          color="#D47A24"
        />

        <Text className="ml-2 text-[15px] font-extrabold text-[#C16B1B]">
          Registrar tu negocio
        </Text>
      </Pressable>
    </View>
  );
}

// =====================================================
// PERFIL AUTENTICADO
// =====================================================

interface AuthenticatedProfileProps {
  user: AppUser;

  onEditProfile: () => void;

  onLogout: () => void;
}

function AuthenticatedProfile({
  user,
  onEditProfile,
  onLogout,
}: AuthenticatedProfileProps) {
  const fullName =
    [
      user.firstName,
      user.middleName,
      user.lastName,
      user.secondLastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

  const displayedName =
    fullName ||
    user.username;

  const displayedRole =
    user.role?.name ||
    user.role?.type ||
    'Usuario';

  const avatarUrl =
    getAvatarUrl(
      user.avatar?.url
    );

  const avatarLetter =
    displayedName
      .charAt(0)
      .toUpperCase();

  return (
    <View className="items-center px-5 pb-10 pt-5">
      {/* ============================================= */}
      {/* PERFIL PRINCIPAL */}
      {/* ============================================= */}

      <View className="w-full max-w-[620px] items-center rounded-[28px] bg-[#171A15] px-5 pb-7 pt-7">
        <View className="h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[5px] border-[#7B9646] bg-[#EEF3E3]">
          {avatarUrl ? (
            <Image
              source={{
                uri:
                  avatarUrl,
              }}
              resizeMode="cover"
              className="h-full w-full"
            />
          ) : (
            <Text className="text-[48px] font-extrabold text-[#607A35]">
              {
                avatarLetter
              }
            </Text>
          )}
        </View>

        <Text className="mt-5 text-center text-[24px] font-extrabold text-white">
          {
            displayedName
          }
        </Text>

        <Text className="mt-1 text-center text-[13px] text-[#B6BDB0]">
          {user.email}
        </Text>

        <View className="mt-4 flex-row items-center rounded-full bg-[#293021] px-4 py-2">
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color="#A8C56C"
          />

          <Text className="ml-2 text-[12px] font-extrabold text-[#D6E2BE]">
            {
              displayedRole
            }
          </Text>
        </View>
      </View>

      {/* ============================================= */}
      {/* INFORMACIÓN */}
      {/* ============================================= */}

      <View className="mt-5 w-full max-w-[620px] rounded-[26px] border border-[#E5E8DE] bg-white p-5">
        <View className="mb-5">
          <Text className="text-[17px] font-extrabold text-[#252A20]">
            Información personal
          </Text>

          <Text className="mt-1 text-[11px] text-[#858A7A]">
            Datos principales de tu cuenta
          </Text>
        </View>

        <View className="gap-3">
          <InformationRow
            icon="person-outline"
            label="Usuario"
            value={
              user.username
            }
            color="green"
          />

          <InformationRow
            icon="mail-outline"
            label="Correo electrónico"
            value={
              user.email
            }
            color="orange"
          />

          <InformationRow
            icon="briefcase-outline"
            label="Rol"
            value={
              displayedRole
            }
            color="green"
          />

          {user.phone ? (
            <InformationRow
              icon="call-outline"
              label="Teléfono"
              value={
                user.phone
              }
              color="orange"
            />
          ) : null}

          {user.ci ? (
            <InformationRow
              icon="card-outline"
              label="Cédula de identidad"
              value={
                user.ci
              }
              color="green"
            />
          ) : null}
        </View>
      </View>

      {/* ============================================= */}
      {/* ESTADO */}
      {/* ============================================= */}

      <View className="mt-5 w-full max-w-[620px] flex-row gap-3">
        <View className="flex-1 rounded-[22px] bg-[#EEF3E3] p-4">
          <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#DDE9C5]">
            <Ionicons
              name="checkmark-circle-outline"
              size={21}
              color="#6F8C3E"
            />
          </View>

          <Text className="mt-3 text-[13px] font-extrabold text-[#252A20]">
            {user.confirmed
              ? 'Confirmada'
              : 'Pendiente'}
          </Text>

          <Text className="mt-1 text-[10px] text-[#858A7A]">
            Estado de cuenta
          </Text>
        </View>

        <View
          className={
            user.blocked
              ? 'flex-1 rounded-[22px] bg-[#FBEAE6] p-4'
              : 'flex-1 rounded-[22px] bg-[#FFF0DD] p-4'
          }
        >
          <View
            className={
              user.blocked
                ? 'h-10 w-10 items-center justify-center rounded-[14px] bg-[#F5D3CD]'
                : 'h-10 w-10 items-center justify-center rounded-[14px] bg-[#FFE0B5]'
            }
          >
            <Ionicons
              name={
                user.blocked
                  ? 'lock-closed-outline'
                  : 'lock-open-outline'
              }
              size={20}
              color={
                user.blocked
                  ? '#B65D51'
                  : '#D47A24'
              }
            />
          </View>

          <Text className="mt-3 text-[13px] font-extrabold text-[#252A20]">
            {user.blocked
              ? 'Bloqueada'
              : 'Habilitada'}
          </Text>

          <Text className="mt-1 text-[10px] text-[#858A7A]">
            Acceso al sistema
          </Text>
        </View>
      </View>

      {/* ============================================= */}
      {/* EDITAR PERFIL */}
      {/* ============================================= */}

      <Pressable
        onPress={
          onEditProfile
        }
        className="mt-6 h-[54px] w-full max-w-[620px] flex-row items-center justify-center rounded-[18px] bg-[#7B9646] active:opacity-80"
      >
        <Ionicons
          name="create-outline"
          size={20}
          color="#FFFFFF"
        />

        <Text className="ml-2 text-[15px] font-extrabold text-white">
          Editar perfil
        </Text>
      </Pressable>

      {/* ============================================= */}
      {/* CERRAR SESIÓN */}
      {/* ============================================= */}

      <Pressable
        onPress={
          onLogout
        }
        className="mt-3 h-[54px] w-full max-w-[620px] flex-row items-center justify-center rounded-[18px] border border-[#EBC3BC] bg-[#FBEAE6] active:opacity-75"
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#B65D51"
        />

        <Text className="ml-2 text-[15px] font-extrabold text-[#B65D51]">
          Cerrar sesión
        </Text>
      </Pressable>

      {/* ============================================= */}
      {/* FOOTER */}
      {/* ============================================= */}

      <View className="items-center pb-2 pt-8">
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color="#7B9646"
        />

        <Text className="mt-2 text-center text-[10px] text-[#989E8F]">
          Tu información de perfil está protegida
        </Text>
      </View>
    </View>
  );
}

// =====================================================
// FEATURE
// =====================================================

interface FeatureProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  text: string;

  color:
    | 'green'
    | 'orange';
}

function Feature({
  icon,
  text,
  color,
}: FeatureProps) {
  const green =
    color ===
    'green';

  return (
    <View className="min-h-[52px] flex-row items-center">
      <View
        className={
          green
            ? 'mr-3 h-11 w-11 items-center justify-center rounded-[14px] bg-[#EEF3E3]'
            : 'mr-3 h-11 w-11 items-center justify-center rounded-[14px] bg-[#FFF0DD]'
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            green
              ? '#6F8C3E'
              : '#D47A24'
          }
        />
      </View>

      <Text className="flex-1 text-[13px] font-semibold text-[#555C4E]">
        {text}
      </Text>
    </View>
  );
}

// =====================================================
// INFORMATION ROW
// =====================================================

interface InformationRowProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;

  color:
    | 'green'
    | 'orange';
}

function InformationRow({
  icon,
  label,
  value,
  color,
}: InformationRowProps) {
  const green =
    color ===
    'green';

  return (
    <View className="flex-row items-center rounded-[18px] bg-[#F7F8F2] p-3.5">
      <View
        className={
          green
            ? 'h-11 w-11 items-center justify-center rounded-[14px] bg-[#E9F0DB]'
            : 'h-11 w-11 items-center justify-center rounded-[14px] bg-[#FFF0DD]'
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            green
              ? '#6F8C3E'
              : '#D47A24'
          }
        />
      </View>

      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-[10px] font-semibold uppercase tracking-wide text-[#989E8F]">
          {label}
        </Text>

        <Text
          numberOfLines={2}
          className="mt-1 text-[14px] font-bold text-[#30352A]"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}