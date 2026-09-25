// app/registerRes.tsx

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

export default function RegisterRestaurantScreen() {
  const {
    registerRestaurant,
  } = useAuth();

  const [
    step,
    setStep,
  ] =
    useState<
      1 | 2 | 3
    >(1);

  // ===================================================
  // RESTAURANTE
  // ===================================================

  const [
    proposedRestaurantName,
    setProposedRestaurantName,
  ] =
    useState('');

  const [
    phone,
    setPhone,
  ] =
    useState('');

  // ===================================================
  // RESPONSABLE
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
    stepThreeError,
    setStepThreeError,
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
  // USUARIO AUTOMÁTICO
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
  // VALIDACIONES VISUALES
  // ===================================================

  const stepOneComplete =
    Boolean(
      proposedRestaurantName.trim() &&
      phone.trim() &&
      phone.trim().length >= 7
    );

  const stepTwoComplete =
    Boolean(
      firstName.trim() &&
      lastName.trim() &&
      username.trim()
    );

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordValid =
    password.length >= 6 &&
    /[A-Za-z]/.test(
      password
    ) &&
    /\d/.test(
      password
    );

  const stepThreeComplete =
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

  function clearStepTwoError() {
    if (
      stepTwoError
    ) {
      setStepTwoError(
        ''
      );
    }
  }

  function clearStepThreeMessages() {
    if (
      stepThreeError
    ) {
      setStepThreeError(
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

  function validateStepOne():
    string | null {
    if (
      !proposedRestaurantName.trim()
    ) {
      return 'Ingresa el nombre del restaurante.';
    }

    if (
      !phone.trim()
    ) {
      return 'Ingresa un número de teléfono.';
    }

    if (
      phone.trim()
        .length < 7
    ) {
      return 'Introduce un número de teléfono válido.';
    }

    return null;
  }

  // ===================================================
  // VALIDAR PASO 2
  // ===================================================

  function validateStepTwo():
    string | null {
    if (
      !firstName.trim()
    ) {
      return 'Ingresa el nombre del responsable.';
    }

    if (
      !lastName.trim()
    ) {
      return 'Ingresa el apellido del responsable.';
    }

    if (
      !username.trim()
    ) {
      return 'El nombre de usuario es obligatorio.';
    }

    return null;
  }

  // ===================================================
  // VALIDAR PASO 3
  // ===================================================

  function validateStepThree():
    string | null {
    if (
      !email.trim()
    ) {
      return 'Ingresa el correo electrónico.';
    }

    if (
      !emailPattern.test(
        email.trim()
      )
    ) {
      return 'Introduce un correo electrónico válido.';
    }

    if (
      !password
    ) {
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
  // SIGUIENTE PASO 1
  // ===================================================

  function handleFirstNext() {
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
  // SIGUIENTE PASO 2
  // ===================================================

  function handleSecondNext() {
    const error =
      validateStepTwo();

    if (error) {
      setStepTwoError(
        error
      );

      return;
    }

    setStepTwoError(
      ''
    );

    setStep(
      3
    );
  }

  // ===================================================
  // REGISTRAR RESTAURANTE
  // ===================================================

  async function handleRegisterRestaurant() {
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

      setStep(
        2
      );

      return;
    }

    const thirdError =
      validateStepThree();

    if (thirdError) {
      setStepThreeError(
        thirdError
      );

      return;
    }

    setStepThreeError(
      ''
    );

    setSuccessMessage(
      ''
    );

    try {
      setSubmitting(
        true
      );

      const response =
        await registerRestaurant({
          proposedRestaurantName:
            proposedRestaurantName.trim(),

          firstName:
            firstName.trim(),

          lastName:
            lastName.trim(),

          phone:
            phone.trim(),

          username:
            username
              .trim()
              .toLowerCase(),

          email:
            email
              .trim()
              .toLowerCase(),

          password,
        });

      setSuccessMessage(
        response.message ||
          'Solicitud enviada correctamente. Debes esperar la aprobación del administrador.'
      );

      await new Promise<void>(
        (
          resolve
        ) => {
          setTimeout(
            resolve,
            1800
          );
        }
      );

      router.replace(
        '/login'
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
          backendMessage ||
            ''
        ).toLowerCase();

      if (
        normalizedMessage.includes(
          'username'
        ) ||
        normalizedMessage.includes(
          'usuario'
        )
      ) {
        setStepTwoError(
          'Ese nombre de usuario ya está registrado. Prueba con otro.'
        );

        setStep(
          2
        );

        return;
      }

      if (
        normalizedMessage.includes(
          'correo'
        ) ||
        normalizedMessage.includes(
          'email'
        ) ||
        normalizedMessage.includes(
          'already'
        ) ||
        normalizedMessage.includes(
          'registered'
        )
      ) {
        setStepThreeError(
          'El correo electrónico ya está registrado.'
        );

        setStep(
          3
        );

        return;
      }

      setStepThreeError(
        backendMessage ??
          'No se pudo enviar la solicitud. Inténtalo nuevamente.'
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
        <View className="w-full self-center web:max-w-[540px]">
          <View className="rounded-[28px] border border-[#E5E8DE] bg-white p-5">
            {/* ======================================= */}
            {/* ANIMACIÓN */}
            {/* ======================================= */}

            <View className="h-[105px] items-center justify-center">
              <LottieView
                source={
                  REGISTER_ANIMATION
                }
                autoPlay
                loop
                style={{
                  width:
                    120,

                  height:
                    120,
                }}
              />
            </View>

            {/* ======================================= */}
            {/* TITULO */}
            {/* ======================================= */}

            <Text className="text-center text-[26px] font-extrabold text-[#252A20]">
              Registra tu restaurante
            </Text>

            <Text className="mt-2 text-center text-[12px] leading-5 text-[#858A7A]">
              Envía tu solicitud en tres pasos. Un administrador
              deberá aprobar tu cuenta antes de ingresar.
            </Text>

            {/* ======================================= */}
            {/* PROGRESO */}
            {/* ======================================= */}

            <View className="my-6 flex-row items-start">
              <StepIndicator
                number="1"
                label="Restaurante"
                active={
                  step === 1
                }
                complete={
                  step > 1 ||
                  stepOneComplete
                }
              />

              <StepLine
                complete={
                  step > 1
                }
              />

              <StepIndicator
                number="2"
                label="Responsable"
                active={
                  step === 2
                }
                complete={
                  step > 2 ||
                  stepTwoComplete
                }
              />

              <StepLine
                complete={
                  step > 2
                }
              />

              <StepIndicator
                number="3"
                label="Acceso"
                active={
                  step === 3
                }
                complete={
                  stepThreeComplete
                }
              />
            </View>

            {/* ======================================= */}
            {/* PASO 1 */}
            {/* ======================================= */}

            {step === 1 ? (
              <View>
                <SectionTitle
                  icon="restaurant-outline"
                  title="Tu restaurante"
                  description="Comienza con la información principal del negocio."
                />

                <View className="mt-5 gap-3">
                  <RegisterInput
                    icon="restaurant-outline"
                    placeholder="Nombre del restaurante"
                    value={
                      proposedRestaurantName
                    }
                    onChangeText={(
                      value
                    ) => {
                      setProposedRestaurantName(
                        value
                      );

                      clearStepOneError();
                    }}
                    autoCapitalize="words"
                  />

                  <RegisterInput
                    icon="call-outline"
                    placeholder="Número de teléfono"
                    value={
                      phone
                    }
                    onChangeText={(
                      value
                    ) => {
                      setPhone(
                        value
                      );

                      clearStepOneError();
                    }}
                    keyboardType="phone-pad"
                  />
                </View>

                <RegisterFeedback
                  message={
                    stepOneError
                  }
                />

                <Pressable
                  onPress={
                    handleFirstNext
                  }
                  className={
                    stepOneComplete
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
            ) : null}

            {/* ======================================= */}
            {/* PASO 2 */}
            {/* ======================================= */}

            {step === 2 ? (
              <View>
                <SectionTitle
                  icon="person-outline"
                  title="Responsable"
                  description="Indica quién estará a cargo de esta cuenta."
                />

                {/* RESTAURANTE RESUMEN */}

                <View className="mt-5 flex-row items-center rounded-[18px] bg-[#EEF3E3] p-3.5">
                  <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-white">
                    <Ionicons
                      name="restaurant-outline"
                      size={19}
                      color="#6F8C3E"
                    />
                  </View>

                  <View className="ml-3 min-w-0 flex-1">
                    <Text
                      numberOfLines={
                        1
                      }
                      className="text-[12px] font-extrabold text-[#252A20]"
                    >
                      {
                        proposedRestaurantName
                      }
                    </Text>

                    <Text className="mt-0.5 text-[10px] text-[#78806E]">
                      {phone}
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

                <View className="mt-4 gap-3">
                  <RegisterInput
                    icon="person-outline"
                    placeholder="Nombre del responsable"
                    value={
                      firstName
                    }
                    onChangeText={(
                      value
                    ) => {
                      setFirstName(
                        value
                      );

                      clearStepTwoError();
                    }}
                    autoCapitalize="words"
                  />

                  <RegisterInput
                    icon="person-outline"
                    placeholder="Apellido del responsable"
                    value={
                      lastName
                    }
                    onChangeText={(
                      value
                    ) => {
                      setLastName(
                        value
                      );

                      clearStepTwoError();
                    }}
                    autoCapitalize="words"
                  />

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

                        clearStepTwoError();
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
                          Generamos un usuario con tu nombre. Puedes
                          modificarlo si quieres.
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

                          clearStepTwoError();
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
                    stepTwoError
                  }
                />

                <Pressable
                  onPress={
                    handleSecondNext
                  }
                  className={
                    stepTwoComplete
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

                <BackStepButton
                  label="Volver al restaurante"
                  onPress={() => {
                    setStepTwoError(
                      ''
                    );

                    setStep(
                      1
                    );
                  }}
                />
              </View>
            ) : null}

            {/* ======================================= */}
            {/* PASO 3 */}
            {/* ======================================= */}

            {step === 3 ? (
              <View>
                <SectionTitle
                  icon="shield-checkmark-outline"
                  title="Acceso a la cuenta"
                  description="Finalmente crea las credenciales de acceso."
                />

                {/* RESPONSABLE RESUMEN */}

                <View className="mt-5 flex-row items-center rounded-[18px] bg-[#EEF3E3] p-3.5">
                  <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-white">
                    <Ionicons
                      name="person-outline"
                      size={19}
                      color="#6F8C3E"
                    />
                  </View>

                  <View className="ml-3 min-w-0 flex-1">
                    <Text
                      numberOfLines={
                        1
                      }
                      className="text-[12px] font-extrabold text-[#252A20]"
                    >
                      {firstName}{' '}
                      {lastName}
                    </Text>

                    <Text
                      numberOfLines={
                        1
                      }
                      className="mt-0.5 text-[10px] text-[#78806E]"
                    >
                      @{username}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      setStep(
                        2
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

                <View className="mt-4 gap-3">
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

                      clearStepThreeMessages();
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

                      clearStepThreeMessages();
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

                      clearStepThreeMessages();
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
                      handleRegisterRestaurant
                    }
                  />
                </View>

                <RegisterFeedback
                  message={
                    stepThreeError
                  }
                />

                <RegisterFeedback
                  type="success"
                  message={
                    successMessage
                  }
                />

                {/* APROBACIÓN */}

                <View className="mt-4 flex-row items-start rounded-[18px] bg-[#FFF0DD] p-4">
                  <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-white">
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color="#D47A24"
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-[12px] font-extrabold text-[#A95D17]">
                      Requiere aprobación
                    </Text>

                    <Text className="mt-1 text-[10px] leading-4 text-[#8B755D]">
                      Después de enviar la solicitud deberás esperar
                      a que un administrador la revise y apruebe.
                    </Text>
                  </View>
                </View>

                {/* ENVIAR */}

                <Pressable
                  onPress={
                    handleRegisterRestaurant
                  }
                  disabled={
                    submitting
                  }
                  className={
                    submitting
                      ? 'mt-6 h-[54px] flex-row items-center justify-center rounded-[18px] bg-[#7B9646] opacity-60'
                      : stepThreeComplete
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
                        Enviando solicitud...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="paper-plane-outline"
                        size={20}
                        color="#FFFFFF"
                      />

                      <Text className="ml-2 text-[15px] font-extrabold text-white">
                        Enviar solicitud
                      </Text>
                    </>
                  )}
                </Pressable>

                <BackStepButton
                  label="Volver al responsable"
                  onPress={() => {
                    setStepThreeError(
                      ''
                    );

                    setStep(
                      2
                    );
                  }}
                />
              </View>
            ) : null}

            {/* ======================================= */}
            {/* LOGIN */}
            {/* ======================================= */}

            <View className="mt-6 flex-row flex-wrap items-center justify-center border-t border-[#ECEEE8] pt-5">
              <Text className="text-[13px] text-[#858A7A]">
                ¿Tu cuenta ya fue aprobada?{' '}
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
          {/* VOLVER AL INICIO */}
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
// TITULO DE SECCIÓN
// =====================================================

interface SectionTitleProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  title: string;

  description: string;
}

function SectionTitle({
  icon,
  title,
  description,
}: SectionTitleProps) {
  return (
    <View className="flex-row items-start">
      <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#EEF3E3]">
        <Ionicons
          name={icon}
          size={21}
          color="#6F8C3E"
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[17px] font-extrabold text-[#252A20]">
          {title}
        </Text>

        <Text className="mt-1 text-[11px] leading-4 text-[#858A7A]">
          {description}
        </Text>
      </View>
    </View>
  );
}

// =====================================================
// INDICADOR
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
    <View className="w-[72px] items-center">
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
        numberOfLines={
          1
        }
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

// =====================================================
// LINEA DE PASO
// =====================================================

function StepLine({
  complete,
}: {
  complete: boolean;
}) {
  return (
    <View className="flex-1 pt-[17px]">
      <View
        className={
          complete
            ? 'h-[2px] w-full rounded-full bg-[#7B9646]'
            : 'h-[2px] w-full rounded-full bg-[#E1E5DA]'
        }
      />
    </View>
  );
}

// =====================================================
// VOLVER
// =====================================================

interface BackStepButtonProps {
  label: string;

  onPress: () => void;
}

function BackStepButton({
  label,
  onPress,
}: BackStepButtonProps) {
  return (
    <Pressable
      onPress={
        onPress
      }
      className="mt-3 h-[45px] flex-row items-center justify-center rounded-[15px] active:bg-[#EEF3E3]"
    >
      <Ionicons
        name="arrow-back-outline"
        size={17}
        color="#6F8C3E"
      />

      <Text className="ml-1.5 text-[12px] font-bold text-[#607A35]">
        {label}
      </Text>
    </Pressable>
  );
}