// app/(tabs-restaurant)/_layout.tsx

import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function RestaurantLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          '#6F8C3E',

        tabBarInactiveTintColor:
          '#858B80',

        tabBarStyle: {
          backgroundColor:
            '#FFFFFF',

          borderTopColor:
            '#E6E9E1',

          height:
            64,

          paddingTop:
            6,

          paddingBottom:
            7,
        },

        tabBarLabelStyle: {
          fontSize:
            10,

          fontWeight:
            '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:
            'Inicio',

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title:
            'Productos',

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="fast-food-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title:
            'Órdenes',

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="receipt-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="publications"
        options={{
          title:
            'Publicaciones',

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="newspaper-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="promotions"
        options={{
          title:
            'Promociones',

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="pricetag-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="restaurant"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}