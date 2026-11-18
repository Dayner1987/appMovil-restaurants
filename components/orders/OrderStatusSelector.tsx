import { Pressable, ScrollView, Text, View } from 'react-native';

export type CustomerOrderTab = 'PENDING' | 'COMPLETED' | 'CANCELLED';

interface Props {
  selected: CustomerOrderTab;
  counts: Record<CustomerOrderTab, number>;
  onSelect: (tab: CustomerOrderTab) => void;
}

const OPTIONS: { key: CustomerOrderTab; label: string }[] = [
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'COMPLETED', label: 'Completadas' },
  { key: 'CANCELLED', label: 'Canceladas' },
];

export default function OrderStatusSelector({ selected, counts, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 9 }}>
      {OPTIONS.map((option) => {
        const active = selected === option.key;
        return (
          <Pressable key={option.key} onPress={() => onSelect(option.key)}
            className={`flex-row items-center gap-2 rounded-2xl border px-4 py-3 ${active ? 'border-[#2F6A46] bg-[#2F6A46]' : 'border-[#E1E9DF] bg-white'}`}>
            <Text className={`text-sm font-extrabold ${active ? 'text-white' : 'text-[#536657]'}`}>{option.label}</Text>
            <View className={`min-w-6 items-center rounded-full px-2 py-0.5 ${active ? 'bg-white/20' : 'bg-[#EEF3EC]'}`}>
              <Text className={`text-xs font-extrabold ${active ? 'text-white' : 'text-[#607B67]'}`}>{counts[option.key]}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
