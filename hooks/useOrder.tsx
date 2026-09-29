// hooks/useOrder.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import {
  orderService,
} from '@/services/order.service';

import {
  orderItemService,
} from '@/services/order-item.service';

import type {
  CreateOrderData,
  Order,
  OrderPagination,
  OrderPaymentStatus,
  OrderQueryParams,
  OrderStatus,
  UpdateOrderData,
} from '@/types/orders.types';

import type {
  Product,
} from '@/types/product.types';

// =====================================================
// OPTIONS
// =====================================================

interface UseOrderOptions {
  documentId?: string;

  autoLoad?: boolean;

  query?: OrderQueryParams;
}

// =====================================================
// ORDER LINE INPUT
// =====================================================

export interface CreateOrderLineInput {
  product:
    Product;

  quantity:
    number;

  /**
   * Descuento TOTAL de esta línea.
   */
  discount?:
    number;
}

// =====================================================
// CALCULATION
// =====================================================

export interface OrderCalculationItem {
  quantity:
    number;

  unitPrice:
    number;

  discount?:
    number;
}

export interface OrderCalculation {
  subtotal:
    number;

  itemDiscount:
    number;

  generalDiscount:
    number;

  discount:
    number;

  total:
    number;

  quantity:
    number;
}

// =====================================================
// EVENTS
//
// Permite que Payment y OrderItem avisen
// a useOrder que una orden cambió.
// =====================================================

type OrderChangeEvent =
  | {
      type:
        'saved';

      order:
        Order;
    }
  | {
      type:
        'refresh';

      documentId:
        string;
    }
  | {
      type:
        'deleted';

      documentId:
        string;
    };

const orderListeners =
  new Set<
    (
      event:
        OrderChangeEvent
    ) => void
  >();

export function emitOrderChange(
  event:
    OrderChangeEvent
) {
  orderListeners.forEach(
    (
      listener
    ) => {
      listener(
        event
      );
    }
  );
}

// =====================================================
// ERROR
// =====================================================

function getErrorMessage(
  error:
    unknown,

  fallback:
    string
): string {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const data =
      error.response
        ?.data as
        | {
            error?: {
              message?: string;
            };

            message?: string;
          }
        | undefined;

    return (
      data?.error
        ?.message ??
      data?.message ??
      fallback
    );
  }

  return error instanceof
    Error
    ? error.message
    : fallback;
}

// =====================================================
// MONEY
// =====================================================

function roundMoney(
  value:
    number
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
    ).toFixed(
      2
    )
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
    ).slice(
      -2
    );

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

  const hours =
    String(
      date.getHours()
    ).padStart(
      2,
      '0'
    );

  const minutes =
    String(
      date.getMinutes()
    ).padStart(
      2,
      '0'
    );

  const seconds =
    String(
      date.getSeconds()
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

  return `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

// =====================================================
// TOTALS
// =====================================================

export function calculateOrderTotals(
  items:
    OrderCalculationItem[],

  generalDiscount =
    0
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
          ) ||
          0
        )
      );

    const safeUnitPrice =
      roundMoney(
        Number(
          item.unitPrice
        ) ||
        0
      );

    const lineSubtotal =
      roundMoney(
        safeQuantity *
        safeUnitPrice
      );

    const lineDiscount =
      roundMoney(
        Math.min(
          Math.max(
            Number(
              item.discount ??
              0
            ) ||
            0,
            0
          ),
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
        Math.max(
          Number(
            generalDiscount
          ) ||
          0,
          0
        ),
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
// LINE SUBTOTAL
// =====================================================

function calculateLineSubtotal(
  quantity:
    number,

  unitPrice:
    number,

  discount =
    0
): number {
  const gross =
    roundMoney(
      quantity *
      unitPrice
    );

  const safeDiscount =
    roundMoney(
      Math.min(
        Math.max(
          discount,
          0
        ),
        gross
      )
    );

  return roundMoney(
    gross -
    safeDiscount
  );
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
    pagination,
    setPagination,
  ] =
    useState<OrderPagination | null>(
      null
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

  const mutationRef =
    useRef(false);

  // ===================================================
  // QUERY KEY
  // ===================================================

  const queryKey =
    JSON.stringify({
      page:
        query?.page ??
        1,

      pageSize:
        query?.pageSize ??
        25,

      sort:
        query?.sort ??
        'orderedAt:desc',

      orderCode:
        query?.orderCode,

      orderType:
        query?.orderType,

      statusOrder:
        query?.statusOrder,

      paymentStatus:
        query?.paymentStatus,

      restaurantDocumentId:
        query
          ?.restaurantDocumentId,

      userId:
        query?.userId,

      orderedFrom:
        query?.orderedFrom,

      orderedTo:
        query?.orderedTo,

      completedFrom:
        query?.completedFrom,

      completedTo:
        query?.completedTo,
    });

  // ===================================================
  // MOUNT
  // ===================================================

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  // ===================================================
  // SYNC LOCAL
  // ===================================================

  const syncOrder =
    useCallback(
      (
        updated:
          Order
      ) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

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
          ) => {
            const exists =
              current.some(
                (
                  item
                ) =>
                  item.documentId ===
                  updated.documentId
              );

            if (!exists) {
              return [
                updated,
                ...current,
              ];
            }

            return current.map(
              (
                item
              ) =>
                item.documentId ===
                updated.documentId
                  ? updated
                  : item
            );
          }
        );
      },
      []
    );

  // ===================================================
  // LOAD ONE
  // ===================================================

  const loadOrder =
    useCallback(
      async (
        id:
          string
      ) => {
        if (
          mountedRef.current
        ) {
          setLoading(
            true
          );

          setError(
            null
          );
        }

        try {
          const response =
            await orderService
              .findOne(
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
              getErrorMessage(
                requestError,
                'No se pudo cargar la orden.'
              )
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
        if (
          mountedRef.current
        ) {
          setLoading(
            true
          );

          setError(
            null
          );
        }

        try {
          const response =
            await orderService
              .findAll(
                params
              );

          if (
            mountedRef.current
          ) {
            setOrders(
              response.data
            );

            setPagination(
              response.meta
                .pagination
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
              getErrorMessage(
                requestError,
                'No se pudieron cargar las órdenes.'
              )
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
  // MUTATION
  // ===================================================

  const runMutation =
    useCallback(
      async <T,>(
        operation:
          () => Promise<T>
      ): Promise<T> => {
        if (
          mutationRef.current
        ) {
          throw new Error(
            'Espera a que termine la operación actual.'
          );
        }

        mutationRef.current =
          true;

        if (
          mountedRef.current
        ) {
          setSaving(
            true
          );

          setError(
            null
          );
        }

        try {
          return await operation();
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              getErrorMessage(
                requestError,
                'No se pudo completar la operación.'
              )
            );
          }

          throw requestError;
        } finally {
          mutationRef.current =
            false;

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
  // CREATE COMPLETE ORDER
  //
  // AUTOMATIZADO:
  //
  // 1. Calcula totales.
  // 2. Crea Order.
  // 3. Crea cada OrderItem.
  // 4. Relaciona:
  //      OrderItem.order
  //      OrderItem.product
  // 5. Si algo falla:
  //      rollback.
  // 6. Recarga Order con relaciones.
  // ===================================================

  const createOrder =
    useCallback(
      async (
        data:
          Omit<
            CreateOrderData,
            | 'orderCode'
            | 'statusOrder'
            | 'paymentStatus'
            | 'subtotal'
            | 'discount'
            | 'total'
            | 'orderedAt'
            | 'completeAt'
          >,

        lines:
          CreateOrderLineInput[],

        generalDiscount =
          0
      ): Promise<Order> =>
        runMutation(
          async () => {
            if (
              !data.restaurant
            ) {
              throw new Error(
                'La orden debe pertenecer a un restaurante.'
              );
            }

            if (
              lines.length ===
              0
            ) {
              throw new Error(
                'La orden debe contener al menos un producto.'
              );
            }

            // =========================================
            // VALIDATE LINES
            // =========================================

            const calculationItems:
              OrderCalculationItem[] =
              lines.map(
                (
                  line
                ) => {
                  if (
                    !line.product
                      ?.documentId
                  ) {
                    throw new Error(
                      'Uno de los productos no tiene documentId.'
                    );
                  }

                  const quantity =
                    Math.max(
                      1,
                      Math.floor(
                        Number(
                          line.quantity
                        ) ||
                        1
                      )
                    );

                  const unitPrice =
                    roundMoney(
                      Number(
                        line.product
                          .price
                      ) ||
                      0
                    );

                  if (
                    unitPrice <=
                    0
                  ) {
                    throw new Error(
                      `El producto "${line.product.name}" no tiene un precio válido.`
                    );
                  }

                  return {
                    quantity,

                    unitPrice,

                    discount:
                      roundMoney(
                        Number(
                          line.discount ??
                          0
                        ) ||
                        0
                      ),
                  };
                }
              );

            const totals =
              calculateOrderTotals(
                calculationItems,
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

            // =========================================
            // CREATE ORDER
            // =========================================

            const orderData:
              CreateOrderData = {
                ...data,

                orderCode:
                  generateOrderCode(),

                statusOrder:
                  'PENDING',

                paymentStatus:
                  'PENDING',

                subtotal:
                  totals.subtotal,

                discount:
                  totals.discount,

                total:
                  totals.total,

                orderedAt:
                  new Date()
                    .toISOString(),

                completeAt:
                  null,
              };

            const orderResponse =
              await orderService
                .create(
                  orderData
                );

            const newOrder =
              orderResponse.data;

            const createdItemIds:
              string[] = [];

            // =========================================
            // CREATE ORDER ITEMS
            // =========================================

            try {
              for (
                let index =
                  0;
                index <
                lines.length;
                index +=
                  1
              ) {
                const line =
                  lines[
                    index
                  ];

                const calculated =
                  calculationItems[
                    index
                  ];

                const lineDiscount =
                  roundMoney(
                    calculated.discount ??
                    0
                  );

                const itemResponse =
                  await orderItemService
                    .create({
                      order:
                        newOrder.documentId,

                      product:
                        line.product
                          .documentId,

                      productName:
                        line.product
                          .name,

                      quantity:
                        calculated.quantity,

                      unitPrice:
                        calculated.unitPrice,

                      discount:
                        lineDiscount,

                      subtotal:
                        calculateLineSubtotal(
                          calculated.quantity,
                          calculated.unitPrice,
                          lineDiscount
                        ),
                    });

                createdItemIds.push(
                  itemResponse.data
                    .documentId
                );
              }
            } catch (
              itemError
            ) {
              // =======================================
              // ROLLBACK ITEMS
              // =======================================

              for (
                const itemId of
                createdItemIds
                  .reverse()
              ) {
                try {
                  await orderItemService
                    .remove(
                      itemId
                    );
                } catch {
                  // rollback best-effort
                }
              }

              // =======================================
              // ROLLBACK ORDER
              // =======================================

              try {
                await orderService
                  .remove(
                    newOrder.documentId
                  );
              } catch {
                // rollback best-effort
              }

              throw new Error(
                getErrorMessage(
                  itemError,
                  'No se pudieron crear todos los productos de la orden.'
                )
              );
            }

            // =========================================
            // RELOAD WITH RELATIONS
            // =========================================

            const hydratedResponse =
              await orderService
                .findOne(
                  newOrder.documentId
                );

            const hydratedOrder =
              hydratedResponse.data;

            syncOrder(
              hydratedOrder
            );

            emitOrderChange({
              type:
                'saved',

              order:
                hydratedOrder,
            });

            return hydratedOrder;
          }
        ),
      [
        runMutation,
        syncOrder,
      ]
    );

  // ===================================================
  // UPDATE
  //
  // CUSTOM PATCH
  // ===================================================

  const updateOrder =
    useCallback(
      (
        id:
          string,

        data:
          UpdateOrderData
      ): Promise<Order> =>
        runMutation(
          async () => {
            const response =
              await orderService
                .patch(
                  id,
                  data
                );

            const updated =
              response.data;

            syncOrder(
              updated
            );

            emitOrderChange({
              type:
                'saved',

              order:
                updated,
            });

            return updated;
          }
        ),
      [
        runMutation,
        syncOrder,
      ]
    );

  // ===================================================
  // STATUS
  // ===================================================

  const changeStatus =
    useCallback(
      (
        id:
          string,

        status:
          OrderStatus
      ) => {
        const data:
          UpdateOrderData = {
          statusOrder:
            status,
        };

        if (
          status ===
          'COMPLETED'
        ) {
          data.completeAt =
            new Date()
              .toISOString();
        } else {
          /*
           * Si vuelve a otro estado,
           * no dejamos una fecha falsa
           * de completado.
           */
          data.completeAt =
            null;
        }

        return updateOrder(
          id,
          data
        );
      },
      [
        updateOrder,
      ]
    );

  // ===================================================
  // PAYMENT STATUS
  //
  // Normalmente lo actualizará usePayment
  // automáticamente.
  // ===================================================

  const changePaymentStatus =
    useCallback(
      (
        id:
          string,

        status:
          OrderPaymentStatus
      ) =>
        updateOrder(
          id,
          {
            paymentStatus:
              status,
          }
        ),
      [
        updateOrder,
      ]
    );

  // ===================================================
  // COMPLETE
  // ===================================================

  const completeOrder =
    useCallback(
      (
        id:
          string
      ) =>
        changeStatus(
          id,
          'COMPLETED'
        ),
      [
        changeStatus,
      ]
    );

  // ===================================================
  // CANCEL
  // ===================================================

  const cancelOrder =
    useCallback(
      (
        id:
          string
      ) =>
        updateOrder(
          id,
          {
            statusOrder:
              'CANCELLED',

            completeAt:
              null,
          }
        ),
      [
        updateOrder,
      ]
    );

  // ===================================================
  // DELETE
  // ===================================================

  const deleteOrder =
    useCallback(
      (
        id:
          string
      ): Promise<void> =>
        runMutation(
          async () => {
            await orderService
              .remove(
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

            emitOrderChange({
              type:
                'deleted',

              documentId:
                id,
            });
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // ORDER EVENTS
  // ===================================================

  useEffect(() => {
    const listener =
      (
        event:
          OrderChangeEvent
      ) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        if (
          event.type ===
          'saved'
        ) {
          syncOrder(
            event.order
          );

          return;
        }

        if (
          event.type ===
          'deleted'
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
                  event.documentId
              )
          );

          if (
            documentId ===
            event.documentId
          ) {
            setOrder(
              null
            );
          }

          return;
        }

        if (
          event.type ===
          'refresh'
        ) {
          if (
            documentId ===
            event.documentId
          ) {
            void loadOrder(
              event.documentId
            ).catch(
              () =>
                undefined
            );

            return;
          }

          const params =
            JSON.parse(
              queryKey
            ) as OrderQueryParams;

          void loadOrders(
            params
          ).catch(
            () =>
              undefined
          );
        }
      };

    orderListeners.add(
      listener
    );

    return () => {
      orderListeners.delete(
        listener
      );
    };
  }, [
    documentId,
    queryKey,
    loadOrder,
    loadOrders,
    syncOrder,
  ]);

  // ===================================================
  // AUTO LOAD
  // ===================================================

  useEffect(() => {
    if (
      !autoLoad
    ) {
      return;
    }

    if (
      documentId
    ) {
      void loadOrder(
        documentId
      ).catch(
        () =>
          undefined
      );

      return;
    }

    const params =
      JSON.parse(
        queryKey
      ) as OrderQueryParams;

    void loadOrders(
      params
    ).catch(
      () =>
        undefined
    );
  }, [
    autoLoad,
    documentId,
    queryKey,
    loadOrder,
    loadOrders,
  ]);

  // ===================================================
  // RETURN
  // ===================================================

  return {
    order,
    orders,
    pagination,

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
              JSON.parse(
                queryKey
              ) as OrderQueryParams
            ),
  };
}