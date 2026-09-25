// components/admin/users/AdminUserFilters.tsx

import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

export type AdminUserFilter =
  | 'all'
  | 'active'
  | 'blocked'
  | 'unconfirmed'
  | 'admin'
  | 'restaurant'
  | 'employee'
  | 'client';

interface AdminUserFiltersProps {
  search: string;
  filter: AdminUserFilter;

  onSearchChange: (
    value: string
  ) => void;

  onFilterChange: (
    value: AdminUserFilter
  ) => void;
}

const filters: {
  key: AdminUserFilter;
  label: string;
}[] = [
  {
    key: 'all',
    label: 'Todos',
  },
  {
    key: 'active',
    label: 'Activos',
  },
  {
    key: 'blocked',
    label: 'Bloqueados',
  },
  {
    key: 'unconfirmed',
    label: 'Sin confirmar',
  },
  {
    key: 'admin',
    label: 'Admin',
  },
  {
    key: 'restaurant',
    label: 'Restaurantes',
  },
  {
    key: 'employee',
    label: 'Empleados',
  },
  {
    key: 'client',
    label: 'Clientes',
  },
];

export default function AdminUserFilters({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: AdminUserFiltersProps) {
  return (
    <View className="gap-4">
      <View className="h-[52px] flex-row items-center rounded-[18px] border border-[#E9EBE3] bg-white px-4">
        <Ionicons
          name="search-outline"
          size={20}
          color="#858A7A"
        />

        <TextInput
          value={search}
          onChangeText={
            onSearchChange
          }
          placeholder="Buscar usuario..."
          placeholderTextColor="#A6AA9C"
          autoCapitalize="none"
          className="ml-3 flex-1 text-[14px] text-[#252A20]"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() =>
              onSearchChange('')
            }
            className="h-8 w-8 items-center justify-center rounded-full active:opacity-60"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#A6AA9C"
            />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row gap-2 pr-4">
          {filters.map(
            (item) => {
              const selected =
                filter === item.key;

              return (
                <Pressable
                  key={item.key}
                  onPress={() =>
                    onFilterChange(
                      item.key
                    )
                  }
                  className={
                    selected
                      ? 'rounded-full bg-[#252A20] px-4 py-2.5 active:opacity-80'
                      : 'rounded-full border border-[#E9EBE3] bg-white px-4 py-2.5 active:opacity-70'
                  }
                >
                  <Text
                    className={
                      selected
                        ? 'text-[12px] font-bold text-white'
                        : 'text-[12px] font-semibold text-[#667052]'
                    }
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>
      </ScrollView>
    </View>
  );
}