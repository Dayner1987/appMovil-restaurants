// components/restaurant/DeleteProductModal.tsx

import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

interface DeleteProductModalProps {
  visible: boolean;

  productName?: string;

  deleting?: boolean;

  onClose:
    () => void;

  onConfirm:
    () => Promise<void>;
}

export default function DeleteProductModal({
  visible,
  productName,
  deleting = false,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
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
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-[#FBECEA]
            "
          >
            <Ionicons
              name="trash-outline"
              size={23}
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
            Eliminar producto
          </Text>

          <Text
            className="
              mt-2
              text-sm
              leading-6
              text-[#777D71]
            "
          >
            Se eliminará{' '}
            <Text
              className="
                font-bold
                text-[#33382F]
              "
            >
              {productName ??
                'este producto'}
            </Text>
            . Esta acción no se puede
            deshacer.
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
                deleting
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
              onPress={() =>
                void onConfirm()
              }
              disabled={
                deleting
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
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="trash-outline"
                    size={19}
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