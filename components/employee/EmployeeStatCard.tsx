// components/employee/EmployeeStatCard.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Text,
  View,
} from 'react-native';

interface EmployeeStatCardProps {
  title:
    string;

  value:
    string | number;

  icon:
    keyof typeof Ionicons.glyphMap;

  subtitle?:
    string;
}

export default function EmployeeStatCard({
  title,
  value,
  icon,
  subtitle,
}: EmployeeStatCardProps) {
  return (
    <View className="flex-1 rounded-[20px] bg-white p-4">
      <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#EEF3E3]">
        <Ionicons
          name={icon}
          size={20}
          color="#7B9646"
        />
      </View>

      <Text className="mt-4 text-[23px] font-extrabold text-[#252A20]">
        {value}
      </Text>

      <Text className="mt-1 text-[12px] font-semibold text-[#626A59]">
        {title}
      </Text>

      {subtitle ? (
        <Text className="mt-1 text-[10px] text-[#989E90]">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}