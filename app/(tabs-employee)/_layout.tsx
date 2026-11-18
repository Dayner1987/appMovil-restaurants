import Ionicons from '@expo/vector-icons/Ionicons';
import DashboardNavbar from '@/components/DashboardNavbar';
import { Tabs } from 'expo-router';

const GREEN = '#617D34';
const MUTED = '#8B9285';

export default function EmployeeLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: ({ options }) => <DashboardNavbar title={options.title || 'Empleado'} />,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E6EADD',
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 9,
          elevation: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 1 },
        tabBarIconStyle: { marginTop: 1 },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Inicio',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
        ),
      }} />
      <Tabs.Screen name="orders" options={{
        title: 'Órdenes',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
        ),
      }} />
      <Tabs.Screen name="products" options={{
        title: 'Productos',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'fast-food' : 'fast-food-outline'} size={size} color={color} />
        ),
      }} />
      <Tabs.Screen name="sales" options={{
        title: 'Ventas',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={size} color={color} />
        ),
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Perfil',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />
        ),
      }} />
    </Tabs>
  );
}
