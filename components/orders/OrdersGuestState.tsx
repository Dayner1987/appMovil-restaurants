import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Pressable, Text, View } from 'react-native';

// Cuando tengas tu animación, reemplaza null por:
// require('../../assets/lotties/ordenes-login.json')
// La ruta se configura únicamente en este archivo.
const ORDERS_LOTTIE_SOURCE: any = require('../../assets/lotties/publicaciones-vacias.json');

export default function OrdersGuestState() {
  return (
    <View className="mx-5 mt-5 items-center rounded-[30px] border border-[#E5ECE3] bg-white px-6 py-7">
      {ORDERS_LOTTIE_SOURCE ? (
        <LottieView source={ORDERS_LOTTIE_SOURCE} autoPlay loop style={{ width: 190, height: 170 }} />
      ) : (
        <View className="h-36 w-36 items-center justify-center rounded-full bg-[#EAF2E8]">
          <Ionicons name="receipt-outline" size={66} color="#2F6A46" />
        </View>
      )}
      <Text className="mt-5 text-center text-xl font-extrabold text-[#253729]">Tus órdenes te esperan</Text>
      <Text className="mt-2 text-center text-sm leading-6 text-[#788579]">
        Inicia sesión para consultar tus pedidos, revisar su estado y descargar tus recibos.
      </Text>
      <Pressable onPress={() => router.push('/login')} className="mt-5 w-full items-center rounded-2xl bg-[#2F6A46] py-4">
        <Text className="font-extrabold text-white">Iniciar sesión</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/register')} className="mt-3 w-full items-center rounded-2xl border border-[#D9E5D8] bg-[#F7FAF5] py-4">
        <Text className="font-extrabold text-[#2F6A46]">Crear una cuenta</Text>
      </Pressable>
    </View>
  );
}
