// components/admin/AdminSalesChart.tsx

import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const salesData = [
  { day: 'L', value: 30 },
  { day: 'M', value: 44 },
  { day: 'X', value: 38 },
  { day: 'J', value: 58 },
  { day: 'V', value: 80 },
  { day: 'S', value: 67 },
  { day: 'D', value: 48 },
];

export default function AdminSalesChart() {
  const animatedValues = useRef(
    salesData.map(() => new Animated.Value(0))
  ).current;

  const maxValue = useMemo(
    () => Math.max(...salesData.map((item) => item.value)),
    []
  );

  const totalSales = useMemo(
    () => salesData.reduce((acc, item) => acc + item.value, 0),
    []
  );

  useEffect(() => {
    const animations = animatedValues.map((value, index) =>
      Animated.timing(value, {
        toValue: salesData[index].value,
        duration: 900,
        delay: index * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      })
    );

    Animated.stagger(70, animations).start();
  }, [animatedValues]);

  return (
    <View className="rounded-[28px] bg-white p-5">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-[18px] bg-[#F1F8DE]">
            <Ionicons
              name="stats-chart"
              size={22}
              color="#7B9646"
            />
          </View>

          <View>
            <Text className="text-[18px] font-extrabold text-[#262B1F]">
              Ventas de la semana
            </Text>

            <Text className="mt-1 text-[12px] text-[#8A8F7B]">
              Rendimiento semanal
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-[11px] text-[#9AA08F]">
            Total
          </Text>

          <Text className="mt-1 text-[20px] font-extrabold text-[#4E6B28]">
            Bs {totalSales.toFixed(2)}
          </Text>
        </View>
      </View>

      <View className="mt-6 h-[190px] flex-row items-end justify-between rounded-[24px] bg-[#FAFBF7] px-3 py-4">
        {salesData.map((item, index) => {
          const barHeight = animatedValues[index].interpolate({
            inputRange: [0, maxValue],
            outputRange: [0, 120],
            extrapolate: 'clamp',
          });

          return (
            <View
              key={item.day}
              className="flex-1 items-center justify-end"
            >
              <Animated.Text
                style={{
                  marginBottom: 6,
                  fontSize: 10,
                  color: '#868C79',
                  opacity: animatedValues[index].interpolate({
                    inputRange: [0, item.value],
                    outputRange: [0.2, 1],
                  }),
                }}
              >
                {item.value}
              </Animated.Text>

              <View
                style={{
                  width: 22,
                  height: 125,
                  justifyContent: 'flex-end',
                  overflow: 'hidden',
                  borderRadius: 99,
                  backgroundColor: '#EEF1E7',
                }}
              >
                <Animated.View
                  style={{
                    width: '100%',
                    height: barHeight,
                    borderRadius: 99,
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={['#B8D36F', '#8FB04E', '#E49A5E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      flex: 1,
                      borderRadius: 99,
                    }}
                  />
                </Animated.View>
              </View>

              <Text className="mt-2 text-[11px] font-bold text-[#777D6E]">
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="mt-4 flex-row items-center rounded-[18px] bg-[#F5F8ED] px-4 py-3">
        <Ionicons
          name="trending-up-outline"
          size={18}
          color="#739042"
        />

        <Text className="ml-2 flex-1 text-[12px] text-[#6C715F]">
          El viernes presenta el mayor rendimiento de ventas.
        </Text>
      </View>
    </View>
  );
}