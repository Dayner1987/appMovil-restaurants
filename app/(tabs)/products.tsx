// app/(tabs)/products.tsx

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

export default function ProductsScreen() {
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
            <View>
              <Text className="text-[26px] font-bold text-[#171A15]">
                Productos
              </Text>

              <Text className="mt-1 text-[14px] text-[#74796E]">
                Encuentra algo delicioso
              </Text>
            </View>

            <Pressable className="relative h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3E3]">
              <Ionicons
                name="cart-outline"
                size={23}
                color="#6F8C3E"
              />

              <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-[#D35B5B] px-1">
                <Text className="text-[10px] font-bold text-white">
                  2
                </Text>
              </View>
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
              Buscar producto
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

        {/* CATEGORÍAS */}

        <View className="mt-5">
          <Text className="mb-4 px-5 text-[18px] font-bold text-[#171A15]">
            Categorías
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 10,
            }}
          >
            <Pressable className="flex-row items-center rounded-full bg-[#6F8C3E] px-4 py-3">
              <Ionicons
                name="grid-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text className="ml-2 text-[13px] font-semibold text-white">
                Todos
              </Text>
            </Pressable>

            <Pressable className="flex-row items-center rounded-full bg-white px-4 py-3">
              <Ionicons
                name="fast-food-outline"
                size={16}
                color="#6F8C3E"
              />

              <Text className="ml-2 text-[13px] font-semibold text-[#5C6257]">
                Comida
              </Text>
            </Pressable>

            <Pressable className="flex-row items-center rounded-full bg-white px-4 py-3">
              <Ionicons
                name="pizza-outline"
                size={16}
                color="#6F8C3E"
              />

              <Text className="ml-2 text-[13px] font-semibold text-[#5C6257]">
                Pizza
              </Text>
            </Pressable>

            <Pressable className="flex-row items-center rounded-full bg-white px-4 py-3">
              <Ionicons
                name="ice-cream-outline"
                size={16}
                color="#6F8C3E"
              />

              <Text className="ml-2 text-[13px] font-semibold text-[#5C6257]">
                Postres
              </Text>
            </Pressable>

            <Pressable className="flex-row items-center rounded-full bg-white px-4 py-3">
              <Ionicons
                name="cafe-outline"
                size={16}
                color="#6F8C3E"
              />

              <Text className="ml-2 text-[13px] font-semibold text-[#5C6257]">
                Bebidas
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* DESTACADO */}

        <View className="mx-5 mt-7 overflow-hidden rounded-[24px] bg-[#607A35] p-5">
          <View className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10" />

          <View className="absolute -bottom-9 right-16 h-24 w-24 rounded-full bg-white/10" />

          <View className="w-[70%]">
            <Text className="text-[12px] font-semibold text-[#EAF0DF]">
              Recomendación del día
            </Text>

            <Text className="mt-2 text-[21px] font-bold leading-7 text-white">
              Encuentra tu próxima comida favorita
            </Text>

            <Pressable className="mt-4 self-start rounded-xl bg-white px-4 py-2.5">
              <Text className="text-[12px] font-bold text-[#607A35]">
                Ver opciones
              </Text>
            </Pressable>
          </View>

          <View className="absolute bottom-5 right-5 h-[78px] w-[78px] items-center justify-center rounded-full bg-white/15">
            <Ionicons
              name="restaurant"
              size={38}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* PRODUCTOS */}

        <View className="mt-7 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-[#171A15]">
              Recomendados
            </Text>

            <Text className="text-[12px] text-[#74796E]">
              24 productos
            </Text>
          </View>

          {/* PRODUCTO 1 */}

          <Pressable className="mb-4 rounded-[22px] bg-white p-3">
            <View className="flex-row">
              <View className="h-[112px] w-[112px] items-center justify-center rounded-[20px] bg-[#EEF3E3]">
                <Ionicons
                  name="fast-food"
                  size={45}
                  color="#6F8C3E"
                />

                <View className="absolute left-2 top-2 rounded-full bg-[#607A35] px-2 py-1">
                  <Text className="text-[8px] font-bold text-white">
                    DISPONIBLE
                  </Text>
                </View>
              </View>

              <View className="ml-4 flex-1 py-1">
                <View className="flex-row items-start justify-between">
                  <Text className="flex-1 pr-2 text-[17px] font-bold text-[#171A15]">
                    Empanada de pollo
                  </Text>

                  <Pressable>
                    <Ionicons
                      name="heart-outline"
                      size={20}
                      color="#90958B"
                    />
                  </Pressable>
                </View>

                <Text
                  className="mt-1 text-[12px] leading-4 text-[#74796E]"
                  numberOfLines={2}
                >
                  Masa artesanal con relleno de pollo condimentado.
                </Text>

                <Text className="mt-2 text-[11px] font-semibold text-[#6F8C3E]">
                  Empanadas Pemelita
                </Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-[18px] font-bold text-[#171A15]">
                    Bs 20.00
                  </Text>

                  <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-[#6F8C3E]">
                    <Ionicons
                      name="add"
                      size={22}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </Pressable>

          {/* PRODUCTO 2 */}

          <Pressable className="mb-4 rounded-[22px] bg-white p-3">
            <View className="flex-row">
              <View className="h-[112px] w-[112px] items-center justify-center rounded-[20px] bg-[#F2F5E9]">
                <Ionicons
                  name="pizza"
                  size={46}
                  color="#607A35"
                />

                <View className="absolute left-2 top-2 rounded-full bg-[#607A35] px-2 py-1">
                  <Text className="text-[8px] font-bold text-white">
                    DISPONIBLE
                  </Text>
                </View>
              </View>

              <View className="ml-4 flex-1 py-1">
                <View className="flex-row items-start justify-between">
                  <Text className="flex-1 pr-2 text-[17px] font-bold text-[#171A15]">
                    Pizza especial
                  </Text>

                  <Pressable>
                    <Ionicons
                      name="heart-outline"
                      size={20}
                      color="#90958B"
                    />
                  </Pressable>
                </View>

                <Text
                  className="mt-1 text-[12px] leading-4 text-[#74796E]"
                  numberOfLines={2}
                >
                  Queso, jamón, tomate y nuestra salsa especial.
                </Text>

                <Text className="mt-2 text-[11px] font-semibold text-[#6F8C3E]">
                  Pizza Central
                </Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-[18px] font-bold text-[#171A15]">
                    Bs 48.00
                  </Text>

                  <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-[#6F8C3E]">
                    <Ionicons
                      name="add"
                      size={22}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </Pressable>

          {/* PRODUCTO 3 */}

          <Pressable className="mb-4 rounded-[22px] bg-white p-3">
            <View className="flex-row">
              <View className="h-[112px] w-[112px] items-center justify-center rounded-[20px] bg-[#EAF0E1]">
                <Ionicons
                  name="ice-cream"
                  size={45}
                  color="#6F8C3E"
                />
              </View>

              <View className="ml-4 flex-1 py-1">
                <View className="flex-row items-start justify-between">
                  <Text className="flex-1 pr-2 text-[17px] font-bold text-[#171A15]">
                    Helado especial
                  </Text>

                  <Pressable>
                    <Ionicons
                      name="heart-outline"
                      size={20}
                      color="#90958B"
                    />
                  </Pressable>
                </View>

                <Text
                  className="mt-1 text-[12px] leading-4 text-[#74796E]"
                  numberOfLines={2}
                >
                  Tres sabores acompañados de frutas y crema.
                </Text>

                <Text className="mt-2 text-[11px] font-semibold text-[#6F8C3E]">
                  Dulce Momento
                </Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-[18px] font-bold text-[#171A15]">
                    Bs 24.00
                  </Text>

                  <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-[#6F8C3E]">
                    <Ionicons
                      name="add"
                      size={22}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </Pressable>

          {/* PRODUCTO NO DISPONIBLE */}

          <Pressable className="mb-4 rounded-[22px] bg-white p-3 opacity-70">
            <View className="flex-row">
              <View className="h-[112px] w-[112px] items-center justify-center rounded-[20px] bg-[#ECEEE9]">
                <Ionicons
                  name="cafe"
                  size={45}
                  color="#8D9289"
                />

                <View className="absolute left-2 top-2 rounded-full bg-[#8D9289] px-2 py-1">
                  <Text className="text-[8px] font-bold text-white">
                    AGOTADO
                  </Text>
                </View>
              </View>

              <View className="ml-4 flex-1 py-1">
                <View className="flex-row items-start justify-between">
                  <Text className="flex-1 pr-2 text-[17px] font-bold text-[#171A15]">
                    Café especial
                  </Text>

                  <Ionicons
                    name="heart-outline"
                    size={20}
                    color="#A5AAA1"
                  />
                </View>

                <Text
                  className="mt-1 text-[12px] leading-4 text-[#74796E]"
                  numberOfLines={2}
                >
                  Café preparado al momento con granos seleccionados.
                </Text>

                <Text className="mt-2 text-[11px] font-semibold text-[#74796E]">
                  Café del Centro
                </Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-[18px] font-bold text-[#555A51]">
                    Bs 14.00
                  </Text>

                  <View className="h-9 w-9 items-center justify-center rounded-full bg-[#DADDD7]">
                    <Ionicons
                      name="remove"
                      size={21}
                      color="#858A81"
                    />
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}