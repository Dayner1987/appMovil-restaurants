import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';

interface DashboardNavbarProps {
  title?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export default function DashboardNavbar({
  title = 'Mi aplicación',
}: DashboardNavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const translateX = useRef(
    new Animated.Value(-DRAWER_WIDTH)
  ).current;

  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(' ');

  const displayedName =
    fullName || user?.username || 'Invitado';

  const displayedEmail =
    user?.email || 'Inicia sesión para ver tu perfil';

  const displayedRole =
    user?.role?.name || (isAuthenticated ? 'Cliente' : 'Visitante');

  const avatarLetter = displayedName.charAt(0).toUpperCase();

  function openDrawer() {
    setDrawerVisible(true);

    Animated.timing(translateX, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function closeDrawer(callback?: () => void) {
    Animated.timing(translateX, {
      toValue: -DRAWER_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
      callback?.();
    });
  }

  function handleEditProfile() {
    closeDrawer(() => {
      router.push('/edit-profile');
    });
  }

  function handleLogin() {
    closeDrawer(() => {
      router.push('/login');
    });
  }

  function handleRegister() {
    closeDrawer(() => {
      router.push('/register');
    });
  }

  async function performLogout() {
  try {
    // Cerramos primero el menú lateral.
    closeDrawer();

    // Eliminamos JWT y usuario guardado.
    await logout();

    // Regresamos al inicio público.
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
}

function handleLogout() {
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
}
  return (
    <>
      <View style={styles.navbar}>
        <Pressable
          style={({ pressed }) => [
            styles.avatarButton,
            pressed && styles.pressed,
          ]}
          onPress={openDrawer}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {avatarLetter}
            </Text>
          </View>

          <View style={styles.userSummary}>
            <Text style={styles.welcomeText}>
              {isAuthenticated ? 'Hola,' : 'Bienvenido'}
            </Text>

            <Text style={styles.userName} numberOfLines={1}>
              {displayedName}
            </Text>
          </View>
        </Pressable>

        <Text style={styles.navbarTitle} numberOfLines={1}>
          {title}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={23}
            color="#554D70"
          />

          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => closeDrawer()}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.overlay}
            onPress={() => closeDrawer()}
          />

          <Animated.View
            style={[
              styles.drawer,
              {
                width: DRAWER_WIDTH,
                transform: [{ translateX }],
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Pressable
                style={styles.closeButton}
                onPress={() => closeDrawer()}
              >
                <Ionicons
                  name="close-outline"
                  size={27}
                  color="#FFFFFF"
                />
              </Pressable>

              <View style={styles.largeAvatar}>
                <Text style={styles.largeAvatarText}>
                  {avatarLetter}
                </Text>
              </View>

              <Text style={styles.drawerName}>
                {displayedName}
              </Text>

              <Text style={styles.drawerEmail} numberOfLines={1}>
                {displayedEmail}
              </Text>

              <View style={styles.roleBadge}>
                <Ionicons
                  name={
                    isAuthenticated
                      ? 'shield-checkmark-outline'
                      : 'person-outline'
                  }
                  size={16}
                  color="#6548BE"
                />

                <Text style={styles.roleText}>
                  {displayedRole}
                </Text>
              </View>
            </View>

            <View style={styles.drawerBody}>
              {isAuthenticated ? (
                <>
                  <DrawerOption
                    icon="person-circle-outline"
                    title="Mi perfil"
                    description="Consulta la información de tu cuenta"
                    onPress={() => closeDrawer()}
                  />

                  <DrawerOption
                    icon="create-outline"
                    title="Editar perfil"
                    description="Modifica tus datos personales"
                    onPress={handleEditProfile}
                  />

                  <View style={styles.separator} />

                  <DrawerOption
                    icon="log-out-outline"
                    title="Cerrar sesión"
                    description="Salir de la cuenta actual"
                    danger
                    onPress={handleLogout}
                  />
                </>
              ) : (
                <>
                  <DrawerOption
                    icon="log-in-outline"
                    title="Iniciar sesión"
                    description="Ingresa con tu cuenta"
                    onPress={handleLogin}
                  />

                  <DrawerOption
                    icon="person-add-outline"
                    title="Crear una cuenta"
                    description="Regístrate como cliente"
                    onPress={handleRegister}
                  />
                </>
              )}
            </View>

            <View style={styles.drawerFooter}>
              <Text style={styles.footerText}>
                Sistema móvil de restaurantes
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

interface DrawerOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  danger?: boolean;
  onPress: () => void;
}

function DrawerOption({
  icon,
  title,
  description,
  danger = false,
  onPress,
}: DrawerOptionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.drawerOption,
        pressed && styles.optionPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.optionIcon,
          danger && styles.dangerIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={danger ? '#D94F68' : '#7657D5'}
        />
      </View>

      <View style={styles.optionContent}>
        <Text
          style={[
            styles.optionTitle,
            danger && styles.dangerText,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.optionDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={19}
        color="#AAA6B7"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navbar: {
    minHeight: 70,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEDF5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    maxWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#7657D5',
    borderWidth: 3,
    borderColor: '#E8E2FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userSummary: {
    marginLeft: 9,
    flexShrink: 1,
  },
  welcomeText: {
    fontSize: 11,
    color: '#8C879B',
  },
  userName: {
    marginTop: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#302D3E',
  },
  navbarTitle: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#302D3E',
    textAlign: 'center',
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F3F0FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#55BDEB',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  pressed: {
    opacity: 0.78,
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 19, 31, 0.48)',
  },
  drawer: {
    height: '100%',
    backgroundColor: '#F8F7FC',
    shadowColor: '#000000',
    shadowOffset: {
      width: 5,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 16,
  },
  drawerHeader: {
    paddingTop: 55,
    paddingHorizontal: 24,
    paddingBottom: 26,
    backgroundColor: '#7657D5',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 47,
    right: 17,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#9F8AE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeAvatarText: {
    fontSize: 37,
    fontWeight: '800',
    color: '#7657D5',
  },
  drawerName: {
    marginTop: 14,
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  drawerEmail: {
    maxWidth: '90%',
    marginTop: 4,
    fontSize: 13,
    color: '#E8E2FA',
  },
  roleBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6548BE',
  },
  drawerBody: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  drawerOption: {
    minHeight: 72,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionPressed: {
    backgroundColor: '#EEEBF8',
  },
  optionIcon: {
    width: 43,
    height: 43,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: '#EDE8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: {
    backgroundColor: '#FCEAED',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#343143',
  },
  optionDescription: {
    marginTop: 3,
    fontSize: 12,
    color: '#8C879B',
  },
  dangerText: {
    color: '#D94F68',
  },
  separator: {
    height: 1,
    marginVertical: 8,
    backgroundColor: '#E7E4EE',
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E7E4EE',
  },
  footerText: {
    fontSize: 12,
    color: '#9A96A7',
    textAlign: 'center',
  },
});