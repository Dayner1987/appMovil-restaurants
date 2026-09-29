// app/(tabs-restaurant)/publications.tsx

import {
  useCallback,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import DashboardNavbar from '@/components/DashboardNavbar';

import PublicationCard from '@/components/restaurant/PublicationCard';

import DeletePublicationModal from '@/components/restaurant/DeletePublicationModal';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useRestaurant,
} from '@/hooks/useRestaurant';

import {
  usePublication,
} from '@/hooks/usePublication';

import type {
  Publication,
} from '@/types/publication.types';

export default function RestaurantPublicationsScreen() {
  // =====================================================
  // AUTH
  // =====================================================

  const {
    user,

    loading:
      authLoading,
  } =
    useAuth();

  // =====================================================
  // RESTAURANT
  // =====================================================

  const {
    restaurant,

    loading:
      restaurantLoading,

    refresh:
      refreshRestaurant,
  } =
    useRestaurant({
      autoLoad:
        Boolean(
          user?.id
        ),

      query: {
        page:
          1,

        pageSize:
          1,

        userId:
          user?.id,
      },
    });

  const restaurantDocumentId =
    restaurant
      ?.documentId;

  // =====================================================
  // PUBLICATIONS
  // =====================================================

  const {
    publications,

    loading:
      publicationsLoading,

    saving,

    error,

    refresh:
      refreshPublications,

    deletePublication,
  } =
    usePublication({
      autoLoad:
        Boolean(
          restaurantDocumentId
        ),

      restaurantDocumentId,

      query: {
        page:
          1,

        pageSize:
          100,

        sort:
          'createdAt:desc',

        restaurantDocumentId,
      },
    });

  const [
    publicationToDelete,
    setPublicationToDelete,
  ] =
    useState<Publication | null>(
      null
    );

  // =====================================================
  // REFRESH
  // =====================================================

  const refreshAll =
    useCallback(
      async () => {
        try {
          await refreshRestaurant();

          if (
            restaurantDocumentId
          ) {
            await refreshPublications();
          }
        } catch (
          requestError
        ) {
          Toast.show({
            type:
              'error',

            text1:
              'No se pudo actualizar',

            text2:
              requestError instanceof
                Error
                ? requestError.message
                : 'Intenta nuevamente.',

            position:
              'bottom',
          });
        }
      },
      [
        refreshRestaurant,
        restaurantDocumentId,
        refreshPublications,
      ]
    );

  // =====================================================
  // REFRESH ON FOCUS
  //
  // CREATE / EDIT / IMAGE / DELETE
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      void refreshRestaurant();

      if (
        restaurantDocumentId
      ) {
        void refreshPublications()
          .catch(
            () =>
              undefined
          );
      }

      return undefined;
    }, [
      refreshRestaurant,
      restaurantDocumentId,
      refreshPublications,
    ])
  );

  // =====================================================
  // CREATE
  // =====================================================

  const handleCreate =
    () => {
      if (
        !restaurantDocumentId
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'Restaurante no disponible',

          text2:
            'No se pudo recuperar la información del restaurante.',

          position:
            'bottom',
        });

        return;
      }

      router.push({
        pathname:
          '/others/CreatePublication',

        params: {
          restaurantDocumentId,

          restaurantName:
            restaurant
              ?.name ??
            '',
        },
      });
    };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit =
    (
      publication:
        Publication
    ) => {
      if (
        !restaurantDocumentId
      ) {
        return;
      }

      router.push({
        pathname:
          '/others/EditPublication',

        params: {
          documentId:
            publication.documentId,

          restaurantDocumentId,
        },
      });
    };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete =
    async () => {
      if (
        !publicationToDelete
      ) {
        return;
      }

      try {
        await deletePublication(
          publicationToDelete
            .documentId
        );

        setPublicationToDelete(
          null
        );

        Toast.show({
          type:
            'success',

          text1:
            'Publicación eliminada',

          text2:
            'La publicación fue eliminada correctamente.',

          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo eliminar',

          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'Intenta nuevamente.',

          position:
            'bottom',
        });
      }
    };

  const initialLoading =
    authLoading ||
    restaurantLoading;

  const refreshing =
    restaurantLoading ||
    publicationsLoading;

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
      edges={[
        'top',
      ]}
    >
      <DashboardNavbar
        title="Publicaciones"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom:
            140,
        }}
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              void refreshAll()
            }
          />
        }
      >
        <View
          className="
            px-5
            pt-5
          "
        >
          {/* HEADER */}

          <View
            className="
              flex-row
              items-center
            "
          >
            <View
              className="
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#EEF3E3]
              "
            >
              <Ionicons
                name="newspaper-outline"
                size={24}
                color="#6F8C3E"
              />
            </View>

            <View
              className="
                ml-4
                flex-1
              "
            >
              <Text
                className="
                  text-2xl
                  font-extrabold
                  text-[#171A15]
                "
              >
                Publicaciones
              </Text>

              <Text
                className="
                  mt-1
                  text-sm
                  text-[#777D71]
                "
              >
                Gestiona el contenido de tu restaurante.
              </Text>
            </View>
          </View>

          {/* CREATE */}

          <Pressable
            onPress={
              handleCreate
            }
            className="
              mt-6
              flex-row
              items-center
              justify-center
              rounded-2xl
              bg-[#6F8C3E]
              px-4
              py-4
            "
          >
            <Ionicons
              name="add-outline"
              size={23}
              color="#FFFFFF"
            />

            <Text
              className="
                ml-2
                font-extrabold
                text-white
              "
            >
              Nueva publicación
            </Text>
          </Pressable>

          {/* COUNT */}

          {!initialLoading &&
          restaurantDocumentId ? (
            <View
              className="
                mt-6
                flex-row
                items-center
                justify-between
              "
            >
              <Text
                className="
                  text-base
                  font-extrabold
                  text-[#171A15]
                "
              >
                Tus publicaciones
              </Text>

              <View
                className="
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
                  {publications.length}
                </Text>
              </View>
            </View>
          ) : null}

          {/* INITIAL LOADING */}

          {initialLoading ? (
            <View
              className="
                items-center
                justify-center
                py-20
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
                Cargando publicaciones...
              </Text>
            </View>
          ) : null}

          {/* NO RESTAURANT */}

          {!initialLoading &&
          !restaurantDocumentId ? (
            <View
              className="
                mt-8
                items-center
                rounded-3xl
                bg-white
                px-6
                py-10
              "
            >
              <Ionicons
                name="restaurant-outline"
                size={34}
                color="#8A9680"
              />

              <Text
                className="
                  mt-3
                  text-center
                  text-base
                  font-bold
                  text-[#343A30]
                "
              >
                Restaurante no disponible
              </Text>

              <Text
                className="
                  mt-2
                  text-center
                  text-sm
                  leading-5
                  text-[#858B80]
                "
              >
                No se pudo recuperar el restaurante asociado a tu usuario.
              </Text>
            </View>
          ) : null}

          {/* ERROR */}

          {!initialLoading &&
          error ? (
            <View
              className="
                mt-5
                flex-row
                rounded-2xl
                bg-[#FBECEA]
                px-4
                py-3
              "
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#B65D51"
              />

              <Text
                className="
                  ml-2
                  flex-1
                  text-sm
                  text-[#A95249]
                "
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* EMPTY */}

          {!initialLoading &&
          !publicationsLoading &&
          restaurantDocumentId &&
          publications.length ===
            0 ? (
            <View
              className="
                mt-5
                items-center
                rounded-3xl
                bg-white
                px-6
                py-10
              "
            >
              <View
                className="
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-3xl
                  bg-[#EEF3E3]
                "
              >
                <Ionicons
                  name="newspaper-outline"
                  size={30}
                  color="#78934A"
                />
              </View>

              <Text
                className="
                  mt-4
                  text-center
                  text-lg
                  font-extrabold
                  text-[#171A15]
                "
              >
                Sin publicaciones
              </Text>

              <Text
                className="
                  mt-2
                  text-center
                  text-sm
                  leading-5
                  text-[#858B80]
                "
              >
                Crea tu primera publicación para comenzar a mostrar contenido.
              </Text>
            </View>
          ) : null}

          {/* LIST */}

          {publications.length >
          0 ? (
            <View
              className="
                mt-4
                gap-3
              "
            >
              {publications.map(
                (
                  publication
                ) => (
                  <PublicationCard
                    key={
                      publication.documentId
                    }
                    publication={
                      publication
                    }
                    onEdit={
                      handleEdit
                    }
                    onDelete={
                      setPublicationToDelete
                    }
                  />
                )
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <DeletePublicationModal
        visible={
          Boolean(
            publicationToDelete
          )
        }
        title={
          publicationToDelete
            ?.title
        }
        saving={
          saving
        }
        onClose={() =>
          setPublicationToDelete(
            null
          )
        }
        onConfirm={
          handleDelete
        }
      />
    </SafeAreaView>
  );
}