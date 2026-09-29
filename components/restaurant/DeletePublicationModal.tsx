// components/restaurant/DeletePublicationModal.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

interface DeletePublicationModalProps {
  visible:
    boolean;

  title?:
    string;

  saving?:
    boolean;

  onClose:
    () => void;

  onConfirm:
    () => Promise<void>;
}

export default function DeletePublicationModal({
  visible,
  title,
  saving = false,
  onClose,
  onConfirm,
}: DeletePublicationModalProps) {
  return (
    <Modal
      visible={
        visible
      }
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
            p-6
          "
        >
          <View
            className="
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-[#FBECEA]
            "
          >
            <Ionicons
              name="trash-outline"
              size={26}
              color="#B65D51"
            />
          </View>

          <Text
            className="
              mt-4
              text-xl
              font-extrabold
              text-[#171A15]
            "
          >
            Eliminar publicación
          </Text>

          <Text
            className="
              mt-2
              text-sm
              leading-6
              text-[#747B6D]
            "
          >
            ¿Deseas eliminar
            {title
              ? ` "${title}"`
              : ' esta publicación'}
            ? Esta acción no se puede deshacer.
          </Text>

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
                bg-[#F1F2EE]
                py-3.5
              "
            >
              <Text
                className="
                  font-bold
                  text-[#4E534A]
                "
              >
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                void onConfirm()
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
                bg-[#B65D51]
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
                    name="trash-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    className="
                      ml-2
                      font-bold
                      text-white
                    "
                  >
                    Eliminar
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