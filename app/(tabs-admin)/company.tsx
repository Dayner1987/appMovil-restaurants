import { StyleSheet, Text, View } from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function AdminCompanyScreen() {
  return (
    <View style={styles.container}>
      <DashboardNavbar title="Empresa" />

      <View style={styles.center}>
        <Text style={styles.title}>Company</Text>
        <Text style={styles.text}>
          Este módulo estará disponible próximamente.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FC',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#292638',
  },
  text: {
    marginTop: 8,
    color: '#7D788A',
  },
});