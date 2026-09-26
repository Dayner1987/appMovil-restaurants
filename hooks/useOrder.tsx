// hooks/useOrder.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  orderService,
} from '@/services/order.service';

import type {
  CreateOrderData,
  Order,
  OrderQueryParams,
  OrderStatus,
  PaymentStatus,
  UpdateOrderData,
} from '@/types/orders.types';

// =====================================================
// CALCULATION
// =====================================================

export interface OrderCalculationItem {
  quantity: number;

  unitPrice: number;

  /*
   * Descuento TOTAL aplicado a esta línea.
   *
   * Ejemplo:
   * 2 hamburguesas = Bs 60
   * descuento = Bs 10
   */
  discount?: number;
}

export interface OrderCalculation {
  subtotal: number;

  itemDiscount: number;

  generalDiscount: number;

  discount: number;

  total: number;

  quantity: number;
}

// =====================================================
// OPTIONS
// =====================================================

interface UseOrderOptions {
  documentId?: string;

  autoLoad?: boolean;

  query?: OrderQueryParams;
}

// =====================================================
// MONEY
// =====================================================

function roundMoney(
  value: number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  return Number(
    Math.max(
      value,
      0
    ).toFixed(2)
  );
}

// =====================================================
// ORDER CODE
// =====================================================

export function generateOrderCode():
  string {
  const date =
    new Date();

  const year =
    String(
      date.getFullYear()
    ).slice(-2);

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );

  const random =
    Math.floor(
      1000 +
        Math.random() *
          9000
    );

  return `ORD-${year}${month}${day}-${random}`;
}

// =====================================================
// TOTALS
// =====================================================

export function calculateOrderTotals(
  items:
    OrderCalculationItem[],

  generalDiscount = 0
): OrderCalculation {
  let subtotal =
    0;

  let itemDiscount =
    0;

  let quantity =
    0;

  for (
    const item of
    items
  ) {
    const safeQuantity =
      Math.max(
        0,
        Math.floor(
          Number(
            item.quantity
          ) || 0
        )
      );

    const safeUnitPrice =
      roundMoney(
        Number(
          item.unitPrice
        ) || 0
      );

    const lineSubtotal =
      roundMoney(
        safeQuantity *
          safeUnitPrice
      );

    const lineDiscount =
      roundMoney(
        Math.min(
          Number(
            item.discount ??
              0
          ) || 0,

          lineSubtotal
        )
      );

    subtotal +=
      lineSubtotal;

    itemDiscount +=
      lineDiscount;

    quantity +=
      safeQuantity;
  }

  subtotal =
    roundMoney(
      subtotal
    );

  itemDiscount =
    roundMoney(
      itemDiscount
    );

  const maxGeneralDiscount =
    Math.max(
      subtotal -
        itemDiscount,
      0
    );

  const safeGeneralDiscount =
    roundMoney(
      Math.min(
        Number(
          generalDiscount
        ) || 0,

        maxGeneralDiscount
      )
    );

  const discount =
    roundMoney(
      itemDiscount +
        safeGeneralDiscount
    );

  const total =
    roundMoney(
      subtotal -
        discount
    );

  return {
    subtotal,

    itemDiscount,

    generalDiscount:
      safeGeneralDiscount,

    discount,

    total,

    quantity,
  };
}

// =====================================================
// HOOK
// =====================================================

export function useOrder(
  options:
    UseOrderOptions = {}
) {
  const {
    documentId,
    autoLoad = true,
    query,
  } = options;

  const [
    order,
    setOrder,
  ] =
    useState<Order | null>(
      null
    );

  const [
    orders,
    setOrders,
  ] =
    useState<Order[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

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

  const mountedRef =
    useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  // ===================================================
  // LOAD ONE
  // ===================================================

  const loadOrder =
    useCallback(
      async (
        id: string
      ) => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await orderService.findOne(
              id
            );

          if (
            mountedRef.current
          ) {
            setOrder(
              response.data
            );
          }

          return response.data;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo cargar la orden'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // LOAD ALL
  // ===================================================

  const loadOrders =
    useCallback(
      async (
        params:
          OrderQueryParams = {}
      ) => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await orderService.findAll(
              params
            );

          if (
            mountedRef.current
          ) {
            setOrders(
              response.data
            );
          }

          return response;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudieron cargar las órdenes'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // CREATE
  // ===================================================

  const createOrder =
    useCallback(
      async (
        data:
          Omit<
            CreateOrderData,
            | 'subtotal'
            | 'discount'
            | 'total'
            | 'orderCode'
            | 'statusOrder'
            | 'paymentStatus'
            | 'orderedAt'
          >,

        items:
          OrderCalculationItem[],

        generalDiscount =
          0
      ) => {
        if (
          items.length ===
          0
        ) {
          throw new Error(
            'La orden debe contener al menos un producto.'
          );
        }

        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const totals =
            calculateOrderTotals(
              items,
              generalDiscount
            );

          if (
            totals.total <=
            0
          ) {
            throw new Error(
              'El total de la orden debe ser mayor a 0.'
            );
          }

          const orderData:
            CreateOrderData = {
              ...data,

              orderCode:
                generateOrderCode(),

              statusOrder:
                'PENDING',

              paymentStatus:
                'PENDING',

              orderedAt:
                new Date()
                  .toISOString(),

              subtotal:
                totals.subtotal,

              discount:
                totals.discount,

              total:
                totals.total,

              completeAt:
                null,
            };

          const response =
            await orderService.create(
              orderData
            );

          const newOrder =
            response.data;

          if (
            mountedRef.current
          ) {
            setOrder(
              newOrder
            );

            setOrders(
              (
                current
              ) => [
                newOrder,
                ...current,
              ]
            );
          }

          return newOrder;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              requestError instanceof
                Error
                ? requestError.message
                : 'No se pudo crear la orden'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // UPDATE
  // ===================================================

  const updateOrder =
    useCallback(
      async (
        id: string,

        data:
          UpdateOrderData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await orderService.update(
              id,
              data
            );

          const updated =
            response.data;

          if (
            mountedRef.current
          ) {
            setOrder(
              (
                current
              ) =>
                current
                  ?.documentId ===
                updated.documentId
                  ? updated
                  : current
            );

            setOrders(
              (
                current
              ) =>
                current.map(
                  (
                    item
                  ) =>
                    item.documentId ===
                    updated.documentId
                      ? updated
                      : item
                )
            );
          }

          return updated;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo actualizar la orden'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // STATUS
  // ===================================================

  const changeStatus =
    useCallback(
      async (
        id: string,

        status:
          OrderStatus
      ) => {
        if (
          status ===
          'COMPLETED'
        ) {
          return updateOrder(
            id,
            {
              statusOrder:
                status,

              completeAt:
                new Date()
                  .toISOString(),
            }
          );
        }

        return updateOrder(
          id,
          {
            statusOrder:
              status,
          }
        );
      },
      [
        updateOrder,
      ]
    );

  // ===================================================
  // PAYMENT STATUS
  // ===================================================

  const changePaymentStatus =
    useCallback(
      async (
        id: string,

        status:
          PaymentStatus
      ) => {
        return updateOrder(
          id,
          {
            paymentStatus:
              status,
          }
        );
      },
      [
        updateOrder,
      ]
    );

  // ===================================================
  // COMPLETE
  // ===================================================

  const completeOrder =
    useCallback(
      async (
        id: string
      ) => {
        return changeStatus(
          id,
          'COMPLETED'
        );
      },
      [
        changeStatus,
      ]
    );

  // ===================================================
  // CANCEL
  // ===================================================

  const cancelOrder =
    useCallback(
      async (
        id: string
      ) => {
        return updateOrder(
          id,
          {
            statusOrder:
              'CANCELLED',
          }
        );
      },
      [
        updateOrder,
      ]
    );

  // ===================================================
  // DELETE
  // ===================================================

  const deleteOrder =
    useCallback(
      async (
        id: string
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          await orderService.remove(
            id
          );

          if (
            mountedRef.current
          ) {
            setOrders(
              (
                current
              ) =>
                current.filter(
                  (
                    item
                  ) =>
                    item.documentId !==
                    id
                )
            );

            setOrder(
              (
                current
              ) =>
                current
                  ?.documentId ===
                id
                  ? null
                  : current
            );
          }
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo eliminar la orden'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // AUTO LOAD
  // ===================================================

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (
      documentId
    ) {
      void loadOrder(
        documentId
      );

      return;
    }

    void loadOrders(
      query
    );
  }, [
    autoLoad,
    documentId,

    query?.page,
    query?.pageSize,
    query?.sort,
    query?.orderCode,
    query?.orderType,
    query?.statusOrder,
    query?.paymentStatus,
    query?.restaurantId,
    query?.userId,

    loadOrder,
    loadOrders,
  ]);

  return {
    order,
    orders,

    loading,
    saving,
    error,

    loadOrder,
    loadOrders,

    createOrder,
    updateOrder,

    changeStatus,
    changePaymentStatus,

    completeOrder,
    cancelOrder,

    deleteOrder,

    calculateOrderTotals,
    generateOrderCode,

    refresh:
      documentId
        ? () =>
            loadOrder(
              documentId
            )
        : () =>
            loadOrders(
              query
            ),
  };
}