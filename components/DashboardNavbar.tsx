// components/DashboardNavbar.tsx

import {
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
} from 'expo-router';

import Toast from 'react-native-toast-message';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useUser,
} from '@/hooks/useUsers';

import {
  useCompany,
} from '@/hooks/useCompany';

import {
  api,
} from '@/services/api';

import type {
  Company,
} from '@/types/company.types';

interface DashboardNavbarProps {
  title?: string;
}

type CompanyNavbarData =
  Company & {
    name?: string | null;

    companyName?:
      | string
      | null;

    logo?:
      | {
          url?:
            | string
            | null;
        }
      | null;
  };

const SCREEN_WIDTH =
  Dimensions.get(
    'window'
  ).width;

const DRAWER_WIDTH =
  Math.min(
    SCREEN_WIDTH * 0.84,
    360
  );

function getMediaUrl(
  url?:
    | string
    | null
) {
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

export default function DashboardNavbar({
  title = 'Panel',
}: DashboardNavbarProps) {
  const {
    user: authUser,
    isAuthenticated,
    logout,
  } = useAuth();

  /*
   * /users/me para tener el
   * perfil actualizado.
   */
  const {
    user: currentUser,
  } = useUser({
    autoLoad:
      isAuthenticated,
  });

  /*
   * Para el panel administrativo
   * tomamos la empresa disponible.
   */
  const {
    company,
    companies,
  } = useCompany({
    autoLoad: true,

    query: {
      page: 1,
      pageSize: 1,
    },
  });

  const [
    drawerVisible,
    setDrawerVisible,
  ] =
    useState(false);

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

  const translateX =
    useRef(
      new Animated.Value(
        -DRAWER_WIDTH
      )
    ).current;

  const user =
    currentUser ??
    authUser;

  const currentCompany =
    (
      company ??
      companies[0] ??
      null
    ) as
      | CompanyNavbarData
      | null;

  const displayedName =
    useMemo(() => {
      const fullName =
        [
          user?.firstName,
          user?.lastName,
        ]
          .filter(Boolean)
          .join(' ')
          .trim();

      return (
        fullName ||
        user?.username ||
        'Usuario'
      );
    }, [
      user?.firstName,
      user?.lastName,
      user?.username,
    ]);

  const displayedRole =
    user?.role?.name ??
    'Usuario';

  const displayedEmail =
    user?.email ??
    '';

  const avatarUrl =
    getMediaUrl(
      user?.avatar?.url
    );

  const avatarLetter =
    displayedName
      .charAt(0)
      .toUpperCase();

  const companyName =
    currentCompany
      ?.name?.trim() ||
    currentCompany
      ?.companyName?.trim() ||
    'Mi empresa';

  const companyLogoUrl =
    getMediaUrl(
      currentCompany
        ?.logo?.url
    );

  const companyLetter =
    companyName
      .charAt(0)
      .toUpperCase();

  function openDrawer() {
    setDrawerVisible(
      true
    );

    Animated.timing(
      translateX,
      {
        toValue: 0,

        duration: 220,

        useNativeDriver:
          true,
      }
    ).start();
  }

  function closeDrawer(
    callback?:
      () => void
  ) {
    Animated.timing(
      translateX,
      {
        toValue:
          -DRAWER_WIDTH,

        duration: 200,

        useNativeDriver:
          true,
      }
    ).start(() => {
      setDrawerVisible(
        false
      );

      callback?.();
    });
  }

  function handleCompanyInfo() {
    closeDrawer(
      () => {
        router.push({
          pathname:
            '/others/InfoCompany',

          params:
            currentCompany
              ?.documentId
              ? {
                  documentId:
                    currentCompany.documentId,
                }
              : {},
        });
      }
    );
  }

  function handleEditProfile() {
    closeDrawer(
      () => {
        router.push(
          '/edit-profile'
        );
      }
    );
  }

  function handleLogout() {
    closeDrawer(
      () => {
        setLogoutVisible(
          true
        );
      }
    );
  }

  async function performLogout() {
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
  }

  return (
    <>
      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <View className="min-h-[72px] flex-row items-center justify-between bg-[#171A15] px-4 py-2.5">
        {/* ============================================= */}
        {/* IZQUIERDA - USUARIO */}
        {/* ============================================= */}

        <Pressable
          onPress={
            openDrawer
          }
          className="min-w-0 flex-1 flex-row items-center active:opacity-75"
        >
          {avatarUrl ? (
            <Image
              source={{
                uri:
                  avatarUrl,
              }}
              resizeMode="cover"
              className="h-11 w-11 rounded-[15px] border-2 border-[#7B9646]"
            />
          ) : (
            <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#7B9646]">
              <Text className="text-[16px] font-extrabold text-white">
                {
                  avatarLetter
                }
              </Text>
            </View>
          )}

          <View className="ml-3 min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className="text-[14px] font-extrabold text-white"
            >
              {
                displayedName
              }
            </Text>

            <View className="mt-0.5 flex-row items-center">
              <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#9EBD62]" />

              <Text
                numberOfLines={1}
                className="text-[10px] font-semibold text-[#AEB5A6]"
              >
                {
                  displayedRole
                }
              </Text>
            </View>
          </View>
        </Pressable>

        {/* ============================================= */}
        {/* DERECHA - EMPRESA */}
        {/* ============================================= */}

        <Pressable
          onPress={
            handleCompanyInfo
          }
          className="ml-4 max-w-[48%] flex-row items-center rounded-[18px] bg-[#22261F] py-1.5 pl-3 pr-1.5 active:opacity-75"
        >
          <View className="mr-2 min-w-0 flex-1 items-end">
            <Text
              numberOfLines={1}
              className="text-right text-[12px] font-extrabold text-white"
            >
              {
                companyName
              }
            </Text>

            <Text
              numberOfLines={1}
              className="mt-0.5 text-right text-[9px] font-semibold text-[#A8C56C]"
            >
              {title}
            </Text>
          </View>

          {companyLogoUrl ? (
            <Image
              source={{
                uri:
                  companyLogoUrl,
              }}
              resizeMode="cover"
              className="h-10 w-10 rounded-[14px] border border-[#4B5540] bg-white"
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#7B9646]">
              <Text className="text-[14px] font-extrabold text-white">
                {
                  companyLetter
                }
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ================================================= */}
      {/* DRAWER */}
      {/* ================================================= */}

      <Modal
        visible={
          drawerVisible
        }
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() =>
          closeDrawer()
        }
      >
        <View className="flex-1 flex-row">
          {/* Overlay solamente en la parte exterior */}

          <Pressable
            onPress={() =>
              closeDrawer()
            }
            className="absolute inset-0 bg-black/55"
          />

          {/* El drawer ahora es VERDE */}

          <Animated.View
            className="h-full overflow-hidden bg-[#6F8C3E]"
            style={{
              width:
                DRAWER_WIDTH,

              transform: [
                {
                  translateX,
                },
              ],
            }}
          >
            {/* ========================================= */}
            {/* CABECERA USUARIO */}
            {/* ========================================= */}

            <View className="items-center px-6 pb-6 pt-14">
              <Pressable
                onPress={() =>
                  closeDrawer()
                }
                className="absolute right-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/15 active:opacity-70"
              >
                <Ionicons
                  name="close-outline"
                  size={27}
                  color="#FFFFFF"
                />
              </Pressable>

              {avatarUrl ? (
                <Image
                  source={{
                    uri:
                      avatarUrl,
                  }}
                  resizeMode="cover"
                  className="h-[88px] w-[88px] rounded-full border-4 border-[#DDE9C5]"
                />
              ) : (
                <View className="h-[88px] w-[88px] items-center justify-center rounded-full border-4 border-[#DDE9C5] bg-white">
                  <Text className="text-[32px] font-extrabold text-[#607A35]">
                    {
                      avatarLetter
                    }
                  </Text>
                </View>
              )}

              <Text
                numberOfLines={1}
                className="mt-4 max-w-[90%] text-center text-[21px] font-extrabold text-white"
              >
                {
                  displayedName
                }
              </Text>

              <Text
                numberOfLines={1}
                className="mt-1 max-w-[90%] text-center text-[12px] text-[#E1EACF]"
              >
                {
                  displayedEmail
                }
              </Text>

              <View className="mt-3 flex-row items-center rounded-full bg-black/15 px-3.5 py-2">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color="#FFFFFF"
                />

                <Text className="ml-2 text-[11px] font-bold text-white">
                  {
                    displayedRole
                  }
                </Text>
              </View>
            </View>

            {/* ========================================= */}
            {/* EMPRESA */}
            {/* ========================================= */}

            <View className="px-4">
              <Pressable
                onPress={
                  handleCompanyInfo
                }
                className="flex-row items-center rounded-[22px] bg-white p-4 active:opacity-85"
              >
                {companyLogoUrl ? (
                  <Image
                    source={{
                      uri:
                        companyLogoUrl,
                    }}
                    resizeMode="cover"
                    className="h-12 w-12 rounded-[15px] bg-[#EEF3E3]"
                  />
                ) : (
                  <View className="h-12 w-12 items-center justify-center rounded-[15px] bg-[#EEF3E3]">
                    <Ionicons
                      name="business-outline"
                      size={22}
                      color="#6F8C3E"
                    />
                  </View>
                )}

                <View className="ml-3 min-w-0 flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-[#979D8D]">
                    Empresa
                  </Text>

                  <Text
                    numberOfLines={1}
                    className="mt-0.5 text-[15px] font-extrabold text-[#252A20]"
                  >
                    {
                      companyName
                    }
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#9BA18F"
                />
              </Pressable>
            </View>

            {/* ========================================= */}
            {/* OPCIONES */}
            {/* ========================================= */}

            <View className="flex-1 px-4 pt-5">
              <DrawerOption
                icon="business-outline"
                title="Información compañía"
                description="Consulta los datos generales de la empresa"
                type="light"
                onPress={
                  handleCompanyInfo
                }
              />

              <DrawerOption
                icon="create-outline"
                title="Editar perfil"
                description="Actualiza tus datos personales"
                type="orange"
                onPress={
                  handleEditProfile
                }
              />

              <View className="my-3 h-px bg-white/25" />

              <DrawerOption
                icon="log-out-outline"
                title="Cerrar sesión"
                description="Salir de la cuenta actual"
                type="danger"
                onPress={
                  handleLogout
                }
              />
            </View>

            {/* ========================================= */}
            {/* FOOTER */}
            {/* ========================================= */}

            <View className="border-t border-white/20 px-5 py-5">
              <Text className="text-center text-[11px] text-[#E0E8CF]">
                Sistema móvil de restaurantes
              </Text>

              <Text className="mt-1 text-center text-[9px] text-[#CFDDB6]">
                Administración segura
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ================================================= */}
      {/* MODAL CERRAR SESIÓN */}
      {/* ================================================= */}

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
                <Ionicons
                  name="log-out-outline"
                  size={17}
                  color="#FFFFFF"
                />

                <Text className="ml-2 text-[13px] font-bold text-white">
                  {loggingOut
                    ? 'Cerrando...'
                    : 'Cerrar sesión'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type DrawerOptionType =
  | 'light'
  | 'orange'
  | 'danger';

interface DrawerOptionProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  title: string;

  description: string;

  type:
    DrawerOptionType;

  onPress: () => void;
}

function DrawerOption({
  icon,
  title,
  description,
  type,
  onPress,
}: DrawerOptionProps) {
  const containerClass =
    type === 'orange'
      ? 'bg-[#FFF1DF]'
      : type ===
          'danger'
        ? 'bg-[#FBEAE6]'
        : 'bg-white';

  const iconColor =
    type === 'orange'
      ? '#D47A24'
      : type ===
          'danger'
        ? '#B65D51'
        : '#6F8C3E';

  const titleColor =
    type === 'danger'
      ? 'text-[#B65D51]'
      : 'text-[#252A20]';

  return (
    <Pressable
      onPress={
        onPress
      }
      className={`mb-3 min-h-[72px] flex-row items-center rounded-[20px] px-3.5 active:opacity-85 ${containerClass}`}
    >
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-[14px] bg-black/5">
        <Ionicons
          name={icon}
          size={21}
          color={
            iconColor
          }
        />
      </View>

      <View className="min-w-0 flex-1">
        <Text
          className={`text-[14px] font-extrabold ${titleColor}`}
        >
          {title}
        </Text>

        <Text className="mt-1 text-[11px] leading-4 text-[#7F8578]">
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={18}
        color="#9AA08F"
      />
    </Pressable>
  );
}