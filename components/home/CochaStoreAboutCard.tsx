
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { companyService } from '@/services/company.service';
import type { Company } from '@/types/company.types';
import { COCHASTORE_PUBLIC_INFO } from '@/config/cochastore-info';

export default function CochaStoreAboutCard() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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

  return (
    <Pressable
      onPress={() => router.push('/others/CochaStoreInfo')}
      className="mx-5 mt-7 mb-5 overflow-hidden rounded-[28px] bg-[#1D2A20] p-5 active:opacity-90"
    >
      {/* ENCABEZADO */}
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#365B40]">
          <Ionicons
            name="storefront-outline"
            size={25}
            color="#FFFFFF"
          />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-extrabold text-white">
            {company?.name || COCHASTORE_PUBLIC_INFO.brandName}
          </Text>

          <Text className="mt-1 text-xs text-[#C8D8C9]">
            Conoce nuestra empresa y plataforma
          </Text>
        </View>

        <Ionicons
          name="arrow-forward-circle"
          size={27}
          color="#D7E8C7"
        />
      </View>

      {/* DESCRIPCIÓN */}
      <Text className="mt-4 text-sm leading-6 text-[#D4DED3]">
        {COCHASTORE_PUBLIC_INFO.description}
      </Text>

      {/* CONTACTOS CENTRADOS */}
      {loading ? (
        <View className="mt-5 flex-row items-center justify-center gap-2">
          <ActivityIndicator size="small" color="#D7E8C7" />
          <Text className="text-xs text-[#C8D8C9]">
            Cargando datos institucionales...
          </Text>
        </View>
      ) : (
        <View className="mt-5 w-full items-center gap-3">

          {company?.email ? (
            <View className="w-full flex-row items-center justify-center gap-2">
              <Ionicons
                name="mail-outline"
                size={17}
                color="#D7E8C7"
              />

              <Text className="shrink text-center text-sm text-[#E1E9DE]">
                {company.email}
              </Text>
            </View>
          ) : null}

          {company?.number ? (
            <View className="w-full flex-row items-center justify-center gap-2">
              <Ionicons
                name="call-outline"
                size={17}
                color="#D7E8C7"
              />

              <Text className="text-center text-sm text-[#E1E9DE]">
                {company.number}
              </Text>
            </View>
          ) : null}

        </View>
      )}

      {/* BOTÓN CENTRADO */}
      <View className="mt-6 self-center rounded-xl bg-[#E5F0DE] px-6 py-3">
        <Text className="text-sm font-extrabold text-[#284A31]">
          Más información
        </Text>
      </View>
    </Pressable>
  );
}
