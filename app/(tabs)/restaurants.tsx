// app/(tabs)/restaurants.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

export default function RestaurantsScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* HEADER */}

        <View className="bg-white px-5 pb-5 pt-3">
          <Text className="text-[26px] font-bold text-[#171A15]">
            Restaurantes
          </Text>

          <Text className="mt-1 text-[14px] leading-5 text-[#74796E]">
            Encuentra un lugar para disfrutar tu próxima comida
          </Text>

          {/* BUSCADOR */}

          <Pressable className="mt-5 flex-row items-center rounded-2xl bg-[#F7F8F2] px-4 py-4">
            <Ionicons
              name="search-outline"
              size={21}
              color="#74796E"
            />

            <Text className="ml-3 flex-1 text-[14px] text-[#999E94]">
              Buscar restaurante
            </Text>

            <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#EEF3E3]">
              <Ionicons
                name="options-outline"
                size={19}
                color="#6F8C3E"
              />
            </View>
          </Pressable>
        </View>

        {/* FILTROS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 18,
            gap: 10,
          }}
        >
          <Pressable className="rounded-full bg-[#6F8C3E] px-5 py-3">
            <Text className="text-[13px] font-semibold text-white">
              Todos
            </Text>
          </Pressable>

          <Pressable className="flex-row items-center rounded-full bg-white px-4 py-3">
            <Ionicons
              name="location-outline"
              size={16}
              color="#6F8C3E"
            />

            <Text className="ml-1.5 text-[13px] font-semibold text-[#5C6257]">
              Cerca de ti
            </Text>
          </Pressable>

          <Pressable className="flex-row items-center rounded-full bg-white px-4 py-3">
            <Ionicons
              name="star-outline"
              size={16}
              color="#6F8C3E"
            />

            <Text className="ml-1.5 text-[13px] font-semibold text-[#5C6257]">
              Mejor valorados
            </Text>
          </Pressable>

          <Pressable className="flex-row items-center rounded-full bg-white px-4 py-3">
            <Ionicons
              name="pricetag-outline"
              size={16}
              color="#6F8C3E"
            />

            <Text className="ml-1.5 text-[13px] font-semibold text-[#5C6257]">
              Ofertas
            </Text>
          </Pressable>
        </ScrollView>

        {/* RESULTADOS */}

        <View className="px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-[#171A15]">
              Disponibles
            </Text>

            <Text className="text-[12px] text-[#74796E]">
              12 restaurantes
            </Text>
          </View>

          {/* RESTAURANTE 1 */}

          <Pressable className="mb-4 overflow-hidden rounded-[24px] bg-white">
            <View className="h-[165px] items-center justify-center bg-[#EEF3E3]">
              <View className="h-20 w-20 items-center justify-center rounded-[25px] bg-white">
                <Ionicons
                  name="restaurant"
                  size={41}
                  color="#6F8C3E"
                />
              </View>

              <View className="absolute left-4 top-4 flex-row items-center rounded-full bg-[#607A35] px-3 py-2">
                <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />

                <Text className="text-[10px] font-bold text-white">
                  ABIERTO
                </Text>
              </View>

              <Pressable className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white">
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color="#6F8C3E"
                />
              </Pressable>
            </View>

            <View className="p-5">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[19px] font-bold text-[#171A15]">
                    Empanadas Pemelita
                  </Text>

                  <Text className="mt-1 text-[13px] text-[#74796E]">
                    Empanadas · Comida rápida
                  </Text>
                </View>

                <View className="flex-row items-center rounded-xl bg-[#F6F2E6] px-2.5 py-2">
                  <Ionicons
                    name="star"
                    size={15}
                    color="#D9A436"
                  />

                  <Text className="ml-1 text-[12px] font-bold text-[#5E5A4E]">
                    4.8
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center">
                <View className="mr-5 flex-row items-center">
                  <Ionicons
                    name="time-outline"
                    size={17}
                    color="#6F8C3E"
                  />

                  <Text className="ml-2 text-[12px] text-[#62675E]">
                    20 - 30 min
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={17}
                    color="#6F8C3E"
                  />

                  <Text className="ml-1 text-[12px] text-[#62675E]">
                    1.2 km
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* RESTAURANTE 2 */}

          <Pressable className="mb-4 overflow-hidden rounded-[24px] bg-white">
            <View className="h-[165px] items-center justify-center bg-[#F2F5E9]">
              <View className="h-20 w-20 items-center justify-center rounded-[25px] bg-white">
                <Ionicons
                  name="pizza"
                  size={43}
                  color="#607A35"
                />
              </View>

              <View className="absolute left-4 top-4 flex-row items-center rounded-full bg-[#607A35] px-3 py-2">
                <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />

                <Text className="text-[10px] font-bold text-white">
                  ABIERTO
                </Text>
              </View>

              <Pressable className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white">
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color="#6F8C3E"
                />
              </Pressable>
            </View>

            <View className="p-5">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[19px] font-bold text-[#171A15]">
                    Pizza Central
                  </Text>

                  <Text className="mt-1 text-[13px] text-[#74796E]">
                    Pizza · Italiana
                  </Text>
                </View>

                <View className="flex-row items-center rounded-xl bg-[#F6F2E6] px-2.5 py-2">
                  <Ionicons
                    name="star"
                    size={15}
                    color="#D9A436"
                  />

                  <Text className="ml-1 text-[12px] font-bold text-[#5E5A4E]">
                    4.6
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center">
                <View className="mr-5 flex-row items-center">
                  <Ionicons
                    name="time-outline"
                    size={17}
                    color="#6F8C3E"
                  />

                  <Text className="ml-2 text-[12px] text-[#62675E]">
                    25 - 35 min
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={17}
                    color="#6F8C3E"
                  />

                  <Text className="ml-1 text-[12px] text-[#62675E]">
                    2.0 km
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* RESTAURANTE 3 */}

          <Pressable className="mb-4 overflow-hidden rounded-[24px] bg-white">
            <View className="h-[165px] items-center justify-center bg-[#E9EFE0]">
              <View className="h-20 w-20 items-center justify-center rounded-[25px] bg-white">
                <Ionicons
                  name="cafe"
                  size={42}
                  color="#607A35"
                />
              </View>

              <View className="absolute left-4 top-4 flex-row items-center rounded-full bg-[#8E9488] px-3 py-2">
                <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />

                <Text className="text-[10px] font-bold text-white">
                  CERRADO
                </Text>
              </View>

              <Pressable className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white">
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color="#6F8C3E"
                />
              </Pressable>
            </View>

            <View className="p-5">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[19px] font-bold text-[#171A15]">
                    Café del Centro
                  </Text>

                  <Text className="mt-1 text-[13px] text-[#74796E]">
                    Café · Desayunos
                  </Text>
                </View>

                <View className="flex-row items-center rounded-xl bg-[#F6F2E6] px-2.5 py-2">
                  <Ionicons
                    name="star"
                    size={15}
                    color="#D9A436"
                  />

                  <Text className="ml-1 text-[12px] font-bold text-[#5E5A4E]">
                    4.7
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center">
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#6F8C3E"
                />

                <Text className="ml-2 text-[12px] text-[#62675E]">
                  2.7 km de distancia
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}