import {
  useCallback,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useRestaurantManagement,
} from '@/hooks/useRestaurantManagement';

import {
  mediaUrl,
} from '@/utils/media';

export default function RestaurantScreen() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const documentId =
    user?.restaurant?.documentId;

  const {
    restaurant,
    loadingRestaurant,
    error,
    loadRestaurant,
  } =
    useRestaurantManagement({
      restaurantDocumentId:
        documentId,
      autoLoadRestaurant: false,
    });

  const refresh =
    useCallback(
      async () => {
        if (!documentId) {
          return;
        }

        await loadRestaurant(
          documentId,
        );
      },
      [
        documentId,
        loadRestaurant,
      ],
    );

  useFocusEffect(
    useCallback(() => {
      if (documentId) {
        void refresh().catch(
          () => undefined,
        );
      }

      return undefined;
    }, [
      documentId,
      refresh,
    ]),
  );

  const loading =
    authLoading ||
    loadingRestaurant;

  const logoUrl =
    mediaUrl(
      restaurant?.logo,
    );

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <DashboardNavbar
        title="Restaurante"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={
              loadingRestaurant
            }
            onRefresh={() =>
              void refresh().catch(
                () => undefined,
              )
            }
            tintColor="#6F8C3E"
          />
        }
        contentContainerClassName="px-5 pb-12 pt-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-3xl font-extrabold text-[#171A15]">
              Mi restaurante
            </Text>

            <Text className="mt-2 text-sm leading-6 text-[#747A6E]">
              Consulta y administra la información principal de tu restaurante.
            </Text>
          </View>

          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0DD]">
            <Ionicons
              name="restaurant-outline"
              size={24}
              color="#D47A24"
            />
          </View>
        </View>

        {loading &&
        !restaurant ? (
          <View className="items-center py-16">
            <ActivityIndicator
              size="large"
              color="#6F8C3E"
            />

            <Text className="mt-3 text-sm text-[#777D71]">
              Cargando restaurante...
            </Text>
          </View>
        ) : null}

        {!loading &&
        !restaurant ? (
          <View className="mt-6 rounded-3xl bg-white p-5">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1EF]">
              <Ionicons
                name="alert-circle-outline"
                size={26}
                color="#B65D52"
              />
            </View>

            <Text className="mt-4 text-base font-bold text-[#171A15]">
              No se pudo recuperar el restaurante
            </Text>

            <Text className="mt-2 text-sm leading-6 text-[#777D71]">
              {error ||
                'La cuenta no tiene un restaurante asociado o la información todavía no está disponible.'}
            </Text>

            <Pressable
              onPress={() =>
                void refresh().catch(
                  () => undefined,
                )
              }
              className="mt-4 flex-row items-center justify-center rounded-2xl bg-[#6F8C3E] py-3"
            >
              <Ionicons
                name="refresh-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text className="ml-2 font-bold text-white">
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {restaurant ? (
          <View className="mt-6 rounded-3xl bg-white p-5">
            <View className="flex-row items-center">
              <View className="h-20 w-20 overflow-hidden rounded-3xl bg-[#EEF3E3]">
                {logoUrl ? (
                  <Image
                    source={{
                      uri: logoUrl,
                    }}
                    resizeMode="contain"
                    className="h-full w-full"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons
                      name="restaurant-outline"
                      size={29}
                      color="#6F8C3E"
                    />
                  </View>
                )}
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-xl font-extrabold text-[#171A15]">
                  {restaurant.name}
                </Text>

                <View className="mt-2 self-start rounded-full bg-[#EEF3E3] px-3 py-1">
                  <Text className="text-xs font-bold text-[#607B35]">
                    {restaurant.statusRes}
                  </Text>
                </View>
              </View>
            </View>

            {restaurant.description ? (
              <Text className="mt-5 text-sm leading-6 text-[#73796D]">
                {restaurant.description}
              </Text>
            ) : null}

            <View className="mt-5 gap-4">
              <InfoRow
                icon="mail-outline"
                label="Correo"
                value={
                  restaurant.email ||
                  'No registrado'
                }
              />

              <InfoRow
                icon="call-outline"
                label="Teléfono"
                value={
                  restaurant.phone ||
                  'No registrado'
                }
              />

              <InfoRow
                icon="location-outline"
                label="Dirección"
                value={
                  restaurant.address ||
                  'No registrada'
                }
              />

              <InfoRow
                icon="document-text-outline"
                label="NIT"
                value={
                  restaurant.nit ||
                  'No registrado'
                }
              />

              <InfoRow
                icon="link-outline"
                label="Slug"
                value={
                  restaurant.slug ||
                  'No registrado'
                }
              />
            </View>

            <Pressable
              onPress={() =>
                router.push({
                  pathname:
                    '/others/EditRestaurant',
                  params: {
                    documentId:
                      restaurant.documentId,
                  },
                })
              }
              className="mt-5 flex-row items-center justify-center rounded-2xl bg-[#6F8C3E] py-3.5 active:opacity-80"
            >
              <Ionicons
                name="create-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text className="ml-2 text-[13px] font-extrabold text-white">
                Editar restaurante
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center">
      <Ionicons
        name={icon}
        size={19}
        color="#6F8C3E"
      />

      <View className="ml-3 flex-1">
        <Text className="text-xs text-[#858B80]">
          {label}
        </Text>

        <Text className="mt-0.5 font-semibold text-[#252A20]">
          {value}
        </Text>
      </View>
    </View>
  );
}
