// app/_layout.tsx
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { GlobalCartButton } from '@/components/client/GlobalCartButton';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';

export const unstable_settings = { initialRouteName: '(tabs)' };
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#F7F8F2' }}>
            <StatusBar style="dark" backgroundColor="#F7F8F2" translucent={false} />
            <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F8F2' } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(tabs-admin)" />
              <Stack.Screen name="(tabs-restaurant)" />
              <Stack.Screen name="(tabs-employee)" />
              <Stack.Screen name="login" options={{ presentation: 'modal' }} />
              <Stack.Screen name="register" options={{ presentation: 'modal' }} />
              <Stack.Screen name="registerRes" options={{ presentation: 'modal' }} />
              <Stack.Screen name="others/CochaStoreInfo" options={{ headerShown: false }} />
            </Stack>
            <GlobalCartButton />
            <Toast position="bottom" bottomOffset={24} />
          </SafeAreaView>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
