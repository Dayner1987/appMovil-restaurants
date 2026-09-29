// components/restaurant/CreateCategoryModal.tsx

import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

interface CreateCategoryModalProps {
  visible: boolean;

  saving?: boolean;

  onClose:
    () => void;

  onCreate:
    (
      name: string
    ) => Promise<void>;
}

export default function CreateCategoryModal({
  visible,
  saving = false,
  onClose,
  onCreate,
}: CreateCategoryModalProps) {
  const [
    name,
    setName,
  ] =
    useState('');

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  useEffect(() => {
    if (!visible) {
      setName('');
      setError(null);
    }
  }, [
    visible,
  ]);

  const handleCreate =
    async () => {
      const value =
        name.trim();

      if (!value) {
        setError(
          'Escribe el nombre de la categoría.'
        );

        return;
      }

      setError(null);

      try {
        await onCreate(
          value
        );

        setName('');
      } catch {
        // El error principal lo maneja el hook.
      }
    };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={
        onClose
      }
    >
      <View
        className="
          flex-1
          items-center
          justify-center
          bg-black/40
          px-5
        "
      >
        <View
          className="
            w-full
            max-w-md
            rounded-3xl
            bg-white
            p-5
          "
        >
          <View
            className="
              flex-row
              items-center
              justify-between
            "
          >
            <View>
              <Text
                className="
                  text-lg
                  font-extrabold
                  text-[#171A15]
                "
              >
                Nueva categoría
              </Text>

              <Text
                className="
                  mt-1
                  text-sm
                  text-[#7A8074]
                "
              >
                Crea una categoría para
                organizar tus productos.
              </Text>
            </View>

            <Pressable
              onPress={
                onClose
              }
              disabled={
                saving
              }
              className="
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#F2F3EE]
              "
            >
              <Ionicons
                name="close-outline"
                size={23}
                color="#44493F"
              />
            </Pressable>
          </View>

          <Text
            className="
              mb-2
              mt-6
              text-sm
              font-semibold
              text-[#343A30]
            "
          >
            Nombre
          </Text>

          <TextInput
            value={name}
            onChangeText={
              setName
            }
            placeholder="Ej. Hamburguesas"
            placeholderTextColor="#A1A69B"
            editable={
              !saving
            }
            className="
              rounded-2xl
              border
              border-[#DDE1D7]
              bg-[#F9FAF6]
              px-4
              py-3.5
              text-base
              text-[#171A15]
            "
          />

          {error ? (
            <Text
              className="
                mt-2
                text-sm
                text-[#B65D51]
              "
            >
              {error}
            </Text>
          ) : null}

          <View
            className="
              mt-6
              flex-row
              gap-3
            "
          >
            <Pressable
              onPress={
                onClose
              }
              disabled={
                saving
              }
              className="
                flex-1
                items-center
                rounded-2xl
                border
                border-[#DDE1D7]
                py-3.5
              "
            >
              <Text
                className="
                  font-bold
                  text-[#555B50]
                "
              >
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={
                handleCreate
              }
              disabled={
                saving
              }
              className="
                flex-1
                flex-row
                items-center
                justify-center
                rounded-2xl
                bg-[#6F8C3E]
                py-3.5
              "
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="add-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    className="
                      ml-2
                      font-bold
                      text-white
                    "
                  >
                    Crear
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}