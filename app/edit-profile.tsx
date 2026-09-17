import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/hooks/useAuth';

export default function EditProfileScreen() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setUsername(user.username);
  }, [user]);

  async function handleSave() {
    if (!username.trim()) {
      Alert.alert(
        'Campo obligatorio',
        'El nombre de usuario es obligatorio.'
      );
      return;
    }

    try {
      setSaving(true);

      // Posteriormente conectaremos aquí el endpoint:
      // PUT /api/users/:id

      Alert.alert(
        'Perfil',
        'La pantalla funciona correctamente. Ahora falta conectar la actualización con Strapi.',
        [
          {
            text: 'Aceptar',
            onPress: () => router.back(),
          },
        ]
      );
    } catch {
      Alert.alert(
        'Error',
        'No se pudo actualizar la información.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color="#343143"
            />
          </Pressable>

          <Text style={styles.headerTitle}>Editar perfil</Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(firstName || username).charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.changePhotoText}>
            Foto de perfil próximamente
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nombre</Text>

            <TextInput
              style={styles.input}
              placeholder="Ingresa tu nombre"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={styles.label}>Apellido</Text>

            <TextInput
              style={styles.input}
              placeholder="Ingresa tu apellido"
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={styles.label}>Nombre de usuario</Text>

            <TextInput
              style={styles.input}
              placeholder="Ingresa tu usuario"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.label}>Correo electrónico</Text>

            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{user.email}</Text>

              <Ionicons
                name="lock-closed-outline"
                size={17}
                color="#A29EAD"
              />
            </View>

            <Text style={styles.helpText}>
              Por seguridad, el correo no puede modificarse desde
              esta pantalla.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.buttonPressed,
                saving && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text style={styles.saveButtonText}>
                    Guardar cambios
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    minHeight: 67,
    paddingHorizontal: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEDF5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1EEFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#302D3E',
  },
  headerSpace: {
    width: 42,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#F8F7FC',
    alignItems: 'center',
  },
  avatar: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: '#7657D5',
    borderWidth: 5,
    borderColor: '#E4DDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  changePhotoText: {
    marginTop: 10,
    fontSize: 13,
    color: '#898495',
  },
  form: {
    width: '100%',
    marginTop: 27,
  },
  label: {
    marginBottom: 7,
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4657',
  },
  input: {
    minHeight: 53,
    marginBottom: 17,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#DCD7E7',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  disabledInput: {
    marginBottom: 5,
    backgroundColor: '#F0EEF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledText: {
    flex: 1,
    fontSize: 14,
    color: '#817D8B',
  },
  helpText: {
    marginBottom: 24,
    fontSize: 12,
    lineHeight: 17,
    color: '#9691A0',
  },
  saveButton: {
    minHeight: 53,
    borderRadius: 13,
    backgroundColor: '#7657D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});