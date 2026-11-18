// app/(tabs-admin)/others.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, Pressable, Text, View } from 'react-native';
import DashboardNavbar from '@/components/DashboardNavbar';
const sections = [
  { id: 'publications', title: 'Publicaciones', sub: 'Crear, editar, destacar y eliminar', icon: 'newspaper-outline' },
  { id: 'promotions', title: 'Promociones', sub: 'Descuentos y productos asociados', icon: 'pricetags-outline' },
  { id: 'restaurants', title: 'Restaurantes', sub: 'Consultar y administrar estados', icon: 'restaurant-outline' },
  { id: 'products', title: 'Productos', sub: 'Disponibilidad y edición del catálogo', icon: 'fast-food-outline' },
  { id: 'categories', title: 'Categorías', sub: 'Crear y mantener categorías', icon: 'grid-outline' },
  { id: 'orders', title: 'Pedidos', sub: 'Revisar pedidos y cambiar su estado', icon: 'receipt-outline' },
  { id: 'payments', title: 'Pagos', sub: 'Consultar los pagos registrados', icon: 'wallet-outline' },
  { id: 'applications', title: 'Solicitudes', sub: 'Revisar solicitudes de restaurantes', icon: 'document-text-outline' },
];
export default function AdminOthersScreen() {
  return <View className="flex-1 bg-[#F7F8F2]"><DashboardNavbar title="Gestión" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:18,paddingBottom:40}}>
    <Text className="mb-2 text-2xl font-extrabold text-[#252A20]">Más herramientas</Text><Text className="mb-5 text-sm text-[#858A7A]">Administración de la plataforma con información real de Strapi.</Text>
    {sections.map(s => <Pressable key={s.id} onPress={() => router.push({pathname: '/admin/[entity]', params:{entity:s.id}})} className="mb-3 flex-row items-center rounded-3xl bg-white p-4 active:opacity-80"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3E3]"><Ionicons name={s.icon as keyof typeof Ionicons.glyphMap} size={23} color="#607B35" /></View><View className="ml-4 flex-1"><Text className="text-base font-extrabold text-[#252A20]">{s.title}</Text><Text className="mt-1 text-xs text-[#858A7A]">{s.sub}</Text></View><Ionicons name="chevron-forward" color="#858A7A" size={21}/></Pressable>)}
  </ScrollView></View>;
}
