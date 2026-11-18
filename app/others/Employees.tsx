import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useRestaurantManagement,
} from '@/hooks/useRestaurantManagement';

import type {
  RestaurantManagementEmployee,
} from '@/types/restaurant-management.types';

const GREEN = '#617D34';

function fullName(
  employee: RestaurantManagementEmployee,
) {
  return [
    employee.firstName,
    employee.middleName,
    employee.lastName,
    employee.secondLastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || employee.username;
}

export default function RestaurantEmployeesScreen() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    employees,
    loadingEmployees,
    saving,
    error,
    loadEmployees,
    setEmployeeBlocked,
  } = useRestaurantManagement({
    autoLoadEmployees: false,
  });

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    confirm,
    setConfirm,
  ] = useState<{
    id: number;
    blocked: boolean;
  } | null>(null);

  const [
    busyId,
    setBusyId,
  ] = useState<number | null>(
    null,
  );

  const role = (
    user?.role?.type ??
    user?.role?.name ??
    ''
  ).toLowerCase();

  const canManage =
    role === 'restaurant';

  const reload =
    useCallback(
      async () => {
        await loadEmployees();
      },
      [loadEmployees],
    );

  useFocusEffect(
    useCallback(() => {
      if (canManage) {
        void reload().catch(
          () => undefined,
        );
      }

      return undefined;
    }, [
      canManage,
      reload,
    ]),
  );

  const activeCount =
    employees.filter(
      employee =>
        !employee.blocked,
    ).length;

  const results =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return employees;
      }

      return employees.filter(
        employee =>
          `${fullName(employee)} ${employee.username} ${employee.email} ${employee.ci ?? ''} ${employee.phone ?? ''}`
            .toLowerCase()
            .includes(value),
      );
    }, [
      employees,
      search,
    ]);

  async function handleStatus() {
    if (
      !confirm ||
      saving
    ) {
      return;
    }

    const {
      id,
      blocked,
    } = confirm;

    setBusyId(id);

    try {
      await setEmployeeBlocked(
        id,
        blocked,
      );

      setConfirm(null);

      Toast.show({
        type: 'success',
        text1: blocked
          ? 'Acceso suspendido'
          : 'Acceso habilitado',
        position: 'bottom',
      });

      await reload();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          'No se pudo actualizar el acceso',
        text2:
          error instanceof Error
            ? error.message
            : 'Revisa los permisos del servidor.',
        position: 'bottom',
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-[#F7F8F2]"
    >
      <View className="flex-row items-center border-b border-[#E7EBDD] bg-white px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Volver"
          className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF3E8]"
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={GREEN}
          />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[21px] font-extrabold text-[#20291B]">
            Mi equipo
          </Text>

          <Text className="text-xs text-[#7B8672]">
            Personal de tu restaurante
          </Text>
        </View>

        {canManage ? (
          <Pressable
            onPress={() =>
              router.push(
                '/others/CreateEmployee',
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Nuevo empleado"
            className="h-11 w-11 items-center justify-center rounded-2xl bg-[#617D34]"
          >
            <Ionicons
              name="person-add-outline"
              size={22}
              color="white"
            />
          </Pressable>
        ) : null}
      </View>

      {authLoading ? (
        <ActivityIndicator
          color={GREEN}
          className="mt-14"
        />
      ) : !canManage ? (
        <View className="mx-5 mt-8 rounded-3xl bg-white p-6">
          <Ionicons
            name="lock-closed-outline"
            size={28}
            color={GREEN}
          />

          <Text className="mt-3 text-base font-bold text-[#20291B]">
            Acceso exclusivo del restaurante
          </Text>

          <Text className="mt-2 text-sm text-[#7B8672]">
            Solo el propietario o un administrador puede gestionar empleados.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);

                try {
                  await reload();
                } finally {
                  setRefreshing(false);
                }
              }}
              tintColor={GREEN}
            />
          }
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 60,
          }}
        >
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-[22px] bg-[#EAF2E0] p-4">
              <Ionicons
                name="people-outline"
                size={24}
                color={GREEN}
              />

              <Text className="mt-2 text-[27px] font-extrabold text-[#20291B]">
                {employees.length}
              </Text>

              <Text className="text-xs font-semibold text-[#6D7E5E]">
                Empleados
              </Text>
            </View>

            <View className="flex-1 rounded-[22px] bg-white p-4">
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={GREEN}
              />

              <Text className="mt-2 text-[27px] font-extrabold text-[#20291B]">
                {activeCount}
              </Text>

              <Text className="text-xs font-semibold text-[#6D7E5E]">
                Activos
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() =>
              router.push(
                '/others/CreateEmployee',
              )
            }
            className="mt-4 flex-row items-center justify-center rounded-2xl bg-[#617D34] p-4 active:opacity-80"
          >
            <Ionicons
              name="person-add-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text className="ml-2 font-bold text-white">
              Registrar nuevo empleado
            </Text>
          </Pressable>

          <View className="mt-5 flex-row items-center rounded-2xl border border-[#E8ECDF] bg-white px-4">
            <Ionicons
              name="search-outline"
              size={20}
              color="#87947C"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre, usuario, CI o teléfono"
              placeholderTextColor="#98A092"
              className="ml-3 flex-1 py-4 text-[#20291B]"
            />
          </View>

          <View className="mb-3 mt-6 flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-[#20291B]">
              Personal registrado
            </Text>

            <Pressable
              onPress={() =>
                void reload().catch(
                  () => undefined,
                )
              }
              accessibilityLabel="Actualizar empleados"
              className="h-9 w-9 items-center justify-center rounded-xl bg-white"
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={GREEN}
              />
            </Pressable>
          </View>

          {error ? (
            <View className="mb-3 rounded-2xl bg-[#FFF1EF] p-4">
              <Text className="font-semibold text-[#A6514C]">
                {error}
              </Text>

              <Pressable
                onPress={() =>
                  void reload().catch(
                    () => undefined,
                  )
                }
                className="mt-2"
              >
                <Text className="font-bold text-[#A6514C]">
                  Reintentar
                </Text>
              </Pressable>
            </View>
          ) : null}

          {loadingEmployees &&
          employees.length === 0 ? (
            <ActivityIndicator
              className="my-10"
              color={GREEN}
            />
          ) : null}

          {!loadingEmployees &&
          !error &&
          results.length === 0 ? (
            <View className="items-center rounded-3xl bg-white px-5 py-10">
              <Ionicons
                name="people-outline"
                size={40}
                color="#91A37D"
              />

              <Text className="mt-3 text-base font-bold text-[#20291B]">
                {search
                  ? 'No encontramos coincidencias'
                  : 'Todavía no hay empleados'}
              </Text>

              <Text className="mt-1 text-center text-sm text-[#879080]">
                {search
                  ? 'Prueba con otro nombre, correo, CI o teléfono.'
                  : 'Agrega tu primer empleado para administrar productos y pedidos.'}
              </Text>
            </View>
          ) : null}

          {results.map(
            employee => (
              <View
                key={employee.id}
                className="mb-3 rounded-[24px] border border-[#E8ECDF] bg-white p-4"
              >
                <View className="flex-row items-center">
                  <View
                    className="items-center justify-center rounded-2xl bg-[#EEF3E6]"
                    style={{
                      width: 52,
                      height: 52,
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={25}
                      color={GREEN}
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text
                      numberOfLines={2}
                      className="text-[15px] font-extrabold text-[#20291B]"
                    >
                      {fullName(employee)}
                    </Text>

                    <Text className="mt-0.5 text-xs text-[#798575]">
                      @{employee.username}
                    </Text>
                  </View>

                  <View
                    className={`rounded-full px-3 py-1.5 ${
                      employee.blocked
                        ? 'bg-[#FCEAE7]'
                        : 'bg-[#EAF2E0]'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        employee.blocked
                          ? 'text-[#AF6057]'
                          : 'text-[#617D34]'
                      }`}
                    >
                      {employee.blocked
                        ? 'Suspendido'
                        : 'Activo'}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 border-t border-[#EFF0EB] pt-3">
                  <Text
                    numberOfLines={1}
                    className="text-xs text-[#697666]"
                  >
                    {employee.email}
                  </Text>

                  <Text className="mt-1 text-xs text-[#697666]">
                    {employee.phone ||
                      'Teléfono no registrado'}
                  </Text>

                  <Text className="mt-1 text-xs text-[#697666]">
                    CI: {employee.ci ||
                      'No registrado'}
                  </Text>

                  <Text className="mt-1 text-xs text-[#697666]">
                    Rol: {employee.role?.name ||
                      'Empleado'}
                  </Text>

                  <Text className="mt-1 text-xs text-[#697666]">
                    Restaurante: {employee.restaurant?.name ||
                      'No informado'}
                  </Text>
                </View>

                <View className="mt-4 flex-row gap-2">
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname:
                          '/others/EditEmployee',
                        params: {
                          id: String(
                            employee.id,
                          ),
                        },
                      })
                    }
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-[#EEF3E6] py-3"
                  >
                    <Ionicons
                      name="create-outline"
                      size={17}
                      color={GREEN}
                    />

                    <Text className="ml-1.5 text-xs font-bold text-[#617D34]">
                      Editar
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname:
                          '/others/ResetEmployeePassword',
                        params: {
                          id: String(
                            employee.id,
                          ),
                        },
                      })
                    }
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-[#F4F5F1] py-3"
                  >
                    <Ionicons
                      name="key-outline"
                      size={17}
                      color="#626B5B"
                    />

                    <Text className="ml-1.5 text-xs font-bold text-[#626B5B]">
                      Clave
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setConfirm({
                        id: employee.id,
                        blocked:
                          !employee.blocked,
                      })
                    }
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-[#F8EEE9] py-3"
                  >
                    <Ionicons
                      name={
                        employee.blocked
                          ? 'checkmark-circle-outline'
                          : 'ban-outline'
                      }
                      size={17}
                      color="#A56350"
                    />

                    <Text className="ml-1.5 text-xs font-bold text-[#A56350]">
                      {employee.blocked
                        ? 'Activar'
                        : 'Suspender'}
                    </Text>
                  </Pressable>
                </View>

                {confirm?.id ===
                employee.id ? (
                  <View className="mt-3 rounded-2xl bg-[#FAF7F2] p-3">
                    <Text className="text-sm font-semibold text-[#494E43]">
                      ¿{confirm.blocked
                        ? 'Suspender'
                        : 'Habilitar'} el acceso de{' '}
                      {employee.firstName ||
                        employee.username}
                      ?
                    </Text>

                    <View className="mt-3 flex-row gap-2">
                      <Pressable
                        disabled={saving}
                        onPress={() =>
                          setConfirm(null)
                        }
                        className="flex-1 items-center rounded-xl bg-white py-3"
                      >
                        <Text className="text-xs font-bold text-[#686F61]">
                          Cancelar
                        </Text>
                      </Pressable>

                      <Pressable
                        disabled={saving}
                        onPress={() =>
                          void handleStatus()
                        }
                        className="flex-1 items-center rounded-xl bg-[#617D34] py-3"
                      >
                        {busyId ===
                        employee.id ? (
                          <ActivityIndicator
                            color="white"
                          />
                        ) : (
                          <Text className="text-xs font-bold text-white">
                            Confirmar
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </View>
            ),
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
