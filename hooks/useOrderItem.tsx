// hooks/useOrderItem.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  orderItemService,
} from '@/services/order-item.service';

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
  quantity: number;

  unitPrice: number;

  discount?: number;
}

export function calculateSubtotal({
  quantity,
  unitPrice,
  discount = 0,
}: OrderItemCalculation): number {
  const safeQuantity =
    Math.max(
      1,
      Math.floor(
        Number(
          quantity
        ) || 1
      )
    );

  const safeUnitPrice =
    Math.max(
      0,
      Number(
        unitPrice
      ) || 0
    );

  const gross =
    safeQuantity *
    safeUnitPrice;

  const safeDiscount =
    Math.min(
      Math.max(
        Number(
          discount
        ) || 0,
        0
      ),
      gross
    );

  return Number(
    (
      gross -
      safeDiscount
    ).toFixed(2)
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

  useEffect(() => {
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
            await orderItemService.findOne(
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
              'No se pudo cargar el detalle de la orden'
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
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await orderItemService.findAll(
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
              'No se pudieron cargar los detalles de la orden'
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

  const createOrderItem =
    useCallback(
      async (
        data:
          CreateOrderItemData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const quantity =
            Math.max(
              1,
              Math.floor(
                Number(
                  data.quantity
                ) || 1
              )
            );

          const unitPrice =
            Number(
              Math.max(
                Number(
                  data.unitPrice
                ) || 0,
                0
              ).toFixed(2)
            );

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
                  ) || 0,
                  0
                ),
                gross
              ).toFixed(2)
            );

          const itemData:
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
            await orderItemService.create(
              itemData
            );

          const newItem =
            response.data;

          if (
            mountedRef.current
          ) {
            setOrderItem(
              newItem
            );

            setOrderItems(
              (
                current
              ) => [
                newItem,
                ...current,
              ]
            );
          }

          return newItem;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo crear el detalle de la orden'
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
  // CREATE FROM PRODUCT
  // ===================================================

  const createOrderItemFromProduct =
    useCallback(
      async (
        orderId:
          | number
          | string,

        product:
          Product,

        quantity:
          number,

        discount =
          0
      ) => {
        return createOrderItem({
          order:
            orderId,

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
      async (
        id: string,

        data:
          UpdateOrderItemData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const currentItem =
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

          const updatedData:
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

            updatedData.subtotal =
              calculateSubtotal({
                quantity,
                unitPrice,
                discount,
              });
          }

          if (
            data.productName !==
            undefined
          ) {
            updatedData.productName =
              data.productName
                ?.trim() ||
              null;
          }

          const response =
            await orderItemService.update(
              id,
              updatedData
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

          return updated;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo actualizar el detalle de la orden'
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
      [
        orderItem,
        orderItems,
      ]
    );

  // ===================================================
  // DELETE
  // ===================================================

  const deleteOrderItem =
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
          await orderItemService.remove(
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
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo eliminar el detalle de la orden'
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
      void loadOrderItem(
        documentId
      );

      return;
    }

    void loadOrderItems(
      query
    );
  }, [
    autoLoad,
    documentId,

    query?.page,
    query?.pageSize,
    query?.sort,
    query?.orderId,
    query?.productId,

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
              query
            ),
  };
}