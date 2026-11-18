// components/restaurant/RestaurantEmployeeForm.tsx

import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

export interface RestaurantEmployeeFormValues {
  firstName:
    string;

  middleName:
    string;

  lastName:
    string;

  secondLastName:
    string;

  ci:
    string;

  phone:
    string;

  username:
    string;

  email:
    string;

  password:
    string;

  passwordConfirmation:
    string;
}

interface RestaurantEmployeeFormProps {
  values:
    RestaurantEmployeeFormValues;

  saving:
    boolean;

  mode?: 'create' | 'edit';

  onChange:
    (
      values:
        RestaurantEmployeeFormValues
    ) => void;

  onSubmit:
    () => void;
}

export default function RestaurantEmployeeForm({
  values,
  saving,
  mode = 'create',
  onChange,
  onSubmit,
}: RestaurantEmployeeFormProps) {
  function updateField<
    K extends
      keyof RestaurantEmployeeFormValues,
  >(
    field:
      K,

    value:
      RestaurantEmployeeFormValues[K]
  ) {
    onChange({
      ...values,

      [field]:
        value,
    });
  }

  return (
    <View className="gap-4">
      <View className="rounded-[24px] bg-white p-5">
        <Text className="text-[17px] font-extrabold text-[#252A20]">
          Datos personales
        </Text>

        <View className="mt-5 gap-4">
          <TextInput
            value={
              values.firstName
            }
            onChangeText={(
              value
            ) =>
              updateField(
                'firstName',
                value
              )
            }
            placeholder="Nombre"
            placeholderTextColor="#A3A99A"
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />

          <TextInput
            value={
              values.middleName
            }
            onChangeText={(
              value
            ) =>
              updateField(
                'middleName',
                value
              )
            }
            placeholder="Segundo nombre (opcional)"
            placeholderTextColor="#A3A99A"
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />

          <TextInput
            value={
              values.lastName
            }
            onChangeText={(
              value
            ) =>
              updateField(
                'lastName',
                value
              )
            }
            placeholder="Apellido"
            placeholderTextColor="#A3A99A"
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />

          <TextInput
            value={
              values.secondLastName
            }
            onChangeText={(
              value
            ) =>
              updateField(
                'secondLastName',
                value
              )
            }
            placeholder="Segundo apellido (opcional)"
            placeholderTextColor="#A3A99A"
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />

          <TextInput
            value={
              values.ci
            }
            onChangeText={(
              value
            ) =>
              updateField(
                'ci',
                value
              )
            }
            placeholder="CI"
            placeholderTextColor="#A3A99A"
            keyboardType="number-pad"
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />

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
            placeholder="Teléfono"
            placeholderTextColor="#A3A99A"
            keyboardType="phone-pad"
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />
        </View>
      </View>

      <View className="rounded-[24px] bg-white p-5">
        <Text className="text-[17px] font-extrabold text-[#252A20]">
          Datos de acceso
        </Text>

        <View className="mt-5 gap-4">
          <TextInput
            value={
              values.username
            }
            onChangeText={(
              value
            ) =>
              updateField(
                'username',
                value
              )
            }
            placeholder="Usuario"
            placeholderTextColor="#A3A99A"
            autoCapitalize="none"
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />

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
            placeholder="Correo electrónico"
            placeholderTextColor="#A3A99A"
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />

          {mode === 'create' ? <>
          <TextInput
            value={
              values.password
            }
            onChangeText={(
              value
            ) =>
              updateField(
                'password',
                value
              )
            }
            placeholder="Contraseña"
            placeholderTextColor="#A3A99A"
            secureTextEntry
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />

          <TextInput
            value={
              values.passwordConfirmation
            }
            onChangeText={(
              value
            ) =>
              updateField(
                'passwordConfirmation',
                value
              )
            }
            placeholder="Confirmar contraseña"
            placeholderTextColor="#A3A99A"
            secureTextEntry
            className="rounded-[16px] bg-[#F7F8F2] px-4 py-4 text-[#252A20]"
          />
          </> : null}
        </View>
      </View>

      {mode === 'create' ? <View className="flex-row rounded-[18px] bg-[#EEF3E3] p-4">
        <Ionicons
          name="information-circle-outline"
          size={21}
          color="#6F8C3E"
        />

        <Text className="ml-3 flex-1 text-[11px] leading-5 text-[#68715E]">
          La cuenta se registrará como Employee y quedará vinculada automáticamente a tu restaurante.
        </Text>
      </View> : null}

      <Pressable
        disabled={
          saving
        }
        onPress={
          onSubmit
        }
        className={`flex-row items-center justify-center rounded-[18px] py-4 ${
          saving
            ? 'bg-[#AEB99B]'
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
              name={mode === 'create' ? 'person-add-outline' : 'save-outline'}
              size={20}
              color="#FFFFFF"
            />

            <Text className="ml-2 text-[13px] font-extrabold text-white">
              {mode === 'create' ? 'Registrar empleado' : 'Guardar cambios'}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}