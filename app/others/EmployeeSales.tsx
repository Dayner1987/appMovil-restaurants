// app/restaurant/EmployeeSales.tsx

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

import RestaurantEmployeeSalesCard from '@/components/restaurant/RestaurantEmployeeSalesCard';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useRestaurant,
} from '@/hooks/useRestaurant';

import {
  useRestaurantEmployees,
} from '@/hooks/useRestaurantEmployees';

import {
  employeeOperationsService,
} from '@/services/employee-operations.service';

import type {
  EmployeePayment,
} from '@/types/employee.types';

export default function RestaurantEmployeeSalesScreen() {
  const {
    user,
  } =
    useAuth();

  const {
    restaurants,

    loading:
      restaurantLoading,
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

  const restaurant =
    restaurants[0] ??
    null;

  const {
    employees,

    loadEmployees,
  } =
    useRestaurantEmployees({
      autoLoad:
        false,
    });

  const [
    payments,
    setPayments,
  ] =
    useState<EmployeePayment[]>(
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

  const loadData =
    useCallback(
      async () => {
        if (
          !restaurant
            ?.documentId
        ) {
          return;
        }

        setLoading(
          true
        );

        try {
          const [
            ,
            paymentResponse,
          ] =
            await Promise.all([
              loadEmployees(),

              employeeOperationsService
                .findPayments({
                  restaurantDocumentId:
                    restaurant.documentId,

                  statusPayment:
                    'APPROVED',

                  page:
                    1,

                  pageSize:
                    100,
                }),
            ]);

          setPayments(
            paymentResponse.data
          );
        } catch (
          error
        ) {
          Toast.show({
            type:
              'error',

            text1:
              'No se pudieron cargar las ventas',

            text2:
              error instanceof
                Error
                ? error.message
                : 'Intenta nuevamente.',

            position:
              'bottom',
          });
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        restaurant
          ?.documentId,

        loadEmployees,
      ]
    );

  useFocusEffect(
    useCallback(() => {
      void loadData();

      return undefined;
    }, [
      loadData,
    ])
  );

  const employeeSummaries =
    useMemo(
      () =>
        employees.map(
          (
            employee
          ) => {
            const employeePayments =
              payments.filter(
                (
                  payment
                ) =>
                  payment
                    .processedBy
                    ?.id ===
                  employee.id
              );

            const total =
              employeePayments.reduce(
                (
                  accumulator,
                  payment
                ) =>
                  accumulator +
                  Number(
                    payment.amount ??
                    0
                  ),
                0
              );

            const ordered =
              [...employeePayments]
                .sort(
                  (
                    a,
                    b
                  ) =>
                    new Date(
                      b.paidAt ??
                      0
                    ).getTime() -
                    new Date(
                      a.paidAt ??
                      0
                    ).getTime()
                );

            return {
              employee,

              salesCount:
                employeePayments.length,

              total:
                Number(
                  total.toFixed(
                    2
                  )
                ),

              lastSale:
                ordered[0]
                  ?.paidAt ??
                null,
            };
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            b.total -
            a.total
        ),
      [
        employees,
        payments,
      ]
    );

  const totalSales =
    payments.reduce(
      (
        accumulator,
        payment
      ) =>
        accumulator +
        Number(
          payment.amount ??
          0
        ),
      0
    );

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={[
        'top',
      ]}
    >
      <View className="flex-row items-center bg-white px-4 py-4">
        <Pressable
          onPress={() =>
            router.back()
          }
          className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#EEF3E3]"
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#617D34"
          />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[20px] font-extrabold text-[#252A20]">
            Ventas de empleados
          </Text>

          <Text className="mt-0.5 text-[11px] text-[#858A7A]">
            {restaurant
              ?.name ??
              'Restaurante'}
          </Text>
        </View>
      </View>

      <FlatList
        data={
          employeeSummaries
        }
        keyExtractor={(
          item
        ) =>
          String(
            item.employee
              .id
          )
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              async () => {
                setRefreshing(
                  true
                );

                try {
                  await loadData();
                } finally {
                  setRefreshing(
                    false
                  );
                }
              }
            }
            tintColor="#7B9646"
          />
        }
        contentContainerStyle={{
          paddingHorizontal:
            16,

          paddingTop:
            18,

          paddingBottom:
            140,
        }}
        ItemSeparatorComponent={() => (
          <View className="h-3" />
        )}
        ListHeaderComponent={
          <View className="mb-5">
            <View className="overflow-hidden rounded-[26px] bg-[#617D34] p-5">
              <View className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10" />

              <Text className="text-[11px] font-semibold text-white/70">
                Total procesado por empleados
              </Text>

              <Text className="mt-2 text-[29px] font-extrabold text-white">
                Bs{' '}
                {totalSales.toFixed(
                  2
                )}
              </Text>

              <View className="mt-4 self-start rounded-full bg-white/15 px-3 py-1.5">
                <Text className="text-[10px] font-bold text-white">
                  {
                    payments.length
                  }{' '}
                  operaciones aprobadas
                </Text>
              </View>
            </View>

            <Text className="mt-6 text-[17px] font-extrabold text-[#252A20]">
              Empleados
            </Text>

            <Text className="mt-1 text-[11px] text-[#858A7A]">
              Ventas procesadas por cada trabajador.
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ||
          restaurantLoading ? (
            <View className="items-center py-20">
              <ActivityIndicator
                size="large"
                color="#7B9646"
              />

              <Text className="mt-3 text-[12px] text-[#858A7A]">
                Cargando ventas...
              </Text>
            </View>
          ) : (
            <View className="items-center py-20">
              <Ionicons
                name="people-outline"
                size={40}
                color="#A0A695"
              />

              <Text className="mt-4 text-[15px] font-extrabold text-[#252A20]">
                No hay empleados
              </Text>

              <Text className="mt-1 text-[11px] text-[#858A7A]">
                Registra empleados para comenzar a supervisarlos.
              </Text>
            </View>
          )
        }
        renderItem={({
          item,
        }) => (
          <RestaurantEmployeeSalesCard
            employee={
              item.employee
            }
            salesCount={
              item.salesCount
            }
            total={
              item.total
            }
            lastSale={
              item.lastSale
            }
          />
        )}
      />
    </SafeAreaView>
  );
}