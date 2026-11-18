// components/restaurant/RestaurantEditForm.tsx

import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

export interface RestaurantEditFormValues {
  name:
    string;

  description:
    string;

  email:
    string;

  phone:
    string;

  address:
    string;

  nit:
    string;
}

interface RestaurantEditFormProps {
  values:
    RestaurantEditFormValues;

  saving?:
    boolean;

  onChange:
    (
      values:
        RestaurantEditFormValues
    ) => void;

  onSubmit:
    () => void;
}

export default function RestaurantEditForm({
  values,
  saving = false,
  onChange,
  onSubmit,
}: RestaurantEditFormProps) {
  function updateField<
    K extends
      keyof RestaurantEditFormValues,
  >(
    field:
      K,

    value:
      RestaurantEditFormValues[K]
  ) {
    onChange({
      ...values,

      [field]:
        value,
    });
  }

  return (
    <View className="gap-4 rounded-[26px] bg-white p-5">
      <View>
        <Text className="mb-2 text-[12px] font-bold text-[#5F6757]">
          Nombre
        </Text>

        <TextInput
          value={
            values.name
          }
          onChangeText={(
            value
          ) =>
            updateField(
              'name',
              value
            )
          }
          placeholder="Nombre del restaurante"
          placeholderTextColor="#A3A99A"
          className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
        />
      </View>

      <View>
        <Text className="mb-2 text-[12px] font-bold text-[#5F6757]">
          Descripción
        </Text>

        <TextInput
          value={
            values.description
          }
          onChangeText={(
            value
          ) =>
            updateField(
              'description',
              value
            )
          }
          placeholder="Describe tu restaurante"
          placeholderTextColor="#A3A99A"
          multiline
          textAlignVertical="top"
          className="min-h-[110px] rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
        />
      </View>

      <View>
        <Text className="mb-2 text-[12px] font-bold text-[#5F6757]">
          Correo
        </Text>

        <TextInput
          value={
            values.email
          }
          onChangeText={(
            value
          ) =>
            updateField(
              'email',
              value
            )
          }
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="restaurante@correo.com"
          placeholderTextColor="#A3A99A"
          className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
        />
      </View>

      <View>
        <Text className="mb-2 text-[12px] font-bold text-[#5F6757]">
          Teléfono
        </Text>

        <TextInput
          value={
            values.phone
          }
          onChangeText={(
            value
          ) =>
            updateField(
              'phone',
              value
            )
          }
          keyboardType="phone-pad"
          placeholder="Número de teléfono"
          placeholderTextColor="#A3A99A"
          className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
        />
      </View>

      <View>
        <Text className="mb-2 text-[12px] font-bold text-[#5F6757]">
          Dirección
        </Text>

        <TextInput
          value={
            values.address
          }
          onChangeText={(
            value
          ) =>
            updateField(
              'address',
              value
            )
          }
          placeholder="Dirección del negocio"
          placeholderTextColor="#A3A99A"
          className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
        />
      </View>

      <View>
        <Text className="mb-2 text-[12px] font-bold text-[#5F6757]">
          NIT
        </Text>

        <TextInput
          value={
            values.nit
          }
          onChangeText={(
            value
          ) =>
            updateField(
              'nit',
              value
            )
          }
          keyboardType="number-pad"
          placeholder="NIT"
          placeholderTextColor="#A3A99A"
          className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[14px] text-[#252A20]"
        />
      </View>

      <Pressable
        disabled={
          saving
        }
        onPress={
          onSubmit
        }
        className={`mt-2 flex-row items-center justify-center rounded-[17px] py-4 ${
          saving
            ? 'bg-[#ACB99B]'
            : 'bg-[#6F8C3E]'
        }`}
      >
        {saving ? (
          <ActivityIndicator
            color="#FFFFFF"
          />
        ) : (
          <>
            <Ionicons
              name="save-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text className="ml-2 text-[13px] font-extrabold text-white">
              Guardar cambios
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}