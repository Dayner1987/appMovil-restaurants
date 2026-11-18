// components/employee/EmployeeOrderCard.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import type {
  EmployeeOrder,
} from '@/types/employee.types';
import { statusLabel } from '@/utils/status-labels';

interface EmployeeOrderCardProps {
  order:
    EmployeeOrder;

  saving?:
    boolean;

  onAdvance:
    () => void;

  onPay:
    () => void;
}

// components/employee/EmployeeOrderCard.tsx

function getStatusLabel(
  status:
    | string
    | null
    | undefined
) {
  switch (status) {
    case 'PENDING':
      return 'Pendiente';

    case 'CONFIRMED':
      return 'Confirmada';

    case 'PREPARING':
      return 'Preparando';

    case 'READY':
      return 'Lista';

    case 'COMPLETED':
      return 'Completada';

    case 'CANCELLED':
      return 'Cancelada';

    default:
      return 'Sin estado';
  }
}

export default function EmployeeOrderCard({
  order,
  saving = false,
  onAdvance,
  onPay,
}: EmployeeOrderCardProps) {
  const finished =
    order.statusOrder ===
      'COMPLETED' ||
    order.statusOrder ===
      'CANCELLED';

  const paid =
    order.paymentStatus ===
    'PAID';

  return (
    <View className="rounded-[22px] bg-white p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[16px] font-extrabold text-[#252A20]">
            {order.orderCode}
          </Text>

          <Text className="mt-1 text-[11px] text-[#858A7A]">
            {order.orderType}
          </Text>
        </View>

        <View className="rounded-full bg-[#EEF3E3] px-3 py-1.5">
          <Text className="text-[10px] font-bold text-[#617D34]">
            {getStatusLabel(
              order.statusOrder
            )}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row">
        <View className="mr-5">
          <Text className="text-[10px] text-[#999F90]">
            Total
          </Text>

          <Text className="mt-1 text-[16px] font-extrabold text-[#252A20]">
            Bs{' '}
            {Number(
              order.total ??
              0
            ).toFixed(
              2
            )}
          </Text>
        </View>

        <View>
          <Text className="text-[10px] text-[#999F90]">
            Pago
          </Text>

          <Text
            className={`mt-1 text-[12px] font-bold ${
              paid
                ? 'text-[#617D34]'
                : 'text-[#B17D32]'
            }`}
          >
            {paid
              ? 'Pagado'
              : statusLabel(order.paymentStatus, 'Pendiente')}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-2">
        {!paid &&
        !finished ? (
          <Pressable
            disabled={
              saving
            }
            onPress={
              onPay
            }
            className="flex-1 flex-row items-center justify-center rounded-[14px] bg-[#EEF3E3] py-3 active:opacity-80"
          >
            <Ionicons
              name="wallet-outline"
              size={17}
              color="#617D34"
            />

            <Text className="ml-2 text-[11px] font-bold text-[#617D34]">
              Cobrar
            </Text>
          </Pressable>
        ) : null}

        {!finished ? (
          <Pressable
            disabled={
              saving
            }
            onPress={
              onAdvance
            }
            className="flex-1 flex-row items-center justify-center rounded-[14px] bg-[#7B9646] py-3 active:opacity-80"
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Text className="text-[11px] font-bold text-white">
                  Avanzar
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#FFFFFF"
                  style={{
                    marginLeft:
                      5,
                  }}
                />
              </>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}