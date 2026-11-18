// components/client/CategoryChips.tsx


import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

export interface CategoryChoice {
  id: string;
  name: string;
  count?: number;
}

interface CategoryChipsProps {
  choices: CategoryChoice[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryChips({
  choices,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <View
      style={{
        height: 62,
        justifyContent: 'center',
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        style={{
          flexGrow: 0,
          flexShrink: 0,
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 8,
          alignItems: 'center',
          gap: 8,
        }}
      >
        {choices.map((choice) => {
          const active = choice.id === selected;

          return (
            <Pressable
              key={choice.id}
              onPress={() => onSelect(choice.id)}
              accessibilityRole="button"
              accessibilityState={{
                selected: active,
              }}
              style={{
                height: 44,
                minWidth: 85,
                maxWidth: 210,
                paddingHorizontal: 15,
                borderRadius: 14,
                backgroundColor: active
                  ? '#2F6A46'
                  : '#EDF2EC',
                borderWidth: 1,
                borderColor: active
                  ? '#2F6A46'
                  : '#DFE8DD',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                flexShrink: 0,
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  textAlign: 'center',
                  color: active
                    ? '#FFFFFF'
                    : '#405343',
                }}
              >
                {choice.name}
                {choice.count !== undefined
                  ? `  ${choice.count}`
                  : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
