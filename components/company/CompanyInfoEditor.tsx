import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import type {
  Company,
  UpdateCompanyData,
} from '@/types/company.types';

interface CompanyInfoEditorProps {
  company: Company;
  saving: boolean;
  onSave: (
    documentId: string,
    data: UpdateCompanyData
  ) => Promise<Company>;
}

export default function CompanyInfoEditor({
  company,
  saving,
  onSave,
}: CompanyInfoEditorProps) {
  const [name, setName] = useState(company.name);
  const [email, setEmail] = useState(company.email);
  const [number, setNumber] = useState(company.number);
  const [aditionalLink, setAditionalLink] = useState(
    company.aditionalLink || ''
  );

  useEffect(() => {
    setName(company.name);
    setEmail(company.email);
    setNumber(company.number);
    setAditionalLink(company.aditionalLink || '');
  }, [company]);

  async function handleSave() {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'El nombre de la empresa es obligatorio.',
      });

      return;
    }

    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'El correo electrónico es obligatorio.',
      });

      return;
    }

    if (!number.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'El número telefónico es obligatorio.',
      });

      return;
    }

    const data: UpdateCompanyData = {
      name: name.trim(),
      email: email.trim(),
      number: number.trim(),
      aditionalLink: aditionalLink.trim() || null,
    };

    try {
      await onSave(company.documentId, data);

      Toast.show({
        type: 'success',
        text1: 'Información actualizada',
        text2: 'Los datos se guardaron correctamente.',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo actualizar la información.',
      });
    }
  }

  return (
    <View className="rounded-[24px] border border-[#E9EBE3] bg-white p-5">
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#E8EEDC]">
          <Ionicons
            name="business-outline"
            size={22}
            color="#627A36"
          />
        </View>

        <View className="ml-3">
          <Text className="text-[17px] font-extrabold text-[#252A20]">
            Información general
          </Text>

          <Text className="mt-1 text-[12px] text-[#858A7A]">
            Edita los datos del propietario
          </Text>
        </View>
      </View>

      <CompanyInput
        label="Nombre de la empresa"
        icon="business-outline"
        value={name}
        onChangeText={setName}
        placeholder="Ej. CochaStore"
      />

      <CompanyInput
        label="Correo electrónico"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <CompanyInput
        label="Número telefónico"
        icon="call-outline"
        value={number}
        onChangeText={setNumber}
        placeholder="+591 70000000"
        keyboardType="phone-pad"
      />

      <CompanyInput
        label="Enlace adicional"
        icon="link-outline"
        value={aditionalLink}
        onChangeText={setAditionalLink}
        placeholder="https://facebook.com/..."
        keyboardType="url"
        autoCapitalize="none"
      />

      <Pressable
        disabled={saving}
        onPress={() => void handleSave()}
        className="mt-5 flex-row items-center justify-center rounded-[16px] bg-[#20251B] px-4 py-4 active:opacity-80"
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons
              name="save-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text className="ml-2 font-extrabold text-white">
              Guardar cambios
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function CompanyInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: React.ComponentProps<
    typeof TextInput
  >['keyboardType'];
  autoCapitalize?: React.ComponentProps<
    typeof TextInput
  >['autoCapitalize'];
}) {
  return (
    <View className="mt-5">
      <Text className="mb-2 text-[12px] font-bold text-[#555C4A]">
        {label}
      </Text>

      <View className="flex-row items-center rounded-[16px] border border-[#E1E6D9] bg-[#F7F8F2] px-4">
        <Ionicons
          name={icon}
          size={19}
          color="#7B9646"
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A2A697"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          className="ml-3 flex-1 py-4 text-[14px] text-[#30352A]"
        />
      </View>
    </View>
  );
}