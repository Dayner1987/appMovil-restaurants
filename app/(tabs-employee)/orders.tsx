// app/(tabs-employee)/orders.tsx

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
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import EmployeeScreenHeader from '@/components/employee/EmployeeScreenHeader';
import EmployeeOrderCard from '@/components/employee/EmployeeOrderCard';

import {
  useEmployeeContext,
} from '@/hooks/useEmployeeContext';

import {
  employeeOperationsService,
} from '@/services/employee-operations.service';

import type {
  EmployeeOrder,
} from '@/types/employee.types';

import type {
  OrderStatus,
} from '@/types/orders.types';
function getNextStatus(
  status:
    | OrderStatus
    | null
    | undefined
): OrderStatus | null {
  switch (status) {
    case 'PENDING':
      return 'CONFIRMED';

    case 'CONFIRMED':
      return 'PREPARING';

    case 'PREPARING':
      return 'READY';

    case 'READY':
      return 'COMPLETED';

    default:
      return null;
  }
}

export default function EmployeeOrdersScreen() {
  const {
    employeeId,

    restaurantDocumentId,

    restaurantName,

    loading:
      contextLoading,
  } =
    useEmployeeContext();

  const [
    orders,
    setOrders,
  ] =
    useState<EmployeeOrder[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    savingId,
    setSavingId,
  ] =
    useState<
      string | null
    >(null);

  const loadOrders =
    useCallback(
      async (
        silent =
          false
      ) => {
        if (
          !restaurantDocumentId
        ) {
          return;
        }

        if (
          !silent
        ) {
          setLoading(
            true
          );
        }

        try {
          const response =
            await employeeOperationsService
              .findOrders({
                restaurantDocumentId,

                page:
                  1,

                pageSize:
                  100,
              });

          setOrders(
            response.data
          );
        } catch {
          Toast.show({
            type:
              'error',

            text1:
              'No se pudieron cargar las órdenes',

            position:
              'bottom',
          });
        } finally {
          if (
            !silent
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        restaurantDocumentId,
      ]
    );

  useFocusEffect(
    useCallback(() => {
      void loadOrders();

      return undefined;
    }, [
      loadOrders,
    ])
  );

  async function handleAdvance(
    order:
      EmployeeOrder
  ) {
    if (
      !employeeId
    ) {
      return;
    }

    const next =
      getNextStatus(
        order.statusOrder
      );

    if (
      !next
    ) {
      return;
    }

    if (
      next ===
        'COMPLETED' &&
      order.paymentStatus !==
        'PAID'
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'Orden pendiente de pago',

        text2:
          'Debes cobrar la orden antes de completarla.',

        position:
          'bottom',
      });

      return;
    }

    try {
      setSavingId(
        order.documentId
      );

      const response =
        await employeeOperationsService
          .patchOrder(
            order.documentId,
            next ===
              'COMPLETED'
              ? {
                  statusOrder:
                    'COMPLETED',

                  completeAt:
                    new Date()
                      .toISOString(),

                  completeBy:
                    employeeId,
                }
              : {
                  statusOrder:
                    next,
                }
          );

      setOrders(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.documentId ===
              order.documentId
                ? {
                    ...item,
                    ...response.data,
                  }
                : item
          )
      );

      Toast.show({
        type:
          'success',

        text1:
          next ===
          'COMPLETED'
            ? 'Orden completada'
            : 'Estado actualizado',

        text2:
          `La orden ${order.orderCode} se actualizó correctamente.`,

        position:
          'bottom',
      });

      await loadOrders(
        true
      );
    } catch (
      error
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'No se pudo actualizar la orden',

        text2:
          error instanceof
            Error
            ? error.message
            : 'Intenta nuevamente.',

        position:
          'bottom',
      });
    } finally {
      setSavingId(
        null
      );
    }
  }

  const activeOrders =
    orders.filter(
      (
        order
      ) =>
        order.statusOrder !==
          'COMPLETED' &&
        order.statusOrder !==
          'CANCELLED'
    );

  if (
    contextLoading
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F7F8F2]">
        <ActivityIndicator
          size="large"
          color="#7B9646"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={['top']}
    >
      <EmployeeScreenHeader
        title="Órdenes"
        subtitle={
          restaurantName
        }
        icon="receipt-outline"
        onAction={() =>
          void loadOrders()
        }
      />

      <FlatList
        data={
          activeOrders
        }
        keyExtractor={(
          item
        ) =>
          item.documentId
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            tintColor="#7B9646"
            onRefresh={
              async () => {
                setRefreshing(
                  true
                );

                try {
                  await loadOrders(
                    true
                  );
                } finally {
                  setRefreshing(
                    false
                  );
                }
              }
            }
          />
        }
        contentContainerStyle={{
          paddingHorizontal:
            16,

          paddingTop:
            18,

          paddingBottom:
            150,
        }}
        ItemSeparatorComponent={() => (
          <View className="h-3" />
        )}
        ListHeaderComponent={
          <View className="mb-5">
            <View className="flex-row items-center justify-between rounded-[22px] bg-[#EEF3E3] p-4">
              <View>
                <Text className="text-[11px] font-semibold text-[#858A7A]">
                  Órdenes activas
                </Text>

                <Text className="mt-1 text-[25px] font-extrabold text-[#617D34]">
                  {
                    activeOrders.length
                  }
                </Text>
              </View>

              <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-white">
                <Ionicons
                  name="receipt-outline"
                  size={23}
                  color="#7B9646"
                />
              </View>
            </View>

            <Pressable
              onPress={() =>
                router.push(
                  '../others/employee/CreateOrder'
                )
              }
              className="mt-4 flex-row items-center justify-center rounded-[17px] bg-[#7B9646] py-4 active:opacity-80"
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text className="ml-2 text-[13px] font-extrabold text-white">
                Nueva orden
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-16">
              <ActivityIndicator
                size="large"
                color="#7B9646"
              />

              <Text className="mt-3 text-[12px] text-[#858A7A]">
                Cargando órdenes...
              </Text>
            </View>
          ) : (
            <View className="items-center px-8 py-16">
              <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF3E3]">
                <Ionicons
                  name="checkmark-done-outline"
                  size={29}
                  color="#7B9646"
                />
              </View>

              <Text className="mt-4 text-[16px] font-extrabold text-[#252A20]">
                Todo al día
              </Text>

              <Text className="mt-1 text-center text-[12px] leading-5 text-[#858A7A]">
                No existen órdenes activas en este momento.
              </Text>
            </View>
          )
        }
        renderItem={({
          item,
        }) => (
          <EmployeeOrderCard
            order={
              item
            }
            saving={
              savingId ===
              item.documentId
            }
            onAdvance={() =>
              void handleAdvance(
                item
              )
            }
            onPay={() =>
              router.push({
                pathname:
                  '../others/employee/PayOrder',

                params: {
                  documentId:
                    item.documentId,
                },
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}