// components/admin/RestaurantApplicationsPreview.tsx

import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import type { RestaurantApplication } from '@/types/restaurant-application.types';

type FilterType = 'all' | 'pending' | 'approved';

interface Props {
  applications: RestaurantApplication[];
}

export default function RestaurantApplicationsPreview({
  applications,
}: Props) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const pendingCount = useMemo(
    () => applications.filter((item) => item.status === 'pending').length,
    [applications]
  );

  const approvedCount = useMemo(
    () => applications.filter((item) => item.status === 'approved').length,
    [applications]
  );

  const filteredApplications = useMemo(() => {
    const sorted = [...applications].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (activeFilter === 'pending') {
      return sorted.filter((item) => item.status === 'pending').slice(0, 3);
    }

    if (activeFilter === 'approved') {
      return sorted.filter((item) => item.status === 'approved').slice(0, 3);
    }

    return sorted.slice(0, 3);
  }, [applications, activeFilter]);

  const totalShown = filteredApplications.length;

  if (applications.length === 0) {
    return (
      <View className="items-center rounded-[28px] bg-white px-6 py-10">
        <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF6D8]">
          <Ionicons
            name="document-text-outline"
            size={28}
            color="#7B9646"
          />
        </View>

        <Text className="mt-4 text-[18px] font-extrabold text-[#262B1F]">
          Sin solicitudes
        </Text>

        <Text className="mt-2 text-center text-[13px] leading-5 text-[#7A8070]">
          Cuando lleguen nuevas solicitudes de restaurantes aparecerán aquí.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View className="mb-4 flex-row items-end justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[21px] font-extrabold text-[#23271D]">
            Solicitudes recientes
          </Text>

          <Text className="mt-1 text-[13px] text-[#858A7A]">
            Mostrando solo las 3 más recientes
          </Text>
        </View>

        <View className="rounded-2xl bg-[#F3F8E8] px-4 py-2">
          <Text className="text-[11px] font-bold text-[#789149]">
            {applications.length} total
          </Text>
        </View>
      </View>

      <View className="mb-4 flex-row gap-2">
        <Pressable
          onPress={() => setActiveFilter('all')}
          className={`rounded-full px-4 py-2 ${
            activeFilter === 'all' ? 'bg-[#1F241A]' : 'bg-white'
          }`}
        >
          <Text
            className={`text-[12px] font-bold ${
              activeFilter === 'all' ? 'text-white' : 'text-[#59604E]'
            }`}
          >
            Todos
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveFilter('pending')}
          className={`rounded-full px-4 py-2 ${
            activeFilter === 'pending' ? 'bg-[#D98B4F]' : 'bg-white'
          }`}
        >
          <Text
            className={`text-[12px] font-bold ${
              activeFilter === 'pending' ? 'text-white' : 'text-[#8A684E]'
            }`}
          >
            Pendientes ({pendingCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveFilter('approved')}
          className={`rounded-full px-4 py-2 ${
            activeFilter === 'approved' ? 'bg-[#7A9447]' : 'bg-white'
          }`}
        >
          <Text
            className={`text-[12px] font-bold ${
              activeFilter === 'approved' ? 'text-white' : 'text-[#5C7040]'
            }`}
          >
            Aprobados ({approvedCount})
          </Text>
        </Pressable>
      </View>

      {filteredApplications.length === 0 ? (
        <View className="items-center rounded-[24px] bg-white px-6 py-10">
          <Text className="text-[16px] font-extrabold text-[#2B301F]">
            No hay resultados
          </Text>

          <Text className="mt-2 text-center text-[13px] text-[#848879]">
            No existen solicitudes para este filtro.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {filteredApplications.map((item, index) => {
            const applicantName =
              [item.applicant?.firstName, item.applicant?.lastName]
                .filter(Boolean)
                .join(' ') ||
              item.applicant?.username ||
              'Sin propietario';

            const approved = item.status === 'approved';
            const pending = item.status === 'pending';
            const rejected = item.status === 'rejected';

            return (
              <Pressable
                key={item.documentId || String(item.id)}
                onPress={() =>
                  router.push({
                    pathname: '../others/RestaurantSol',
                    params: {
                      documentId: item.documentId,
                    },
                  })
                }
                className="overflow-hidden rounded-[26px] bg-white active:opacity-80"
              >
                <View className="flex-row items-center p-4">
                  <View className="mr-3 items-center justify-center">
                    <View className="mb-2 rounded-full bg-[#F5F6EF] px-2 py-1">
                      <Text className="text-[11px] font-extrabold text-[#91967F]">
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                    </View>

                    <LinearGradient
                      colors={
                        approved
                          ? ['#7A9447', '#A5BD72']
                          : rejected
                          ? ['#C96B63', '#E59A8E']
                          : ['#D98B4F', '#F0B57B']
                      }
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name="restaurant-outline"
                        size={24}
                        color="#FFFFFF"
                      />
                    </LinearGradient>
                  </View>

                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-[16px] font-extrabold text-[#2A2E21]"
                    >
                      {item.proposedRestaurantName}
                    </Text>

                    <Text
                      numberOfLines={1}
                      className="mt-1 text-[12px] text-[#8D9184]"
                    >
                      Propietario: {applicantName}
                    </Text>

                    <Text className="mt-1 text-[11px] text-[#AAAFA0]">
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>

                    <View
                      className={`mt-3 self-start rounded-full px-3 py-1 ${
                        approved
                          ? 'bg-[#E4EFD6]'
                          : pending
                          ? 'bg-[#FFF0E0]'
                          : 'bg-[#FCE4E1]'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          approved
                            ? 'text-[#68853B]'
                            : pending
                            ? 'text-[#C06E35]'
                            : 'text-[#B95850]'
                        }`}
                      >
                        {approved
                          ? 'Aprobado'
                          : pending
                          ? 'Pendiente'
                          : 'Rechazado'}
                      </Text>
                    </View>
                  </View>

                  <View className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-[#F7F8F2]">
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#8A8F7D"
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <View className="mt-4 items-center">
        <Text className="text-[12px] text-[#8C9181]">
          Mostrando {totalShown} resultado{totalShown === 1 ? '' : 's'} del filtro seleccionado
        </Text>
      </View>
    </View>
  );
}