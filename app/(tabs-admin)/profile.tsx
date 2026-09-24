import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import type { AppUser } from '@/types/user.types';

export default function ProfileScreen() {
  const {
    user,
    loading,
    isAuthenticated,
    logout,
  } = useAuth();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleRegisterRestaurant = () => {
    router.push('/registerRes');
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const performLogout = async () => {
    try {
      await logout();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);

      if (Platform.OS === 'web') {
        window.alert('No se pudo cerrar la sesión.');
      } else {
        Alert.alert(
          'Error',
          'No se pudo cerrar la sesión.'
        );
      }
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        '¿Estás seguro de que deseas cerrar tu sesión?'
      );

      if (confirmed) {
        void performLogout();
      }

      return;
    }

    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar tu sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#7657D5"
          />

          <Text style={styles.loadingText}>
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>

          <View style={styles.headerIcon}>
            <Ionicons
              name="settings-outline"
              size={21}
              color="#7657D5"
            />
          </View>
        </View>

        {isAuthenticated && user ? (
          <AuthenticatedProfile
            user={user}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
          />
        ) : (
          <GuestProfile
            onLogin={handleLogin}
            onRegister={handleRegister}
            onRegisterRestaurant={handleRegisterRestaurant}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface GuestProfileProps {
  onLogin: () => void;
  onRegister: () => void;
  onRegisterRestaurant: () => void;
}

function GuestProfile({
  onLogin,
  onRegister,
  onRegisterRestaurant,
}: GuestProfileProps) {
  return (
    <View style={styles.content}>
      <LinearGradient
        colors={['#7657D5', '#55BDEB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatarGradient}
      >
        <View style={styles.avatarInner}>
          <Ionicons
            name="person-outline"
            size={65}
            color="#7657D5"
          />
        </View>
      </LinearGradient>

      <Text style={styles.title}>¡Bienvenido!</Text>

      <Text style={styles.description}>
        Inicia sesión o crea una cuenta para realizar pedidos,
        guardar tus favoritos y administrar tu perfil.
      </Text>

      <View style={styles.features}>
        <Feature
          icon="fast-food-outline"
          text="Realiza pedidos fácilmente"
        />

        <Feature
          icon="receipt-outline"
          text="Consulta el estado de tus pedidos"
        />

        <Feature
          icon="heart-outline"
          text="Guarda tus productos favoritos"
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onLogin}
      >
        <LinearGradient
          colors={['#7657D5', '#608EE4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Ionicons
            name="log-in-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.loginButtonText}>
            Iniciar sesión
          </Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.registerButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onRegister}
      >
        <Ionicons
          name="person-add-outline"
          size={20}
          color="#7657D5"
        />

        <Text style={styles.registerButtonText}>
          Crear una cuenta
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.registerButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onRegisterRestaurant}
      >
        <Ionicons
          name="restaurant-outline"
          size={20}
          color="#7657D5"
        />

        <Text style={styles.registerButtonText}>
          Registrar tu negocio
        </Text>
      </Pressable>
    </View>
  );
}

interface AuthenticatedProfileProps {
  user: AppUser;
  onEditProfile: () => void;
  onLogout: () => void;
}

function AuthenticatedProfile({
  user,
  onEditProfile,
  onLogout,
}: AuthenticatedProfileProps) {
  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  const displayedName = fullName || user.username;

  const displayedRole =
    user.role?.name ||
    user.role?.type ||
    'Cliente';

  return (
    <View style={styles.content}>
      <LinearGradient
        colors={['#7657D5', '#55BDEB']}
        style={styles.avatarGradient}
      >
        <View style={styles.avatarInner}>
          <Text style={styles.avatarLetter}>
            {displayedName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </LinearGradient>

      <Text style={styles.title}>{displayedName}</Text>

      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.roleBadge}>
        <Ionicons
          name="shield-checkmark-outline"
          size={17}
          color="#6548BE"
        />

        <Text style={styles.roleText}>
          {displayedRole}
        </Text>
      </View>

      <View style={styles.informationCard}>
        <InformationRow
          icon="person-outline"
          label="Usuario"
          value={user.username}
        />

        <View style={styles.separator} />

        <InformationRow
          icon="mail-outline"
          label="Correo"
          value={user.email}
        />

        <View style={styles.separator} />

        <InformationRow
          icon="briefcase-outline"
          label="Rol"
          value={displayedRole}
        />

        {user.phone && (
          <>
            <View style={styles.separator} />

            <InformationRow
              icon="call-outline"
              label="Teléfono"
              value={user.phone}
            />
          </>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onEditProfile}
      >
        <LinearGradient
          colors={['#7657D5', '#608EE4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Ionicons
            name="grid-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.loginButtonText}>
            Ir a mi panel principal
          </Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#DC506A"
        />

        <Text style={styles.logoutButtonText}>
          Cerrar sesión
        </Text>
      </Pressable>
    </View>
  );
}

interface FeatureProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

function Feature({ icon, text }: FeatureProps) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#7657D5"
        />
      </View>

      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

interface InformationRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InformationRow({
  icon,
  label,
  value,
}: InformationRowProps) {
  return (
    <View style={styles.informationRow}>
      <View style={styles.informationIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#7657D5"
        />
      </View>

      <View style={styles.informationText}>
        <Text style={styles.informationLabel}>
          {label}
        </Text>

        <Text style={styles.informationValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F7F7FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#242234',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0ECFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 35,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7FC',
  },
  loadingText: {
    marginTop: 12,
    color: '#777487',
  },
  avatarGradient: {
    width: 136,
    height: 136,
    padding: 5,
    borderRadius: 68,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 63,
    backgroundColor: '#F5F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 55,
    fontWeight: '700',
    color: '#7657D5',
  },
  title: {
    marginTop: 22,
    fontSize: 26,
    fontWeight: '700',
    color: '#242234',
    textAlign: 'center',
  },
  email: {
    marginTop: 5,
    fontSize: 14,
    color: '#777487',
  },
  description: {
    marginTop: 10,
    maxWidth: 350,
    fontSize: 15,
    lineHeight: 22,
    color: '#777487',
    textAlign: 'center',
  },
  roleBadge: {
    marginTop: 13,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EDE8FC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleText: {
    color: '#6548BE',
    fontSize: 13,
    fontWeight: '700',
  },
  features: {
    width: '100%',
    marginTop: 26,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  featureRow: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 37,
    height: 37,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F0ECFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#4D4A5C',
  },
  informationCard: {
    width: '100%',
    marginTop: 26,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  informationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  informationIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F0ECFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  informationText: {
    flex: 1,
  },
  informationLabel: {
    fontSize: 12,
    color: '#9995A8',
  },
  informationValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '600',
    color: '#343143',
  },
  separator: {
    height: 1,
    marginVertical: 13,
    backgroundColor: '#EFEDF5',
  },
  loginButton: {
    width: '100%',
    marginTop: 25,
    borderRadius: 13,
    overflow: 'hidden',
  },
  buttonGradient: {
    minHeight: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  registerButton: {
    width: '100%',
    minHeight: 52,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#7657D5',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7657D5',
  },
  logoutButton: {
    width: '100%',
    minHeight: 52,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#F1A8B5',
    borderRadius: 13,
    backgroundColor: '#FFF7F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC506A',
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});