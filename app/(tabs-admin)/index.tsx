import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import DashboardNavbar from '@/components/DashboardNavbar';
import { useRestaurantApplication } from '@/hooks/useRestaurantApplication';

export default function AdminHomeScreen() {
  const router = useRouter();

  const {
    applications,
    loading,
    error,
    loadApplications,
  } = useRestaurantApplication({
    autoLoad: false,
  });

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  return (
    <View style={styles.container}>
      <DashboardNavbar title="Administración" />

      <View style={styles.header}>
        <Text style={styles.title}>Solicitudes de restaurantes</Text>
        <Text style={styles.subtitle}>
          Revisa y administra las solicitudes recibidas.
        </Text>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7657D5" />
          <Text style={styles.loadingText}>
            Cargando solicitudes...
          </Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.messageBox}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => void loadApplications()}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={applications}
          keyExtractor={(item) =>
            item.documentId || String(item.id)
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => void loadApplications()}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                No existen solicitudes
              </Text>
              <Text style={styles.emptyText}>
                Las nuevas solicitudes aparecerán aquí.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const applicantName =
              [
                item.applicant?.firstName,
                item.applicant?.lastName,
              ]
                .filter(Boolean)
                .join(' ') ||
              item.applicant?.username ||
              'Propietario sin nombre';

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname: '../others/RestaurantSol',
                    params: {
                      documentId: item.documentId,
                    },
                  })
                }
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>🍽️</Text>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.restaurantName}>
                    {item.proposedRestaurantName}
                  </Text>

                  <Text style={styles.owner}>
                    Propietario: {applicantName}
                  </Text>

                  <Text
                    style={[
                      styles.status,
                      item.status === 'approved' &&
                        styles.approved,
                      item.status === 'rejected' &&
                        styles.rejected,
                    ]}
                  >
                    {item.status === 'pending'
                      ? 'Pendiente'
                      : item.status === 'approved'
                        ? 'Aprobado'
                        : 'Rechazado'}
                  </Text>
                </View>

                <Text style={styles.arrow}>›</Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#292638',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#7D788A',
  },
  list: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  card: {
    minHeight: 100,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F0ECFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  icon: {
    fontSize: 25,
  },
  cardContent: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#343143',
  },
  owner: {
    marginTop: 5,
    fontSize: 13,
    color: '#858191',
  },
  status: {
    marginTop: 7,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF3D6',
    color: '#A56A00',
    fontSize: 11,
    fontWeight: '700',
  },
  approved: {
    backgroundColor: '#DDF7E8',
    color: '#16834B',
  },
  rejected: {
    backgroundColor: '#FFE1E1',
    color: '#C0392B',
  },
  arrow: {
    marginLeft: 10,
    fontSize: 30,
    color: '#AAA6B7',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7D788A',
  },
  messageBox: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#C0392B',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#7657D5',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#343143',
  },
  emptyText: {
    marginTop: 8,
    color: '#858191',
  },
});