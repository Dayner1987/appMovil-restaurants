// components/restaurant/OrderStatusFilters.tsx

import {
  Pressable,
  ScrollView,
  Text,
} from 'react-native';

export type OrderListFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

interface OrderStatusFiltersProps {
  value:
    OrderListFilter;

  onChange:
    (
      value:
        OrderListFilter
    ) => void;

  counts?: {
    all:
      number;

    active:
      number;

    completed:
      number;

    cancelled:
      number;
  };
}

const filters: {
  key:
    OrderListFilter;

  label:
    string;
}[] = [
  {
    key:
      'ALL',

    label:
      'Todas',
  },

  {
    key:
      'ACTIVE',

    label:
      'Pendientes',
  },

  {
    key:
      'COMPLETED',

    label:
      'Completadas',
  },

  {
    key:
      'CANCELLED',

    label:
      'Canceladas',
  },
];

export default function OrderStatusFilters({
  value,
  onChange,
  counts,
}: OrderStatusFiltersProps) {
  const getCount =
    (
      key:
        OrderListFilter
    ) => {
      if (!counts) {
        return 0;
      }

      switch (
        key
      ) {
        case 'ALL':
          return counts.all;

        case 'ACTIVE':
          return counts.active;

        case 'COMPLETED':
          return counts.completed;

        case 'CANCELLED':
          return counts.cancelled;

        default:
          return 0;
      }
    };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerClassName="
        gap-2
        pr-5
      "
    >
      {filters.map(
        (
          filter
        ) => {
          const selected =
            value ===
            filter.key;

          return (
            <Pressable
              key={
                filter.key
              }
              onPress={() =>
                onChange(
                  filter.key
                )
              }
              className={`
                flex-row
                items-center
                rounded-full
                border
                px-4
                py-2.5

                ${
                  selected
                    ? 'border-[#6F8C3E] bg-[#6F8C3E]'
                    : 'border-[#E2E5DC] bg-white'
                }
              `}
            >
              <Text
                className={`
                  text-sm
                  font-bold

                  ${
                    selected
                      ? 'text-white'
                      : 'text-[#646A5E]'
                  }
                `}
              >
                {filter.label}
              </Text>

              <Text
                className={`
                  ml-2
                  text-xs
                  font-extrabold

                  ${
                    selected
                      ? 'text-[#EAF1DD]'
                      : 'text-[#92988B]'
                  }
                `}
              >
                {getCount(
                  filter.key
                )}
              </Text>
            </Pressable>
          );
        }
      )}
    </ScrollView>
  );
}