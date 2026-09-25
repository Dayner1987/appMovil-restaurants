// components/auth/RegisterFeedback.tsx

import {
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

interface RegisterFeedbackProps {
  message: string;

  type?:
    | 'error'
    | 'success';
}

export default function RegisterFeedback({
  message,
  type = 'error',
}: RegisterFeedbackProps) {
  if (!message) {
    return null;
  }

  const success =
    type ===
    'success';

  return (
    <View
      className={
        success
          ? 'mt-3 flex-row items-start rounded-[14px] border border-[#D7E5C1] bg-[#EEF6E3] px-3.5 py-3'
          : 'mt-3 flex-row items-start rounded-[14px] border border-[#F0D0CB] bg-[#FBEDEA] px-3.5 py-3'
      }
    >
      <Ionicons
        name={
          success
            ? 'checkmark-circle-outline'
            : 'alert-circle-outline'
        }
        size={19}
        color={
          success
            ? '#6F8C3E'
            : '#B65D51'
        }
      />

      <Text
        className={
          success
            ? 'ml-2 flex-1 text-[12px] font-semibold leading-5 text-[#607A35]'
            : 'ml-2 flex-1 text-[12px] font-semibold leading-5 text-[#A95047]'
        }
      >
        {message}
      </Text>
    </View>
  );
}