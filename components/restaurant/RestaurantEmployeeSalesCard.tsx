// components/restaurant/RestaurantEmployeeSalesCard.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Text,
  View,
} from 'react-native';

import type {
  RestaurantEmployee,
} from '@/types/employee.types';

interface RestaurantEmployeeSalesCardProps {
  employee:
    RestaurantEmployee;

  salesCount:
    number;

  total:
    number;

  lastSale?:
    | string
    | null;
}

function getEmployeeName(
  employee:
    RestaurantEmployee
) {
  return [
    employee.firstName,
    employee.lastName,
  ]
    .filter(
      Boolean
    )
    .join(' ')
    .trim() ||
    employee.username;
}

function formatDate(
  date?:
    | string
    | null
) {
  if (
    !date
  ) {
    return 'Sin ventas';
  }

  return new Date(
    date
  ).toLocaleString(
    'es-BO',
    {
      day:
        '2-digit',

      month:
        '2-digit',

      hour:
        '2-digit',

      minute:
        '2-digit',
    }
  );
}

export default function RestaurantEmployeeSalesCard({
  employee,
  salesCount,
  total,
  lastSale,
}: RestaurantEmployeeSalesCardProps) {
  return (
    <View className="rounded-[22px] bg-white p-4">
      <View className="flex-row items-center">
        <View className="h-13 w-13 h-[52px] w-[52px] items-center justify-center rounded-[17px] bg-[#EEF3E3]">
          <Ionicons
            name="person-outline"
            size={23}
            color="#7B9646"
          />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-extrabold text-[#252A20]">
            {getEmployeeName(
              employee
            )}
          </Text>

          <Text className="mt-1 text-[11px] text-[#858A7A]">
            @{employee.username}
          </Text>
        </View>

        <View
          className={`rounded-full px-3 py-1.5 ${
            employee.blocked
              ? 'bg-[#F5E8E8]'
              : 'bg-[#EEF3E3]'
          }`}
        >
          <Text
            className={`text-[9px] font-extrabold ${
              employee.blocked
                ? 'text-[#A45B5B]'
                : 'text-[#617D34]'
            }`}
          >
            {employee.blocked
              ? 'BLOQUEADO'
              : 'ACTIVO'}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-[16px] bg-[#F7F8F2] p-3">
          <Text className="text-[10px] text-[#858A7A]">
            Ventas
          </Text>

          <Text className="mt-1 text-[18px] font-extrabold text-[#252A20]">
            {salesCount}
          </Text>
        </View>

        <View className="flex-1 rounded-[16px] bg-[#EEF3E3] p-3">
          <Text className="text-[10px] text-[#78816D]">
            Total cobrado
          </Text>

          <Text className="mt-1 text-[17px] font-extrabold text-[#617D34]">
            Bs{' '}
            {total.toFixed(
              2
            )}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center">
        <Ionicons
          name="time-outline"
          size={15}
          color="#969C8D"
        />

        <Text className="ml-2 text-[10px] text-[#858A7A]">
          Última venta:{' '}
          {formatDate(
            lastSale
          )}
        </Text>
      </View>
    </View>
  );
}