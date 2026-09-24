// app/edit-profile.tsx

import {
  useEffect,
} from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
} from 'expo-router';

import ProfileAvatarSection from '@/components/profile/ProfileAvatarSection';
import ProfileInfoForm from '@/components/profile/ProfileInfoForm';
import ProfilePasswordForm from '@/components/profile/ProfilePasswordForm';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useUser,
} from '@/hooks/useUsers';

export default function EditProfileScreen() {
  const {
    user: authUser,
  } = useAuth();

  const {
    user,
    avatar,

    loading,
    saving,
    error,

    loadMe,

    updateMyProfile,

    uploadMyAvatar,
    removeMyAvatar,

    changePassword,
  } = useUser({
    autoLoad: false,
  });

  // =====================================================
  // VALIDAR SESIÓN Y CARGAR USUARIO ACTUAL
  // =====================================================

  useEffect(() => {
    if (!authUser) {
      router.replace(
        '/login'
      );

      return;
    }

    void loadMe().catch(
      () => undefined
    );
  }, [
    authUser,
    loadMe,
  ]);

  if (!authUser) {
    return null;
  }

  // =====================================================
  // CARGANDO
  // =====================================================

  if (
    loading &&
    !user
  ) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={[
          'top',
        ]}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#7B9646"
          />

          <Text className="mt-4 text-[13px] text-[#858A7A]">
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!user) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={[
          'top',
        ]}
      >
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() =>
              router.back()
            }
            className="h-11 w-11 items-center justify-center rounded-[16px] bg-white"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#30352A"
            />
          </Pressable>

          <Text className="ml-3 text-[18px] font-extrabold text-[#252A20]">
            Editar perfil
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[14px] leading-5 text-[#B65D51]">
            {error ||
              'No se pudo cargar el perfil.'}
          </Text>

          <Pressable
            onPress={() =>
              void loadMe().catch(
                () => undefined
              )
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

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={[
        'top',
      ]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* HEADER */}

        <View className="min-h-[64px] flex-row items-center border-b border-[#E9EBE3] bg-[#F7F8F2] px-4">
          <Pressable
            onPress={() =>
              router.back()
            }
            className="h-11 w-11 items-center justify-center rounded-[16px] bg-white active:opacity-70"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#30352A"
            />
          </Pressable>

          <View className="ml-3">
            <Text className="text-[19px] font-extrabold text-[#252A20]">
              Editar perfil
            </Text>

            <Text className="mt-0.5 text-[11px] text-[#8D9282]">
              Administra tu información personal
            </Text>
          </View>
        </View>

        {/* CONTENIDO */}

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 50,
          }}
        >
          <View className="w-full self-center px-4 py-5 web:max-w-[700px]">
            <ProfileAvatarSection
              user={user}
              avatar={
                avatar ??
                user.avatar ??
                null
              }
              saving={saving}
              onUpload={
                uploadMyAvatar
              }
              onRemove={
                removeMyAvatar
              }
            />

            <ProfileInfoForm
              user={user}
              saving={saving}
              onSave={
                updateMyProfile
              }
            />

            <ProfilePasswordForm
              saving={saving}
              onChangePassword={
                changePassword
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}