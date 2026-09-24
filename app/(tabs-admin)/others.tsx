import { StyleSheet, Text, View } from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function AdminOthersScreen() {
  return (
    <View style={styles.container}>
      <DashboardNavbar title="Others" />

      <View style={styles.center}>
        <Text style={styles.title}>Others</Text>
        <Text style={styles.text}>
          Aquí se agregarán otras funciones administrativas.
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