// app/(tabs)/_layout.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, useSegments } from 'expo-router';
import DashboardNavbar from '@/components/DashboardNavbar';
import { View } from 'react-native';

const ACTIVE = '#2F6A46';
const INACTIVE = '#87938A';

function TabIcon({ name, selected, color }: {
  name: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  color: string;
}) {
  return (
    <View style={{ width: 42, height: 32, borderRadius: 16,
      backgroundColor: selected ? '#E1F0E4' : 'transparent',
      justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name={name} size={23} color={color} />
    </View>
  );
}


function ClientTabHeader() {
  const segments = useSegments();
  const active = String(segments[1] ?? 'index');
  const titles: Record<string, string> = {
    index: 'Inicio',
    restaurants: 'Locales',
    products: 'Productos',
    orders: 'Órdenes',
    publications: 'Novedades',
    profile: 'Perfil',
  };
  return <DashboardNavbar title={titles[active] ?? 'Sistema'} />;
}

export default function ClientTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true,
      header: () => <ClientTabHeader />,
      tabBarActiveTintColor: ACTIVE,
      tabBarInactiveTintColor: INACTIVE,
      tabBarHideOnKeyboard: true,
      tabBarStyle: {
        height: 72, paddingTop: 7, paddingBottom: 8,
        borderTopWidth: 1, borderTopColor: '#EBF0EA', backgroundColor: '#FFFFFF', elevation: 13,
      },
      tabBarLabelStyle: { fontSize: 9, fontWeight: '800', marginTop: 1 },
      tabBarItemStyle: { minWidth: 0 },
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Inicio', tabBarIcon: ({ color, focused }) =>
          <TabIcon name={focused ? 'home' : 'home-outline'} selected={focused} color={color} />,
      }} />
      <Tabs.Screen name="restaurants" options={{
        title: 'Locales', tabBarIcon: ({ color, focused }) =>
          <TabIcon name={focused ? 'storefront' : 'storefront-outline'} selected={focused} color={color} />,
      }} />
      <Tabs.Screen name="products" options={{
        title: 'Productos', tabBarIcon: ({ color, focused }) =>
          <TabIcon name={focused ? 'fast-food' : 'fast-food-outline'} selected={focused} color={color} />,
      }} />
     
      <Tabs.Screen name="publications" options={{
        title: 'Novedades', tabBarIcon: ({ color, focused }) =>
          <TabIcon name={focused ? 'newspaper' : 'newspaper-outline'} selected={focused} color={color} />,
      }} />
       <Tabs.Screen name="orders" options={{
        title: 'Órdenes', tabBarIcon: ({ color, focused }) =>
          <TabIcon name={focused ? 'receipt' : 'receipt-outline'} selected={focused} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Perfil', tabBarIcon: ({ color, focused }) =>
          <TabIcon name={focused ? 'person' : 'person-outline'} selected={focused} color={color} />,
      }} />
    </Tabs>
  );
}
