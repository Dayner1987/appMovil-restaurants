// app/(tabs)/index.tsx

import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import DashboardNavbar from '@/components/DashboardNavbar';
import AdminHero from '@/components/admin/AdminHero';
import AdminSalesChart from '@/components/admin/SalesChart';
import RestaurantApplicationsPreview from '@/components/admin/RestaurantApplicationsPreview';
import AdminFooter from '@/components/admin/AdminFooter';

import { useRestaurantApplication } from '@/hooks/useRestaurantApplication';

export default function AdminHomeScreen() {
  const {
    applications,
    loading,
    error,
    loadApplications,
  } = useRestaurantApplication({
    autoLoad: false,
  });

  useFocusEffect(
    useCallback(() => {
      void loadApplications().catch(() => undefined);
    }, [loadApplications])
  );

  return (
    <View className="flex-1 bg-[#F8F8F3]">
      <DashboardNavbar title="Administración" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        <View className="w-full self-center px-4 pb-4 pt-5 web:max-w-[920px]">
          <AdminHero />

          <View className="mt-5">
            <AdminSalesChart />
          </View>

          <View className="mt-6">
            {loading && applications.length === 0 ? (
              <View className="min-h-[220px] items-center justify-center rounded-[28px] bg-white">
                <ActivityIndicator
                  size="large"
                  color="#88A64B"
                />

                <Text className="mt-3 text-[13px] text-[#8B907F]">
                  Cargando solicitudes...
                </Text>
              </View>
            ) : error && applications.length === 0 ? (
              <View className="items-center rounded-[28px] bg-white p-6">
                <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-[#FCE9E5]">
                  <Text className="text-[22px] font-extrabold text-[#BF5B4C]">
                    !
                  </Text>
                </View>

                <Text className="mt-4 text-center text-[13px] leading-5 text-[#BF5B4C]">
                  {error}
                </Text>

                <Pressable
                  onPress={() =>
                    void loadApplications().catch(() => undefined)
                  }
                  className="mt-5 rounded-[18px] bg-[#D98B4F] px-6 py-3 active:opacity-80"
                >
                  <Text className="font-bold text-white">
                    Reintentar
                  </Text>
                </Pressable>
              </View>
            ) : (
              <RestaurantApplicationsPreview
                applications={applications}
              />
            )}
          </View>

          <AdminFooter />
        </View>
      </ScrollView>
    </View>
  );
}