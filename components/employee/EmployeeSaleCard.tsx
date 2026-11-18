// components/employee/EmployeeSaleCard.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Text,
  View,
} from 'react-native';

import type {
  EmployeePayment,
} from '@/types/employee.types';

interface EmployeeSaleCardProps {
  payment:
    EmployeePayment;
}

function formatDate(
  value?:
    string | null
) {
  if (
    !value
  ) {
    return 'Sin fecha';
  }

  const date =
    new Date(
      value
    );

  return date.toLocaleString(
    'es-BO',
    {
      day:
        '2-digit',

      month:
        '2-digit',

      year:
        'numeric',

      hour:
        '2-digit',

      minute:
        '2-digit',
    }
  );
}

export default function EmployeeSaleCard({
  payment,
}: EmployeeSaleCardProps) {
  return (
    <View className="rounded-[22px] bg-white p-4">
      <View className="flex-row items-start">
        <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-[#EEF3E3]">
          <Ionicons
            name="wallet-outline"
            size={22}
            color="#7B9646"
          />
        </View>

        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[15px] font-extrabold text-[#252A20]">
                {payment.order
                  ?.orderCode ??
                  'Orden'}
              </Text>

              <Text className="mt-1 text-[11px] text-[#858A7A]">
                {
                  payment.method
                }
              </Text>
            </View>

            <Text className="text-[17px] font-extrabold text-[#617D34]">
              Bs{' '}
              {Number(
                payment.amount ??
                0
              ).toFixed(
                2
              )}
            </Text>
          </View>

          <View className="mt-3 flex-row items-center">
            <Ionicons
              name="time-outline"
              size={14}
              color="#969C8D"
            />

            <Text className="ml-1.5 text-[10px] text-[#858A7A]">
              {formatDate(
                payment.paidAt
              )}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}