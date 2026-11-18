import { paymentService } from '@/services/payment.service';
import type { Payment } from '@/types/payment.types';
// app/employee/PayOrder.tsx

import {
  useCallback,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import {
  useEmployeeContext,
} from '@/hooks/useEmployeeContext';

import {
  employeeShiftService,
} from '@/services/employee-shift.service';

import {
  employeeOperationsService,
} from '@/services/employee-operations.service';

import type {
  EmployeeOrder,
  EmployeeShift,
} from '@/types/employee.types';

import type {
  PaymentMethod,
} from '@/types/payment.types';

export default function PayEmployeeOrderScreen() {
  const params =
    useLocalSearchParams<{
      documentId?:
        string;
    }>();

  const documentId =
    Array.isArray(
      params.documentId
    )
      ? params.documentId[0]
      : params.documentId;

  const {
    employeeId,

    restaurantDocumentId,
  } =
    useEmployeeContext();

  const [
    order,
    setOrder,
  ] =
    useState<EmployeeOrder | null>(
      null
    );

  const [
    shift,
    setShift,
  ] =
    useState<EmployeeShift | null>(
      null
    );

  const [
    method,
    setMethod,
  ] =
    useState<PaymentMethod>(
      'CASH'
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [existingPayment, setExistingPayment] = useState<Payment | null>(null);

  const loadData =
    useCallback(
      async () => {
        if (
          !documentId ||
          !employeeId ||
          !restaurantDocumentId
        ) {
          return;
        }

        try {
          setLoading(
            true
          );

          const [
            orderResponse,
            currentShift,
          ] =
            await Promise.all([
              employeeOperationsService
                .findOrder(
                  documentId
                ),

              employeeShiftService
                .findCurrentOpen(
                  employeeId,
                  restaurantDocumentId
                ),
            ]);

          const paymentResult = await paymentService.findAll({ orderDocumentId: documentId });
          const payment = paymentResult.data.find(item => item.statusPayment === 'APPROVED')
            ?? paymentResult.data.find(item => item.statusPayment === 'PENDING') ?? null;
          setExistingPayment(payment);
          if (payment?.method) setMethod(payment.method);

          setOrder(
            orderResponse.data
          );

          setShift(
            currentShift
          );
        } catch {
          Toast.show({
            type:
              'error',

            text1:
              'No se pudo cargar la orden',

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
        documentId,
        employeeId,
        restaurantDocumentId,
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

  async function handlePayment() {
    if (
      !order ||
      !employeeId ||
      !shift ||
      saving
    ) {
      return;
    }

    if (
      order.paymentStatus ===
      'PAID'
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'Orden ya pagada',

        position:
          'bottom',
      });

      return;
    }

    try {
      setSaving(
        true
      );

      if (existingPayment) {
        if (existingPayment.statusPayment !== 'APPROVED') {
          await paymentService.update(existingPayment.documentId, {
            statusPayment: 'APPROVED',
            paidAt: new Date().toISOString(),
          });
        }
      } else {
        const created = await paymentService.create({
          amount: Number(order.total ?? 0),
          method,
          statusPayment: 'PENDING',
          paidAt: new Date().toISOString(),
          order: order.documentId,
        });
        setExistingPayment(created.data);
        await paymentService.update(created.data.documentId, { statusPayment: 'APPROVED' });
      }

      await employeeOperationsService
        .patchOrder(
          order.documentId,
          {
            paymentStatus:
              'PAID',
          }
        );

      Toast.show({
        type:
          'success',

        text1:
          'Pago registrado',

        text2:
          `Se registraron Bs ${Number(
            order.total ??
              0
          ).toFixed(
            2
          )}.`,

        position:
          'bottom',
      });

      router.back();
    } catch (
      error
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'No se pudo registrar el pago',

        text2:
          error instanceof
            Error
            ? error.message
            : 'Intenta nuevamente.',

        position:
          'bottom',
      });
    } finally {
      setSaving(
        false
      );
    }
  }

  if (
    loading
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

  if (order?.paymentStatus === 'PAID') {
    return <SafeAreaView className="flex-1 items-center justify-center bg-[#F7F8F2]">
      <Text className="text-xl font-bold">Pago confirmado</Text>
      <Pressable onPress={() => router.back()} className="mt-4 p-4"><Text>Volver</Text></Pressable>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={[
        'top',
        'bottom',
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

        <Text className="ml-3 text-[20px] font-extrabold text-[#252A20]">
          Verificar pago
        </Text>
      </View>

      <View className="flex-1 px-5 pt-6">
        <View className="rounded-[24px] bg-white p-5">
          <Text className="text-[11px] text-[#858A7A]">
            Orden
          </Text>

          <Text className="mt-1 text-[18px] font-extrabold text-[#252A20]">
            {order
              ?.orderCode ??
              'Orden'}
          </Text>

          <Text className="mt-6 text-[11px] text-[#858A7A]">
            Total a cobrar
          </Text>

          <Text className="mt-1 text-[31px] font-extrabold text-[#617D34]">
            Bs{' '}
            {Number(
              order?.total ??
              0
            ).toFixed(
              2
            )}
          </Text>
        </View>

        <Text className="mb-3 mt-6 text-[17px] font-extrabold text-[#252A20]">
          {existingPayment ? 'Método elegido por el cliente' : 'Método de pago'}
        </Text>

        <View className="gap-3">
          {[
            {
              value:
                'CASH',

              label:
                'Efectivo',

              icon:
                'cash-outline',
            },

            {
              value:
                'QR',

              label:
                'QR',

              icon:
                'qr-code-outline',
            },
          ].map(
            (
              item
            ) => {
              const selected =
                method ===
                item.value;

              return (
                <Pressable
                  key={
                    item.value
                  }
                  disabled={Boolean(existingPayment)}
                  onPress={() =>
                    setMethod(
                      item.value as PaymentMethod
                    )
                  }
                  className={`flex-row items-center rounded-[18px] border p-4 ${
                    selected
                      ? 'border-[#7B9646] bg-[#EEF3E3]'
                      : 'border-[#E6E9DF] bg-white'
                  }`}
                >
                  <View
                    className={`h-11 w-11 items-center justify-center rounded-[14px] ${
                      selected
                        ? 'bg-[#7B9646]'
                        : 'bg-[#F2F4EE]'
                    }`}
                  >
                    <Ionicons
                      name={
                        item.icon as keyof typeof Ionicons.glyphMap
                      }
                      size={20}
                      color={
                        selected
                          ? '#FFFFFF'
                          : '#707768'
                      }
                    />
                  </View>

                  <Text className="ml-3 flex-1 text-[13px] font-bold text-[#343A2F]">
                    {
                      item.label
                    }
                  </Text>

                  <Ionicons
                    name={
                      selected
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={20}
                    color={
                      selected
                        ? '#7B9646'
                        : '#A8AEA1'
                    }
                  />
                </Pressable>
              );
            }
          )}
        </View>

        {!shift ? (
          <View className="mt-5 rounded-[17px] bg-[#F7ECE8] p-4">
            <Text className="text-[12px] font-semibold text-[#9A5D51]">
              Necesitas una jornada abierta para registrar el pago.
            </Text>
          </View>
        ) : null}
      </View>

      <View className="bg-white px-5 pb-5 pt-4">
        <Pressable
          disabled={
            saving ||
            !shift
          }
          onPress={() =>
            void handlePayment()
          }
          className={`items-center rounded-[17px] py-4 ${
            saving ||
            !shift
              ? 'bg-[#AEB99B]'
              : 'bg-[#7B9646]'
          }`}
        >
          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text className="text-[13px] font-extrabold text-white">
              {method === 'QR' ? 'Verifiqué el comprobante y el abono' : 'Confirmar efectivo recibido'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}