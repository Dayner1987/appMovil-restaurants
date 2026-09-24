// components/admin/AdminFooter.tsx

import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminFooter() {
  return (
    <View className="mt-9 items-center border-t border-[#E9E4DA] px-5 pb-8 pt-7">
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-2xl bg-[#E8EEDC]">
        <Ionicons
          name="restaurant-outline"
          size={19}
          color="#69784E"
        />
      </View>

      <Text className="text-[13px] font-extrabold text-[#4B4B41]">
        AppMovil Restaurants
      </Text>

      <Text className="mt-1 text-center text-[11px] text-[#9B978B]">
        Administración y gestión de restaurantes
      </Text>

      <Text className="mt-3 text-[10px] text-[#B1ADA2]">
        © 2026
      </Text>
    </View>
  );
}