// components/auth/RegisterInput.tsx

import {
  useState,
} from 'react';

import type {
  TextInputProps,
} from 'react-native';

import {
  Pressable,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

interface RegisterInputProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  placeholder: string;

  value: string;

  onChangeText:
    (
      value: string
    ) => void;

  secureTextEntry?:
    boolean;

  keyboardType?:
    TextInputProps[
      'keyboardType'
    ];

  autoCapitalize?:
    TextInputProps[
      'autoCapitalize'
    ];

  rightIcon?:
    keyof typeof Ionicons.glyphMap;

  onRightIconPress?:
    () => void;

  onSubmitEditing?:
    () => void;
}

export default function RegisterInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  rightIcon,
  onRightIconPress,
  onSubmitEditing,
}: RegisterInputProps) {
  const [
    focused,
    setFocused,
  ] =
    useState(false);

  return (
    <View
      className={
        focused
          ? 'min-h-[54px] flex-row items-center rounded-[16px] border-[1.5px] border-[#7B9646] bg-[#F3F6EC] px-4'
          : 'min-h-[54px] flex-row items-center rounded-[16px] border-[1.5px] border-[#DFE3D8] bg-[#FAFBF7] px-4'
      }
    >
      {!value ? (
        <Ionicons
          name={icon}
          size={20}
          color={
            focused
              ? '#6F8C3E'
              : '#929889'
          }
        />
      ) : null}

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor="#929889"
        secureTextEntry={
          secureTextEntry
        }
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        autoCorrect={false}
        autoComplete="off"
        importantForAutofill="no"
        returnKeyType={
          secureTextEntry
            ? 'done'
            : 'next'
        }
        onSubmitEditing={
          onSubmitEditing
        }
        onFocus={() =>
          setFocused(
            true
          )
        }
        onBlur={() =>
          setFocused(
            false
          )
        }
        className="ml-2 h-[52px] flex-1 p-0 text-[14px] font-medium text-[#252A20]"
      />

      {rightIcon &&
      onRightIconPress ? (
        <Pressable
          onPress={
            onRightIconPress
          }
          className="h-9 w-9 items-center justify-center rounded-full active:bg-[#E5ECD7]"
        >
          <Ionicons
            name={
              rightIcon
            }
            size={21}
            color="#6F8C3E"
          />
        </Pressable>
      ) : null}
    </View>
  );
}