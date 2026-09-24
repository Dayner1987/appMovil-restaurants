// app/others/RestaurantSol.tsx

import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import DashboardNavbar from '@/components/DashboardNavbar';
import { useRestaurantApplication } from '@/hooks/useRestaurantApplication';

export default function RestaurantSolScreen() {
  const router = useRouter();

  const { documentId } =
    useLocalSearchParams<{
      documentId: string;
    }>();

  const [
    confirmVisible,
    setConfirmVisible,
  ] = useState(false);

  const [
    successVisible,
    setSuccessVisible,
  ] = useState(false);

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

  // =====================================================
  // CARGAR SOLICITUD
  // =====================================================
  useEffect(() => {
    if (!documentId) {
      return;
    }

    void loadApplication(
      documentId
    ).catch(() => undefined);
  }, [
    documentId,
    loadApplication,
  ]);

  const applicant =
    application?.applicant;

  const fullName =
    [
      applicant?.firstName,
      applicant?.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    applicant?.username ||
    'Sin nombre';

  // =====================================================
  // APROBAR SOLICITUD
  // =====================================================
  const handleApprove = async () => {
    if (!documentId) {
      return;
    }

    try {
      await approveApplication(
        documentId
      );

      setConfirmVisible(false);
      setSuccessVisible(true);
    } catch {
      setConfirmVisible(false);
    }
  };

  // =====================================================
  // CARGANDO
  // =====================================================
  if (loading) {
    return (
      <View className="flex-1 bg-[#F7F8F2]">
        <DashboardNavbar title="Solicitud" />

        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-[26px] bg-white">
            <ActivityIndicator
              size="large"
              color="#7B9646"
            />
          </View>

          <Text className="mt-5 text-[15px] font-semibold text-[#62675A]">
            Cargando información...
          </Text>

          <Text className="mt-2 text-center text-[12px] text-[#9A9E91]">
            Estamos obteniendo los datos de la solicitud.
          </Text>
        </View>
      </View>
    );
  }

  // =====================================================
  // ERROR / SIN SOLICITUD
  // =====================================================
  if (!application) {
    return (
      <View className="flex-1 bg-[#F7F8F2]">
        <DashboardNavbar title="Solicitud" />

        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-[26px] bg-[#FDEAE5]">
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color="#BF5B4C"
            />
          </View>

          <Text className="mt-5 text-[20px] font-extrabold text-[#272B20]">
            No se pudo cargar
          </Text>

          <Text className="mt-2 max-w-[320px] text-center text-[13px] leading-5 text-[#858A7A]">
            {error ||
              'No encontramos la información de esta solicitud.'}
          </Text>

          <Pressable
            onPress={() => {
              if (!documentId) {
                return;
              }

              void loadApplication(
                documentId
              ).catch(
                () => undefined
              );
            }}
            className="mt-6 flex-row items-center rounded-[18px] bg-[#1B1E18] px-6 py-3.5 active:opacity-80"
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text className="ml-2 font-extrabold text-white">
              Reintentar
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isPending =
    application.status === 'pending';

  const isApproved =
    application.status === 'approved';

  const isRejected =
    application.status === 'rejected';

  const statusLabel =
    isPending
      ? 'Pendiente'
      : isApproved
        ? 'Aprobado'
        : 'Rechazado';

  const statusIcon = isPending
    ? 'time-outline'
    : isApproved
      ? 'checkmark-circle-outline'
      : 'close-circle-outline';

  return (
    <View className="flex-1 bg-[#F7F8F2]">
      <DashboardNavbar title="Detalle de solicitud" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="w-full self-center px-4 pb-6 pt-5 web:max-w-[850px]">
          {/* ================================================= */}
          {/* CABECERA */}
          {/* ================================================= */}

          <View className="overflow-hidden rounded-[30px] bg-[#151713]">
            <LinearGradient
              colors={[
                '#11130F',
                '#1F2419',
                '#364326',
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={{
                padding: 22,
              }}
            >
              <View className="flex-row items-center">
                <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-white/10">
                  <Ionicons
                    name="restaurant-outline"
                    size={30}
                    color="#B8D36F"
                  />
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                    Solicitud de restaurante
                  </Text>

                  <Text
                    numberOfLines={2}
                    className="mt-1 text-[23px] font-extrabold leading-7 text-white"
                  >
                    {
                      application.proposedRestaurantName
                    }
                  </Text>
                </View>
              </View>

              <View
                className={`mt-5 self-start flex-row items-center rounded-full px-4 py-2 ${
                  isApproved
                    ? 'bg-[#B8D36F]'
                    : isRejected
                      ? 'bg-[#D26A5E]'
                      : 'bg-[#E19A5F]'
                }`}
              >
                <Ionicons
                  name={statusIcon}
                  size={16}
                  color={
                    isApproved
                      ? '#263116'
                      : '#FFFFFF'
                  }
                />

                <Text
                  className={`ml-2 text-[12px] font-extrabold ${
                    isApproved
                      ? 'text-[#263116]'
                      : 'text-white'
                  }`}
                >
                  {statusLabel}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* ================================================= */}
          {/* PROPIETARIO */}
          {/* ================================================= */}

          <View className="mt-5 rounded-[28px] bg-white p-5">
            <View className="mb-2 flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-[16px] bg-[#EFF6DC]">
                <Ionicons
                  name="person-outline"
                  size={21}
                  color="#789447"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[17px] font-extrabold text-[#292D22]">
                  Información del propietario
                </Text>

                <Text className="mt-0.5 text-[12px] text-[#939789]">
                  Datos del usuario solicitante
                </Text>
              </View>
            </View>

            <InfoRow
              icon="person-outline"
              label="Nombre completo"
              value={fullName}
            />

            <InfoRow
              icon="at-outline"
              label="Usuario"
              value={
                applicant?.username ||
                'No registrado'
              }
            />

            <InfoRow
              icon="mail-outline"
              label="Correo electrónico"
              value={
                applicant?.email ||
                'No registrado'
              }
            />

            <InfoRow
              icon="call-outline"
              label="Teléfono"
              value={
                applicant?.phone ||
                'No registrado'
              }
              last
            />
          </View>

          {/* ================================================= */}
          {/* INFORMACIÓN DE SOLICITUD */}
          {/* ================================================= */}

          <View className="mt-4 rounded-[28px] bg-white p-5">
            <View className="mb-2 flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-[16px] bg-[#FFF0E2]">
                <Ionicons
                  name="document-text-outline"
                  size={21}
                  color="#D58245"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[17px] font-extrabold text-[#292D22]">
                  Información de la solicitud
                </Text>

                <Text className="mt-0.5 text-[12px] text-[#939789]">
                  Estado y registro de la petición
                </Text>
              </View>
            </View>

            <InfoRow
              icon="pulse-outline"
              label="Estado actual"
              value={statusLabel}
              valueColor={
                isApproved
                  ? '#708C3E'
                  : isRejected
                    ? '#B95750'
                    : '#C6773E'
              }
            />

            <InfoRow
              icon="calendar-outline"
              label="Fecha de registro"
              value={new Date(
                application.createdAt
              ).toLocaleDateString()}
            />

            <InfoRow
              icon="chatbox-ellipses-outline"
              label="Motivo de rechazo"
              value={
                application.rejectionReason ||
                'No existe motivo de rechazo'
              }
              last
            />
          </View>

          {/* ================================================= */}
          {/* ERROR DE OPERACIÓN */}
          {/* ================================================= */}

          {error && (
            <View className="mt-4 flex-row items-start rounded-[20px] bg-[#FDEAE5] p-4">
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#B95750"
              />

              <Text className="ml-3 flex-1 text-[12px] leading-5 text-[#A94F48]">
                {error}
              </Text>
            </View>
          )}

          {/* ================================================= */}
          {/* APROBAR */}
          {/* ================================================= */}

          {isPending && (
            <View className="mt-5">
              <Pressable
                disabled={saving}
                onPress={() =>
                  setConfirmVisible(
                    true
                  )
                }
                className={`min-h-[58px] flex-row items-center justify-center rounded-[20px] bg-[#1C2118] px-6 active:opacity-80 ${
                  saving
                    ? 'opacity-50'
                    : ''
                }`}
              >
                {saving ? (
                  <ActivityIndicator
                    color="#B8D36F"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={22}
                      color="#B8D36F"
                    />

                    <Text className="ml-2 text-[15px] font-extrabold text-white">
                      Aprobar restaurante
                    </Text>
                  </>
                )}
              </Pressable>

              <View className="mt-3 flex-row items-start px-2">
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color="#969B8A"
                />

                <Text className="ml-2 flex-1 text-[11px] leading-4 text-[#969B8A]">
                  Al aprobar la solicitud se creará el restaurante y se habilitará el acceso del propietario.
                </Text>
              </View>
            </View>
          )}

          {/* ================================================= */}
          {/* SOLICITUD APROBADA */}
          {/* ================================================= */}

          {isApproved && (
            <View className="mt-5 flex-row items-center rounded-[22px] bg-[#EBF4D8] p-4">
              <View className="h-11 w-11 items-center justify-center rounded-[16px] bg-[#B8D36F]">
                <Ionicons
                  name="checkmark"
                  size={24}
                  color="#263116"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[14px] font-extrabold text-[#405425]">
                  Restaurante habilitado
                </Text>

                <Text className="mt-1 text-[11px] leading-4 text-[#6F7D58]">
                  Esta solicitud ya fue aprobada correctamente.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* =================================================== */}
      {/* MODAL DE CONFIRMACIÓN */}
      {/* =================================================== */}

      <Modal
        visible={
          confirmVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setConfirmVisible(false)
        }
      >
        <View className="flex-1 items-center justify-center bg-black/70 px-5">
          <View className="w-full max-w-[420px] rounded-[30px] bg-white p-6">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EFF6DC]">
              <Ionicons
                name="restaurant-outline"
                size={28}
                color="#789447"
              />
            </View>

            <Text className="mt-5 text-[22px] font-extrabold text-[#272B20]">
              Aprobar restaurante
            </Text>

            <Text className="mt-2 text-[13px] leading-5 text-[#808575]">
              ¿Estás seguro de aprobar la solicitud de{' '}
              <Text className="font-extrabold text-[#3C4232]">
                {
                  application.proposedRestaurantName
                }
              </Text>
              ?
            </Text>

            <View className="mt-4 rounded-[18px] bg-[#F5F7EF] p-4">
              <View className="flex-row items-start">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#789447"
                />

                <Text className="ml-2 flex-1 text-[12px] leading-5 text-[#737967]">
                  Se creará el restaurante, se asociará al propietario y su cuenta quedará habilitada.
                </Text>
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                disabled={saving}
                onPress={() =>
                  setConfirmVisible(false)
                }
                className="min-h-[52px] flex-1 items-center justify-center rounded-[18px] border border-[#DADDD2] bg-white active:opacity-70"
              >
                <Text className="font-extrabold text-[#62675A]">
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                disabled={saving}
                onPress={() =>
                  void handleApprove()
                }
                className={`min-h-[52px] flex-1 flex-row items-center justify-center rounded-[18px] bg-[#1C2118] active:opacity-80 ${
                  saving
                    ? 'opacity-50'
                    : ''
                }`}
              >
                {saving ? (
                  <ActivityIndicator
                    color="#B8D36F"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark"
                      size={19}
                      color="#B8D36F"
                    />

                    <Text className="ml-2 font-extrabold text-white">
                      Aprobar
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================== */}
      {/* MODAL DE ÉXITO */}
      {/* =================================================== */}

      <Modal
        visible={
          successVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          setSuccessVisible(
            false
          );

          router.back();
        }}
      >
        <View className="flex-1 items-center justify-center bg-black/70 px-5">
          <View className="w-full max-w-[420px] items-center rounded-[30px] bg-white p-7">
            <LinearGradient
              colors={[
                '#B8D36F',
                '#8FA94E',
              ]}
              style={{
                width: 78,
                height: 78,
                borderRadius: 26,
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}
            >
              <Ionicons
                name="checkmark"
                size={39}
                color="#263116"
              />
            </LinearGradient>

            <Text className="mt-5 text-center text-[23px] font-extrabold text-[#272B20]">
              Restaurante aprobado
            </Text>

            <Text className="mt-2 max-w-[300px] text-center text-[13px] leading-5 text-[#858A7A]">
              El restaurante fue creado correctamente y el propietario ya puede acceder al sistema.
            </Text>

            <Pressable
              onPress={() => {
                setSuccessVisible(
                  false
                );

                router.back();
              }}
              className="mt-6 min-h-[54px] w-full flex-row items-center justify-center rounded-[18px] bg-[#1C2118] active:opacity-80"
            >
              <Text className="font-extrabold text-white">
                Continuar
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#B8D36F"
                style={{
                  marginLeft: 8,
                }}
              />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =======================================================
// FILA DE INFORMACIÓN
// =======================================================

function InfoRow({
  icon,
  label,
  value,
  valueColor,
  last = false,
}: {
  icon:
    | 'person-outline'
    | 'at-outline'
    | 'mail-outline'
    | 'call-outline'
    | 'pulse-outline'
    | 'calendar-outline'
    | 'chatbox-ellipses-outline';

  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center py-4 ${
        last
          ? ''
          : 'border-b border-[#EEEFE9]'
      }`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-[13px] bg-[#F6F7F2]">
        <Ionicons
          name={icon}
          size={17}
          color="#858B78"
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[11px] font-medium text-[#9A9F91]">
          {label}
        </Text>

        <Text
          className="mt-1 text-[14px] font-bold text-[#383D31]"
          style={
            valueColor
              ? {
                  color:
                    valueColor,
                }
              : undefined
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}