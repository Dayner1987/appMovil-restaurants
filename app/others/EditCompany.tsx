//app/others/EditCompany.tsx
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import CompanyLogoEditor from '@/components/company/CompanyLogoEditor';
import CompanyInfoEditor from '@/components/company/CompanyInfoEditor';
import { useCompany } from '@/hooks/useCompany';

export default function EditCompanyScreen() {
  const params = useLocalSearchParams<{
    documentId?: string;
  }>();

  const documentId = Array.isArray(params.documentId)
    ? params.documentId[0]
    : params.documentId;

  const {
    company,
    loading,
    saving,
    error,
    updateCompany,
    patchCompany,
    uploadCompanyLogo,
    deleteCompanyLogo,
  } = useCompany({
    documentId,
    autoLoad: Boolean(documentId),
  });

  if (!documentId) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={['top']}
      >
        <Header />

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[15px] text-[#B65D51]">
            No se recibió el identificador de la empresa.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !company) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#F7F8F2]"
        edges={['top']}
      >
        <Header />

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
        <Header />

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[15px] text-[#B65D51]">
            {error || 'No se pudo cargar la empresa.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={['top']}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <Header />

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 50,
          }}
        >
          <View className="w-full self-center gap-5 px-4 py-5 web:max-w-[700px]">
            <View>
              <Text className="text-[24px] font-extrabold text-[#252A20]">
                Editar empresa
              </Text>

              <Text className="mt-1 text-[13px] text-[#858A7A]">
                Actualiza la información del sistema
              </Text>
            </View>

            <CompanyLogoEditor
              company={company}
              saving={saving}
              onUpload={uploadCompanyLogo}
              onDelete={deleteCompanyLogo}
            />

            <CompanyInfoEditor
              company={company}
              saving={saving}
              onSave={patchCompany}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View className="min-h-[64px] flex-row items-center border-b border-[#E9EBE3] bg-[#F7F8F2] px-4">
      <Pressable
        onPress={() => router.back()}
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
          Empresa
        </Text>

        <Text className="mt-0.5 text-[11px] text-[#8D9282]">
          Administración de la información
        </Text>
      </View>
    </View>
  );
}