import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { paymentService } from '@/services/payment.service';

import type {
  CreatePaymentData,
  Payment,
  PaymentQueryParams,
  PaymentStatus,
  UpdatePaymentData,
} from '@/types/payment.types';

interface UsePaymentOptions {
  documentId?: string;
  autoLoad?: boolean;
  query?: PaymentQueryParams;
}

export interface VirtualReceipt {
  paymentId: number;
  paymentDocumentId: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  restaurantName: string;
  restaurantLogo: string | null;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionReference: string | null;
  paidAt: string;
}

function getCustomerName(payment: Payment): string {
  const users = payment.order?.users;

  if (Array.isArray(users)) {
    const user = users[0];

    if (!user) {
      return 'Cliente';
    }

    return [
      user.firstName,
      user.middleName,
      user.lastName,
      user.secondLastName,
    ]
      .filter(Boolean)
      .join(' ') || user.username || 'Cliente';
  }

  if (users) {
    return [
      users.firstName,
      users.middleName,
      users.lastName,
      users.secondLastName,
    ]
      .filter(Boolean)
      .join(' ') || users.username || 'Cliente';
  }

  return 'Cliente';
}

function getImageUrl(image: unknown): string | null {
  if (!image || typeof image !== 'object') {
    return null;
  }

  const imageData = image as { url?: string };

  return imageData.url ?? null;
}

function buildVirtualReceipt(
  payment: Payment
): VirtualReceipt {
  const user = Array.isArray(payment.order?.users)
    ? payment.order?.users[0]
    : payment.order?.users;

  return {
    paymentId: payment.id,
    paymentDocumentId: payment.documentId,
    orderCode: payment.order?.orderCode ?? 'Sin código',
    customerName: getCustomerName(payment),
    customerEmail: user?.email ?? '',
    restaurantName:
      payment.order?.restaurant?.name ?? 'Restaurante',
    restaurantLogo: getImageUrl(
      payment.order?.restaurant?.logoImg
    ),
    amount: payment.amount,
    method: payment.method,
    status: payment.statusPayment,
    transactionReference:
      payment.transactionReference,
    paidAt: payment.paidAt,
  };
}

export function usePayment(
  options: UsePaymentOptions = {}
) {
  const {
    documentId,
    autoLoad = true,
    query,
  } = options;

  const [payment, setPayment] =
    useState<Payment | null>(null);

  const [payments, setPayments] =
    useState<Payment[]>([]);

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

  const loadPayment = useCallback(async (
    id: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await paymentService.findOne(id);

      if (mountedRef.current) {
        setPayment(response.data);
      }

      return response.data;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo cargar el pago');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadPayments = useCallback(async (
    params: PaymentQueryParams = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await paymentService.findAll(params);

      if (mountedRef.current) {
        setPayments(response.data);
      }

      return response;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudieron cargar los pagos');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const createPayment = useCallback(async (
    data: CreatePaymentData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const paymentData: CreatePaymentData = {
        ...data,
        statusPayment: data.statusPayment ?? 'PENDING',
        paidAt: data.paidAt ?? new Date().toISOString(),
      };

      const response =
        await paymentService.create(paymentData);

      const newPayment = response.data;

      if (mountedRef.current) {
        setPayment(newPayment);
        setPayments((currentPayments) => [
          newPayment,
          ...currentPayments,
        ]);
      }

      return newPayment;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo registrar el pago');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const updatePayment = useCallback(async (
    id: string,
    data: UpdatePaymentData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response =
        await paymentService.update(id, data);

      const updatedPayment = response.data;

      if (mountedRef.current) {
        setPayment(updatedPayment);

        setPayments((currentPayments) =>
          currentPayments.map((item) =>
            item.documentId ===
            updatedPayment.documentId
              ? updatedPayment
              : item
          )
        );
      }

      return updatedPayment;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar el pago');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const confirmPayment = useCallback(async (
    id: string
  ) => {
    return updatePayment(id, {
      statusPayment: 'PAID',
    });
  }, [updatePayment]);

  const cancelPayment = useCallback(async (
    id: string
  ) => {
    return updatePayment(id, {
      statusPayment: 'CANCELLED',
    });
  }, [updatePayment]);

  const deletePayment = useCallback(async (
    id: string
  ) => {
    setSaving(true);
    setError(null);

    try {
      await paymentService.remove(id);

      if (mountedRef.current) {
        setPayments((currentPayments) =>
          currentPayments.filter(
            (item) => item.documentId !== id
          )
        );

        if (payment?.documentId === id) {
          setPayment(null);
        }
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo eliminar el pago');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [payment?.documentId]);

  const getReceipt = useCallback((
    selectedPayment?: Payment | null
  ) => {
    const currentPayment =
      selectedPayment ?? payment;

    if (!currentPayment) {
      return null;
    }

    return buildVirtualReceipt(currentPayment);
  }, [payment]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadPayment(documentId);
      return;
    }

    void loadPayments(query);
  }, [
    autoLoad,
    documentId,
    query?.page,
    query?.pageSize,
    query?.sort,
    query?.orderId,
    query?.statusPayment,
    query?.method,
    loadPayment,
    loadPayments,
  ]);

  return {
    payment,
    payments,
    loading,
    saving,
    error,
    loadPayment,
    loadPayments,
    createPayment,
    updatePayment,
    confirmPayment,
    cancelPayment,
    deletePayment,
    getReceipt,
    refresh: documentId
      ? () => loadPayment(documentId)
      : () => loadPayments(query),
  };
}