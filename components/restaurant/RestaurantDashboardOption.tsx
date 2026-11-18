// components/restaurant/RestaurantDashboardOption.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

interface RestaurantDashboardOptionProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  title:
    string;

  description:
    string;

  onPress:
    () => void;

  disabled?:
    boolean;

  primary?:
    boolean;
}

export default function RestaurantDashboardOption({
  icon,
  title,
  description,
  onPress,
  disabled = false,
  primary = false,
}: RestaurantDashboardOptionProps) {
  return (
    <Pressable
      disabled={
        disabled
      }
      onPress={
        onPress
      }
      className={`flex-row items-center rounded-[22px] p-4 active:opacity-80 ${
        primary
          ? 'bg-[#617D34]'
          : 'bg-white'
      } ${
        disabled
          ? 'opacity-50'
          : ''
      }`}
    >
      <View
        className={`h-14 w-14 items-center justify-center rounded-[18px] ${
          primary
            ? 'bg-white/15'
            : 'bg-[#EEF3E3]'
        }`}
      >
        <Ionicons
          name={icon}
          size={25}
          color={
            primary
              ? '#FFFFFF'
              : '#7B9646'
          }
        />
      </View>

      <View className="ml-4 flex-1">
        <Text
          className={`text-[15px] font-extrabold ${
            primary
              ? 'text-white'
              : 'text-[#252A20]'
          }`}
        >
          {title}
        </Text>

        <Text
          className={`mt-1 text-[12px] leading-5 ${
            primary
              ? 'text-white/75'
              : 'text-[#7B8175]'
          }`}
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={
          primary
            ? '#FFFFFF'
            : '#A1A69B'
        }
      />
    </Pressable>
  );
}