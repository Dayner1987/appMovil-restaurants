
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';
import { companyService } from '@/services/company.service';
import type { Company } from '@/types/company.types';
import { mediaUrl } from '@/utils/media';
import { COCHASTORE_PUBLIC_INFO } from '@/config/cochastore-info';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
}) {
  if (!value?.trim()) return null;

  return (
    <View className="flex-row items-start gap-3 border-b border-[#EEF1EC] py-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2E9]">
        <Ionicons name={icon} size={18} color="#2F6A46" />
      </View>

      <View className="flex-1">
        <Text className="text-xs font-semibold text-[#879287]">
          {label}
        </Text>

        <Text className="mt-1 text-sm font-bold text-[#2B3B2E]">
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function CochaStoreInfoScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await companyService.findAll({
        page: 1,
        pageSize: 1,
        sort: 'createdAt:desc',
      });

      setCompany(response.data?.[0] ?? null);
    } catch {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const logo = mediaUrl(company?.logoImg);
  const name =
    company?.name?.trim() || COCHASTORE_PUBLIC_INFO.brandName;

  const year = new Date().getFullYear();

  return (
    <View className="flex-1 bg-[#F7F8F2]">

      <DashboardNavbar title="Acerca de CochaStore" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 45,
        }}
      >

        {/* BOTÓN REGRESAR */}
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Regresar a la pantalla anterior"
          className="mb-5 self-start flex-row items-center gap-2 rounded-2xl border border-[#E4EAE1] bg-white px-4 py-3 active:opacity-70"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#2F6A46"
          />

          <Text className="text-sm font-bold text-[#2F6A46]">
            Volver
          </Text>
        </Pressable>

        {/* PRESENTACIÓN DE COCHASTORE */}
        <View className="overflow-hidden rounded-[30px] bg-[#1D2A20] px-6 py-8">

          <View className="items-center">

            <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] border border-[#57765C] bg-white">

              {logo ? (
                <Image
                  source={{ uri: logo }}
                  resizeMode="contain"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Ionicons
                  name="storefront"
                  size={48}
                  color="#2F6A46"
                />
              )}

            </View>

            <Text className="mt-5 text-center text-3xl font-extrabold text-white">
              {name}
            </Text>

            <Text className="mt-2 text-center text-sm leading-6 text-[#D2DED0]">
              {COCHASTORE_PUBLIC_INFO.description}
            </Text>

          </View>
        </View>

        {/* INFORMACIÓN EMPRESARIAL */}
        <View className="mt-5 rounded-[26px] border border-[#E4EAE1] bg-white p-5">

          <View className="mb-2 flex-row items-center gap-2">

            <Ionicons
              name="business-outline"
              size={21}
              color="#2F6A46"
            />

            <Text className="text-lg font-extrabold text-[#26382A]">
              Información de la empresa
            </Text>

          </View>

          {loading ? (
            <View className="py-5">
              <ActivityIndicator color="#2F6A46" />

              <Text className="mt-2 text-center text-xs text-[#849084]">
                Cargando información...
              </Text>
            </View>
          ) : (
            <>
              <InfoRow
                icon="business-outline"
                label="Nombre comercial"
                value={name}
              />

              <InfoRow
                icon="mail-outline"
                label="Correo electrónico"
                value={company?.email}
              />

              <InfoRow
                icon="call-outline"
                label="Teléfono de contacto"
                value={company?.number}
              />

              <InfoRow
                icon="link-outline"
                label="Enlace oficial"
                value={company?.aditionalLink}
              />

              {!company ? (
                <Text className="py-3 text-sm leading-5 text-[#7D897E]">
                  Los datos de contacto institucional todavía no están registrados.
                </Text>
              ) : null}
            </>
          )}

        </View>

        {/* TITULARIDAD Y DERECHOS */}
        <View className="mt-4 rounded-[26px] border border-[#E4EAE1] bg-white p-5">

          <View className="flex-row items-center gap-2">

            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color="#2F6A46"
            />

            <Text className="text-lg font-extrabold text-[#26382A]">
              Titularidad y derechos
            </Text>

          </View>

          <Text className="mt-3 text-sm leading-6 text-[#718073]">
            Titular o propietario de la aplicación
          </Text>

          <Text className="mt-1 text-base font-bold text-[#2B3B2E]">
            {COCHASTORE_PUBLIC_INFO.ownerName.trim() ||
              'Información pendiente de configuración'}
          </Text>

          <View className="mt-4 rounded-2xl bg-[#F0F5EE] p-4">

            <Text className="text-center text-sm font-bold text-[#42634A]">
              © {year} {COCHASTORE_PUBLIC_INFO.brandName}.{' '}
              {COCHASTORE_PUBLIC_INFO.rightsText}
            </Text>

            <Text className="mt-2 text-center text-xs leading-5 text-[#829084]">
              El nombre, la identidad visual, el contenido y los elementos propios de la aplicación se encuentran sujetos a los derechos de sus respectivos titulares.
            </Text>

          </View>

        </View>

        {/* ACTUALIZAR INFORMACIÓN */}
        <Pressable
          onPress={() => void load()}
          disabled={loading}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-[#DCE7DA] bg-white py-4 active:opacity-70"
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#2F6A46"
          />

          <Text className="font-bold text-[#2F6A46]">
            Actualizar información
          </Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
