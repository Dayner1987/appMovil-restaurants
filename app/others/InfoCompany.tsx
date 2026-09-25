// app/others/InfoCompany.tsx

import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  useLocalSearchParams,
} from 'expo-router';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import DashboardNavbar from '@/components/DashboardNavbar';

import {
  useCompany,
} from '@/hooks/useCompany';

import {
  api,
} from '@/services/api';

import type {
  Company,
} from '@/types/company.types';

type CompanyInfo =
  Company & {
    name?: string | null;

    companyName?:
      | string
      | null;

    email?:
      | string
      | null;

    phone?:
      | string
      | null;

    address?:
      | string
      | null;

    nit?:
      | string
      | null;

    description?:
      | string
      | null;

    website?:
      | string
      | null;

    status?:
      | string
      | null;

    createdAt?:
      | string
      | null;

    updatedAt?:
      | string
      | null;

    logo?:
      | {
          url?:
            | string
            | null;
        }
      | null;
  };

function getMediaUrl(
  url?:
    | string
    | null
) {
  if (!url) {
    return null;
  }

  if (
    url.startsWith(
      'http://'
    ) ||
    url.startsWith(
      'https://'
    )
  ) {
    return url;
  }

  const baseUrl =
    String(
      api.defaults
        .baseURL ?? ''
    ).replace(
      /\/$/,
      ''
    );

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}${
    url.startsWith('/')
      ? url
      : `/${url}`
  }`;
}

function formatDate(
  value?:
    | string
    | null
) {
  if (!value) {
    return 'No disponible';
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    'es-BO',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  );
}

function formatStatus(
  status?:
    | string
    | null
) {
  if (!status) {
    return 'Activa';
  }

  const normalized =
    status.toLowerCase();

  if (
    normalized ===
      'active' ||
    normalized ===
      'activo' ||
    normalized ===
      'activa'
  ) {
    return 'Activa';
  }

  if (
    normalized ===
      'inactive' ||
    normalized ===
      'inactivo' ||
    normalized ===
      'inactiva'
  ) {
    return 'Inactiva';
  }

  return status;
}

export default function InfoCompanyScreen() {
  const params =
    useLocalSearchParams<{
      documentId?:
        string;
    }>();

  const documentId =
    Array.isArray(
      params.documentId
    )
      ? params.documentId[0]
      : params.documentId;

  const {
    company,
    companies,
    loading,
    error,
  } = useCompany({
    documentId,

    autoLoad: true,

    query:
      documentId
        ? undefined
        : {
            page: 1,
            pageSize: 1,
          },
  });

  const selectedCompany =
    (
      company ??
      companies[0] ??
      null
    ) as
      | CompanyInfo
      | null;

  if (
    loading &&
    !selectedCompany
  ) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={[
          'top',
        ]}
      >
        <DashboardNavbar
          title="Compañía"
        />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#7B9646"
          />

          <Text className="mt-4 text-[13px] text-[#858A7A]">
            Cargando información...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    !selectedCompany
  ) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={[
          'top',
        ]}
      >
        <DashboardNavbar
          title="Compañía"
        />

        <View className="flex-1 items-center justify-center px-6">
          <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#FBEAE6]">
            <Ionicons
              name="business-outline"
              size={28}
              color="#B65D51"
            />
          </View>

          <Text className="mt-4 text-center text-[16px] font-extrabold text-[#252A20]">
            No se pudo cargar la compañía
          </Text>

          <Text className="mt-2 text-center text-[13px] leading-5 text-[#858A7A]">
            {error ||
              'No existe información registrada.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const companyName =
    selectedCompany
      .name?.trim() ||
    selectedCompany
      .companyName?.trim() ||
    'Mi empresa';

  const logoUrl =
    getMediaUrl(
      selectedCompany
        .logo?.url
    );

  const status =
    formatStatus(
      selectedCompany
        .status
    );

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={[
        'top',
      ]}
    >
      <DashboardNavbar
        title="Compañía"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom:
            45,
        }}
      >
        <View className="w-full self-center px-4 py-5 web:max-w-[760px]">
          {/* =========================================== */}
          {/* HERO */}
          {/* =========================================== */}

          <View className="overflow-hidden rounded-[28px] bg-[#171A15]">
            <View className="items-center px-5 pb-7 pt-7">
              {logoUrl ? (
                <Image
                  source={{
                    uri:
                      logoUrl,
                  }}
                  resizeMode="cover"
                  className="h-28 w-28 rounded-[30px] border-4 border-[#7B9646] bg-white"
                />
              ) : (
                <View className="h-28 w-28 items-center justify-center rounded-[30px] bg-[#7B9646]">
                  <Ionicons
                    name="business-outline"
                    size={46}
                    color="#FFFFFF"
                  />
                </View>
              )}

              <Text className="mt-5 text-center text-[24px] font-extrabold text-white">
                {companyName}
              </Text>

              {selectedCompany
                .description ? (
                <Text className="mt-2 max-w-[520px] text-center text-[13px] leading-5 text-[#BDC4B6]">
                  {
                    selectedCompany.description
                  }
                </Text>
              ) : (
                <Text className="mt-2 text-center text-[13px] text-[#BDC4B6]">
                  Información general de la compañía
                </Text>
              )}

              <View className="mt-4 flex-row items-center rounded-full bg-[#283020] px-4 py-2">
                <View className="mr-2 h-2 w-2 rounded-full bg-[#A8C56C]" />

                <Text className="text-[11px] font-extrabold text-[#D9E5C2]">
                  {status}
                </Text>
              </View>
            </View>
          </View>

          {/* =========================================== */}
          {/* RESUMEN */}
          {/* =========================================== */}

          <View className="mt-5 flex-row gap-3">
            <SummaryCard
              icon="business-outline"
              value="Empresa"
              label="Tipo de cuenta"
              color="green"
            />

            <SummaryCard
              icon="shield-checkmark-outline"
              value="Protegida"
              label="Administración"
              color="orange"
            />
          </View>

          {/* =========================================== */}
          {/* INFORMACIÓN DE CONTACTO */}
          {/* =========================================== */}

          <View className="mt-5 rounded-[26px] border border-[#E5E8DE] bg-white p-5">
            <SectionHeader
              icon="information-circle-outline"
              title="Información general"
              subtitle="Datos registrados de la compañía"
            />

            <View className="mt-5 gap-3">
              <InfoRow
                icon="business-outline"
                label="Nombre"
                value={
                  companyName
                }
              />

              <InfoRow
                icon="mail-outline"
                label="Correo electrónico"
                value={
                  selectedCompany
                    .email ||
                  'No registrado'
                }
              />

              <InfoRow
                icon="call-outline"
                label="Teléfono"
                value={
                  selectedCompany
                    .phone ||
                  'No registrado'
                }
              />

              <InfoRow
                icon="location-outline"
                label="Dirección"
                value={
                  selectedCompany
                    .address ||
                  'No registrada'
                }
              />

              <InfoRow
                icon="document-text-outline"
                label="NIT"
                value={
                  selectedCompany
                    .nit ||
                  'No registrado'
                }
              />

              {selectedCompany
                .website ? (
                <InfoRow
                  icon="globe-outline"
                  label="Sitio web"
                  value={
                    selectedCompany.website
                  }
                />
              ) : null}
            </View>
          </View>

          {/* =========================================== */}
          {/* INFORMACIÓN DEL SISTEMA */}
          {/* =========================================== */}

          <View className="mt-5 rounded-[26px] border border-[#E5E8DE] bg-white p-5">
            <SectionHeader
              icon="server-outline"
              title="Información del sistema"
              subtitle="Datos de registro y control"
            />

            <View className="mt-5 gap-3">
              <InfoRow
                icon="key-outline"
                label="Document ID"
                value={
                  selectedCompany
                    .documentId ||
                  'No disponible'
                }
              />

              <InfoRow
                icon="calendar-outline"
                label="Fecha de registro"
                value={formatDate(
                  selectedCompany
                    .createdAt
                )}
              />

              <InfoRow
                icon="time-outline"
                label="Última actualización"
                value={formatDate(
                  selectedCompany
                    .updatedAt
                )}
              />
            </View>
          </View>

          {/* =========================================== */}
          {/* BLOQUE INSTITUCIONAL ESTÁTICO */}
          {/* =========================================== */}

          <View className="mt-5 rounded-[26px] bg-[#EEF3E3] p-5">
            <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-[#7B9646]">
              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color="#FFFFFF"
              />
            </View>

            <Text className="mt-4 text-[17px] font-extrabold text-[#252A20]">
              Gestión empresarial
            </Text>

            <Text className="mt-2 text-[12px] leading-5 text-[#69705F]">
              La información mostrada forma parte del
              sistema administrativo y está destinada al
              control interno de la plataforma.
            </Text>

            <View className="mt-4 flex-row items-center">
              <Ionicons
                name="lock-closed-outline"
                size={15}
                color="#6F8C3E"
              />

              <Text className="ml-2 flex-1 text-[11px] font-semibold text-[#60704C]">
                Información protegida y de acceso
                administrativo.
              </Text>
            </View>
          </View>

          {/* =========================================== */}
          {/* FOOTER */}
          {/* =========================================== */}

          <View className="items-center px-5 pb-3 pt-8">
            <Ionicons
              name="restaurant-outline"
              size={22}
              color="#7B9646"
            />

            <Text className="mt-3 text-center text-[11px] font-bold text-[#5F6657]">
              {companyName}
            </Text>

            <Text className="mt-1 text-center text-[10px] text-[#979D8D]">
              © 2026 Todos los derechos reservados
            </Text>

            <Text className="mt-1 text-center text-[9px] text-[#A8AD9F]">
              Sistema móvil de restaurantes
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SectionHeaderProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  title: string;

  subtitle: string;
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-center">
      <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#EEF3E3]">
        <Ionicons
          name={icon}
          size={21}
          color="#6F8C3E"
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-extrabold text-[#252A20]">
          {title}
        </Text>

        <Text className="mt-0.5 text-[11px] text-[#8A9080]">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

interface InfoRowProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;
}

function InfoRow({
  icon,
  label,
  value,
}: InfoRowProps) {
  return (
    <View className="flex-row items-center rounded-[18px] bg-[#F7F8F2] p-3.5">
      <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-white">
        <Ionicons
          name={icon}
          size={19}
          color="#7B9646"
        />
      </View>

      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-[10px] font-semibold uppercase tracking-wide text-[#989E8F]">
          {label}
        </Text>

        <Text className="mt-1 text-[13px] font-bold text-[#30352A]">
          {value}
        </Text>
      </View>
    </View>
  );
}

interface SummaryCardProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  value: string;

  label: string;

  color:
    | 'green'
    | 'orange';
}

function SummaryCard({
  icon,
  value,
  label,
  color,
}: SummaryCardProps) {
  const green =
    color ===
    'green';

  return (
    <View
      className={
        green
          ? 'flex-1 rounded-[22px] bg-[#EEF3E3] p-4'
          : 'flex-1 rounded-[22px] bg-[#FFF0DD] p-4'
      }
    >
      <View
        className={
          green
            ? 'h-10 w-10 items-center justify-center rounded-[14px] bg-[#DDE9C5]'
            : 'h-10 w-10 items-center justify-center rounded-[14px] bg-[#FFE1B9]'
        }
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            green
              ? '#6F8C3E'
              : '#D47A24'
          }
        />
      </View>

      <Text className="mt-3 text-[14px] font-extrabold text-[#252A20]">
        {value}
      </Text>

      <Text className="mt-1 text-[10px] text-[#858A7A]">
        {label}
      </Text>
    </View>
  );
}