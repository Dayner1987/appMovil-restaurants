import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/hooks/useAuth';

const REGISTER_ANIMATION = require(
  '../assets/fonts/register.json'
);

export default function RegisterRestaurantScreen() {
  const { registerRestaurant } = useAuth();

  const [
    proposedRestaurantName,
    setProposedRestaurantName,
  ] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] =
    useState('');

  const [submitting, setSubmitting] = useState(false);

  function clearMessages() {
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  }

  function validateForm(): string | null {
    if (!proposedRestaurantName.trim()) {
      return 'El nombre del restaurante es obligatorio.';
    }

    if (!firstName.trim()) {
      return 'El nombre del responsable es obligatorio.';
    }

    if (!lastName.trim()) {
      return 'El apellido del responsable es obligatorio.';
    }

    if (!phone.trim()) {
      return 'El número de teléfono es obligatorio.';
    }

    if (phone.trim().length < 7) {
      return 'Introduce un número de teléfono válido.';
    }

    if (!username.trim()) {
      return 'El nombre de usuario es obligatorio.';
    }

    if (!email.trim()) {
      return 'El correo electrónico es obligatorio.';
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return 'Introduce un correo electrónico válido.';
    }

    if (!password) {
      return 'La contraseña es obligatoria.';
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!/[A-Za-z]/.test(password)) {
      return 'La contraseña debe contener al menos una letra.';
    }

    if (!/\d/.test(password)) {
      return 'La contraseña debe contener al menos un número.';
    }

    if (!confirmPassword) {
      return 'Debes confirmar la contraseña.';
    }

    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }

    return null;
  }

  async function handleRegisterRestaurant() {
    if (submitting) return;

    const validationError = validateForm();

    if (validationError) {
      setSuccessMessage('');
      setErrorMessage(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await registerRestaurant({
        proposedRestaurantName:
          proposedRestaurantName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSuccessMessage(
        response.message ||
          'Solicitud enviada correctamente. Debes esperar la aprobación del administrador.'
      );

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1800);
      });

      router.replace('/login');
    } catch (error: any) {
      setSuccessMessage('');

      const backendMessage =
        error.response?.data?.error?.message ??
        error.response?.data?.message;

      const normalizedMessage = String(
        backendMessage || ''
      ).toLowerCase();

      if (
        normalizedMessage.includes('correo') ||
        normalizedMessage.includes('email') ||
        normalizedMessage.includes('usuario') ||
        normalizedMessage.includes('username') ||
        normalizedMessage.includes('already') ||
        normalizedMessage.includes('registered')
      ) {
        setErrorMessage(
          'El correo electrónico o nombre de usuario ya está registrado.'
        );
      } else {
        setErrorMessage(
          backendMessage ??
            'No se pudo enviar la solicitud. Inténtalo nuevamente.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios' ? 'padding' : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={REGISTER_ANIMATION}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>

          <Text style={styles.title}>
            Registra tu restaurante
          </Text>

          <Text style={styles.subtitle}>
            Envía tu solicitud para formar parte de la
            aplicación. Un administrador deberá aprobar
            tu cuenta antes de que puedas ingresar.
          </Text>

          <FormInput
            icon="restaurant-outline"
            placeholder="Nombre del restaurante"
            value={proposedRestaurantName}
            onChangeText={(value) => {
              setProposedRestaurantName(value);
              clearMessages();
            }}
            autoCapitalize="words"
          />

          <FormInput
            icon="person-outline"
            placeholder="Nombre del responsable"
            value={firstName}
            onChangeText={(value) => {
              setFirstName(value);
              clearMessages();
            }}
            autoCapitalize="words"
          />

          <FormInput
            icon="person-outline"
            placeholder="Apellido del responsable"
            value={lastName}
            onChangeText={(value) => {
              setLastName(value);
              clearMessages();
            }}
            autoCapitalize="words"
          />

          <FormInput
            icon="call-outline"
            placeholder="Número de teléfono"
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              clearMessages();
            }}
            keyboardType="phone-pad"
          />

          <FormInput
            icon="at-outline"
            placeholder="Nombre de usuario"
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              clearMessages();
            }}
            autoCapitalize="none"
          />

          <FormInput
            icon="mail-outline"
            placeholder="Correo electrónico"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearMessages();
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormInput
            icon="lock-closed-outline"
            placeholder="Contraseña"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearMessages();
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={
              showPassword
                ? 'eye-off-outline'
                : 'eye-outline'
            }
            onRightIconPress={() =>
              setShowPassword((current) => !current)
            }
          />

          <Text style={styles.passwordHelp}>
            Mínimo 6 caracteres, con al menos una letra y
            un número.
          </Text>

          <FormInput
            icon="shield-checkmark-outline"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              clearMessages();
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            rightIcon={
              showConfirmPassword
                ? 'eye-off-outline'
                : 'eye-outline'
            }
            onRightIconPress={() =>
              setShowConfirmPassword(
                (current) => !current
              )
            }
            onSubmitEditing={handleRegisterRestaurant}
          />

          {errorMessage ? (
            <View style={styles.errorBar}>
              <Ionicons
                name="alert-circle-outline"
                size={21}
                color="#C23B55"
              />

              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBar}>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#238A55"
              />

              <Text style={styles.successText}>
                {successMessage}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed &&
                !submitting &&
                styles.buttonPressed,
              submitting && styles.buttonDisabled,
            ]}
            onPress={handleRegisterRestaurant}
            disabled={submitting}
          >
            <LinearGradient
              colors={['#7657D5', '#55BDEB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {submitting ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />

                  <Text style={styles.buttonText}>
                    Enviando solicitud...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="paper-plane-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text style={styles.buttonText}>
                    Enviar solicitud
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.informationBox}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#7657D5"
            />

            <Text style={styles.informationText}>
              Después de enviar la solicitud deberás
              esperar la aprobación del administrador.
            </Text>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginQuestion}>
              ¿Tu cuenta ya fue aprobada?
            </Text>

            <Link href="/login" style={styles.link}>
              Iniciar sesión
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FormInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;

  keyboardType?: ComponentProps<
    typeof TextInput
  >['keyboardType'];

  autoCapitalize?: ComponentProps<
    typeof TextInput
  >['autoCapitalize'];

  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  onSubmitEditing?: () => void;
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
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.inputContainer,
        focused && styles.inputContainerFocused,
      ]}
    >
      {!value ? (
        <Ionicons
          name={icon}
          size={21}
          color={focused ? '#7657D5' : '#9995A8'}
        />
      ) : null}

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9995A8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        returnKeyType={
          secureTextEntry ? 'done' : 'next'
        }
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {rightIcon && onRightIconPress ? (
        <Pressable
          style={styles.visibilityButton}
          onPress={onRightIconPress}
        >
          <Ionicons
            name={rightIcon}
            size={21}
            color="#7657D5"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F4FC',
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 35,
    backgroundColor: '#F5F4FC',
  },

  formCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    boxShadow:
      '0px 8px 24px rgba(80, 65, 130, 0.12)',
  },

  lottieContainer: {
    width: '100%',
    height: 170,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lottie: {
    width: 180,
    height: 180,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#27233A',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 25,
    fontSize: 14,
    lineHeight: 21,
    color: '#777487',
    textAlign: 'center',
  },

  inputContainer: {
    minHeight: 54,
    marginBottom: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#DDD8EB',
    borderRadius: 14,
    backgroundColor: '#FBFAFE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  inputContainerFocused: {
    borderColor: '#7657D5',
    backgroundColor: '#F9F7FF',
  },

  input: {
    flex: 1,
    height: 52,
    paddingVertical: 0,
    fontSize: 15,
    color: '#302C40',
  },

  visibilityButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  passwordHelp: {
    marginTop: -5,
    marginBottom: 13,
    paddingHorizontal: 5,
    fontSize: 12,
    lineHeight: 17,
    color: '#858092',
  },

  errorBar: {
    width: '100%',
    marginTop: 2,
    marginBottom: 14,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#FDECEF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#A72E47',
  },

  button: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },

  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonGradient: {
    minHeight: 54,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  informationBox: {
    width: '100%',
    marginTop: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#DED7F5',
    borderRadius: 12,
    backgroundColor: '#F7F4FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  informationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#655B82',
  },

  loginRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },

  loginQuestion: {
    fontSize: 14,
    color: '#777487',
  },

  link: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7657D5',
  },
   successBar: {width: '100%',marginBottom: 13,paddingHorizontal: 14,paddingVertical: 12,borderLeftWidth: 4,borderLeftColor: '#2FA66A',borderRadius: 10,backgroundColor: '#EAF9F0',flexDirection: 'row',alignItems: 'center',gap: 9,},
  successText: {flex: 1,fontSize: 13,lineHeight: 18,fontWeight: '600',color: '#23784C',},
});