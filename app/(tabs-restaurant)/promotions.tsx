// app/(tabs-restaurant)/promotions.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function RestaurantPromotionsScreen() {
  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
    >
      <DashboardNavbar
        title="Promociones"
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
              bg-[#FFF0DD]
            "
          >
            <Ionicons
              name="pricetag-outline"
              size={24}
              color="#D47A24"
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
              Promociones
            </Text>

            <Text
              className="
                mt-1
                text-sm
                text-[#777D71]
              "
            >
              Descuentos y beneficios aplicados
              a productos.
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
            Gestión de promociones
          </Text>

          <Text
            className="
              mt-2
              text-sm
              leading-6
              text-[#858B80]
            "
          >
            Aquí se podrán crear promociones por
            porcentaje, monto fijo o promociones
            por cantidad.
          </Text>

          <View
            className="
              mt-5
              flex-row
              items-center
              rounded-2xl
              bg-[#FFF0DD]
              px-4
              py-3
            "
          >
            <Ionicons
              name="add-circle-outline"
              size={22}
              color="#D47A24"
            />

            <Text
              className="
                ml-3
                font-semibold
                text-[#A75C19]
              "
            >
              Crear promoción
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}