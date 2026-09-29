// app/(tabs-restaurant)/orders.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function RestaurantOrdersScreen() {
  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
    >
      <DashboardNavbar
        title="Órdenes"
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
              name="receipt-outline"
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
              Órdenes y pagos
            </Text>

            <Text
              className="
                mt-1
                text-sm
                text-[#777D71]
              "
            >
              Consulta las ventas realizadas y
              sus pagos registrados.
            </Text>
          </View>
        </View>

        <View
          className="
            mt-7
            flex-row
            gap-3
          "
        >
          <View
            className="
              flex-1
              rounded-2xl
              bg-white
              p-4
            "
          >
            <Text
              className="
                text-xs
                font-semibold
                uppercase
                text-[#858B80]
              "
            >
              Órdenes
            </Text>

            <Text
              className="
                mt-2
                text-2xl
                font-extrabold
                text-[#171A15]
              "
            >
              0
            </Text>
          </View>

          <View
            className="
              flex-1
              rounded-2xl
              bg-[#EEF3E3]
              p-4
            "
          >
            <Text
              className="
                text-xs
                font-semibold
                uppercase
                text-[#6F7F53]
              "
            >
              Ventas
            </Text>

            <Text
              className="
                mt-2
                text-2xl
                font-extrabold
                text-[#536A2F]
              "
            >
              Bs 0.00
            </Text>
          </View>
        </View>

        <View
          className="
            mt-5
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
            Historial de órdenes
          </Text>

          <Text
            className="
              mt-2
              text-sm
              leading-6
              text-[#858B80]
            "
          >
            Aquí se mostrarán las órdenes,
            productos vendidos, estados del
            pedido, pagos y comprobantes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}