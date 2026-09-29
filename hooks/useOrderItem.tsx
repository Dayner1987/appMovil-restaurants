// hooks/useOrderItem.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import {
  orderItemService,
} from '@/services/order-item.service';

import {
  emitOrderChange,
} from '@/hooks/useOrder';

import type {
  CreateOrderItemData,
  OrderItem,
  OrderItemQueryParams,
  UpdateOrderItemData,
} from '@/types/order-item.types';

import type {
  Product,
} from '@/types/product.types';

// =====================================================
// OPTIONS
// =====================================================

interface UseOrderItemOptions {
  documentId?: string;

  autoLoad?: boolean;

  query?: OrderItemQueryParams;
}

// =====================================================
// CALCULATION
// =====================================================

interface OrderItemCalculation {
  quantity:
    number;

  unitPrice:
    number;

  discount?:
    number;
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
// SUBTOTAL
// =====================================================

export function calculateSubtotal({
  quantity,
  unitPrice,
  discount =
    0,
}: OrderItemCalculation): number {
  const safeQuantity =
    Math.max(
      1,
      Math.floor(
        Number(
          quantity
        ) ||
        1
      )
    );

  const safeUnitPrice =
    Math.max(
      0,
      Number(
        unitPrice
      ) ||
      0
    );

  const gross =
    safeQuantity *
    safeUnitPrice;

  const safeDiscount =
    Math.min(
      Math.max(
        Number(
          discount
        ) ||
        0,
        0
      ),
      gross
    );

  return Number(
    (
      gross -
      safeDiscount
    ).toFixed(
      2
    )
  );
}

// =====================================================
// HOOK
// =====================================================

export function useOrderItem(
  options:
    UseOrderItemOptions = {}
) {
  const {
    documentId,

    autoLoad = true,

    query,
  } = options;

  const [
    orderItem,
    setOrderItem,
  ] =
    useState<OrderItem | null>(
      null
    );

  const [
    orderItems,
    setOrderItems,
  ] =
    useState<OrderItem[]>(
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

  const mutationRef =
    useRef(false);

  const queryKey =
    JSON.stringify({
      page:
        query?.page ??
        1,

      pageSize:
        query?.pageSize ??
        100,

      sort:
        query?.sort ??
        'createdAt:asc',

      orderDocumentId:
        query
          ?.orderDocumentId,

      productDocumentId:
        query
          ?.productDocumentId,
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
  // LOAD ONE
  // ===================================================

  const loadOrderItem =
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
            await orderItemService
              .findOne(
                id
              );

          if (
            mountedRef.current
          ) {
            setOrderItem(
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
                'No se pudo cargar el detalle de la orden.'
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

  const loadOrderItems =
    useCallback(
      async (
        params:
          OrderItemQueryParams = {}
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
            await orderItemService
              .findAll(
                params
              );

          if (
            mountedRef.current
          ) {
            setOrderItems(
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
              getErrorMessage(
                requestError,
                'No se pudieron cargar los detalles de la orden.'
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
  // CREATE
  // ===================================================

  const createOrderItem =
    useCallback(
      (
        data:
          CreateOrderItemData
      ): Promise<OrderItem> =>
        runMutation(
          async () => {
            if (
              !data.order
            ) {
              throw new Error(
                'El detalle debe pertenecer a una orden.'
              );
            }

            if (
              !data.product
            ) {
              throw new Error(
                'El detalle debe tener un producto.'
              );
            }

            const quantity =
              Math.max(
                1,
                Math.floor(
                  Number(
                    data.quantity
                  ) ||
                  1
                )
              );

            const unitPrice =
              Number(
                Math.max(
                  Number(
                    data.unitPrice
                  ) ||
                  0,
                  0
                ).toFixed(
                  2
                )
              );

            if (
              unitPrice <=
              0
            ) {
              throw new Error(
                'El precio del producto debe ser mayor a 0.'
              );
            }

            const gross =
              quantity *
              unitPrice;

            const discount =
              Number(
                Math.min(
                  Math.max(
                    Number(
                      data.discount ??
                      0
                    ) ||
                    0,
                    0
                  ),
                  gross
                ).toFixed(
                  2
                )
              );

            const payload:
              CreateOrderItemData = {
                ...data,

                quantity,

                unitPrice,

                discount,

                subtotal:
                  calculateSubtotal({
                    quantity,

                    unitPrice,

                    discount,
                  }),

                productName:
                  data.productName
                    ?.trim() ||
                  null,
              };

            const response =
              await orderItemService
                .create(
                  payload
                );

            const created =
              response.data;

            if (
              mountedRef.current
            ) {
              setOrderItem(
                created
              );

              setOrderItems(
                (
                  current
                ) => [
                  created,
                  ...current,
                ]
              );
            }

            const parentId =
              typeof data.order ===
              'string'
                ? data.order
                : created.order
                    ?.documentId;

            if (
              parentId
            ) {
              emitOrderChange({
                type:
                  'refresh',

                documentId:
                  parentId,
              });
            }

            return created;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // CREATE FROM PRODUCT
  // ===================================================

  const createOrderItemFromProduct =
    useCallback(
      (
        orderDocumentId:
          string,

        product:
          Product,

        quantity:
          number,

        discount =
          0
      ) => {
        if (
          !product.documentId
        ) {
          throw new Error(
            'El producto no tiene documentId.'
          );
        }

        return createOrderItem({
          order:
            orderDocumentId,

          product:
            product.documentId,

          productName:
            product.name,

          quantity,

          unitPrice:
            product.price,

          discount,

          subtotal:
            0,
        });
      },
      [
        createOrderItem,
      ]
    );

  // ===================================================
  // UPDATE
  // ===================================================

  const updateOrderItem =
    useCallback(
      (
        id:
          string,

        data:
          UpdateOrderItemData
      ): Promise<OrderItem> =>
        runMutation(
          async () => {
            let currentItem =
              orderItem
                ?.documentId ===
              id
                ? orderItem
                : orderItems.find(
                    (
                      item
                    ) =>
                      item.documentId ===
                      id
                  );

            if (
              !currentItem
            ) {
              try {
                currentItem =
                  await orderItemService
                    .findOne(
                      id
                    )
                    .then(
                      (
                        response
                      ) =>
                        response.data
                    );
              } catch {
                currentItem =
                  undefined;
              }
            }

            const payload:
              UpdateOrderItemData = {
                ...data,
              };

            if (
              data.quantity !==
                undefined ||
              data.unitPrice !==
                undefined ||
              data.discount !==
                undefined
            ) {
              const quantity =
                data.quantity ??
                currentItem
                  ?.quantity ??
                1;

              const unitPrice =
                data.unitPrice ??
                currentItem
                  ?.unitPrice ??
                0;

              const discount =
                data.discount ??
                currentItem
                  ?.discount ??
                0;

              payload.subtotal =
                calculateSubtotal({
                  quantity,

                  unitPrice,

                  discount:
                    discount ??
                    0,
                });
            }

            if (
              data.productName !==
              undefined
            ) {
              payload.productName =
                data.productName
                  ?.trim() ||
                null;
            }

            const response =
              await orderItemService
                .update(
                  id,
                  payload
                );

            const updated =
              response.data;

            if (
              mountedRef.current
            ) {
              setOrderItem(
                (
                  current
                ) =>
                  current
                    ?.documentId ===
                  updated.documentId
                    ? updated
                    : current
              );

              setOrderItems(
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

            const parentId =
              updated.order
                ?.documentId ??
              currentItem
                ?.order
                ?.documentId;

            if (
              parentId
            ) {
              emitOrderChange({
                type:
                  'refresh',

                documentId:
                  parentId,
              });
            }

            return updated;
          }
        ),
      [
        runMutation,
        orderItem,
        orderItems,
      ]
    );

  // ===================================================
  // DELETE
  // ===================================================

  const deleteOrderItem =
    useCallback(
      (
        id:
          string
      ): Promise<void> =>
        runMutation(
          async () => {
            let currentItem =
              orderItem
                ?.documentId ===
              id
                ? orderItem
                : orderItems.find(
                    (
                      item
                    ) =>
                      item.documentId ===
                      id
                  );

            if (
              !currentItem
            ) {
              try {
                currentItem =
                  await orderItemService
                    .findOne(
                      id
                    )
                    .then(
                      (
                        response
                      ) =>
                        response.data
                    );
              } catch {
                currentItem =
                  undefined;
              }
            }

            const parentId =
              currentItem
                ?.order
                ?.documentId;

            await orderItemService
              .remove(
                id
              );

            if (
              mountedRef.current
            ) {
              setOrderItems(
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

              setOrderItem(
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

            if (
              parentId
            ) {
              emitOrderChange({
                type:
                  'refresh',

                documentId:
                  parentId,
              });
            }
          }
        ),
      [
        runMutation,
        orderItem,
        orderItems,
      ]
    );

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
      void loadOrderItem(
        documentId
      ).catch(
        () =>
          undefined
      );

      return;
    }

    void loadOrderItems(
      JSON.parse(
        queryKey
      ) as OrderItemQueryParams
    ).catch(
      () =>
        undefined
    );
  }, [
    autoLoad,
    documentId,
    queryKey,
    loadOrderItem,
    loadOrderItems,
  ]);

  return {
    orderItem,
    orderItems,

    loading,
    saving,
    error,

    loadOrderItem,
    loadOrderItems,

    createOrderItem,
    createOrderItemFromProduct,

    updateOrderItem,
    deleteOrderItem,

    calculateSubtotal,

    refresh:
      documentId
        ? () =>
            loadOrderItem(
              documentId
            )
        : () =>
            loadOrderItems(
              JSON.parse(
                queryKey
              ) as OrderItemQueryParams
            ),
  };
}