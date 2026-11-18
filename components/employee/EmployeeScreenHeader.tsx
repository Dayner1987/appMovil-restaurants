// components/employee/EmployeeScreenHeader.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

interface EmployeeScreenHeaderProps {
  title: string;

  subtitle?:
    string;

  icon?:
    keyof typeof Ionicons.glyphMap;

  onAction?:
    () => void;

  actionIcon?:
    keyof typeof Ionicons.glyphMap;
}

export default function EmployeeScreenHeader({
  title,
  subtitle,
  icon =
    'briefcase-outline',
  onAction,
  actionIcon =
    'refresh-outline',
}: EmployeeScreenHeaderProps) {
  return (
    <View className="bg-white px-5 pb-5 pt-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-[15px] bg-[#EEF3E3]">
              <Ionicons
                name={icon}
                size={21}
                color="#7B9646"
              />
            </View>

            <View className="flex-1">
              <Text className="text-[23px] font-extrabold text-[#252A20]">
                {title}
              </Text>

              {subtitle ? (
                <Text
                  className="mt-0.5 text-[12px] text-[#858A7A]"
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {onAction ? (
          <Pressable
            onPress={
              onAction
            }
            className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#F5F7EF] active:opacity-70"
          >
            <Ionicons
              name={
                actionIcon
              }
              size={21}
              color="#617D34"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}