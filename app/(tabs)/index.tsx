// app/(tabs)/index.tsx

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

export default function HomeClient() {
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
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[14px] font-medium text-[#74796E]">
                Bienvenido
              </Text>

              <Text className="mt-1 text-[25px] font-bold text-[#171A15]">
                ¿Qué quieres comer hoy?
              </Text>
            </View>

            <Pressable className="relative h-12 w-12 items-center justify-center rounded-full bg-[#EEF3E3]">
              <Ionicons
                name="notifications-outline"
                size={23}
                color="#6F8C3E"
              />

              <View className="absolute right-[11px] top-[10px] h-[7px] w-[7px] rounded-full bg-[#D35B5B]" />
            </Pressable>
          </View>

          {/* BUSCADOR */}

          <Pressable className="mt-5 flex-row items-center rounded-2xl bg-[#F7F8F2] px-4 py-4">
            <Ionicons
              name="search-outline"
              size={21}
              color="#74796E"
            />

            <Text className="ml-3 flex-1 text-[14px] text-[#999E94]">
              Buscar restaurantes o productos
            </Text>

            <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#6F8C3E]">
              <Ionicons
                name="options-outline"
                size={18}
                color="#FFFFFF"
              />
            </View>
          </Pressable>
        </View>

        {/* CATEGORÍAS */}

        <View className="mt-5">
          <View className="mb-4 flex-row items-center justify-between px-5">
            <Text className="text-[19px] font-bold text-[#171A15]">
              Categorías
            </Text>

            <Pressable>
              <Text className="text-[13px] font-semibold text-[#6F8C3E]">
                Ver todas
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 12,
            }}
          >
            <Pressable className="w-[90px] items-center rounded-2xl bg-white px-2 py-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3E3]">
                <Ionicons
                  name="pizza-outline"
                  size={25}
                  color="#6F8C3E"
                />
              </View>

              <Text className="mt-2 text-[12px] font-semibold text-[#454A40]">
                Pizza
              </Text>
            </Pressable>

            <Pressable className="w-[90px] items-center rounded-2xl bg-white px-2 py-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F5E9]">
                <Ionicons
                  name="fast-food-outline"
                  size={25}
                  color="#607A35"
                />
              </View>

              <Text className="mt-2 text-[12px] font-semibold text-[#454A40]">
                Hamburguesa
              </Text>
            </Pressable>

            <Pressable className="w-[90px] items-center rounded-2xl bg-white px-2 py-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0DB]">
                <Ionicons
                  name="restaurant-outline"
                  size={25}
                  color="#6F8C3E"
                />
              </View>

              <Text className="mt-2 text-[12px] font-semibold text-[#454A40]">
                Almuerzo
              </Text>
            </Pressable>

            <Pressable className="w-[90px] items-center rounded-2xl bg-white px-2 py-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F6EA]">
                <Ionicons
                  name="ice-cream-outline"
                  size={25}
                  color="#607A35"
                />
              </View>

              <Text className="mt-2 text-[12px] font-semibold text-[#454A40]">
                Postres
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* PROMOCIÓN */}

        <View className="mx-5 mt-7 overflow-hidden rounded-[28px] bg-[#6F8C3E] p-5">
          <View className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />

          <View className="absolute -bottom-12 right-14 h-28 w-28 rounded-full bg-white/10" />

          <View className="w-[68%]">
            <View className="mb-3 self-start rounded-full bg-white/15 px-3 py-1.5">
              <Text className="text-[11px] font-semibold text-white">
                Oferta especial
              </Text>
            </View>

            <Text className="text-[24px] font-bold leading-[30px] text-white">
              Disfruta algo delicioso hoy
            </Text>

            <Text className="mt-2 text-[13px] leading-5 text-[#EFF4E6]">
              Descubre productos y promociones de tus restaurantes favoritos.
            </Text>

            <Pressable className="mt-5 self-start rounded-xl bg-white px-4 py-3">
              <Text className="text-[13px] font-bold text-[#607A35]">
                Explorar ahora
              </Text>
            </Pressable>
          </View>

          <View className="absolute bottom-5 right-5 h-[92px] w-[92px] items-center justify-center rounded-full bg-white/15">
            <Ionicons
              name="fast-food"
              size={48}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* RESTAURANTES DESTACADOS */}

        <View className="mt-8">
          <View className="mb-4 flex-row items-center justify-between px-5">
            <Text className="text-[19px] font-bold text-[#171A15]">
              Restaurantes destacados
            </Text>

            <Pressable>
              <Text className="text-[13px] font-semibold text-[#6F8C3E]">
                Ver todos
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 14,
            }}
          >
            <Pressable className="w-[235px] overflow-hidden rounded-[22px] bg-white">
              <View className="h-[125px] items-center justify-center bg-[#EEF3E3]">
                <View className="h-[74px] w-[74px] items-center justify-center rounded-[22px] bg-white">
                  <Ionicons
                    name="restaurant"
                    size={38}
                    color="#6F8C3E"
                  />
                </View>

                <View className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white">
                  <Ionicons
                    name="heart-outline"
                    size={18}
                    color="#6F8C3E"
                  />
                </View>

                <View className="absolute left-3 top-3 rounded-full bg-[#607A35] px-2.5 py-1.5">
                  <Text className="text-[9px] font-bold text-white">
                    ABIERTO
                  </Text>
                </View>
              </View>

              <View className="p-4">
                <Text className="text-[16px] font-bold text-[#171A15]">
                  Empanadas Pemelita
                </Text>

                <Text className="mt-1 text-[12px] text-[#74796E]">
                  Empanadas · Comida rápida
                </Text>

                <View className="mt-3 flex-row items-center">
                  <Ionicons
                    name="star"
                    size={15}
                    color="#D9A436"
                  />

                  <Text className="ml-1 text-[12px] font-semibold text-[#454A40]">
                    4.8
                  </Text>

                  <View className="mx-2 h-1 w-1 rounded-full bg-[#B9C0B4]" />

                  <Ionicons
                    name="time-outline"
                    size={14}
                    color="#6F8C3E"
                  />

                  <Text className="ml-1 text-[12px] text-[#74796E]">
                    20 - 30 min
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable className="w-[235px] overflow-hidden rounded-[22px] bg-white">
              <View className="h-[125px] items-center justify-center bg-[#F2F5E9]">
                <View className="h-[74px] w-[74px] items-center justify-center rounded-[22px] bg-white">
                  <Ionicons
                    name="pizza"
                    size={39}
                    color="#607A35"
                  />
                </View>

                <View className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white">
                  <Ionicons
                    name="heart-outline"
                    size={18}
                    color="#6F8C3E"
                  />
                </View>

                <View className="absolute left-3 top-3 rounded-full bg-[#607A35] px-2.5 py-1.5">
                  <Text className="text-[9px] font-bold text-white">
                    ABIERTO
                  </Text>
                </View>
              </View>

              <View className="p-4">
                <Text className="text-[16px] font-bold text-[#171A15]">
                  Pizza Central
                </Text>

                <Text className="mt-1 text-[12px] text-[#74796E]">
                  Pizza · Italiana
                </Text>

                <View className="mt-3 flex-row items-center">
                  <Ionicons
                    name="star"
                    size={15}
                    color="#D9A436"
                  />

                  <Text className="ml-1 text-[12px] font-semibold text-[#454A40]">
                    4.6
                  </Text>

                  <View className="mx-2 h-1 w-1 rounded-full bg-[#B9C0B4]" />

                  <Ionicons
                    name="time-outline"
                    size={14}
                    color="#6F8C3E"
                  />

                  <Text className="ml-1 text-[12px] text-[#74796E]">
                    25 - 35 min
                  </Text>
                </View>
              </View>
            </Pressable>
          </ScrollView>
        </View>

        {/* PRODUCTOS POPULARES */}

        <View className="mt-8 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[19px] font-bold text-[#171A15]">
              Productos populares
            </Text>

            <Pressable>
              <Text className="text-[13px] font-semibold text-[#6F8C3E]">
                Ver más
              </Text>
            </Pressable>
          </View>

          <Pressable className="rounded-[22px] bg-white p-3">
            <View className="flex-row items-center">
              <View className="h-[84px] w-[84px] items-center justify-center rounded-[18px] bg-[#EEF3E3]">
                <Ionicons
                  name="fast-food"
                  size={36}
                  color="#6F8C3E"
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-[16px] font-bold text-[#171A15]">
                  Empanada de pollo
                </Text>

                <Text className="mt-1 text-[12px] text-[#74796E]">
                  Empanadas Pemelita
                </Text>

                <Text className="mt-3 text-[17px] font-bold text-[#607A35]">
                  Bs 20.00
                </Text>
              </View>

              <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-[#6F8C3E]">
                <Ionicons
                  name="add"
                  size={23}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}