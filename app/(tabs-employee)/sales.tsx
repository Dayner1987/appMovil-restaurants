// app/(tabs-employee)/sales.tsx

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  useFocusEffect,
} from 'expo-router';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import EmployeeScreenHeader from '@/components/employee/EmployeeScreenHeader';
import EmployeeSaleCard from '@/components/employee/EmployeeSaleCard';

import {
  useEmployeeContext,
} from '@/hooks/useEmployeeContext';

import {
  employeeOperationsService,
} from '@/services/employee-operations.service';

import type {
  EmployeePayment,
} from '@/types/employee.types';

export default function EmployeeSalesScreen() {
  const {
    employeeId,

    restaurantDocumentId,

    restaurantName,

    loading:
      contextLoading,
  } =
    useEmployeeContext();

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

  const loadSales =
    useCallback(
      async (
        silent =
          false
      ) => {
        if (
          !employeeId ||
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
              .findPayments({
                restaurantDocumentId,

                processedById:
                  employeeId,

                statusPayment:
                  'APPROVED',

                page:
                  1,

                pageSize:
                  100,
              });

          setPayments(
            response.data
          );
        } catch {
          Toast.show({
            type:
              'error',

            text1:
              'No se pudieron cargar las ventas',

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
        employeeId,
        restaurantDocumentId,
      ]
    );

  useFocusEffect(
    useCallback(() => {
      void loadSales();

      return undefined;
    }, [
      loadSales,
    ])
  );

  const total =
    useMemo(
      () =>
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
        ),
      [
        payments,
      ]
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
        title="Ventas"
        subtitle={
          restaurantName
        }
        icon="wallet-outline"
        onAction={() =>
          void loadSales()
        }
      />

      <FlatList
        data={
          payments
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
                  await loadSales(
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
                Total procesado
              </Text>

              <Text className="mt-2 text-[30px] font-extrabold text-white">
                Bs{' '}
                {total.toFixed(
                  2
                )}
              </Text>

              <View className="mt-4 flex-row items-center">
                <View className="rounded-full bg-white/15 px-3 py-1.5">
                  <Text className="text-[10px] font-bold text-white">
                    {
                      payments.length
                    }{' '}
                    ventas
                  </Text>
                </View>
              </View>
            </View>

            <Text className="mt-6 text-[17px] font-extrabold text-[#252A20]">
              Historial de ventas
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-16">
              <ActivityIndicator
                size="large"
                color="#7B9646"
              />
            </View>
          ) : (
            <View className="items-center px-6 py-16">
              <Ionicons
                name="wallet-outline"
                size={38}
                color="#A0A695"
              />

              <Text className="mt-4 text-[15px] font-extrabold text-[#252A20]">
                Sin ventas todavía
              </Text>

              <Text className="mt-1 text-center text-[12px] text-[#858A7A]">
                Los pagos aprobados que proceses aparecerán aquí.
              </Text>
            </View>
          )
        }
        renderItem={({
          item,
        }) => (
          <EmployeeSaleCard
            payment={
              item
            }
          />
        )}
      />
    </SafeAreaView>
  );
}