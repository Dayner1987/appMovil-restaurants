// hooks/useOrderCheckout.ts

import {
  useCallback,
  useState,
} from 'react';

import {
  useOrder,
} from '@/hooks/useOrder';

import {
  orderItemService,
} from '@/services/order-item.service';

import {
  orderService,
} from '@/services/order.service';

import {
  paymentService,
} from '@/services/payment.service';

import type {
  CreateOrderLineInput,
} from '@/hooks/useOrder';

import type {
  Order,
  OrderType,
} from '@/types/orders.types';

import type {
  Payment,
  PaymentMethod,
} from '@/types/payment.types';

interface CreateOrderCheckoutData {
  restaurantDocumentId:
    string;

  userId?:
    number;

  orderType:
    OrderType;

  lines:
    CreateOrderLineInput[];

  generalDiscount?:
    number;

  paymentMethod:
    PaymentMethod;

  transactionReference?:
    | string
    | null;
}

export interface OrderCheckoutResult {
  order:
    Order;

  payment:
    Payment;
}

function getErrorMessage(
  error:
    unknown
): string {
  return error instanceof
    Error
    ? error.message
    : 'No se pudo crear la orden.';
}

export function useOrderCheckout() {
  const {
    createOrder,
  } =
    useOrder({
      autoLoad:
        false,
    });

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const createOrderWithPayment =
    useCallback(
      async ({
        restaurantDocumentId,

        userId,

        orderType,

        lines,

        generalDiscount =
          0,

        paymentMethod,

        transactionReference =
          null,
      }: CreateOrderCheckoutData): Promise<OrderCheckoutResult> => {
        if (
          !restaurantDocumentId
        ) {
          throw new Error(
            'No se pudo identificar el restaurante.'
          );
        }

        if (
          lines.length ===
          0
        ) {
          throw new Error(
            'Selecciona al menos un producto.'
          );
        }

        setSaving(
          true
        );

        setError(
          null
        );

        let createdOrder:
          | Order
          | null =
          null;

        try {
          // =============================================
          // 1. ORDER + ORDER ITEMS
          // =============================================

          createdOrder =
            await createOrder(
              {
                restaurant:
                  restaurantDocumentId,

                orderType,

                users:
                  userId
                    ? [
                        userId,
                      ]
                    : [],
              },

              lines,

              generalDiscount
            );

          // =============================================
          // 2. PAYMENT PENDING
          //
          // El pago queda relacionado inmediatamente
          // con Order.
          //
          // No cuenta como ingreso todavía.
          // Solo APPROVED contará como dinero cobrado.
          // =============================================

          const paymentResponse =
            await paymentService
              .create({
                amount:
                  createdOrder.total,

                method:
                  paymentMethod,

                statusPayment:
                  'PENDING',

                transactionReference,

                paidAt:
                  new Date()
                    .toISOString(),

                order:
                  createdOrder
                    .documentId,
              });

          return {
            order:
              createdOrder,

            payment:
              paymentResponse.data,
          };
        } catch (
          requestError
        ) {
          // =============================================
          // ROLLBACK
          //
          // Si Order ya fue creada pero Payment falló,
          // intentamos eliminar items y luego Order.
          // =============================================

          if (
            createdOrder
          ) {
            const createdItems =
              createdOrder
                .order_items ??
              [];

            for (
              const item of
              createdItems
            ) {
              if (
                !item.documentId
              ) {
                continue;
              }

              try {
                await orderItemService
                  .remove(
                    item.documentId
                  );
              } catch {
                // rollback best-effort
              }
            }

            try {
              await orderService
                .remove(
                  createdOrder
                    .documentId
                );
            } catch {
              // rollback best-effort
            }
          }

          const message =
            getErrorMessage(
              requestError
            );

          setError(
            message
          );

          throw new Error(
            message
          );
        } finally {
          setSaving(
            false
          );
        }
      },
      [
        createOrder,
      ]
    );

  return {
    saving,
    error,

    createOrderWithPayment,
  };
}