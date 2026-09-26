// hooks/usePayment.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  api,
} from '@/services/api';

import {
  paymentService,
} from '@/services/payment.service';

import type {
  CreatePaymentData,
  Payment,
  PaymentMethod,
  PaymentOrder,
  PaymentQueryParams,
  PaymentStatus,
  UpdatePaymentData,
} from '@/types/payment.types';

// =====================================================
// OPTIONS
// =====================================================

interface UsePaymentOptions {
  documentId?: string;

  autoLoad?: boolean;

  query?: PaymentQueryParams;
}

// =====================================================
// CREAR PAGO DESDE UNA ORDEN
// =====================================================

export interface CreatePaymentFromOrderData {
  order: PaymentOrder;

  method: PaymentMethod;

  statusPayment?: PaymentStatus;

  transactionReference?:
    | string
    | null;
}

// =====================================================
// RECIBO VIRTUAL
// =====================================================

export interface VirtualReceipt {
  paymentId: number;

  paymentDocumentId: string;

  orderCode: string;

  customerName: string;

  customerEmail: string;

  restaurantName: string;

  restaurantLogo:
    | string
    | null;

  amount: number;

  method: string;

  status: PaymentStatus;

  transactionReference:
    | string
    | null;

  paidAt: string;
}

// =====================================================
// HELPERS
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

function normalizeText(
  value?:
    | string
    | null
): string | null {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized ||
    null;
}

function getPrimaryUser(
  payment: Payment
) {
  return (
    payment.order
      ?.users?.[0] ??
    null
  );
}

function getCustomerName(
  payment: Payment
): string {
  const user =
    getPrimaryUser(
      payment
    );

  if (!user) {
    return 'Cliente';
  }

  const fullName = [
    user.firstName,
    user.middleName,
    user.lastName,
    user.secondLastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    fullName ||
    user.username ||
    'Cliente'
  );
}

// =====================================================
// URL DE MEDIA
// =====================================================

function getImageUrl(
  url?:
    | string
    | null
): string | null {
  if (!url) {
    return null;
  }

  if (
    url.startsWith(
      'http://'
    ) ||
    url.startsWith(
      'https://'
    )
  ) {
    return url;
  }

  const baseUrl =
    String(
      api.defaults
        .baseURL ?? ''
    ).replace(
      /\/$/,
      ''
    );

  if (!baseUrl) {
    return url;
  }

  return `${baseUrl}${
    url.startsWith('/')
      ? url
      : `/${url}`
  }`;
}

// =====================================================
// NORMALIZAR CREATE
// =====================================================

function normalizeCreatePayment(
  data: CreatePaymentData
): CreatePaymentData {
  const amount =
    roundMoney(
      Number(
        data.amount
      )
    );

  if (
    amount <= 0
  ) {
    throw new Error(
      'El monto del pago debe ser mayor a 0.'
    );
  }

  return {
    ...data,

    amount,

    statusPayment:
      data.statusPayment ??
      'PENDING',

    transactionReference:
      normalizeText(
        data.transactionReference
      ),

    /*
     * paidAt es obligatorio en tu
     * Content Type de Strapi.
     */
    paidAt:
      data.paidAt ||
      new Date()
        .toISOString(),
  };
}

// =====================================================
// NORMALIZAR PATCH
// =====================================================

function normalizeUpdatePayment(
  data: UpdatePaymentData
): UpdatePaymentData {
  const normalized:
    UpdatePaymentData = {
      ...data,
  };

  if (
    data.amount !==
    undefined
  ) {
    const amount =
      roundMoney(
        Number(
          data.amount
        )
      );

    if (
      amount <= 0
    ) {
      throw new Error(
        'El monto del pago debe ser mayor a 0.'
      );
    }

    normalized.amount =
      amount;
  }

  if (
    data.transactionReference !==
    undefined
  ) {
    normalized.transactionReference =
      normalizeText(
        data.transactionReference
      );
  }

  return normalized;
}

// =====================================================
// RECIBO
// =====================================================

function buildVirtualReceipt(
  payment: Payment
): VirtualReceipt {
  const user =
    getPrimaryUser(
      payment
    );

  return {
    paymentId:
      payment.id,

    paymentDocumentId:
      payment.documentId,

    orderCode:
      payment.order
        ?.orderCode ??
      'Sin código',

    customerName:
      getCustomerName(
        payment
      ),

    customerEmail:
      user?.email ??
      '',

    restaurantName:
      payment.order
        ?.restaurant
        ?.name ??
      'Restaurante',

    restaurantLogo:
      getImageUrl(
        payment.order
          ?.restaurant
          ?.logo
          ?.url
      ),

    amount:
      payment.amount,

    method:
      payment.method,

    status:
      payment.statusPayment,

    transactionReference:
      payment.transactionReference,

    paidAt:
      payment.paidAt,
  };
}

// =====================================================
// HOOK
// =====================================================

export function usePayment(
  options:
    UsePaymentOptions = {}
) {
  const {
    documentId,
    autoLoad = true,
    query,
  } = options;

  const [
    payment,
    setPayment,
  ] =
    useState<Payment | null>(
      null
    );

  const [
    payments,
    setPayments,
  ] =
    useState<Payment[]>(
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

  // ===================================================
  // MOUNT
  // ===================================================

  useEffect(() => {
    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  // ===================================================
  // CARGAR UNO
  // ===================================================

  const loadPayment =
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
            await paymentService.findOne(
              id
            );

          if (
            mountedRef.current
          ) {
            setPayment(
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
              'No se pudo cargar el pago'
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
  // CARGAR TODOS
  // ===================================================

  const loadPayments =
    useCallback(
      async (
        params:
          PaymentQueryParams = {}
      ) => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await paymentService.findAll(
              params
            );

          if (
            mountedRef.current
          ) {
            setPayments(
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
              'No se pudieron cargar los pagos'
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

  const createPayment =
    useCallback(
      async (
        data:
          CreatePaymentData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const paymentData =
            normalizeCreatePayment(
              data
            );

          const response =
            await paymentService.create(
              paymentData
            );

          const newPayment =
            response.data;

          if (
            mountedRef.current
          ) {
            setPayment(
              newPayment
            );

            setPayments(
              (
                currentPayments
              ) => [
                newPayment,
                ...currentPayments,
              ]
            );
          }

          return newPayment;
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
                : 'No se pudo registrar el pago'
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
  // CREATE DESDE ORDEN
  //
  // amount = order.total
  // ===================================================

  const createPaymentFromOrder =
    useCallback(
      async ({
        order,
        method,
        statusPayment =
          'PENDING',
        transactionReference =
          null,
      }: CreatePaymentFromOrderData) => {
        if (
          !order.documentId
        ) {
          throw new Error(
            'La orden no tiene documentId.'
          );
        }

        const amount =
          roundMoney(
            Number(
              order.total ??
                0
            )
          );

        if (
          amount <= 0
        ) {
          throw new Error(
            'La orden no tiene un total válido para registrar el pago.'
          );
        }

        return createPayment({
          amount,

          method,

          statusPayment,

          transactionReference,

          paidAt:
            new Date()
              .toISOString(),

          order:
            order.documentId,
        });
      },
      [
        createPayment,
      ]
    );

  // ===================================================
  // UPDATE / PATCH
  // ===================================================

  const updatePayment =
    useCallback(
      async (
        id: string,

        data:
          UpdatePaymentData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const normalizedData =
            normalizeUpdatePayment(
              data
            );

          const response =
            await paymentService.update(
              id,
              normalizedData
            );

          const updatedPayment =
            response.data;

          if (
            mountedRef.current
          ) {
            setPayment(
              (
                currentPayment
              ) =>
                currentPayment
                  ?.documentId ===
                updatedPayment.documentId
                  ? updatedPayment
                  : currentPayment
            );

            setPayments(
              (
                currentPayments
              ) =>
                currentPayments.map(
                  (
                    item
                  ) =>
                    item.documentId ===
                    updatedPayment.documentId
                      ? updatedPayment
                      : item
                )
            );
          }

          return updatedPayment;
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
                : 'No se pudo actualizar el pago'
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
  // CONFIRMAR
  //
  // Automatiza:
  // status = PAID
  // paidAt = ahora
  // ===================================================

  const confirmPayment =
    useCallback(
      async (
        id: string,

        transactionReference?:
          | string
          | null
      ) => {
        const data:
          UpdatePaymentData = {
          statusPayment:
            'PAID',

          paidAt:
            new Date()
              .toISOString(),
        };

        if (
          transactionReference !==
          undefined
        ) {
          data.transactionReference =
            transactionReference;
        }

        return updatePayment(
          id,
          data
        );
      },
      [
        updatePayment,
      ]
    );

  // ===================================================
  // CANCELAR
  // ===================================================

  const cancelPayment =
    useCallback(
      async (
        id: string
      ) => {
        return updatePayment(
          id,
          {
            statusPayment:
              'CANCELLED',
          }
        );
      },
      [
        updatePayment,
      ]
    );

  // ===================================================
  // MARCAR FALLIDO
  // ===================================================

  const failPayment =
    useCallback(
      async (
        id: string
      ) => {
        return updatePayment(
          id,
          {
            statusPayment:
              'FAILED',
          }
        );
      },
      [
        updatePayment,
      ]
    );

  // ===================================================
  // REEMBOLSO
  // ===================================================

  const refundPayment =
    useCallback(
      async (
        id: string
      ) => {
        return updatePayment(
          id,
          {
            statusPayment:
              'REFUNDED',
          }
        );
      },
      [
        updatePayment,
      ]
    );

  // ===================================================
  // DELETE
  // ===================================================

  const deletePayment =
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
          await paymentService.remove(
            id
          );

          if (
            mountedRef.current
          ) {
            setPayments(
              (
                currentPayments
              ) =>
                currentPayments.filter(
                  (
                    item
                  ) =>
                    item.documentId !==
                    id
                )
            );

            setPayment(
              (
                currentPayment
              ) =>
                currentPayment
                  ?.documentId ===
                id
                  ? null
                  : currentPayment
            );
          }
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo eliminar el pago'
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
  // RECIBO VIRTUAL
  // ===================================================

  const getReceipt =
    useCallback(
      (
        selectedPayment?:
          | Payment
          | null
      ) => {
        const currentPayment =
          selectedPayment ??
          payment;

        if (
          !currentPayment
        ) {
          return null;
        }

        return buildVirtualReceipt(
          currentPayment
        );
      },
      [
        payment,
      ]
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
      void loadPayment(
        documentId
      );

      return;
    }

    void loadPayments(
      query
    );
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

  // ===================================================
  // RETURN
  // ===================================================

  return {
    payment,
    payments,

    loading,
    saving,
    error,

    loadPayment,
    loadPayments,

    createPayment,

    /*
     * Úsalo preferentemente cuando
     * el pago provenga de una orden.
     */
    createPaymentFromOrder,

    updatePayment,

    confirmPayment,
    cancelPayment,
    failPayment,
    refundPayment,

    deletePayment,

    getReceipt,

    refresh:
      documentId
        ? () =>
            loadPayment(
              documentId
            )
        : () =>
            loadPayments(
              query
            ),
  };
}