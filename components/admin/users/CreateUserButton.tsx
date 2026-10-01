// components/admin/users/CreateUserButton.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Pressable,
  Text,
} from 'react-native';

interface CreateUserButtonProps {
  onPress: () => void;
}

export default function CreateUserButton({
  onPress,
}: CreateUserButtonProps) {
  return (
    <Pressable
      onPress={
        onPress
      }
      className="flex-row items-center justify-center rounded-[16px] bg-[#7B9646] px-4 py-3.5 active:opacity-80"
    >
      <Ionicons
        name="person-add-outline"
        size={19}
        color="#FFFFFF"
      />

      <Text className="ml-2 text-[13px] font-bold text-white">
        Nuevo usuario
      </Text>
    </Pressable>
  );
}