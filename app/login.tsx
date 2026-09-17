import FormFeedback from "@/components/FormFeedback";
import { useAuth } from "@/hooks/useAuth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import LottieView from "lottie-react-native";
import { useState } from "react";
import type { TextInputProps } from "react-native";
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
} from "react-native";

const LOGIN_ANIMATION = require("../assets/fonts/Login.json");

export default function LoginScreen() {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function clearMessages() {
    if (errorMessage) {
      setErrorMessage("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  }
function redirectByRole(user: {
  role?: {
    type?: string;
    name?: string;
  } | null;
}) {
  const role = (
    user.role?.type ||
    user.role?.name ||
    ''
  )
    .trim()
    .toLowerCase();

  console.log('ROL RECIBIDO:', user.role);
  console.log('ROL NORMALIZADO:', role);

  if (role === 'admin' || role.includes('admin')) {
    router.replace('/(tabs-admin)');
    return;
  }

  if (
    role === 'restaurant' ||
    role === 'restaurante' ||
    role.includes('restaurant')
  ) {
    router.replace('/(tabs-restaurant)');
    return;
  }

  if (
    role === 'employee' ||
    role === 'empleado' ||
    role.includes('employee')
  ) {
    router.replace('/(tabs-employee)');
    return;
  }

  router.replace('/(tabs)');
}

  async function handleLogin() {
    if (submitting) return;

    if (!identifier.trim() || !password) {
      setErrorMessage("Ingresa tu correo o nombre de usuario y contraseña.");
      return;
    }

    if (identifier.includes("@")) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(identifier.trim())) {
        setErrorMessage("Introduce un correo electrónico válido.");
        return;
      }
    }
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setSubmitting(true);
      setErrorMessage("");

      const user = await login({
        identifier: identifier.trim().toLowerCase(),
        password,
      });
      setSuccessMessage("Inicio de sesión exitoso. Redirigiendo...");

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1200);
      });

      redirectByRole(user);
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.error?.message ?? error.response?.data?.message;
      setSuccessMessage("");
      const status = error.response?.status;

      if (status === 400 || status === 401 || status === 403) {
        setErrorMessage("El correo, usuario o contraseña son incorrectos.");
      } else {
        setErrorMessage(
          backendMessage ?? "No se pudo iniciar sesión. Inténtalo nuevamente."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.lottieContainer}>
            {LOGIN_ANIMATION ? (
              <LottieView
                source={LOGIN_ANIMATION}
                autoPlay
                loop
                style={styles.lottie}
              />
            ) : (
              <View style={styles.lottiePlaceholder}>
                <Ionicons name="restaurant-outline" size={55} color="#7657D5" />

                <Text style={styles.lottieText}>Espacio para Lottie</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>¡Bienvenido!</Text>

          <Text style={styles.subtitle}>
            Inicia sesión para continuar y disfrutar de todos nuestros
            servicios.
          </Text>

          <FormInput
            icon="person-outline"
            placeholder="Correo o nombre de usuario"
            value={identifier}
            onChangeText={(value) => {
              setIdentifier(value);
              clearMessages();
            }}
            autoCapitalize="none"
            keyboardType="email-address"
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
            rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowPassword((current) => !current)}
            onSubmitEditing={handleLogin}
          />

          <Pressable style={styles.forgotButton}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <FormFeedback type="error" message={errorMessage} />

          <FormFeedback type="success" message={successMessage} />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && !submitting && styles.buttonPressed,
              submitting && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={submitting}
          >
            <LinearGradient
              colors={["#7657D5", "#55BDEB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {submitting ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.buttonText}>Ingresando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={21} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Ingresar</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.registerRow}>
            <Text style={styles.registerQuestion}>
              ¿Todavía no tienes una cuenta?
            </Text>

            <Link href="/register" style={styles.link}>
              Regístrate
            </Link>
          </View>

          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#7657D5" />

            <Text style={styles.backText}>Volver al inicio</Text>
          </Pressable>
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
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
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
  keyboardType = "default",
  autoCapitalize = "sentences",
  rightIcon,
  onRightIconPress,
  onSubmitEditing,
}: FormInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[styles.inputContainer, focused && styles.inputContainerFocused]}
    >
      {!value ? (
        <Ionicons
          name={icon}
          size={21}
          color={focused ? "#7657D5" : "#9995A8"}
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
        // Propiedades añadidas para evitar el autocompletado nativo y el fondo amarillo:
        autoComplete="off"
        importantForAutofill="no"
        returnKeyType={secureTextEntry ? "done" : "next"}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {rightIcon && onRightIconPress ? (
        <Pressable style={styles.visibilityButton} onPress={onRightIconPress}>
          <Ionicons name={rightIcon} size={21} color="#7657D5" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F4FC" },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 35,
    backgroundColor: "#F5F4FC",
  },
  formCard: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 8px 24px rgba(80, 65, 130, 0.12)",
  },
  lottieContainer: {
    width: "100%",
    height: 170,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: { width: 180, height: 180 },
  lottiePlaceholder: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CFC5F2",
    borderRadius: 75,
    backgroundColor: "#F4F1FD",
    alignItems: "center",
    justifyContent: "center",
  },
  lottieText: { marginTop: 8, fontSize: 12, color: "#8B7CBF" },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#27233A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 25,
    fontSize: 14,
    lineHeight: 21,
    color: "#777487",
    textAlign: "center",
  },
  inputContainer: {
    minHeight: 54,
    marginBottom: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#DDD8EB",
    borderRadius: 14,
    backgroundColor: "#FBFAFE",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputContainerFocused: { borderColor: "#7657D5", backgroundColor: "#F9F7FF" },
  input: {
    flex: 1,
    height: 52,
    paddingVertical: 0,
    fontSize: 15,
    color: "#0d091b",
  },
  visibilityButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotButton: { alignSelf: "flex-end", marginTop: -3, marginBottom: 15 },
  forgotText: { fontSize: 13, fontWeight: "600", color: "#7657D5" },
  errorBar: {
    width: "100%",
    marginBottom: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#D94F68",
    borderRadius: 10,
    backgroundColor: "#FFF0F3",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#A52F47",
  },
  button: { width: "100%", height: 54, borderRadius: 14, overflow: "hidden" },
  buttonGradient: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  registerRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  registerQuestion: { fontSize: 14, color: "#777487" },
  link: { fontSize: 14, fontWeight: "700", color: "#7657D5" },
  backButton: {
    marginTop: 20,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backText: { fontSize: 14, fontWeight: "600", color: "#7657D5" },
});