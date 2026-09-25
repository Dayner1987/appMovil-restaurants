// app/register.tsx

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
} from 'expo-router';

import LottieView from 'lottie-react-native';

import {
  useAuth,
} from '@/hooks/useAuth';

import RegisterInput from '@/components/auth/RegisterInput';

import RegisterFeedback from '@/components/auth/RegisterFeedback';

const REGISTER_ANIMATION =
  require('../assets/fonts/register.json');

// =====================================================
// HELPERS
// =====================================================

function normalizeUsernamePart(
  value: string
) {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-zA-Z0-9]/g,
      ''
    )
    .toLowerCase();
}

function generateUsername(
  firstName: string,
  lastName: string
) {
  const first =
    normalizeUsernamePart(
      firstName
        .trim()
        .split(/\s+/)[0] ??
        ''
    );

  const last =
    normalizeUsernamePart(
      lastName
        .trim()
        .split(/\s+/)[0] ??
        ''
    );

  if (
    !first &&
    !last
  ) {
    return '';
  }

  if (!last) {
    return first;
  }

  if (!first) {
    return last;
  }

  return `${first}.${last}`;
}

// =====================================================
// SCREEN
// =====================================================

export default function RegisterScreen() {
  const {
    register,
  } = useAuth();

  const [
    step,
    setStep,
  ] =
    useState<1 | 2>(
      1
    );

  // ===================================================
  // DATOS PERSONALES
  // ===================================================

  const [
    firstName,
    setFirstName,
  ] =
    useState('');

  const [
    lastName,
    setLastName,
  ] =
    useState('');

  const [
    username,
    setUsername,
  ] =
    useState('');

  const [
    usernameEdited,
    setUsernameEdited,
  ] =
    useState(false);

  // ===================================================
  // ACCESO
  // ===================================================

  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    password,
    setPassword,
  ] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('');

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);

  // ===================================================
  // FEEDBACK
  // ===================================================

  const [
    stepOneError,
    setStepOneError,
  ] =
    useState('');

  const [
    stepTwoError,
    setStepTwoError,
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
  // GENERAR USUARIO
  // ===================================================

  const generatedUsername =
    useMemo(
      () =>
        generateUsername(
          firstName,
          lastName
        ),
      [
        firstName,
        lastName,
      ]
    );

  useEffect(() => {
    if (
      usernameEdited
    ) {
      return;
    }

    setUsername(
      generatedUsername
    );
  }, [
    generatedUsername,
    usernameEdited,
  ]);

  // ===================================================
  // ESTADOS DE COMPLETADO
  // ===================================================

  const firstStepComplete =
    Boolean(
      firstName.trim() &&
        lastName.trim() &&
        username.trim()
    );

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordValid =
    password.length >=
      6 &&
    /[A-Za-z]/.test(
      password
    ) &&
    /\d/.test(
      password
    );

  const secondStepComplete =
    Boolean(
      email.trim() &&
        emailPattern.test(
          email.trim()
        ) &&
        passwordValid &&
        confirmPassword &&
        password ===
          confirmPassword
    );

  // ===================================================
  // LIMPIAR MENSAJES
  // ===================================================

  function clearStepOneError() {
    if (
      stepOneError
    ) {
      setStepOneError(
        ''
      );
    }
  }

  function clearStepTwoMessages() {
    if (
      stepTwoError
    ) {
      setStepTwoError(
        ''
      );
    }

    if (
      successMessage
    ) {
      setSuccessMessage(
        ''
      );
    }
  }

  // ===================================================
  // VALIDAR PASO 1
  // ===================================================

  function validateStepOne() {
    if (
      !firstName.trim()
    ) {
      return 'Ingresa tu nombre.';
    }

    if (
      firstName.trim()
        .length < 2
    ) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }

    if (
      !lastName.trim()
    ) {
      return 'Ingresa tu apellido.';
    }

    if (
      lastName.trim()
        .length < 2
    ) {
      return 'El apellido debe tener al menos 2 caracteres.';
    }

    if (
      !username.trim()
    ) {
      return 'El nombre de usuario es obligatorio.';
    }

    if (
      username.trim()
        .length < 3
    ) {
      return 'El nombre de usuario debe tener al menos 3 caracteres.';
    }

    if (
      !/^[a-zA-Z0-9._-]+$/.test(
        username.trim()
      )
    ) {
      return 'El usuario solo puede contener letras, números, puntos, guiones y guion bajo.';
    }

    return null;
  }

  // ===================================================
  // VALIDAR PASO 2
  // ===================================================

  function validateStepTwo() {
    if (
      !email.trim()
    ) {
      return 'Ingresa tu correo electrónico.';
    }

    if (
      !emailPattern.test(
        email.trim()
      )
    ) {
      return 'Introduce un correo electrónico válido.';
    }

    if (!password) {
      return 'Ingresa una contraseña.';
    }

    if (
      password.length <
      6
    ) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (
      !/[A-Za-z]/.test(
        password
      )
    ) {
      return 'La contraseña debe contener al menos una letra.';
    }

    if (
      !/\d/.test(
        password
      )
    ) {
      return 'La contraseña debe contener al menos un número.';
    }

    if (
      !confirmPassword
    ) {
      return 'Confirma tu contraseña.';
    }

    if (
      password !==
      confirmPassword
    ) {
      return 'Las contraseñas no coinciden.';
    }

    return null;
  }

  // ===================================================
  // SIGUIENTE
  // ===================================================

  function handleNext() {
    const error =
      validateStepOne();

    if (error) {
      setStepOneError(
        error
      );

      return;
    }

    setStepOneError(
      ''
    );

    setStep(
      2
    );
  }

  // ===================================================
  // REGISTRAR
  // ===================================================

  async function handleRegister() {
    if (
      submitting
    ) {
      return;
    }

    const firstError =
      validateStepOne();

    if (firstError) {
      setStepOneError(
        firstError
      );

      setStep(
        1
      );

      return;
    }

    const secondError =
      validateStepTwo();

    if (secondError) {
      setStepTwoError(
        secondError
      );

      return;
    }

    setStepTwoError(
      ''
    );

    setSuccessMessage(
      ''
    );

    try {
      setSubmitting(
        true
      );

      await register({
        username:
          username
            .trim()
            .toLowerCase(),

        email:
          email
            .trim()
            .toLowerCase(),

        password,

        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),
      });

      setSuccessMessage(
        'Cuenta creada correctamente. Ingresando...'
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

      router.replace(
        '/(tabs)'
      );
    } catch (
      error: any
    ) {
      setSuccessMessage(
        ''
      );

      const backendMessage =
        error.response
          ?.data
          ?.error
          ?.message ??
        error.response
          ?.data
          ?.message;

      const normalizedMessage =
        String(
          backendMessage ??
            ''
        ).toLowerCase();

      if (
        normalizedMessage.includes(
          'email'
        )
      ) {
        setStepTwoError(
          'El correo electrónico ya está registrado.'
        );

        return;
      }

      if (
        normalizedMessage.includes(
          'username'
        ) ||
        normalizedMessage.includes(
          'taken'
        )
      ) {
        setStepOneError(
          'Ese nombre de usuario ya está registrado. Prueba con otro.'
        );

        setStep(
          1
        );

        return;
      }

      setStepTwoError(
        backendMessage ??
          'No se pudo crear la cuenta. Inténtalo nuevamente.'
      );
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
        className="flex-1"
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
            30,
        }}
      >
        <View className="w-full self-center web:max-w-[520px]">
          {/* ========================================= */}
          {/* TARJETA */}
          {/* ========================================= */}

          <View className="rounded-[28px] border border-[#E5E8DE] bg-white p-5">
            {/* ======================================= */}
            {/* ANIMACIÓN COMPACTA */}
            {/* ======================================= */}

            <View className="h-[115px] items-center justify-center">
              <LottieView
                source={
                  REGISTER_ANIMATION
                }
                autoPlay
                loop
                style={{
                  width:
                    125,

                  height:
                    125,
                }}
              />
            </View>

            {/* ======================================= */}
            {/* TITULO */}
            {/* ======================================= */}

            <Text className="text-center text-[27px] font-extrabold text-[#252A20]">
              Crear cuenta
            </Text>

            <Text className="mt-1.5 text-center text-[13px] leading-5 text-[#858A7A]">
              Completa los datos en dos pasos sencillos.
            </Text>

            {/* ======================================= */}
            {/* PROGRESO */}
            {/* ======================================= */}

            <View className="my-6 flex-row items-center">
              <StepIndicator
                number="1"
                label="Tus datos"
                active={
                  step === 1
                }
                complete={
                  step === 2 ||
                  firstStepComplete
                }
              />

              <View
                className={
                  step === 2
                    ? 'mx-2 h-[2px] flex-1 rounded-full bg-[#7B9646]'
                    : 'mx-2 h-[2px] flex-1 rounded-full bg-[#E1E5DA]'
                }
              />

              <StepIndicator
                number="2"
                label="Tu acceso"
                active={
                  step === 2
                }
                complete={
                  secondStepComplete
                }
              />
            </View>

            {/* ======================================= */}
            {/* PASO 1 */}
            {/* ======================================= */}

            {step === 1 ? (
              <View>
                <View className="mb-4">
                  <Text className="text-[18px] font-extrabold text-[#252A20]">
                    Cuéntanos quién eres
                  </Text>

                  <Text className="mt-1 text-[12px] leading-5 text-[#858A7A]">
                    Primero necesitamos tu nombre y el usuario con el que
                    te identificarás.
                  </Text>
                </View>

                <View className="gap-3">
                  <RegisterInput
                    icon="person-outline"
                    placeholder="Nombre"
                    value={
                      firstName
                    }
                    onChangeText={(
                      value
                    ) => {
                      setFirstName(
                        value
                      );

                      clearStepOneError();
                    }}
                    autoCapitalize="words"
                  />

                  <RegisterInput
                    icon="person-outline"
                    placeholder="Apellido"
                    value={
                      lastName
                    }
                    onChangeText={(
                      value
                    ) => {
                      setLastName(
                        value
                      );

                      clearStepOneError();
                    }}
                    autoCapitalize="words"
                  />

                  {/* ================================= */}
                  {/* USUARIO GENERADO */}
                  {/* ================================= */}

                  <View>
                    <RegisterInput
                      icon="at-outline"
                      placeholder="Nombre de usuario"
                      value={
                        username
                      }
                      onChangeText={(
                        value
                      ) => {
                        setUsername(
                          value
                            .replace(
                              /\s/g,
                              ''
                            )
                            .toLowerCase()
                        );

                        setUsernameEdited(
                          true
                        );

                        clearStepOneError();
                      }}
                      autoCapitalize="none"
                    />

                    <View className="mt-2 flex-row items-center justify-between px-1">
                      <View className="mr-3 flex-1 flex-row items-center">
                        <Ionicons
                          name="sparkles-outline"
                          size={14}
                          color="#7B9646"
                        />

                        <Text className="ml-1.5 flex-1 text-[10px] leading-4 text-[#858A7A]">
                          Lo generamos con tu nombre, pero puedes cambiarlo.
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => {
                          setUsernameEdited(
                            false
                          );

                          setUsername(
                            generatedUsername
                          );

                          clearStepOneError();
                        }}
                        className="h-8 flex-row items-center rounded-full bg-[#EEF3E3] px-3 active:opacity-70"
                      >
                        <Ionicons
                          name="refresh-outline"
                          size={14}
                          color="#6F8C3E"
                        />

                        <Text className="ml-1 text-[10px] font-bold text-[#607A35]">
                          Generar
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                <RegisterFeedback
                  message={
                    stepOneError
                  }
                />

                {/* ================================= */}
                {/* SIGUIENTE */}
                {/* ================================= */}

                <Pressable
                  onPress={
                    handleNext
                  }
                  className={
                    firstStepComplete
                      ? 'mt-6 h-[54px] flex-row items-center justify-center rounded-[18px] bg-[#7B9646] active:opacity-80'
                      : 'mt-6 h-[54px] flex-row items-center justify-center rounded-[18px] bg-[#C9CFC0] active:opacity-80'
                  }
                >
                  <Text className="text-[15px] font-extrabold text-white">
                    Siguiente
                  </Text>

                  <Ionicons
                    name="arrow-forward-outline"
                    size={19}
                    color="#FFFFFF"
                    style={{
                      marginLeft:
                        7,
                    }}
                  />
                </Pressable>
              </View>
            ) : (
              /* ===================================== */
              /* PASO 2 */
              /* ===================================== */

              <View>
                <View className="mb-4">
                  <Text className="text-[18px] font-extrabold text-[#252A20]">
                    Protege tu cuenta
                  </Text>

                  <Text className="mt-1 text-[12px] leading-5 text-[#858A7A]">
                    Agrega tu correo y crea una contraseña segura.
                  </Text>
                </View>

                {/* Resumen paso 1 */}

                <View className="mb-4 flex-row items-center rounded-[18px] bg-[#EEF3E3] p-3.5">
                  <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-white">
                    <Ionicons
                      name="person-outline"
                      size={19}
                      color="#6F8C3E"
                    />
                  </View>

                  <View className="ml-3 min-w-0 flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-[12px] font-extrabold text-[#252A20]"
                    >
                      {firstName}{' '}
                      {lastName}
                    </Text>

                    <Text
                      numberOfLines={1}
                      className="mt-0.5 text-[10px] text-[#78806E]"
                    >
                      @{username}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      setStep(
                        1
                      )
                    }
                    className="h-9 w-9 items-center justify-center rounded-[12px] bg-white active:opacity-70"
                  >
                    <Ionicons
                      name="create-outline"
                      size={17}
                      color="#6F8C3E"
                    />
                  </Pressable>
                </View>

                <View className="gap-3">
                  <RegisterInput
                    icon="mail-outline"
                    placeholder="Correo electrónico"
                    value={
                      email
                    }
                    onChangeText={(
                      value
                    ) => {
                      setEmail(
                        value
                      );

                      clearStepTwoMessages();
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <RegisterInput
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

                      clearStepTwoMessages();
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
                  />

                  <View className="-mt-1 px-1">
                    <Text className="text-[10px] leading-4 text-[#858A7A]">
                      Mínimo 6 caracteres, una letra y un número.
                    </Text>
                  </View>

                  <RegisterInput
                    icon="shield-checkmark-outline"
                    placeholder="Confirmar contraseña"
                    value={
                      confirmPassword
                    }
                    onChangeText={(
                      value
                    ) => {
                      setConfirmPassword(
                        value
                      );

                      clearStepTwoMessages();
                    }}
                    secureTextEntry={
                      !showConfirmPassword
                    }
                    autoCapitalize="none"
                    rightIcon={
                      showConfirmPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    onRightIconPress={() =>
                      setShowConfirmPassword(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    onSubmitEditing={
                      handleRegister
                    }
                  />
                </View>

                <RegisterFeedback
                  message={
                    stepTwoError
                  }
                />

                <RegisterFeedback
                  type="success"
                  message={
                    successMessage
                  }
                />

                {/* ================================= */}
                {/* REGISTRAR */}
                {/* ================================= */}

                <Pressable
                  onPress={
                    handleRegister
                  }
                  disabled={
                    submitting
                  }
                  className={
                    submitting
                      ? 'mt-6 h-[54px] flex-row items-center justify-center rounded-[18px] bg-[#7B9646] opacity-60'
                      : secondStepComplete
                        ? 'mt-6 h-[54px] flex-row items-center justify-center rounded-[18px] bg-[#7B9646] active:opacity-80'
                        : 'mt-6 h-[54px] flex-row items-center justify-center rounded-[18px] bg-[#C9CFC0] active:opacity-80'
                  }
                >
                  {submitting ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />

                      <Text className="ml-2 text-[15px] font-extrabold text-white">
                        Creando cuenta...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="person-add-outline"
                        size={20}
                        color="#FFFFFF"
                      />

                      <Text className="ml-2 text-[15px] font-extrabold text-white">
                        Registrarme
                      </Text>
                    </>
                  )}
                </Pressable>

                {/* ================================= */}
                {/* ATRÁS */}
                {/* ================================= */}

                <Pressable
                  onPress={() => {
                    setStepTwoError(
                      ''
                    );

                    setStep(
                      1
                    );
                  }}
                  className="mt-3 h-[46px] flex-row items-center justify-center rounded-[15px] active:bg-[#EEF3E3]"
                >
                  <Ionicons
                    name="arrow-back-outline"
                    size={17}
                    color="#6F8C3E"
                  />

                  <Text className="ml-1.5 text-[12px] font-bold text-[#607A35]">
                    Volver al paso anterior
                  </Text>
                </Pressable>
              </View>
            )}

            {/* ======================================= */}
            {/* LOGIN */}
            {/* ======================================= */}

            <View className="mt-6 flex-row flex-wrap items-center justify-center border-t border-[#ECEEE8] pt-5">
              <Text className="text-[13px] text-[#858A7A]">
                ¿Ya tienes una cuenta?{' '}
              </Text>

              <Pressable
                onPress={() =>
                  router.push(
                    '/login'
                  )
                }
              >
                <Text className="text-[13px] font-extrabold text-[#6F8C3E]">
                  Iniciar sesión
                </Text>
              </Pressable>
            </View>
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
            className="mt-4 min-h-[44px] flex-row items-center justify-center active:opacity-70"
          >
            <Ionicons
              name="arrow-back-outline"
              size={17}
              color="#6F8C3E"
            />

            <Text className="ml-1.5 text-[12px] font-bold text-[#607A35]">
              Volver al inicio
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// INDICADOR DE PASO
// =====================================================

interface StepIndicatorProps {
  number: string;

  label: string;

  active: boolean;

  complete: boolean;
}

function StepIndicator({
  number,
  label,
  active,
  complete,
}: StepIndicatorProps) {
  const highlighted =
    active ||
    complete;

  return (
    <View className="items-center">
      <View
        className={
          highlighted
            ? 'h-9 w-9 items-center justify-center rounded-full bg-[#7B9646]'
            : 'h-9 w-9 items-center justify-center rounded-full bg-[#E4E7DE]'
        }
      >
        {complete ? (
          <Ionicons
            name="checkmark-outline"
            size={18}
            color="#FFFFFF"
          />
        ) : (
          <Text
            className={
              highlighted
                ? 'text-[12px] font-extrabold text-white'
                : 'text-[12px] font-extrabold text-[#93998B]'
            }
          >
            {number}
          </Text>
        )}
      </View>

      <Text
        className={
          highlighted
            ? 'mt-1.5 text-[9px] font-bold text-[#607A35]'
            : 'mt-1.5 text-[9px] font-semibold text-[#9A9F92]'
        }
      >
        {label}
      </Text>
    </View>
  );
}