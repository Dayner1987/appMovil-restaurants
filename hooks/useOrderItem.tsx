import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { orderItemService } from '@/services/order-item.service';

import type {
  CreateOrderItemData,
  OrderItem,
  OrderItemQueryParams,
  UpdateOrderItemData,
} from '@/types/order-item.types';

interface UseOrderItemOptions {
  documentId?: string;
  autoLoad?: boolean;
  query?: OrderItemQueryParams;
}

interface OrderItemCalculation {
  quantity: number;
  unitPrice: number;
  discount?: number;
}

function calculateSubtotal({
  quantity,
  unitPrice,
  discount = 0,
}: OrderItemCalculation): number {
  const subtotal =
    quantity * unitPrice - discount;

  return Number(
    Math.max(subtotal, 0).toFixed(2)
  );
}

export function useOrderItem(
  options: UseOrderItemOptions = {}
) {
  const {
    documentId,
    autoLoad = true,
    query,
  } = options;

  const [orderItem, setOrderItem] =
    useState<OrderItem | null>(null);

  const [orderItems, setOrderItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadOrderItem = useCallback(async (
    id: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await orderItemService.findOne(id);

      if (mountedRef.current) {
        setOrderItem(response.data);
      }

      return response.data;
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          'No se pudo cargar el detalle de la orden'
        );
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadOrderItems = useCallback(async (
    params: OrderItemQueryParams = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await orderItemService.findAll(params);

      if (mountedRef.current) {
        setOrderItems(response.data);
      }

      return response;
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          'No se pudieron cargar los detalles de la orden'
        );
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const createOrderItem = useCallback(async (
    data: CreateOrderItemData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const subtotal = calculateSubtotal({
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        discount: data.discount,
      });

      const itemData: CreateOrderItemData = {
        ...data,
        discount: data.discount ?? 0,
        subtotal,
      };

      const response =
        await orderItemService.create(itemData);

      const newOrderItem = response.data;

      if (mountedRef.current) {
        setOrderItem(newOrderItem);

        setOrderItems((currentItems) => [
          newOrderItem,
          ...currentItems,
        ]);
      }

      return newOrderItem;
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          'No se pudo crear el detalle de la orden'
        );
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const updateOrderItem = useCallback(async (
    id: string,
    data: UpdateOrderItemData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const updatedData: UpdateOrderItemData = {
        ...data,
      };

      if (
        data.quantity !== undefined ||
        data.unitPrice !== undefined ||
        data.discount !== undefined
      ) {
        const currentItem = orderItems.find(
          (item) => item.documentId === id
        );

        const quantity =
          data.quantity ??
          currentItem?.quantity ??
          0;

        const unitPrice =
          data.unitPrice ??
          currentItem?.unitPrice ??
          0;

        const discount =
          data.discount ??
          currentItem?.discount ??
          0;

        updatedData.subtotal =
          calculateSubtotal({
            quantity,
            unitPrice,
            discount,
          });
      }

      const response =
        await orderItemService.update(
          id,
          updatedData
        );

      const updatedOrderItem = response.data;

      if (mountedRef.current) {
        setOrderItem(updatedOrderItem);

        setOrderItems((currentItems) =>
          currentItems.map((item) =>
            item.documentId ===
            updatedOrderItem.documentId
              ? updatedOrderItem
              : item
          )
        );
      }

      return updatedOrderItem;
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          'No se pudo actualizar el detalle de la orden'
        );
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [orderItems]);

  const deleteOrderItem = useCallback(async (
    id: string
  ) => {
    setSaving(true);
    setError(null);

    try {
      await orderItemService.remove(id);

      if (mountedRef.current) {
        setOrderItems((currentItems) =>
          currentItems.filter(
            (item) => item.documentId !== id
          )
        );

        if (orderItem?.documentId === id) {
          setOrderItem(null);
        }
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          'No se pudo eliminar el detalle de la orden'
        );
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [orderItem?.documentId]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadOrderItem(documentId);
      return;
    }

    void loadOrderItems(query);
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
    updateOrderItem,
    deleteOrderItem,
    calculateSubtotal,
    refresh: documentId
      ? () => loadOrderItem(documentId)
      : () => loadOrderItems(query),
  };
}