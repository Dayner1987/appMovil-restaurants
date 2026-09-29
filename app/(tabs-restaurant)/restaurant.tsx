// app/(tabs-restaurant)/restaurant.tsx

import {
  useCallback,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  useFocusEffect,
} from 'expo-router';

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useRestaurant,
} from '@/hooks/useRestaurant';

import {
  api,
} from '@/services/api';

function getImageUrl(
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
        .baseURL ??
        ''
    ).replace(
      /\/$/,
      ''
    );

  return `${baseUrl}${
    url.startsWith('/')
      ? url
      : `/${url}`
  }`;
}

export default function RestaurantScreen() {
  const {
    user,
    loading:
      authLoading,
  } =
    useAuth();

  const {
    restaurants,
    loading:
      restaurantLoading,
    refresh,
  } =
    useRestaurant({
      autoLoad:
        Boolean(
          user?.id
        ),

      query: {
        page: 1,
        pageSize: 25,

        userId:
          user?.id,

        sort:
          'name:asc',
      },
    });

  useFocusEffect(
    useCallback(() => {
      if (
        user?.id
      ) {
        void refresh();
      }

      return undefined;
    }, [
      user?.id,
      refresh,
    ])
  );

  const loading =
    authLoading ||
    restaurantLoading;

  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
    >
      <DashboardNavbar
        title="Restaurante"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              restaurantLoading
            }
            onRefresh={() =>
              void refresh()
            }
            tintColor="#6F8C3E"
          />
        }
        contentContainerClassName="
          px-5
          pb-12
          pt-5
        "
      >
        <View
          className="
            flex-row
            items-center
            justify-between
          "
        >
          <View
            className="
              flex-1
              pr-4
            "
          >
            <Text
              className="
                text-3xl
                font-extrabold
                text-[#171A15]
              "
            >
              Mi restaurante
            </Text>

            <Text
              className="
                mt-2
                text-sm
                leading-6
                text-[#747A6E]
              "
            >
              Información de los restaurantes asociados a tu cuenta.
            </Text>
          </View>

          <View
            className="
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-[#FFF0DD]
            "
          >
            <Ionicons
              name="restaurant-outline"
              size={24}
              color="#D47A24"
            />
          </View>
        </View>

        {loading &&
        restaurants.length ===
          0 ? (
          <View
            className="
              items-center
              py-16
            "
          >
            <ActivityIndicator
              size="large"
              color="#6F8C3E"
            />

            <Text
              className="
                mt-3
                text-sm
                text-[#777D71]
              "
            >
              Cargando restaurante...
            </Text>
          </View>
        ) : null}

        {!loading &&
        restaurants.length ===
          0 ? (
          <View
            className="
              mt-6
              rounded-3xl
              bg-white
              p-5
            "
          >
            <Text
              className="
                text-base
                font-bold
                text-[#171A15]
              "
            >
              No se pudo recuperar la información
            </Text>

            <Text
              className="
                mt-2
                text-sm
                leading-6
                text-[#777D71]
              "
            >
              Intenta cargar nuevamente la información de tu restaurante.
            </Text>

            <Pressable
              onPress={() =>
                void refresh()
              }
              className="
                mt-4
                flex-row
                items-center
                justify-center
                rounded-2xl
                bg-[#6F8C3E]
                py-3
              "
            >
              <Ionicons
                name="refresh-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text
                className="
                  ml-2
                  font-bold
                  text-white
                "
              >
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View
          className="
            mt-6
            gap-4
          "
        >
          {restaurants.map(
            (
              restaurant
            ) => {
              const logoUrl =
                getImageUrl(
                  restaurant.logo
                    ?.url
                );

              return (
                <View
                  key={
                    restaurant.documentId
                  }
                  className="
                    rounded-3xl
                    bg-white
                    p-5
                  "
                >
                  <View
                    className="
                      flex-row
                      items-center
                    "
                  >
                    <View
                      className="
                        h-20
                        w-20
                        overflow-hidden
                        rounded-3xl
                        bg-[#EEF3E3]
                      "
                    >
                      {logoUrl ? (
                        <Image
                          source={{
                            uri:
                              logoUrl,
                          }}
                          resizeMode="cover"
                          className="
                            h-full
                            w-full
                          "
                        />
                      ) : (
                        <View
                          className="
                            flex-1
                            items-center
                            justify-center
                          "
                        >
                          <Ionicons
                            name="restaurant-outline"
                            size={29}
                            color="#6F8C3E"
                          />
                        </View>
                      )}
                    </View>

                    <View
                      className="
                        ml-4
                        flex-1
                      "
                    >
                      <Text
                        className="
                          text-xl
                          font-extrabold
                          text-[#171A15]
                        "
                      >
                        {restaurant.name}
                      </Text>

                      <View
                        className="
                          mt-2
                          self-start
                          rounded-full
                          bg-[#EEF3E3]
                          px-3
                          py-1
                        "
                      >
                        <Text
                          className="
                            text-xs
                            font-bold
                            text-[#607B35]
                          "
                        >
                          {restaurant.statusRes}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {restaurant.description ? (
                    <Text
                      className="
                        mt-5
                        text-sm
                        leading-6
                        text-[#73796D]
                      "
                    >
                      {restaurant.description}
                    </Text>
                  ) : null}

                  <View
                    className="
                      mt-5
                      gap-4
                    "
                  >
                    <View
                      className="
                        flex-row
                        items-center
                      "
                    >
                      <Ionicons
                        name="mail-outline"
                        size={19}
                        color="#6F8C3E"
                      />

                      <View
                        className="
                          ml-3
                          flex-1
                        "
                      >
                        <Text
                          className="
                            text-xs
                            text-[#858B80]
                          "
                        >
                          Correo
                        </Text>

                        <Text
                          className="
                            mt-0.5
                            font-semibold
                            text-[#252A20]
                          "
                        >
                          {restaurant.email}
                        </Text>
                      </View>
                    </View>

                    <View
                      className="
                        flex-row
                        items-center
                      "
                    >
                      <Ionicons
                        name="call-outline"
                        size={19}
                        color="#6F8C3E"
                      />

                      <View
                        className="
                          ml-3
                          flex-1
                        "
                      >
                        <Text
                          className="
                            text-xs
                            text-[#858B80]
                          "
                        >
                          Teléfono
                        </Text>

                        <Text
                          className="
                            mt-0.5
                            font-semibold
                            text-[#252A20]
                          "
                        >
                          {restaurant.phone ||
                            'No registrado'}
                        </Text>
                      </View>
                    </View>

                    <View
                      className="
                        flex-row
                        items-center
                      "
                    >
                      <Ionicons
                        name="location-outline"
                        size={19}
                        color="#6F8C3E"
                      />

                      <View
                        className="
                          ml-3
                          flex-1
                        "
                      >
                        <Text
                          className="
                            text-xs
                            text-[#858B80]
                          "
                        >
                          Dirección
                        </Text>

                        <Text
                          className="
                            mt-0.5
                            font-semibold
                            text-[#252A20]
                          "
                        >
                          {restaurant.address ||
                            'No registrada'}
                        </Text>
                      </View>
                    </View>

                    <View
                      className="
                        flex-row
                        items-center
                      "
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={19}
                        color="#D47A24"
                      />

                      <View
                        className="
                          ml-3
                          flex-1
                        "
                      >
                        <Text
                          className="
                            text-xs
                            text-[#858B80]
                          "
                        >
                          NIT
                        </Text>

                        <Text
                          className="
                            mt-0.5
                            font-semibold
                            text-[#252A20]
                          "
                        >
                          {restaurant.nit ||
                            'No registrado'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}