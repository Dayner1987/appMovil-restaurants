import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { orderService } from '@/services/order.service';

import type {
  CreateOrderData,
  Order,
  OrderQueryParams,
  OrderStatus,
  OrderType,
  PaymentStatus,
  UpdateOrderData,
} from '@/types/orders.types';

interface OrderCalculationItem {
  quantity: number;
  unitPrice: number;
  discount?: number;
}

interface UseOrderOptions {
  documentId?: string;
  autoLoad?: boolean;
  query?: OrderQueryParams;
}

function generateOrderCode(): string {
  const date = new Date();

  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${year}${month}${day}-${random}`;
}

function calculateOrderTotals(
  items: OrderCalculationItem[],
  discount = 0
) {
  const subtotal = items.reduce((total, item) => {
    const itemSubtotal =
      item.quantity * item.unitPrice;

    const itemDiscount = item.discount ?? 0;

    return total + itemSubtotal - itemDiscount;
  }, 0);

  const total = Math.max(subtotal - discount, 0);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export function useOrder(
  options: UseOrderOptions = {}
) {
  const {
    documentId,
    autoLoad = true,
    query,
  } = options;

  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadOrder = useCallback(async (
    id: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderService.findOne(id);

      if (mountedRef.current) {
        setOrder(response.data);
      }

      return response.data;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo cargar la orden');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadOrders = useCallback(async (
    params: OrderQueryParams = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderService.findAll(params);

      if (mountedRef.current) {
        setOrders(response.data);
      }

      return response;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudieron cargar las órdenes');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const createOrder = useCallback(async (
    data: CreateOrderData,
    items: OrderCalculationItem[] = [],
    generalDiscount = 0
  ) => {
    setSaving(true);
    setError(null);

    try {
      const totals = calculateOrderTotals(
        items,
        generalDiscount
      );

      const orderData = {
        ...data,
        orderCode: generateOrderCode(),
        statusOrder: 'PENDING' as OrderStatus,
        paymentStatus: 'PENDING' as PaymentStatus,
        orderedAt: new Date().toISOString(),
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
      } as CreateOrderData;

      const response = await orderService.create(orderData);
      const newOrder = response.data;

      if (mountedRef.current) {
        setOrder(newOrder);
        setOrders((currentOrders) => [
          newOrder,
          ...currentOrders,
        ]);
      }

      return newOrder;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo crear la orden');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const updateOrder = useCallback(async (
    id: string,
    data: UpdateOrderData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response = await orderService.update(id, data);
      const updatedOrder = response.data;

      if (mountedRef.current) {
        setOrder(updatedOrder);

        setOrders((currentOrders) =>
          currentOrders.map((item) =>
            item.documentId === updatedOrder.documentId
              ? updatedOrder
              : item
          )
        );
      }

      return updatedOrder;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar la orden');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const changeStatus = useCallback(async (
    id: string,
    statusOrder: OrderStatus
  ) => {
    return updateOrder(id, {
      statusOrder,
    });
  }, [updateOrder]);

  const changePaymentStatus = useCallback(async (
    id: string,
    paymentStatus: PaymentStatus
  ) => {
    return updateOrder(id, {
      paymentStatus,
    });
  }, [updateOrder]);

  const completeOrder = useCallback(async (
    id: string
  ) => {
    return updateOrder(id, {
      statusOrder: 'COMPLETED',
      completeAt: new Date().toISOString(),
    });
  }, [updateOrder]);

  const deleteOrder = useCallback(async (
    id: string
  ) => {
    setSaving(true);
    setError(null);

    try {
      await orderService.remove(id);

      if (mountedRef.current) {
        setOrders((currentOrders) =>
          currentOrders.filter(
            (item) => item.documentId !== id
          )
        );

        if (order?.documentId === id) {
          setOrder(null);
        }
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo eliminar la orden');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [order?.documentId]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadOrder(documentId);
      return;
    }

    void loadOrders(query);
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
    deleteOrder,
    calculateOrderTotals,
    refresh: documentId
      ? () => loadOrder(documentId)
      : () => loadOrders(query),
  };
}
