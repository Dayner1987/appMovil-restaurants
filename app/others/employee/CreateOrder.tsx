// app/employee/CreateOrder.tsx

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';
import DashboardNavbar from '@/components/DashboardNavbar';
import { MediaThumb } from '@/components/client/CatalogUI';
import { usePromotion } from '@/hooks/usePromotion';
import { promotionShortLabel } from '@/utils/promotion-pricing';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import {
  useEmployeeContext,
} from '@/hooks/useEmployeeContext';

import {
  useProduct,
} from '@/hooks/useProduct';

import {
  employeeShiftService,
} from '@/services/employee-shift.service';

import {
  employeeOperationsService,
} from '@/services/employee-operations.service';

import type {
  Product,
} from '@/types/product.types';

import type {
  EmployeeShift,
} from '@/types/employee.types';

import type {
  OrderType,
} from '@/types/orders.types';

function generateOrderCode() {
  const timestamp =
    Date.now()
      .toString()
      .slice(-8);

  return `EMP-${timestamp}`;
}

export default function CreateEmployeeOrderScreen() {
  const {
    employeeId,

    restaurant,

    restaurantDocumentId,

    loading:
      contextLoading,
  } =
    useEmployeeContext();

  const {
    products,

    loading:
      productsLoading,

    loadProducts,
  } =
    useProduct({
      autoLoad:
        false,
    });

  const {
    loadPromotions,
    calculateProductPrice,
  } = usePromotion({ autoLoad: false });

  const [
    shift,
    setShift,
  ] =
    useState<EmployeeShift | null>(
      null
    );

  const [
    orderType,
    setOrderType,
  ] =
    useState<OrderType>(
      'COUNTER'
    );

  const [
    quantities,
    setQuantities,
  ] =
    useState<
      Record<
        string,
        number
      >
    >({});

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const loadData =
    useCallback(
      async () => {
        if (
          !employeeId ||
          !restaurantDocumentId
        ) {
          return;
        }

        try {
          const [currentShift] = await Promise.all([
            employeeShiftService.findCurrentOpen(employeeId, restaurantDocumentId),
            loadProducts({
              page: 1,
              pageSize: 100,
              sort: 'name:asc',
              available: true,
              restaurantDocumentId,
            }),
          ]);

          setShift(currentShift);

          // La falta de permiso de lectura de promociones no debe bloquear
          // la creación de órdenes del personal. Si falla, se muestran los
          // precios normales y el administrador puede revisar permisos.
          try {
            await loadPromotions({
              restaurantDocumentId,
              page: 1,
              pageSize: 100,
              status: 'published',
            });
          } catch {
            Toast.show({
              type: 'warning',
              text1: 'No se pudieron cargar las promociones',
              text2: 'Se mostrarán los precios normales. Revisa los permisos de lectura.',
              position: 'bottom',
            });
          }
        } catch {
          Toast.show({
            type:
              'error',

            text1:
              'No se pudieron cargar los datos',

            position:
              'bottom',
          });
        }
      },
      [
        employeeId,
        restaurantDocumentId,
        restaurant?.id,
        loadProducts,
        loadPromotions,
      ]
    );

  useFocusEffect(
    useCallback(() => {
      void loadData();

      return undefined;
    }, [
      loadData,
    ])
  );

  const availableProducts =
    useMemo(
      () =>
        products.filter(
          (
            product
          ) =>
            product.isAvailable &&
            Number(
              product.stock ??
              0
            ) >
              0
        ),
      [
        products,
      ]
    );

  const selectedLines =
    useMemo(
      () =>
        availableProducts
          .map(
            (
              product
            ) => ({
              product,

              quantity:
                quantities[
                  product.documentId
                ] ??
                0,
            })
          )
          .filter(
            (
              line
            ) =>
              line.quantity >
              0
          ),
      [
        availableProducts,
        quantities,
      ]
    );

  const calculatedLines =
    useMemo(
      () => selectedLines.map((line) => {
        const price = Number(line.product.price ?? 0);
        const calculation = calculateProductPrice(
          line.quantity,
          price,
          undefined,
          line.product.documentId
        );
        return { ...line, calculation };
      }),
      [selectedLines, calculateProductPrice]
    );

  const subtotal = useMemo(
    () => Number(calculatedLines.reduce((sum, line) => sum + line.calculation.originalTotal, 0).toFixed(2)),
    [calculatedLines]
  );

  const discount = useMemo(
    () => Number(calculatedLines.reduce((sum, line) => sum + line.calculation.discount, 0).toFixed(2)),
    [calculatedLines]
  );

  const total = useMemo(
    () => Number(calculatedLines.reduce((sum, line) => sum + line.calculation.finalTotal, 0).toFixed(2)),
    [calculatedLines]
  );

  function changeQuantity(
    product:
      Product,

    difference:
      number
  ) {
    const current =
      quantities[
        product.documentId
      ] ??
      0;

    const stock =
      Number(
        product.stock ??
        0
      );

    const next =
      Math.max(
        0,
        Math.min(
          current +
            difference,
          stock
        )
      );

    setQuantities(
      (
        previous
      ) => ({
        ...previous,

        [product.documentId]:
          next,
      })
    );
  }

  async function handleCreate() {
    if (
      saving
    ) {
      return;
    }

    if (
      !employeeId ||
      !restaurantDocumentId
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'Datos incompletos',

        text2:
          'No se pudo identificar empleado o restaurante.',

        position:
          'bottom',
      });

      return;
    }

    if (
      !shift
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'Jornada requerida',

        text2:
          'Debes iniciar una jornada antes de crear órdenes.',

        position:
          'bottom',
      });

      return;
    }

    if (
      selectedLines.length ===
      0
    ) {
      Toast.show({
        type:
          'error',

        text1:
          'Orden vacía',

        text2:
          'Selecciona al menos un producto.',

        position:
          'bottom',
      });

      return;
    }

    setSaving(
      true
    );

    let orderDocumentId:
      | string
      | null =
      null;

    const createdItems:
      string[] = [];

    try {
      const response =
        await employeeOperationsService
          .createOrder({
            orderCode:
              generateOrderCode(),

            orderType,

            statusOrder:
              'PENDING',

            paymentStatus:
              'PENDING',

            subtotal,

            discount,

            total,

            orderedAt:
              new Date()
                .toISOString(),

            completeAt:
              null,

            restaurant:
              restaurantDocumentId,

            createdByUser:
              employeeId,

            shift:
              shift.documentId,
          });

      orderDocumentId =
        response.data
          .documentId;

      for (
        const line of
        calculatedLines
      ) {
        const price = Number(line.product.price ?? 0);

        const itemResponse =
          await employeeOperationsService
            .createOrderItem({
              quantity:
                line.quantity,

              unitPrice:
                price,

              discount:
                line.calculation.discount,

              subtotal:
                line.calculation.finalTotal,

              productName:
                line.product
                  .name,

              product:
                line.product
                  .documentId,

              order:
                orderDocumentId,
            });

        if (
          itemResponse.data
            .documentId
        ) {
          createdItems.push(
            itemResponse.data
              .documentId
          );
        }
      }

      Toast.show({
        type:
          'success',

        text1:
          'Orden creada',

        text2:
          `${response.data.orderCode} fue registrada correctamente.`,

        position:
          'bottom',
      });

      router.back();
    } catch (
      error
    ) {
      for (
        const itemId of
        createdItems
      ) {
        try {
          await employeeOperationsService
            .removeOrderItem(
              itemId
            );
        } catch {
          // rollback best effort
        }
      }

      if (
        orderDocumentId
      ) {
        try {
          await employeeOperationsService
            .removeOrder(
              orderDocumentId
            );
        } catch {
          // rollback best effort
        }
      }

      Toast.show({
        type:
          'error',

        text1:
          'No se pudo crear la orden',

        text2:
          error instanceof
            Error
            ? error.message
            : 'Intenta nuevamente.',

        position:
          'bottom',
      });
    } finally {
      setSaving(
        false
      );
    }
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F8F2]"
      edges={[
        'top',
        'bottom',
      ]}
    >
      <DashboardNavbar title="Nueva orden" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          padding:
            16,

          paddingBottom:
            160,
        }}
      >
        {!shift &&
        !contextLoading ? (
          <View className="mb-4 rounded-[18px] bg-[#F7ECE8] p-4">
            <Text className="text-[13px] font-bold text-[#9A5D51]">
              No tienes una jornada abierta.
            </Text>
          </View>
        ) : null}

        <Text className="text-[17px] font-extrabold text-[#252A20]">
          Tipo de orden
        </Text>

        <View className="mt-3 flex-row gap-3">
          {[
            'COUNTER',
            'PICKUP',
          ].map(
            (
              type
            ) => {
              const active =
                orderType ===
                type;

              return (
                <Pressable
                  key={
                    type
                  }
                  onPress={() =>
                    setOrderType(
                      type as OrderType
                    )
                  }
                  className={`flex-1 items-center rounded-[16px] py-3 ${
                    active
                      ? 'bg-[#7B9646]'
                      : 'bg-white'
                  }`}
                >
                  <Text
                    className={`text-[12px] font-bold ${
                      active
                        ? 'text-white'
                        : 'text-[#60675A]'
                    }`}
                  >
                    {type ===
                    'COUNTER'
                      ? 'Mostrador'
                      : 'Recoger'}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        <Text className="mb-3 mt-6 text-[17px] font-extrabold text-[#252A20]">
          Productos
        </Text>

        {productsLoading ? (
          <ActivityIndicator
            color="#7B9646"
          />
        ) : (
          availableProducts.map(
            (
              product
            ) => {
              const quantity =
                quantities[
                  product.documentId
                ] ??
                0;

              return (
                <View
                  key={
                    product.documentId
                  }
                  className={`mb-3 flex-row items-center rounded-[20px] bg-white p-4 ${calculateProductPrice(1, Number(product.price ?? 0), undefined, product.documentId).appliedPromotion ? 'border-2 border-[#E36B35]' : 'border border-transparent'}`}
                >
                  <View className="h-16 w-16 overflow-hidden rounded-[16px] bg-[#EEF3E3]">
                    <MediaThumb src={product.mainImage ?? product.gallery?.[0]} height={64} icon="fast-food-outline" />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-[14px] font-extrabold text-[#252A20]" numberOfLines={2}>
                      {product.name}
                    </Text>

                    {calculateProductPrice(1, Number(product.price ?? 0), undefined, product.documentId).appliedPromotion ? (
                      <View className="mt-1 self-start rounded-full bg-[#FFF0E8] px-2 py-1">
                        <Text className="text-[9px] font-extrabold text-[#D45E2A]">
                          {promotionShortLabel(calculateProductPrice(1, Number(product.price ?? 0), undefined, product.documentId).appliedPromotion!)}
                        </Text>
                      </View>
                    ) : null}

                    <View className="mt-1 flex-row flex-wrap items-center gap-2">
                      <Text className={`text-[12px] font-bold ${calculateProductPrice(1, Number(product.price ?? 0), undefined, product.documentId).appliedPromotion ? 'text-[#D45E2A]' : 'text-[#617D34]'}`}>
                        Bs {calculateProductPrice(1, Number(product.price ?? 0), undefined, product.documentId).finalTotal.toFixed(2)}
                      </Text>
                      {calculateProductPrice(1, Number(product.price ?? 0), undefined, product.documentId).appliedPromotion ? (
                        <Text className="text-[10px] text-[#929889] line-through">Bs {Number(product.price ?? 0).toFixed(2)}</Text>
                      ) : null}
                    </View>

                    <Text className="mt-1 text-[10px] text-[#858A7A]">
                      Stock: {product.stock ?? 0}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Pressable
                      onPress={() =>
                        changeQuantity(
                          product,
                          -1
                        )
                      }
                      className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F3EC]"
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color="#617D34"
                      />
                    </Pressable>

                    <Text className="mx-3 min-w-5 text-center text-[14px] font-extrabold text-[#252A20]">
                      {quantity}
                    </Text>

                    <Pressable
                      onPress={() =>
                        changeQuantity(
                          product,
                          1
                        )
                      }
                      className="h-9 w-9 items-center justify-center rounded-full bg-[#7B9646]"
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  </View>
                </View>
              );
            }
          )
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#E8EADF] bg-white px-5 pb-5 pt-4">
        {discount > 0 ? (
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-[11px] font-semibold text-[#D45E2A]">Ahorro por promociones</Text>
            <Text className="text-[12px] font-bold text-[#D45E2A]">- Bs {discount.toFixed(2)}</Text>
          </View>
        ) : null}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[12px] text-[#858A7A]">Total</Text>
          <Text className="text-[22px] font-extrabold text-[#617D34]">Bs {total.toFixed(2)}</Text>
        </View>

        <Pressable
          disabled={
            saving
          }
          onPress={() =>
            void handleCreate()
          }
          className={`items-center rounded-[17px] py-4 ${
            saving
              ? 'bg-[#A9B693]'
              : 'bg-[#7B9646]'
          }`}
        >
          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text className="text-[13px] font-extrabold text-white">
              Crear orden
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}