//app/(tabs-admin)/indexAd.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function AdminHomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <DashboardNavbar title="Administración" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>
          Panel del administrador
        </Text>

        <Text style={styles.description}>
          Administra los usuarios, restaurantes y actividades de la
          plataforma.
        </Text>

        <View style={styles.cards}>
          <DashboardCard
            icon="people-outline"
            title="Usuarios"
            value="Administrar"
          />

          <DashboardCard
            icon="restaurant-outline"
            title="Restaurantes"
            value="Supervisar"
          />

          <DashboardCard
            icon="stats-chart-outline"
            title="Actividad"
            value="Ver resumen"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DashboardCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
}

function DashboardCard({
  icon,
  title,
  value,
}: DashboardCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={25} color="#7657D5" />
      </View>

      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color="#AAA6B7"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7FC',
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  welcome: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: '800',
    color: '#292638',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#7D788A',
  },
  cards: {
    marginTop: 25,
    gap: 12,
  },
  card: {
    minHeight: 88,
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
    marginRight: 13,
    borderRadius: 15,
    backgroundColor: '#F0ECFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343143',
  },
  cardValue: {
    marginTop: 4,
    fontSize: 13,
    color: '#858191',
  },
});