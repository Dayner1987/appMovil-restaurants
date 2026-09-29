// app/(tabs-restaurant)/index.tsx

import Ionicons from '@expo/vector-icons/Ionicons';
import {
  router,
} from 'expo-router';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import DashboardNavbar from '@/components/DashboardNavbar';

interface DashboardOptionProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  title:
    string;

  description:
    string;

  onPress:
    () => void;
}

function DashboardOption({
  icon,
  title,
  description,
  onPress,
}: DashboardOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className="
        flex-row
        items-center
        rounded-2xl
        bg-white
        px-4
        py-4
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
          name={icon}
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
            text-base
            font-bold
            text-[#171A15]
          "
        >
          {title}
        </Text>

        <Text
          className="
            mt-1
            text-sm
            leading-5
            text-[#7B8175]
          "
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color="#A1A69B"
      />
    </Pressable>
  );
}

export default function RestaurantHomeScreen() {
  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
    >
      <DashboardNavbar
        title="Restaurante"
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
        <Text
          className="
            text-3xl
            font-extrabold
            text-[#171A15]
          "
        >
          Panel del restaurante
        </Text>

        <Text
          className="
            mt-2
            text-sm
            leading-6
            text-[#747A6E]
          "
        >
          Administra la información,
          productos, ventas y contenido
          de tu restaurante.
        </Text>

        <View
          className="
            mt-7
            gap-3
          "
        >
          <DashboardOption
            icon="restaurant-outline"
            title="Información del restaurante"
            description="Consulta y edita la información principal del negocio."
            onPress={() =>
              router.push(
                '/(tabs-restaurant)/restaurant'
              )
            }
          />

          <DashboardOption
            icon="fast-food-outline"
            title="Productos"
            description="Administra los productos y categorías disponibles."
            onPress={() =>
              router.push(
                '/(tabs-restaurant)/products'
              )
            }
          />

          <DashboardOption
            icon="newspaper-outline"
            title="Publicaciones"
            description="Crea y administra publicaciones del restaurante."
            onPress={() =>
              router.push(
                '/(tabs-restaurant)/publications'
              )
            }
          />

          <DashboardOption
            icon="pricetag-outline"
            title="Promociones"
            description="Administra descuentos y promociones para tus productos."
            onPress={() =>
              router.push(
                '/(tabs-restaurant)/promotions'
              )
            }
          />

          <DashboardOption
            icon="receipt-outline"
            title="Órdenes y pagos"
            description="Consulta pedidos realizados, estados y pagos registrados."
            onPress={() =>
              router.push(
                '/(tabs-restaurant)/orders'
              )
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}