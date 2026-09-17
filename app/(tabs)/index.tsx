import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function HomeClient() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.subtitle}>
              ¿Qué deseas comer hoy?
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <Ionicons
              name="notifications-outline"
              size={25}
              color="#222222"
            />
          </View>
        </View>

        <View style={styles.content}>
          <Ionicons
            name="home"
            size={70}
            color="#E53935"
          />

          <Text style={styles.title}>HomeClient</Text>

          <Text style={styles.description}>
            Esta será la página principal del cliente.
          </Text>

          <Text style={styles.description}>
            Aquí mostraremos promociones, restaurantes y productos.
          </Text>
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

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: '#777777',
  },

  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    marginTop: 16,
    fontSize: 25,
    fontWeight: '700',
    color: '#222222',
  },

  description: {
    marginTop: 8,
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
  },
});