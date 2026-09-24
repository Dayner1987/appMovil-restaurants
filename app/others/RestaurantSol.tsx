//app/others/RestaurantSol.tsx
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import DashboardNavbar from '@/components/DashboardNavbar';
import { useRestaurantApplication } from '@/hooks/useRestaurantApplication';

export default function RestaurantSolScreen() {
  const router = useRouter();
  const { documentId } = useLocalSearchParams<{
    documentId: string;
  }>();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const {
    application,
    loading,
    saving,
    error,
    loadApplication,
    approveApplication,
  } = useRestaurantApplication({
    documentId,
    autoLoad: false,
  });

  useEffect(() => {
    if (documentId) {
      void loadApplication(documentId);
    }
  }, [documentId, loadApplication]);

  const applicant = application?.applicant;

  const fullName =
    [applicant?.firstName, applicant?.lastName]
      .filter(Boolean)
      .join(' ') ||
    applicant?.username ||
    'Sin nombre';

  const handleApprove = async () => {
    if (!documentId) {
      return;
    }

    try {
      await approveApplication(documentId);
      setConfirmVisible(false);
      setSuccessVisible(true);
    } catch {
      setConfirmVisible(false);
    }
  };

  if (loading || !application) {
    return (
      <View style={styles.container}>
        <DashboardNavbar title="Solicitud" />

        <View style={styles.center}>
          {loading && (
            <>
              <ActivityIndicator
                size="large"
                color="#7657D5"
              />
              <Text style={styles.loadingText}>
                Cargando información...
              </Text>
            </>
          )}

          {!loading && error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DashboardNavbar title="Detalle de solicitud" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>🍽️</Text>
          </View>

          <Text style={styles.restaurantName}>
            {application.proposedRestaurantName}
          </Text>

          <Text
            style={[
              styles.status,
              application.status === 'approved' &&
                styles.approved,
              application.status === 'rejected' &&
                styles.rejected,
            ]}
          >
            {application.status === 'pending'
              ? 'Pendiente de aprobación'
              : application.status === 'approved'
                ? 'Aprobado'
                : 'Rechazado'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Información del propietario
          </Text>

          <InfoRow label="Nombre completo" value={fullName} />
          <InfoRow
            label="Usuario"
            value={applicant?.username || 'No registrado'}
          />
          <InfoRow
            label="Correo"
            value={applicant?.email || 'No registrado'}
          />
          <InfoRow
            label="Teléfono"
            value={applicant?.phone || 'No registrado'}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Información de la solicitud
          </Text>

          <InfoRow
            label="Estado"
            value={application.status}
          />
          <InfoRow
            label="Fecha de registro"
            value={new Date(
              application.createdAt
            ).toLocaleDateString()}
          />
          <InfoRow
            label="Motivo de rechazo"
            value={
              application.rejectionReason ||
              'No existe motivo de rechazo'
            }
          />
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {application.status === 'pending' && (
          <Pressable
            style={({ pressed }) => [
              styles.approveButton,
              pressed && styles.buttonPressed,
              saving && styles.disabledButton,
            ]}
            disabled={saving}
            onPress={() => setConfirmVisible(true)}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.approveText}>
                Aprobar restaurante
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalEmoji}>✓</Text>
            </View>

            <Text style={styles.modalTitle}>
              ¿Estás seguro de aceptar?
            </Text>

            <Text style={styles.modalText}>
              Al aprobar esta solicitud se creará el restaurante y
              se habilitará al propietario.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={() => void handleApprove()}
              >
                <Text style={styles.confirmText}>Aceptar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSuccessVisible(false);
          router.back();
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIcon}>
              <Text style={styles.modalEmoji}>✓</Text>
            </View>

            <Text style={styles.modalTitle}>
              Restaurante aprobado
            </Text>

            <Text style={styles.modalText}>
              El restaurante fue creado correctamente en el
              sistema.
            </Text>

            <Pressable
              style={styles.confirmButtonFull}
              onPress={() => {
                setSuccessVisible(false);
                router.back();
              }}
            >
              <Text style={styles.confirmText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroIcon: {
    width: 82,
    height: 82,
    borderRadius: 27,
    backgroundColor: '#F0ECFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 40,
  },
  restaurantName: {
    marginTop: 14,
    fontSize: 25,
    fontWeight: '800',
    color: '#292638',
    textAlign: 'center',
  },
  status: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#FFF3D6',
    color: '#A56A00',
    fontSize: 12,
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
  section: {
    marginTop: 15,
    padding: 17,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 17,
    fontWeight: '800',
    color: '#343143',
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFF5',
  },
  infoLabel: {
    fontSize: 12,
    color: '#858191',
  },
  infoValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#343143',
  },
  approveButton: {
    marginTop: 22,
    minHeight: 54,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7657D5',
  },
  approveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  disabledButton: {
    opacity: 0.55,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  loadingText: {
    marginTop: 12,
    color: '#7D788A',
  },
  errorText: {
    marginTop: 15,
    color: '#C0392B',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 24, 45, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  modalIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F0ECFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#DDF7E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmoji: {
    fontSize: 30,
    color: '#7657D5',
  },
  modalTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '800',
    color: '#292638',
    textAlign: 'center',
  },
  modalText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#7D788A',
    textAlign: 'center',
  },
  modalActions: {
    width: '100%',
    marginTop: 22,
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DDD9E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#6F6A7C',
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: '#7657D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonFull: {
    width: '100%',
    minHeight: 48,
    marginTop: 22,
    borderRadius: 13,
    backgroundColor: '#7657D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});