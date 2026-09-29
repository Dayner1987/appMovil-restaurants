// app/(tabs-restaurant)/publications.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function RestaurantPublicationsScreen() {
  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
    >
      <DashboardNavbar
        title="Publicaciones"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerClassName="
          px-5
          pb-10
          pt-5
        "
      >
        <View
          className="
            flex-row
            items-center
          "
        >
          <View
            className="
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-[#EEF3E3]
            "
          >
            <Ionicons
              name="newspaper-outline"
              size={24}
              color="#6F8C3E"
            />
          </View>

          <View
            className="
              ml-4
              flex-1
            "
          >
            <Text
              className="
                text-2xl
                font-extrabold
                text-[#171A15]
              "
            >
              Publicaciones
            </Text>

            <Text
              className="
                mt-1
                text-sm
                text-[#777D71]
              "
            >
              Contenido visible para los clientes.
            </Text>
          </View>
        </View>

        <View
          className="
            mt-7
            rounded-3xl
            bg-white
            p-5
          "
        >
          <Text
            className="
              text-base
              font-bold
              text-[#171A15]
            "
          >
            Contenido del restaurante
          </Text>

          <Text
            className="
              mt-2
              text-sm
              leading-6
              text-[#858B80]
            "
          >
            Aquí se mostrarán las publicaciones,
            imágenes y estado destacado.
          </Text>

          <View
            className="
              mt-5
              flex-row
              items-center
              rounded-2xl
              bg-[#EEF3E3]
              px-4
              py-3
            "
          >
            <Ionicons
              name="add-outline"
              size={23}
              color="#6F8C3E"
            />

            <Text
              className="
                ml-3
                font-semibold
                text-[#536A2F]
              "
            >
              Nueva publicación
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}