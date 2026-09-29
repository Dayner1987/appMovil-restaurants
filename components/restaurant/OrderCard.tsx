// components/restaurant/OrderCard.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import type {
  Order,
  OrderStatus,
} from '@/types/orders.types';

interface OrderCardProps {
  order:
    Order;

  onPress:
    (
      order:
        Order
    ) => void;
}

function getStatusLabel(
  status:
    OrderStatus
    | null
): string {
  switch (
    status
  ) {
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

function getStatusClasses(
  status:
    OrderStatus
    | null
) {
  if (
    status ===
    'COMPLETED'
  ) {
    return {
      container:
        'bg-[#E6F3E8]',

      text:
        'text-[#4D7A54]',
    };
  }

  if (
    status ===
    'CANCELLED'
  ) {
    return {
      container:
        'bg-[#FBECEA]',

      text:
        'text-[#B65D51]',
    };
  }

  if (
    status ===
    'READY'
  ) {
    return {
      container:
        'bg-[#E9EFFB]',

      text:
        'text-[#536F9F]',
    };
  }

  return {
    container:
      'bg-[#FFF0DD]',

    text:
      'text-[#B86216]',
  };
}

function getOrderType(
  value:
    Order['orderType']
) {
  if (
    value ===
    'COUNTER'
  ) {
    return 'Mostrador';
  }

  if (
    value ===
    'PICKUP'
  ) {
    return 'Recoger';
  }

  if (
    value ===
    'ONLINE'
  ) {
    return 'Online';
  }

  return 'Sin tipo';
}

function getCreator(
  order:
    Order
): string {
  const user =
    order.users?.[0];

  if (!user) {
    return 'Sin responsable';
  }

  const name = [
    user.firstName,
    user.lastName,
  ]
    .filter(
      Boolean
    )
    .join(
      ' '
    )
    .trim();

  return (
    name ||
    user.username ||
    user.email ||
    'Usuario'
  );
}

function formatDate(
  value:
    string
) {
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

      hour:
        '2-digit',

      minute:
        '2-digit',
    }
  );
}

export default function OrderCard({
  order,
  onPress,
}: OrderCardProps) {
  const statusClasses =
    getStatusClasses(
      order.statusOrder
    );

  const terminal =
    order.statusOrder ===
      'COMPLETED' ||
    order.statusOrder ===
      'CANCELLED';

  const itemCount =
    order.order_items
      ?.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity ??
            0
          ),
        0
      ) ??
    0;

  return (
    <View
      className="
        rounded-3xl
        border
        border-[#E6E9E0]
        bg-white
        p-4
      "
    >
      <View
        className="
          flex-row
          items-start
          justify-between
        "
      >
        <View
          className="
            flex-1
            pr-3
          "
        >
          <Text
            className="
              text-base
              font-extrabold
              text-[#171A15]
            "
          >
            {order.orderCode}
          </Text>

          <Text
            className="
              mt-1
              text-xs
              text-[#858B80]
            "
          >
            {getOrderType(
              order.orderType
            )}
            {'  •  '}
            {formatDate(
              order.orderedAt
            )}
          </Text>
        </View>

        <View
          className={`
            rounded-full
            px-3
            py-1.5
            ${statusClasses.container}
          `}
        >
          <Text
            className={`
              text-xs
              font-extrabold
              ${statusClasses.text}
            `}
          >
            {getStatusLabel(
              order.statusOrder
            )}
          </Text>
        </View>
      </View>

      <View
        className="
          mt-4
          flex-row
          items-center
          justify-between
        "
      >
        <View>
          <Text
            className="
              text-xs
              text-[#858B80]
            "
          >
            Productos
          </Text>

          <Text
            className="
              mt-1
              font-bold
              text-[#343A30]
            "
          >
            {itemCount}
          </Text>
        </View>

        <View>
          <Text
            className="
              text-xs
              text-[#858B80]
            "
          >
            Pago
          </Text>

          <Text
            className="
              mt-1
              font-bold
              text-[#343A30]
            "
          >
            {order.paymentStatus ??
              'PENDING'}
          </Text>
        </View>

        <View
          className="
            items-end
          "
        >
          <Text
            className="
              text-xs
              text-[#858B80]
            "
          >
            Total
          </Text>

          <Text
            className="
              mt-1
              text-lg
              font-extrabold
              text-[#536A2F]
            "
          >
            Bs{' '}
            {Number(
              order.total
            ).toFixed(
              2
            )}
          </Text>
        </View>
      </View>

      <View
        className="
          mt-4
          flex-row
          items-center
          rounded-2xl
          bg-[#F7F8F2]
          px-3
          py-2.5
        "
      >
        <Ionicons
          name="person-outline"
          size={16}
          color="#7A8173"
        />

        <Text
          numberOfLines={1}
          className="
            ml-2
            flex-1
            text-xs
            text-[#6C7366]
          "
        >
          Registrada por{' '}
          {getCreator(
            order
          )}
        </Text>
      </View>

      <Pressable
        onPress={() =>
          onPress(
            order
          )
        }
        className="
          mt-3
          flex-row
          items-center
          justify-center
          rounded-2xl
          bg-[#EEF3E3]
          py-3
        "
      >
        <Ionicons
          name={
            terminal
              ? 'eye-outline'
              : 'settings-outline'
          }
          size={18}
          color="#607B35"
        />

        <Text
          className="
            ml-2
            font-bold
            text-[#607B35]
          "
        >
          {terminal
            ? 'Ver detalle'
            : 'Gestionar orden'}
        </Text>
      </Pressable>
    </View>
  );
}