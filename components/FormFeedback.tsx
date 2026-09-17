import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

interface FormFeedbackProps {
  type: 'error' | 'success';
  message: string;
}

export default function FormFeedback({
  type,
  message,
}: FormFeedbackProps) {
  if (!message) {
    return null;
  }

  const isSuccess = type === 'success';

  return (
    <View
      style={[
        styles.messageBar,
        isSuccess
          ? styles.successBar
          : styles.errorBar,
      ]}
    >
      <Ionicons
        name={
          isSuccess
            ? 'checkmark-circle-outline'
            : 'alert-circle-outline'
        }
        size={21}
        color={isSuccess ? '#238A55' : '#C23B55'}
      />

      <Text
        style={[
          styles.messageText,
          isSuccess
            ? styles.successText
            : styles.errorText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageBar: {
    width: '100%',
    marginBottom: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  errorBar: {
    borderLeftColor: '#D94F68',
    backgroundColor: '#FFF0F3',
  },

  successBar: {
    borderLeftColor: '#2FA66A',
    backgroundColor: '#EAF9F0',
  },

  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  errorText: {
    color: '#A52F47',
  },

  successText: {
    color: '#23784C',
  },
});