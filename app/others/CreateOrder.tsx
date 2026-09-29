// app/others/CreateOrder.tsx

import {
  useMemo,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import OrderProductSelector from '@/components/restaurant/OrderProductSelector';

import type {
  SelectedOrderProduct,
} from '@/components/restaurant/OrderProductSelector';

import {
  calculateOrderTotals,
} from '@/hooks/useOrder';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useOrderCheckout,
} from '@/hooks/useOrderCheckout';

import {
  useProduct,
} from '@/hooks/useProduct';

import type {
  OrderType,
} from '@/types/orders.types';

import type {
  PaymentMethod,
} from '@/types/payment.types';

const orderTypes: {
  value:
    OrderType;

  label:
    string;
}[] = [
  {
    value:
      'COUNTER',

    label:
      'Mostrador',
  },

  {
    value:
      'PICKUP',

    label:
      'Recoger',
  },

  {
    value:
      'ONLINE',

    label:
      'Online',
  },
];

const paymentMethods: {
  value:
    PaymentMethod;

  label:
    string;
}[] = [
  {
    value:
      'CASH',

    label:
      'Efectivo',
  },

  {
    value:
      'QR',

    label:
      'QR',
  },

  {
    value:
      'CARD',

    label:
      'Tarjeta',
  },

  {
    value:
      'TRANSFER',

    label:
      'Transferencia',
  },
];

export default function CreateOrderScreen() {
  const params =
    useLocalSearchParams<{
      restaurantDocumentId?: string;
      restaurantName?: string;
    }>();

  const restaurantDocumentId =
    Array.isArray(
      params.restaurantDocumentId
    )
      ? params.restaurantDocumentId[0]
      : params.restaurantDocumentId;

  const restaurantName =
    Array.isArray(
      params.restaurantName
    )
      ? params.restaurantName[0]
      : params.restaurantName;

  const {
    user,
  } =
    useAuth();

  const [
    selectedProducts,
    setSelectedProducts,
  ] =
    useState<
      SelectedOrderProduct[]
    >([]);

  const [
    orderType,
    setOrderType,
  ] =
    useState<OrderType>(
      'COUNTER'
    );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      'CASH'
    );

  const [
    discount,
    setDiscount,
  ] =
    useState(
      '0'
    );

  const {
    products,

    loading:
      productsLoading,
  } =
    useProduct({
      autoLoad:
        Boolean(
          restaurantDocumentId
        ),

      query: {
        page:
          1,

        pageSize:
          100,

        sort:
          'name:asc',

        restaurantDocumentId,
      },
    });

  const {
    saving,

    createOrderWithPayment,
  } =
    useOrderCheckout();

  // =====================================================
  // TOTALS
  // =====================================================

  const totals =
    useMemo(
      () =>
        calculateOrderTotals(
          selectedProducts.map(
            (
              item
            ) => ({
              quantity:
                item.quantity,

              unitPrice:
                Number(
                  item.product
                    .price
                ),

              discount:
                0,
            })
          ),

          Number(
            discount
          ) ||
          0
        ),
      [
        selectedProducts,
        discount,
      ]
    );

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async () => {
      if (
        !restaurantDocumentId
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'Restaurante no disponible',

          text2:
            'No se pudo identificar el restaurante.',

          position:
            'bottom',
        });

        return;
      }

      if (
        selectedProducts.length ===
        0
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'Selecciona productos',

          text2:
            'Agrega al menos un producto a la orden.',

          position:
            'bottom',
        });

        return;
      }

      try {
        await createOrderWithPayment({
          restaurantDocumentId,

          userId:
            user?.id,

          orderType,

          paymentMethod,

          generalDiscount:
            Number(
              discount
            ) ||
            0,

          lines:
            selectedProducts.map(
              (
                item
              ) => ({
                product:
                  item.product,

                quantity:
                  item.quantity,

                discount:
                  0,
              })
            ),
        });

        Toast.show({
          type:
            'success',

          text1:
            'Orden creada',

          text2:
            'La orden, sus productos y el pago pendiente fueron registrados.',

          position:
            'bottom',
        });

        setTimeout(
          () => {
            router.back();
          },
          700
        );
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo crear la orden',

          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'Intenta nuevamente.',

          position:
            'bottom',

          visibilityTime:
            4000,
        });
      }
    };

  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#F7F8F2]
      "
      edges={[
        'top',
      ]}
    >
      {/* HEADER */}

      <View
        className="
          flex-row
          items-center
          border-b
          border-[#E5E8DE]
          bg-white
          px-5
          py-4
        "
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          disabled={
            saving
          }
          className="
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-[#F2F3EE]
          "
        >
          <Ionicons
            name="arrow-back-outline"
            size={23}
            color="#171A15"
          />
        </Pressable>

        <View
          className="
            ml-4
            flex-1
          "
        >
          <Text
            className="
              text-xl
              font-extrabold
              text-[#171A15]
            "
          >
            Nueva orden
          </Text>

          <Text
            className="
              mt-0.5
              text-xs
              text-[#858B80]
            "
          >
            {restaurantName ||
              'Restaurante'}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingBottom:
            160,
        }}
      >
        <View
          className="
            px-5
            pt-5
          "
        >
          {/* ORDER TYPE */}

          <Text
            className="
              text-base
              font-extrabold
              text-[#171A15]
            "
          >
            Tipo de orden
          </Text>

          <View
            className="
              mt-3
              flex-row
              gap-2
            "
          >
            {orderTypes.map(
              (
                option
              ) => {
                const selected =
                  orderType ===
                  option.value;

                return (
                  <Pressable
                    key={
                      option.value
                    }
                    onPress={() =>
                      setOrderType(
                        option.value
                      )
                    }
                    className={`
                      flex-1
                      items-center
                      rounded-2xl
                      px-2
                      py-3
                      ${
                        selected
                          ? 'bg-[#6F8C3E]'
                          : 'bg-white'
                      }
                    `}
                  >
                    <Text
                      className={`
                        text-sm
                        font-bold
                        ${
                          selected
                            ? 'text-white'
                            : 'text-[#62685D]'
                        }
                      `}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          {/* PRODUCTS */}

          <Text
            className="
              mt-7
              text-base
              font-extrabold
              text-[#171A15]
            "
          >
            Productos
          </Text>

          <Text
            className="
              mt-1
              text-sm
              text-[#858B80]
            "
          >
            Selecciona los productos y cantidades.
          </Text>

          <View
            className="
              mt-3
            "
          >
            {productsLoading ? (
              <View
                className="
                  items-center
                  py-10
                "
              >
                <ActivityIndicator
                  size="large"
                  color="#6F8C3E"
                />
              </View>
            ) : (
              <OrderProductSelector
                products={
                  products
                }
                selected={
                  selectedProducts
                }
                onChange={
                  setSelectedProducts
                }
              />
            )}
          </View>

          {/* DISCOUNT */}

          <Text
            className="
              mt-7
              text-base
              font-extrabold
              text-[#171A15]
            "
          >
            Descuento general
          </Text>

          <View
            className="
              mt-3
              flex-row
              items-center
              rounded-2xl
              bg-white
              px-4
            "
          >
            <Text
              className="
                font-bold
                text-[#858B80]
              "
            >
              Bs
            </Text>

            <TextInput
              value={
                discount
              }
              onChangeText={
                setDiscount
              }
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#A1A69B"
              className="
                ml-2
                flex-1
                py-4
                text-base
                text-[#171A15]
              "
            />
          </View>

          {/* PAYMENT */}

          <Text
            className="
              mt-7
              text-base
              font-extrabold
              text-[#171A15]
            "
          >
            Método de pago
          </Text>

          <View
            className="
              mt-3
              flex-row
              flex-wrap
              gap-2
            "
          >
            {paymentMethods.map(
              (
                option
              ) => {
                const selected =
                  paymentMethod ===
                  option.value;

                return (
                  <Pressable
                    key={
                      option.value
                    }
                    onPress={() =>
                      setPaymentMethod(
                        option.value
                      )
                    }
                    className={`
                      rounded-2xl
                      px-4
                      py-3
                      ${
                        selected
                          ? 'bg-[#6F8C3E]'
                          : 'bg-white'
                      }
                    `}
                  >
                    <Text
                      className={`
                        font-bold
                        ${
                          selected
                            ? 'text-white'
                            : 'text-[#62685D]'
                        }
                      `}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          {/* TOTAL */}

          <View
            className="
              mt-7
              rounded-3xl
              bg-white
              p-5
            "
          >
            <View
              className="
                flex-row
                justify-between
              "
            >
              <Text
                className="
                  text-sm
                  text-[#858B80]
                "
              >
                Subtotal
              </Text>

              <Text
                className="
                  font-bold
                  text-[#343A30]
                "
              >
                Bs{' '}
                {totals.subtotal.toFixed(
                  2
                )}
              </Text>
            </View>

            <View
              className="
                mt-3
                flex-row
                justify-between
              "
            >
              <Text
                className="
                  text-sm
                  text-[#858B80]
                "
              >
                Descuento
              </Text>

              <Text
                className="
                  font-bold
                  text-[#B65D51]
                "
              >
                - Bs{' '}
                {totals.discount.toFixed(
                  2
                )}
              </Text>
            </View>

            <View
              className="
                mt-4
                flex-row
                items-end
                justify-between
              "
            >
              <Text
                className="
                  text-base
                  font-extrabold
                  text-[#171A15]
                "
              >
                Total a pagar
              </Text>

              <Text
                className="
                  text-2xl
                  font-extrabold
                  text-[#536A2F]
                "
              >
                Bs{' '}
                {totals.total.toFixed(
                  2
                )}
              </Text>
            </View>
          </View>

          {/* SUBMIT */}

          <Pressable
            onPress={() =>
              void handleSubmit()
            }
            disabled={
              saving ||
              selectedProducts.length ===
                0
            }
            className={`
              mt-5
              flex-row
              items-center
              justify-center
              rounded-2xl
              py-4
              ${
                saving ||
                selectedProducts.length ===
                  0
                  ? 'bg-[#A5B28F]'
                  : 'bg-[#6F8C3E]'
              }
            `}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#FFFFFF"
                />

                <Text
                  className="
                    ml-2
                    text-base
                    font-extrabold
                    text-white
                  "
                >
                  Crear orden
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}