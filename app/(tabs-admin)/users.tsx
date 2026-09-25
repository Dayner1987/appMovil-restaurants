// app/(tabs-admin)/users.tsx

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import DashboardNavbar from '@/components/DashboardNavbar';

import AdminUserCard from '@/components/admin/users/AdminUserCard';

import AdminUserFilters, {
  type AdminUserFilter,
} from '@/components/admin/users/AdminUserFilters';

import DeleteUserModal from '@/components/admin/users/DeleteUserModal';

import {
  useUser,
} from '@/hooks/useUsers';

import type {
  AppUser,
} from '@/types/user.types';

export default function AdminUsersScreen() {
  const {
    users,
    loading,
    saving,
    loadUsers,
    deleteUser,
  } = useUser({
    autoLoad: false,
  });

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    filter,
    setFilter,
  ] =
    useState<AdminUserFilter>(
      'all'
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<AppUser | null>(
      null
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const loadData =
    useCallback(
      async () => {
        try {
          await loadUsers({
            page: 1,
            pageSize: 100,
          });
        } catch {
          Toast.show({
            type: 'error',
            text1:
              'No se pudieron cargar los usuarios',
            position:
              'bottom',
          });
        }
      },
      [
        loadUsers,
      ]
    );

  useFocusEffect(
    useCallback(() => {
      void loadData();

      return undefined;
    }, [
      loadData,
    ])
  );

  const filteredUsers =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const fullName =
            [
              user.firstName,
              user.middleName,
              user.lastName,
              user.secondLastName,
            ]
              .filter(
                Boolean
              )
              .join(' ')
              .toLowerCase();

          const matchesSearch =
            !normalized ||
            fullName.includes(
              normalized
            ) ||
            user.username
              .toLowerCase()
              .includes(
                normalized
              ) ||
            user.email
              .toLowerCase()
              .includes(
                normalized
              ) ||
            (
              user.ci ??
              ''
            )
              .toLowerCase()
              .includes(
                normalized
              ) ||
            (
              user.phone ??
              ''
            )
              .toLowerCase()
              .includes(
                normalized
              ) ||
            (
              user.role
                ?.name ??
              ''
            )
              .toLowerCase()
              .includes(
                normalized
              );

          if (
            !matchesSearch
          ) {
            return false;
          }

          switch (
            filter
          ) {
            case 'active':
              return !user.blocked;

            case 'blocked':
              return user.blocked;

            case 'unconfirmed':
              return !user.confirmed;

            case 'admin':
            case 'restaurant':
            case 'employee':
            case 'client':
              return (
                user.role
                  ?.type ===
                filter
              );

            default:
              return true;
          }
        }
      );
    }, [
      users,
      search,
      filter,
    ]);

  const handleRefresh =
    useCallback(
      async () => {
        setRefreshing(
          true
        );

        try {
          await loadData();
        } finally {
          setRefreshing(
            false
          );
        }
      },
      [
        loadData,
      ]
    );

  const handleEdit =
    useCallback(
      (
        user: AppUser
      ) => {
        router.push({
          pathname:
            '/others/EditUserAdmin',
          params: {
            id: String(
              user.id
            ),
          },
        });
      },
      []
    );

  const handleDelete =
    useCallback(
      async () => {
        if (
          !deleteTarget
        ) {
          return;
        }

        try {
          await deleteUser(
            deleteTarget.id
          );

          setDeleteTarget(
            null
          );

          Toast.show({
            type: 'success',
            text1:
              'Usuario eliminado correctamente',
            position:
              'bottom',
          });
        } catch {
          Toast.show({
            type: 'error',
            text1:
              'No se pudo eliminar el usuario',
            position:
              'bottom',
          });
        }
      },
      [
        deleteTarget,
        deleteUser,
      ]
    );

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={[
        'top',
      ]}
    >
      <DashboardNavbar
        title="Usuarios"
      />

      <FlatList
        data={
          filteredUsers
        }
        keyExtractor={(
          item
        ) =>
          String(
            item.id
          )
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor="#7B9646"
          />
        }
        contentContainerStyle={{
          paddingHorizontal:
            16,
          paddingTop:
            18,
          paddingBottom:
            120,
        }}
        ItemSeparatorComponent={() => (
          <View className="h-3" />
        )}
        ListHeaderComponent={
          <View className="mb-5 gap-5">
            <View>
              <Text className="text-[24px] font-extrabold text-[#252A20]">
                Administrar usuarios
              </Text>

              <Text className="mt-1 text-[13px] text-[#858A7A]">
                Busca, filtra y
                administra las cuentas
                registradas
              </Text>
            </View>

            <View className="flex-row items-center justify-between rounded-[22px] bg-[#EEF3E3] px-4 py-4">
              <View>
                <Text className="text-[11px] font-semibold text-[#858A7A]">
                  Usuarios mostrados
                </Text>

                <Text className="mt-0.5 text-[22px] font-extrabold text-[#617D34]">
                  {
                    filteredUsers.length
                  }
                </Text>
              </View>

              <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-white">
                <Ionicons
                  name="people-outline"
                  size={23}
                  color="#7B9646"
                />
              </View>
            </View>

            <AdminUserFilters
              search={
                search
              }
              filter={
                filter
              }
              onSearchChange={
                setSearch
              }
              onFilterChange={
                setFilter
              }
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator
                size="large"
                color="#7B9646"
              />

              <Text className="mt-4 text-[13px] text-[#858A7A]">
                Cargando usuarios...
              </Text>
            </View>
          ) : (
            <View className="items-center justify-center px-6 py-16">
              <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF3E3]">
                <Ionicons
                  name="people-outline"
                  size={28}
                  color="#7B9646"
                />
              </View>

              <Text className="mt-4 text-[16px] font-extrabold text-[#252A20]">
                No hay usuarios
              </Text>

              <Text className="mt-1 text-center text-[13px] leading-5 text-[#858A7A]">
                No se encontraron
                usuarios con los filtros
                seleccionados.
              </Text>
            </View>
          )
        }
        renderItem={({
          item,
        }) => (
          <AdminUserCard
            user={item}
            onEdit={() =>
              handleEdit(
                item
              )
            }
            onDelete={() =>
              setDeleteTarget(
                item
              )
            }
          />
        )}
      />

      <DeleteUserModal
        visible={
          deleteTarget !==
          null
        }
        user={
          deleteTarget
        }
        deleting={
          saving
        }
        onCancel={() => {
          if (
            !saving
          ) {
            setDeleteTarget(
              null
            );
          }
        }}
        onConfirm={
          handleDelete
        }
      />
    </SafeAreaView>
  );
}