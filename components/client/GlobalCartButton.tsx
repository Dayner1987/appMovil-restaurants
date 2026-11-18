
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useSegments } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useCart } from '@/hooks/useCart';

const publicScreens = new Set([
  'product',
  'restaurant',
  'promotions',
  'publications',
  'my-orders',
  'order',
]);

export function GlobalCartButton() {
  const segments = useSegments();
  const { itemCount, total } = useCart();

  const first = String(segments[0] ?? '');
  const second = String(segments[1] ?? '');

  const isClientTab = first === '(tabs)';
  const isProfile = isClientTab && second === 'profile';

  const isPublicScreen = publicScreens.has(first);

  const shouldShow =
    (isClientTab || isPublicScreen) &&
    !isProfile &&
    first !== 'cart';

  if (!shouldShow) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: 16,
        bottom: isClientTab ? 132 : 24,
        zIndex: 50,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir carrito, ${itemCount} productos`}
        onPress={() => router.push('/cart')}
        style={{
          minHeight: 56,
          minWidth: 60,
          borderRadius: 22,
          backgroundColor: '#2F6A46',
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 8,
          shadowColor: '#173A28',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: 4,
          },
        }}
      >
        <Ionicons
          name="cart-outline"
          size={25}
          color="#FFFFFF"
        />

        {itemCount > 0 && (
          <>
            <View
              style={{
                position: 'absolute',
                top: -8,
                right: -5,
                minWidth: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#F5B941',
                borderWidth: 2,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 3,
              }}
            >
              <Text
                style={{
                  color: '#243528',
                  fontWeight: '900',
                  fontSize: 11,
                }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Text>
            </View>

            <Text
              style={{
                marginLeft: 10,
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: 14,
              }}
            >
              Bs {total.toFixed(2)}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
