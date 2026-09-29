// app/(tabs-restaurant)/orders.tsx

import {
  useCallback,
  useMemo,
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

import OrderCard from '@/components/restaurant/OrderCard';


import OrderStatusFilters, {
  type OrderListFilter,
} from '../../components/restaurant/OrderStatusFilters';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useOrder,
} from '@/hooks/useOrder';

import {
  usePayment,
} from '@/hooks/usePayment';

import {
  useRestaurant,
} from '@/hooks/useRestaurant';

import type {
  Order,
} from '@/types/orders.types';

type CreatorFilter =
  | 'ALL'
  | 'MINE'
  | 'TEAM';

export default function RestaurantOrdersScreen() {
  // =====================================================
  // FILTERS
  // =====================================================

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<OrderListFilter>(
      'ALL'
    );

  const [
    creatorFilter,
    setCreatorFilter,
  ] =
    useState<CreatorFilter>(
      'ALL'
    );

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
  // ORDERS
  // =====================================================

  const {
    orders,

    loading:
      ordersLoading,

    loadOrders,
  } =
    useOrder({
      autoLoad:
        false,
    });

  // =====================================================
  // APPROVED PAYMENTS
  //
  // Esto representa dinero realmente cobrado.
  // =====================================================

  const {
    payments:

      approvedPayments,

    loading:
      paymentsLoading,

    loadPayments,
  } =
    usePayment({
      autoLoad:
        false,
    });

  // =====================================================
  // LOAD
  // =====================================================

  const refreshOrders =
    useCallback(
      async () => {
        if (
          !restaurantDocumentId
        ) {
          return;
        }

        await Promise.all([
          loadOrders({
            page:
              1,

            pageSize:
              100,

            sort:
              'orderedAt:desc',

            restaurantDocumentId,
          }),

          loadPayments({
            page:
              1,

            pageSize:
              100,

            sort:
              'paidAt:desc',

            restaurantDocumentId,

            statusPayment:
              'APPROVED',
          }),
        ]);
      },
      [
        restaurantDocumentId,
        loadOrders,
        loadPayments,
      ]
    );

  const refreshAll =
    useCallback(
      async () => {
        try {
          await refreshRestaurant();

          if (
            restaurantDocumentId
          ) {
            await refreshOrders();
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
        refreshOrders,
      ]
    );

  // =====================================================
  // REFRESH ON FOCUS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      void refreshRestaurant();

      if (
        restaurantDocumentId
      ) {
        void refreshOrders()
          .catch(
            () =>
              undefined
          );
      }

      return undefined;
    }, [
      refreshRestaurant,
      restaurantDocumentId,
      refreshOrders,
    ])
  );

  // =====================================================
  // COUNTS
  // =====================================================

  const counts =
    useMemo(
      () => {
        const active =
          orders.filter(
            (
              order
            ) =>
              order.statusOrder !==
                'COMPLETED' &&
              order.statusOrder !==
                'CANCELLED'
          ).length;

        const completed =
          orders.filter(
            (
              order
            ) =>
              order.statusOrder ===
              'COMPLETED'
          ).length;

        const cancelled =
          orders.filter(
            (
              order
            ) =>
              order.statusOrder ===
              'CANCELLED'
          ).length;

        return {
          all:
            orders.length,

          active,

          completed,

          cancelled,
        };
      },
      [
        orders,
      ]
    );

  // =====================================================
  // REVENUE
  //
  // SOLO pagos APPROVED.
  // =====================================================

  const collectedRevenue =
    useMemo(
      () =>
        approvedPayments.reduce(
          (
            total,
            payment
          ) =>
            total +
            Number(
              payment.amount ??
              0
            ),
          0
        ),
      [
        approvedPayments,
      ]
    );

  // =====================================================
  // FILTERED ORDERS
  // =====================================================

  const filteredOrders =
    useMemo(
      () =>
        orders.filter(
          (
            order
          ) => {
            // =========================================
            // STATUS
            // =========================================

            if (
              statusFilter ===
                'ACTIVE' &&
              (
                order.statusOrder ===
                  'COMPLETED' ||
                order.statusOrder ===
                  'CANCELLED'
              )
            ) {
              return false;
            }

            if (
              statusFilter ===
                'COMPLETED' &&
              order.statusOrder !==
                'COMPLETED'
            ) {
              return false;
            }

            if (
              statusFilter ===
                'CANCELLED' &&
              order.statusOrder !==
                'CANCELLED'
            ) {
              return false;
            }

            // =========================================
            // CREATOR
            // =========================================

            if (
              creatorFilter ===
              'MINE'
            ) {
              return Boolean(
                order.users
                  ?.some(
                    (
                      orderUser
                    ) =>
                      orderUser.id ===
                      user?.id
                  )
              );
            }

            if (
              creatorFilter ===
              'TEAM'
            ) {
              /*
               * Mostramos órdenes registradas por
               * otro usuario del sistema.
               *
               * Excluimos ONLINE porque normalmente
               * puede representar pedido del cliente.
               */
              return (
                order.orderType !==
                  'ONLINE' &&
                Boolean(
                  order.users
                    ?.some(
                      (
                        orderUser
                      ) =>
                        orderUser.id !==
                        user?.id
                    )
                )
              );
            }

            return true;
          }
        ),
      [
        orders,
        statusFilter,
        creatorFilter,
        user?.id,
      ]
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
            'No se pudo identificar el restaurante.',

          position:
            'bottom',
        });

        return;
      }

      router.push({
        pathname:
          '/others/CreateOrder',

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
  // DETAILS
  // =====================================================

  const handleOpenOrder =
    (
      order:
        Order
    ) => {
      router.push({
        pathname:
          '/others/OrderDetails',

        params: {
          documentId:
            order.documentId,

          restaurantDocumentId:
            restaurantDocumentId ??
            '',
        },
      });
    };

  const initialLoading =
    authLoading ||
    restaurantLoading;

  const refreshing =
    restaurantLoading ||
    ordersLoading ||
    paymentsLoading;

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
        title="Órdenes"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
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
        contentContainerStyle={{
          paddingBottom:
            140,
        }}
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
                name="receipt-outline"
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
                Órdenes y pagos
              </Text>

              <Text
                className="
                  mt-1
                  text-sm
                  text-[#777D71]
                "
              >
                Gestiona pedidos, responsables y cobros.
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
              Nueva orden
            </Text>
          </Pressable>

          {/* SUMMARY */}

          <View
            className="
              mt-5
              flex-row
              gap-3
            "
          >
            <View
              className="
                flex-1
                rounded-2xl
                bg-white
                p-4
              "
            >
              <Text
                className="
                  text-xs
                  font-semibold
                  uppercase
                  text-[#858B80]
                "
              >
                Órdenes
              </Text>

              <Text
                className="
                  mt-2
                  text-2xl
                  font-extrabold
                  text-[#171A15]
                "
              >
                {orders.length}
              </Text>

              <Text
                className="
                  mt-1
                  text-xs
                  text-[#858B80]
                "
              >
                {counts.active}{' '}
                activas
              </Text>
            </View>

            <View
              className="
                flex-1
                rounded-2xl
                bg-[#EEF3E3]
                p-4
              "
            >
              <Text
                className="
                  text-xs
                  font-semibold
                  uppercase
                  text-[#6F7F53]
                "
              >
                Cobrado
              </Text>

              <Text
                className="
                  mt-2
                  text-2xl
                  font-extrabold
                  text-[#536A2F]
                "
              >
                Bs{' '}
                {collectedRevenue.toFixed(
                  2
                )}
              </Text>

              <Text
                className="
                  mt-1
                  text-xs
                  text-[#70805B]
                "
              >
                Pagos aprobados
              </Text>
            </View>
          </View>

          {/* STATUS FILTER */}

          <View
            className="
              mt-6
            "
          >
            <OrderStatusFilters
              value={
                statusFilter
              }
              onChange={
                setStatusFilter
              }
              counts={
                counts
              }
            />
          </View>

          {/* CREATOR FILTER */}

          <View
            className="
              mt-4
              flex-row
              rounded-2xl
              bg-white
              p-1
            "
          >
            {[
              {
                key:
                  'ALL' as CreatorFilter,

                label:
                  'Todas',
              },

              {
                key:
                  'MINE' as CreatorFilter,

                label:
                  'Mías',
              },

              {
                key:
                  'TEAM' as CreatorFilter,

                label:
                  'Equipo',
              },
            ].map(
              (
                option
              ) => {
                const selected =
                  creatorFilter ===
                  option.key;

                return (
                  <Pressable
                    key={
                      option.key
                    }
                    onPress={() =>
                      setCreatorFilter(
                        option.key
                      )
                    }
                    className={`
                      flex-1
                      items-center
                      rounded-xl
                      py-2.5
                      ${
                        selected
                          ? 'bg-[#EEF3E3]'
                          : ''
                      }
                    `}
                  >
                    <Text
                      className={`
                        text-sm
                        font-bold
                        ${
                          selected
                            ? 'text-[#536A2F]'
                            : 'text-[#858B80]'
                        }
                      `}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          {/* LOADING */}

          {initialLoading ? (
            <View
              className="
                items-center
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
                Cargando órdenes...
              </Text>
            </View>
          ) : null}

          {/* ORDERS */}

          {!initialLoading &&
          filteredOrders.length >
            0 ? (
            <View
              className="
                mt-5
                gap-3
              "
            >
              {filteredOrders.map(
                (
                  order
                ) => (
                  <OrderCard
                    key={
                      order.documentId
                    }
                    order={
                      order
                    }
                    onPress={
                      handleOpenOrder
                    }
                  />
                )
              )}
            </View>
          ) : null}

          {/* EMPTY */}

          {!initialLoading &&
          !ordersLoading &&
          filteredOrders.length ===
            0 ? (
            <View
              className="
                mt-5
                items-center
                rounded-3xl
                bg-white
                px-5
                py-10
              "
            >
              <Ionicons
                name="receipt-outline"
                size={34}
                color="#8A9680"
              />

              <Text
                className="
                  mt-3
                  text-base
                  font-extrabold
                  text-[#343A30]
                "
              >
                No hay órdenes
              </Text>

              <Text
                className="
                  mt-2
                  text-center
                  text-sm
                  text-[#858B80]
                "
              >
                No existen órdenes para el filtro seleccionado.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}