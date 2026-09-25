// app/login.tsx

import {
  useState,
} from 'react';

import type {
  TextInputProps,
} from 'react-native';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Link,
  router,
} from 'expo-router';

import LottieView from 'lottie-react-native';

import FormFeedback from '@/components/FormFeedback';

import {
  useAuth,
} from '@/hooks/useAuth';

const LOGIN_ANIMATION =
  require('../assets/fonts/Login.json');

// =====================================================
// SCREEN
// =====================================================

export default function LoginScreen() {
  const {
    login,
  } = useAuth();

  const [
    identifier,
    setIdentifier,
  ] =
    useState('');

  const [
    password,
    setPassword,
  ] =
    useState('');

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState('');

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  // ===================================================
  // MENSAJES
  // ===================================================

  function clearMessages() {
    if (
      errorMessage
    ) {
      setErrorMessage('');
    }

    if (
      successMessage
    ) {
      setSuccessMessage('');
    }
  }

  // ===================================================
  // REDIRECCIÓN POR ROL
  // ===================================================

  function redirectByRole(
    user: {
      role?: {
        type?: string;
        name?: string;
      } | null;
    }
  ) {
    const role =
      (
        user.role?.type ||
        user.role?.name ||
        ''
      )
        .trim()
        .toLowerCase();

    console.log(
      'ROL RECIBIDO:',
      user.role
    );

    console.log(
      'ROL NORMALIZADO:',
      role
    );

    if (
      role === 'admin' ||
      role.includes(
        'admin'
      )
    ) {
      router.replace(
        '/(tabs-admin)'
      );

      return;
    }

    if (
      role ===
        'restaurant' ||
      role ===
        'restaurante' ||
      role.includes(
        'restaurant'
      )
    ) {
      router.replace(
        '/(tabs-restaurant)'
      );

      return;
    }

    if (
      role ===
        'employee' ||
      role ===
        'empleado' ||
      role.includes(
        'employee'
      )
    ) {
      router.replace(
        '/(tabs-employee)'
      );

      return;
    }

    router.replace(
      '/(tabs)'
    );
  }

  // ===================================================
  // LOGIN
  // ===================================================

  async function handleLogin() {
    if (
      submitting
    ) {
      return;
    }

    if (
      !identifier.trim() ||
      !password
    ) {
      setErrorMessage(
        'Ingresa tu correo o nombre de usuario y contraseña.'
      );

      return;
    }

    if (
      identifier.includes(
        '@'
      )
    ) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          identifier.trim()
        )
      ) {
        setErrorMessage(
          'Introduce un correo electrónico válido.'
        );

        return;
      }
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      setSubmitting(
        true
      );

      const user =
        await login({
          identifier:
            identifier
              .trim()
              .toLowerCase(),

          password,
        });

      setSuccessMessage(
        'Inicio de sesión exitoso. Redirigiendo...'
      );

      await new Promise<void>(
        (
          resolve
        ) => {
          setTimeout(
            resolve,
            1200
          );
        }
      );

      redirectByRole(
        user
      );
    } catch (
      error: any
    ) {
      const backendMessage =
        error.response
          ?.data
          ?.error
          ?.message ??
        error.response
          ?.data
          ?.message;

      const status =
        error.response
          ?.status;

      setSuccessMessage(
        ''
      );

      if (
        status === 400 ||
        status === 401 ||
        status === 403
      ) {
        setErrorMessage(
          'El correo, usuario o contraseña son incorrectos.'
        );
      } else {
        setErrorMessage(
          backendMessage ??
            'No se pudo iniciar sesión. Inténtalo nuevamente.'
        );
      }
    } finally {
      setSubmitting(
        false
      );
    }
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F7F8F2]"
      behavior={
        Platform.OS ===
        'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        className="flex-1 bg-[#F7F8F2]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          flexGrow: 1,

          justifyContent:
            'center',

          paddingHorizontal:
            20,

          paddingVertical:
            32,
        }}
      >
        <View className="w-full self-center rounded-[28px] border border-[#E5E8DE] bg-white p-5 web:max-w-[520px]">
          {/* ========================================= */}
          {/* LOTTIE */}
          {/* ========================================= */}

          <View className="h-[165px] w-full items-center justify-center">
            {LOGIN_ANIMATION ? (
              <LottieView
                source={
                  LOGIN_ANIMATION
                }
                autoPlay
                loop
                style={{
                  width:
                    180,

                  height:
                    180,
                }}
              />
            ) : (
              <View className="h-[145px] w-[145px] items-center justify-center rounded-full border-2 border-dashed border-[#B9C99A] bg-[#EEF3E3]">
                <Ionicons
                  name="restaurant-outline"
                  size={52}
                  color="#6F8C3E"
                />

                <Text className="mt-2 text-[11px] font-semibold text-[#788466]">
                  Restaurantes
                </Text>
              </View>
            )}
          </View>

          {/* ========================================= */}
          {/* TITULO */}
          {/* ========================================= */}

          <Text className="text-center text-[29px] font-extrabold text-[#252A20]">
            ¡Bienvenido!
          </Text>

          <Text className="mb-6 mt-2 text-center text-[13px] leading-5 text-[#858A7A]">
            Inicia sesión para continuar y disfrutar de
            todos nuestros servicios.
          </Text>

          {/* ========================================= */}
          {/* IDENTIFICADOR */}
          {/* ========================================= */}

          <FormInput
            icon="person-outline"
            placeholder="Correo o nombre de usuario"
            value={
              identifier
            }
            onChangeText={(
              value
            ) => {
              setIdentifier(
                value
              );

              clearMessages();
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* ========================================= */}
          {/* PASSWORD */}
          {/* ========================================= */}

          <FormInput
            icon="lock-closed-outline"
            placeholder="Contraseña"
            value={
              password
            }
            onChangeText={(
              value
            ) => {
              setPassword(
                value
              );

              clearMessages();
            }}
            secureTextEntry={
              !showPassword
            }
            autoCapitalize="none"
            rightIcon={
              showPassword
                ? 'eye-off-outline'
                : 'eye-outline'
            }
            onRightIconPress={() =>
              setShowPassword(
                (
                  current
                ) =>
                  !current
              )
            }
            onSubmitEditing={
              handleLogin
            }
          />

          {/* ========================================= */}
          {/* OLVIDASTE CONTRASEÑA */}
          {/* ========================================= */}

          <Pressable className="-mt-1 mb-4 self-end py-1 active:opacity-70">
            <Text className="text-[12px] font-bold text-[#D47A24]">
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          {/* ========================================= */}
          {/* FEEDBACK */}
          {/* ========================================= */}

          <FormFeedback
            type="error"
            message={
              errorMessage
            }
          />

          <FormFeedback
            type="success"
            message={
              successMessage
            }
          />

          {/* ========================================= */}
          {/* LOGIN BUTTON */}
          {/* ========================================= */}

          <Pressable
            onPress={
              handleLogin
            }
            disabled={
              submitting
            }
            className={
              submitting
                ? 'mt-1 h-[54px] w-full flex-row items-center justify-center rounded-[18px] bg-[#171A15] opacity-60'
                : 'mt-1 h-[54px] w-full flex-row items-center justify-center rounded-[18px] bg-[#171A15] active:opacity-80'
            }
          >
            {submitting ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text className="ml-2 text-[15px] font-extrabold text-white">
                  Ingresando...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text className="ml-2 text-[15px] font-extrabold text-white">
                  Ingresar
                </Text>
              </>
            )}
          </Pressable>

          {/* ========================================= */}
          {/* REGISTRO */}
          {/* ========================================= */}

          <View className="mt-6 flex-row flex-wrap items-center justify-center">
            <Text className="text-[13px] text-[#858A7A]">
              ¿Todavía no tienes una cuenta?{' '}
            </Text>

            <Link
              href="/register"
              className="text-[13px] font-extrabold text-[#6F8C3E]"
            >
              Regístrate
            </Link>
          </View>

          {/* ========================================= */}
          {/* VOLVER */}
          {/* ========================================= */}

          <Pressable
            onPress={() =>
              router.replace(
                '/(tabs)'
              )
            }
            className="mt-5 min-h-[44px] flex-row items-center justify-center rounded-[15px] active:bg-[#EEF3E3]"
          >
            <Ionicons
              name="arrow-back-outline"
              size={18}
              color="#6F8C3E"
            />

            <Text className="ml-1.5 text-[13px] font-bold text-[#607A35]">
              Volver al inicio
            </Text>
          </Pressable>
        </View>

        {/* =========================================== */}
        {/* FOOTER */}
        {/* =========================================== */}

        <View className="items-center pt-6">
          <View className="flex-row items-center">
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#7B9646"
            />

            <Text className="ml-1.5 text-[10px] text-[#929889]">
              Acceso seguro
            </Text>
          </View>

          <Text className="mt-2 text-[9px] text-[#A7AC9E]">
            Sistema móvil de restaurantes
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// INPUT
// =====================================================

interface FormInputProps {
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

function FormInput({
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
}: FormInputProps) {
  const [
    focused,
    setFocused,
  ] =
    useState(false);

  return (
    <View
      className={
        focused
          ? 'mb-3.5 min-h-[54px] flex-row items-center rounded-[16px] border-[1.5px] border-[#7B9646] bg-[#F3F6EC] px-4'
          : 'mb-3.5 min-h-[54px] flex-row items-center rounded-[16px] border-[1.5px] border-[#DFE3D8] bg-[#FAFBF7] px-4'
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
        value={
          value
        }
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
        autoCorrect={
          false
        }
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