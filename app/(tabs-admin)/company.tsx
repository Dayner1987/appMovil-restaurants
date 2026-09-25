import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import DashboardNavbar from '@/components/DashboardNavbar';
import { useCompany } from '@/hooks/useCompany';
import { api } from '@/services/api';

function getImageUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith('http')) {
    return url;
  }

  const baseUrl = api.defaults.baseURL
    ?.replace(/\/api\/?$/, '');

  return `${baseUrl}${url}`;
}

export default function AdminCompanyScreen() {
  const {
    companies,
    loading,
    error,
    loadCompanies,
  } = useCompany({
    autoLoad: true,
    query: {
      page: 1,
      pageSize: 1,
    },
  });

  const company = companies[0];

  if (loading && !company) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={['top']}
      >
        <DashboardNavbar title="Empresa" />

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

  if (!company) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={['top']}
      >
        <DashboardNavbar title="Empresa" />

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="business-outline"
            size={54}
            color="#B65D51"
          />

          <Text className="mt-4 text-center text-[15px] text-[#B65D51]">
            {error || 'No se encontró la información de la empresa.'}
          </Text>

          <Pressable
            onPress={() =>
              void loadCompanies({
                page: 1,
                pageSize: 1,
              })
            }
            className="mt-5 rounded-[16px] bg-[#20251B] px-6 py-3"
          >
            <Text className="font-extrabold text-white">
              Reintentar
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const logoUrl = getImageUrl(company.logoImg?.url);

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={['top']}
    >
      <DashboardNavbar title="Empresa" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="w-full self-center px-4 py-5 web:max-w-[700px]">
          <View className="mb-5">
            <Text className="text-[24px] font-extrabold text-[#252A20]">
              Información de la empresa
            </Text>

            <Text className="mt-1 text-[13px] text-[#858A7A]">
              Datos principales del propietario del sistema
            </Text>
          </View>

          <View className="rounded-[24px] border border-[#E9EBE3] bg-white p-5">
            <View className="items-center">
              {logoUrl ? (
                <Image
                  source={{ uri: logoUrl }}
                  className="h-[120px] w-[120px] rounded-[26px]"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-[120px] w-[120px] items-center justify-center rounded-[26px] bg-[#EEF1E7]">
                  <Ionicons
                    name="business-outline"
                    size={48}
                    color="#7B9646"
                  />
                </View>
              )}

              <Text className="mt-4 text-[22px] font-extrabold text-[#252A20]">
                {company.name}
              </Text>

              <Text className="mt-1 text-[13px] text-[#858A7A]">
                Información general
              </Text>
            </View>

            <View className="mt-6 gap-4">
              <InfoRow
                icon="mail-outline"
                label="Correo electrónico"
                value={company.email}
              />

              <InfoRow
                icon="call-outline"
                label="Número telefónico"
                value={company.number}
              />

              <InfoRow
                icon="link-outline"
                label="Enlace adicional"
                value={
                  company.aditionalLink || 'No registrado'
                }
              />
            </View>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/others/EditCompany',
                  params: {
                    documentId: company.documentId,
                  },
                })
              }
              className="mt-7 flex-row items-center justify-center rounded-[17px] bg-[#7B9646] px-5 py-4 active:opacity-80"
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text className="ml-2 font-extrabold text-white">
                Editar información
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center rounded-[17px] bg-[#F7F8F2] p-4">
      <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#E8EEDC]">
        <Ionicons
          name={icon}
          size={19}
          color="#627A36"
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[11px] font-bold text-[#858A7A]">
          {label}
        </Text>

        <Text
          numberOfLines={2}
          className="mt-1 text-[14px] font-semibold text-[#30352A]"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}