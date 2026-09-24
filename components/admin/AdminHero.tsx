// components/admin/AdminHero.tsx

import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

export default function AdminHero() {
  return (
    <LinearGradient
      colors={[
        '#0B0B0B',
        '#151515',
        '#242424',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 30,
        overflow: 'hidden',
      }}
    >
      <View className="min-h-[230px] flex-row items-center overflow-hidden px-5 py-4">
        <View className="flex-1 pr-1">
          <Text className="text-[27px] font-extrabold leading-9 text-white">
            Controla tu plataforma desde un solo lugar
          </Text>

          <Text className="mt-3 max-w-[210px] text-[13px] leading-5 text-white/70">
            Revisa solicitudes, actividad y ventas de los restaurantes.
          </Text>
        </View>

        <View className="h-[200px] w-[170px] items-center justify-center">
          <LottieView
            source={require('../../assets/fonts/panelAdmin.json')}
            autoPlay
            loop
            style={{
              width: 205,
              height: 205,
            }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}