// app/others/OrderDetails.tsx

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
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import {
  openCompletedOrderReceipt,
} from '@/config/generate.order-receipt';

import {
  useOrder,
} from '@/hooks/useOrder';

import {
  usePayment,
} from '@/hooks/usePayment';

import type {
  OrderStatus,
} from '@/types/orders.types';

// =====================================================
// STATUS
// =====================================================

function getStatusLabel(
  status:
    OrderStatus
    | null
) {
  switch (
    status
  ) {
    case 'PENDING':
      return 'Pendiente';

    case 'CONFIRMED':
      return 'Confirmada';

    case 'PREPARING':
      return 'Preparando';

    case 'READY':
      return 'Lista';

    case 'COMPLETED':
      return 'Completada';

    case 'CANCELLED':
      return 'Cancelada';

    default:
      return 'Sin estado';
  }
}

function getNextStatus(
  status:
    OrderStatus
    | null
):
  | OrderStatus
  | null {
  switch (
    status
  ) {
    case 'PENDING':
      return 'CONFIRMED';

    case 'CONFIRMED':
      return 'PREPARING';

    case 'PREPARING':
      return 'READY';

    case 'READY':
      return 'COMPLETED';

    default:
      return null;
  }
}

function getNextLabel(
  status:
    OrderStatus
) {
  switch (
    status
  ) {
    case 'CONFIRMED':
      return 'Confirmar orden';

    case 'PREPARING':
      return 'Empezar preparación';

    case 'READY':
      return 'Marcar como lista';

    case 'COMPLETED':
      return 'Completar orden';

    default:
      return 'Actualizar';
  }
}

// =====================================================
// RESPONSIBLE
// =====================================================

function getResponsibleName(
  firstName?:
    | string
    | null,

  lastName?:
    | string
    | null,

  username?:
    string,

  email?:
    string
) {
  const completeName = [
    firstName,
    lastName,
  ]
    .filter(
      Boolean
    )
    .join(
      ' '
    )
    .trim();

  return (
    completeName ||
    username ||
    email ||
    'Sin responsable'
  );
}

// =====================================================
// SCREEN
// =====================================================

export default function OrderDetailsScreen() {
  const params =
    useLocalSearchParams<{
      documentId?: string;
    }>();

  const documentId =
    Array.isArray(
      params.documentId
    )
      ? params.documentId[0]
      : params.documentId;

  const [
    generatingPdf,
    setGeneratingPdf,
  ] =
    useState(false);

  // =====================================================
  // ORDER
  // =====================================================

  const {
    order,

    loading,

    saving,

    refresh,

    changeStatus,

    cancelOrder,
  } =
    useOrder({
      documentId,

      autoLoad:
        Boolean(
          documentId
        ),
    });

  // =====================================================
  // PAYMENT
  // =====================================================

  const {
    saving:
      paymentSaving,

    approvePayment,

    rejectPayment,
  } =
    usePayment({
      autoLoad:
        false,
    });

  // =====================================================
  // STATE
  // =====================================================

  const completed =
    order?.statusOrder ===
    'COMPLETED';

  const cancelled =
    order?.statusOrder ===
    'CANCELLED';

  const terminal =
    completed ||
    cancelled;

  const nextStatus =
    getNextStatus(
      order
        ?.statusOrder ??
      null
    );

  const itemTotal =
    useMemo(
      () =>
        order?.order_items
          ?.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.quantity ??
                0
              ),
            0
          ) ??
        0,
      [
        order
          ?.order_items,
      ]
    );

  const responsible =
    useMemo(
      () => {
        const user =
          order?.users?.[0];

        if (!user) {
          return 'Sin responsable';
        }

        return getResponsibleName(
          user.firstName,
          user.lastName,
          user.username,
          user.email
        );
      },
      [
        order
          ?.users,
      ]
    );

  // =====================================================
  // NEXT STATUS
  // =====================================================

  const handleNextStatus =
    async () => {
      if (
        !order ||
        !nextStatus
      ) {
        return;
      }

      /*
       * Una orden solamente se completa
       * cuando el monto ya quedó pagado.
       */
      if (
        nextStatus ===
          'COMPLETED' &&
        order.paymentStatus !==
          'PAID'
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'Pago pendiente',

          text2:
            'La orden debe estar pagada antes de completarla.',

          position:
            'bottom',
        });

        return;
      }

      try {
        await changeStatus(
          order.documentId,
          nextStatus
        );

        Toast.show({
          type:
            'success',

          text1:
            'Estado actualizado',

          text2:
            `La orden ahora está ${getStatusLabel(
              nextStatus
            ).toLowerCase()}.`,

          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo actualizar',

          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'Intenta nuevamente.',

          position:
            'bottom',
        });
      }
    };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel =
    async () => {
      if (!order) {
        return;
      }

      try {
        await cancelOrder(
          order.documentId
        );

        Toast.show({
          type:
            'success',

          text1:
            'Orden cancelada',

          text2:
            'La orden fue cancelada correctamente.',

          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo cancelar',

          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'Intenta nuevamente.',

          position:
            'bottom',
        });
      }
    };

  // =====================================================
  // APPROVE PAYMENT
  // =====================================================

  const handleApprovePayment =
    async (
      paymentDocumentId:
        string
    ) => {
      try {
        await approvePayment(
          paymentDocumentId
        );

        /*
         * approvePayment también actualiza
         * Order.paymentStatus.
         *
         * Luego recargamos el detalle para reflejar
         * inmediatamente ese cambio.
         */
        await refresh();

        Toast.show({
          type:
            'success',

          text1:
            'Pago aprobado',

          text2:
            'El pago fue registrado correctamente.',

          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo aprobar el pago',

          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'Intenta nuevamente.',

          position:
            'bottom',
        });
      }
    };

  // =====================================================
  // REJECT PAYMENT
  // =====================================================

  const handleRejectPayment =
    async (
      paymentDocumentId:
        string
    ) => {
      try {
        await rejectPayment(
          paymentDocumentId
        );

        await refresh();

        Toast.show({
          type:
            'success',

          text1:
            'Pago rechazado',

          text2:
            'El estado del pago fue actualizado.',

          position:
            'bottom',
        });
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo actualizar el pago',

          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'Intenta nuevamente.',

          position:
            'bottom',
        });
      }
    };

  // =====================================================
  // PDF
  // =====================================================

  const handleOpenReceiptPdf =
    async () => {
      if (
        !order ||
        order.statusOrder !==
          'COMPLETED'
      ) {
        return;
      }

      setGeneratingPdf(
        true
      );

      try {
        await openCompletedOrderReceipt(
          order
        );
      } catch (
        requestError
      ) {
        Toast.show({
          type:
            'error',

          text1:
            'No se pudo abrir el recibo',

          text2:
            requestError instanceof
              Error
              ? requestError.message
              : 'No se pudo generar el PDF.',

          position:
            'bottom',
        });
      } finally {
        setGeneratingPdf(
          false
        );
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading &&
    !order
  ) {
    return (
      <SafeAreaView
        className="
          flex-1
          items-center
          justify-center
          bg-[#F7F8F2]
        "
        edges={[
          'top',
        ]}
      >
        <ActivityIndicator
          size="large"
          color="#6F8C3E"
        />

        <Text
          className="
            mt-3
            text-sm
            text-[#777D71]
          "
        >
          Cargando orden...
        </Text>
      </SafeAreaView>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!order) {
    return (
      <SafeAreaView
        className="
          flex-1
          items-center
          justify-center
          bg-[#F7F8F2]
          px-6
        "
        edges={[
          'top',
        ]}
      >
        <Ionicons
          name="receipt-outline"
          size={38}
          color="#8A9680"
        />

        <Text
          className="
            mt-4
            text-lg
            font-extrabold
            text-[#171A15]
          "
        >
          Orden no encontrada
        </Text>

        <Pressable
          onPress={() =>
            router.back()
          }
          className="
            mt-5
            rounded-2xl
            bg-[#6F8C3E]
            px-6
            py-3
          "
        >
          <Text
            className="
              font-bold
              text-white
            "
          >
            Volver
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // =====================================================
  // UI
  // =====================================================

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
            {order.orderCode}
          </Text>

          <Text
            className="
              mt-0.5
              text-xs
              text-[#858B80]
            "
          >
            {getStatusLabel(
              order.statusOrder
            )}
          </Text>
        </View>

        {completed ? (
          <View
            className="
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-[#E6F3E8]
            "
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#4D7A54"
            />
          </View>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              loading
            }
            onRefresh={() =>
              void refresh()
            }
          />
        }
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
          {/* SUMMARY */}

          <View
            className="
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
              <View>
                <Text
                  className="
                    text-xs
                    text-[#858B80]
                  "
                >
                  Productos
                </Text>

                <Text
                  className="
                    mt-1
                    text-lg
                    font-extrabold
                    text-[#171A15]
                  "
                >
                  {itemTotal}
                </Text>
              </View>

              <View>
                <Text
                  className="
                    text-xs
                    text-[#858B80]
                  "
                >
                  Pago
                </Text>

                <Text
                  className="
                    mt-1
                    font-extrabold
                    text-[#343A30]
                  "
                >
                  {order.paymentStatus ??
                    'PENDING'}
                </Text>
              </View>

              <View
                className="
                  items-end
                "
              >
                <Text
                  className="
                    text-xs
                    text-[#858B80]
                  "
                >
                  Total
                </Text>

                <Text
                  className="
                    mt-1
                    text-xl
                    font-extrabold
                    text-[#536A2F]
                  "
                >
                  Bs{' '}
                  {Number(
                    order.total
                  ).toFixed(
                    2
                  )}
                </Text>
              </View>
            </View>

            <View
              className="
                mt-4
                flex-row
                items-center
                rounded-2xl
                bg-[#F7F8F2]
                px-3
                py-3
              "
            >
              <Ionicons
                name="person-outline"
                size={17}
                color="#75806B"
              />

              <View
                className="
                  ml-3
                  flex-1
                "
              >
                <Text
                  className="
                    text-[11px]
                    text-[#858B80]
                  "
                >
                  Registrada por
                </Text>

                <Text
                  className="
                    mt-0.5
                    text-sm
                    font-bold
                    text-[#343A30]
                  "
                >
                  {responsible}
                </Text>
              </View>
            </View>
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

          <View
            className="
              mt-3
              gap-2
            "
          >
            {order.order_items
              ?.map(
                (
                  item
                ) => (
                  <View
                    key={
                      item.documentId ??
                      String(
                        item.id
                      )
                    }
                    className="
                      flex-row
                      items-center
                      rounded-2xl
                      bg-white
                      p-4
                    "
                  >
                    <View
                      className="
                        flex-1
                      "
                    >
                      <Text
                        className="
                          font-bold
                          text-[#171A15]
                        "
                      >
                        {item.productName ??
                          'Producto'}
                      </Text>

                      <Text
                        className="
                          mt-1
                          text-xs
                          text-[#858B80]
                        "
                      >
                        {item.quantity}{' '}
                        × Bs{' '}
                        {Number(
                          item.unitPrice
                        ).toFixed(
                          2
                        )}
                      </Text>
                    </View>

                    <Text
                      className="
                        font-extrabold
                        text-[#536A2F]
                      "
                    >
                      Bs{' '}
                      {Number(
                        item.subtotal
                      ).toFixed(
                        2
                      )}
                    </Text>
                  </View>
                )
              )}
          </View>

          {/* TOTALS */}

          <View
            className="
              mt-5
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
                {Number(
                  order.subtotal
                ).toFixed(
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
                {Number(
                  order.discount ??
                  0
                ).toFixed(
                  2
                )}
              </Text>
            </View>

            <View
              className="
                mt-4
                flex-row
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
                Total
              </Text>

              <Text
                className="
                  text-xl
                  font-extrabold
                  text-[#536A2F]
                "
              >
                Bs{' '}
                {Number(
                  order.total
                ).toFixed(
                  2
                )}
              </Text>
            </View>
          </View>

          {/* PAYMENTS */}

          <Text
            className="
              mt-7
              text-base
              font-extrabold
              text-[#171A15]
            "
          >
            Pagos
          </Text>

          <View
            className="
              mt-3
              gap-3
            "
          >
            {order.payments
              ?.map(
                (
                  payment
                ) => (
                  <View
                    key={
                      payment.documentId ??
                      String(
                        payment.id
                      )
                    }
                    className="
                      rounded-2xl
                      bg-white
                      p-4
                    "
                  >
                    <View
                      className="
                        flex-row
                        items-center
                        justify-between
                      "
                    >
                      <View>
                        <Text
                          className="
                            font-bold
                            text-[#171A15]
                          "
                        >
                          {payment.method ??
                            'Sin método'}
                        </Text>

                        <Text
                          className="
                            mt-1
                            text-xs
                            text-[#858B80]
                          "
                        >
                          {payment.statusPayment ??
                            'PENDING'}
                        </Text>
                      </View>

                      <Text
                        className="
                          text-lg
                          font-extrabold
                          text-[#536A2F]
                        "
                      >
                        Bs{' '}
                        {Number(
                          payment.amount
                        ).toFixed(
                          2
                        )}
                      </Text>
                    </View>

                    {!terminal &&
                    payment.statusPayment ===
                      'PENDING' &&
                    payment.documentId ? (
                      <View
                        className="
                          mt-3
                          flex-row
                          gap-2
                        "
                      >
                        <Pressable
                          onPress={() =>
                            void handleApprovePayment(
                              payment.documentId!
                            )
                          }
                          disabled={
                            paymentSaving
                          }
                          className="
                            flex-1
                            items-center
                            rounded-xl
                            bg-[#E6F3E8]
                            py-3
                          "
                        >
                          <Text
                            className="
                              font-bold
                              text-[#4D7A54]
                            "
                          >
                            Aprobar
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() =>
                            void handleRejectPayment(
                              payment.documentId!
                            )
                          }
                          disabled={
                            paymentSaving
                          }
                          className="
                            flex-1
                            items-center
                            rounded-xl
                            bg-[#FBECEA]
                            py-3
                          "
                        >
                          <Text
                            className="
                              font-bold
                              text-[#B65D51]
                            "
                          >
                            Rechazar
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                )
              )}

            {!order.payments
              ?.length ? (
              <View
                className="
                  rounded-2xl
                  bg-white
                  p-4
                "
              >
                <Text
                  className="
                    text-sm
                    text-[#858B80]
                  "
                >
                  No hay pagos registrados.
                </Text>
              </View>
            ) : null}
          </View>

          {/* COMPLETED PDF */}

          {completed ? (
            <Pressable
              onPress={() =>
                void handleOpenReceiptPdf()
              }
              disabled={
                generatingPdf
              }
              className="
                mt-7
                flex-row
                items-center
                justify-center
                rounded-2xl
                bg-[#6F8C3E]
                py-4
              "
            >
              {generatingPdf ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="document-text-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text
                    className="
                      ml-2
                      font-extrabold
                      text-white
                    "
                  >
                    Abrir recibo PDF
                  </Text>
                </>
              )}
            </Pressable>
          ) : null}

          {/* CLOSED MESSAGE */}

          {terminal ? (
            <View
              className="
                mt-4
                flex-row
                rounded-2xl
                bg-[#EEF3E3]
                px-4
                py-4
              "
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#607B35"
              />

              <Text
                className="
                  ml-3
                  flex-1
                  text-sm
                  leading-5
                  text-[#607B35]
                "
              >
                Esta orden está cerrada y se conserva únicamente para consulta.
              </Text>
            </View>
          ) : null}

          {/* NEXT STATUS */}

          {!terminal &&
          nextStatus ? (
            <Pressable
              onPress={() =>
                void handleNextStatus()
              }
              disabled={
                saving ||
                paymentSaving
              }
              className="
                mt-7
                flex-row
                items-center
                justify-center
                rounded-2xl
                bg-[#6F8C3E]
                py-4
              "
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="arrow-forward-circle-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text
                    className="
                      ml-2
                      font-extrabold
                      text-white
                    "
                  >
                    {getNextLabel(
                      nextStatus
                    )}
                  </Text>
                </>
              )}
            </Pressable>
          ) : null}

          {/* CANCEL */}

          {!terminal ? (
            <Pressable
              onPress={() =>
                void handleCancel()
              }
              disabled={
                saving ||
                paymentSaving
              }
              className="
                mt-3
                items-center
                rounded-2xl
                bg-[#FBECEA]
                py-4
              "
            >
              <Text
                className="
                  font-extrabold
                  text-[#B65D51]
                "
              >
                Cancelar orden
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}