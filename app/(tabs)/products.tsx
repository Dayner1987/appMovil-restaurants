import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ProductsScreen() {
  const handleLogin = () => {
    console.log('Ir a iniciar sesión');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Productos</Text>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="fast-food-outline"
              size={65}
              color="#b93eb3"
            />
          </View>

          <Text style={styles.title}>Descubre nuestros productos</Text>

          <Text style={styles.description}>
            Aquí aparecerán los productos disponibles de todos los
            restaurantes.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLogin}
          >
            <Ionicons
              name="log-in-outline"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  headerTitle: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    marginTop: 22,
    fontSize: 22,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#777777',
    textAlign: 'center',
  },

  button: {
    marginTop: 28,
    minWidth: 190,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});