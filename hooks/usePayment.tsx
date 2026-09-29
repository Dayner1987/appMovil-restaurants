// hooks/usePayment.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import {
  paymentService,
} from '@/services/payment.service';

import {
  orderService,
} from '@/services/order.service';

import {
  emitOrderChange,
} from '@/hooks/useOrder';

import type {
  CreatePaymentData,
  Payment,
  PaymentMethod,
  PaymentOrder,
  PaymentQueryParams,
  PaymentStatus,
  UpdatePaymentData,
} from '@/types/payment.types';

import type {
  OrderPaymentStatus,
} from '@/types/orders.types';

// =====================================================
// OPTIONS
// =====================================================

interface UsePaymentOptions {
  documentId?: string;

  autoLoad?: boolean;

  query?: PaymentQueryParams;
}

// =====================================================
// CREATE PAYMENT FROM ORDER
// =====================================================

export interface CreatePaymentFromOrderData {
  order:
    PaymentOrder;

  method:
    PaymentMethod;

  /*
   * Si no se manda,
   * automáticamente se usa
   * el saldo pendiente.
   */
  amount?: number;

  /*
   * Estados reales:
   *
   * PENDING
   * APPROVED
   * REJECTED
   * REFUNDED
   */
  statusPayment?:
    PaymentStatus;

  transactionReference?:
    | string
    | null;
}

// =====================================================
// RECEIPT
// =====================================================

export interface VirtualReceipt {
  paymentId:
    number;

  paymentDocumentId:
    string;

  orderCode:
    string;

  customerName:
    string;

  customerEmail:
    string;

  restaurantName:
    string;

  amount:
    number;

  method:
    | PaymentMethod
    | null;

  status:
    | PaymentStatus
    | null;

  transactionReference:
    | string
    | null;

  paidAt:
    string;
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
// TEXT
// =====================================================

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

// =====================================================
// NORMALIZE CREATE
// =====================================================

function normalizeCreatePayment(
  data:
    CreatePaymentData
): CreatePaymentData {
  const amount =
    roundMoney(
      Number(
        data.amount
      )
    );

  if (
    amount <=
    0
  ) {
    throw new Error(
      'El monto del pago debe ser mayor a 0.'
    );
  }

  return {
    ...data,

    amount,

    method:
      data.method ??
      null,

    statusPayment:
      data.statusPayment ??
      'PENDING',

    transactionReference:
      normalizeText(
        data.transactionReference
      ),

    /*
     * paidAt es obligatorio
     * en Strapi.
     */
    paidAt:
      data.paidAt ||
      new Date()
        .toISOString(),
  };
}

// =====================================================
// NORMALIZE UPDATE
// =====================================================

function normalizeUpdatePayment(
  data:
    UpdatePaymentData
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
      amount <=
      0
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
// APPROVED PAYMENTS TOTAL
// =====================================================

export function calculateApprovedPayments(
  payments:
    Payment[]
): number {
  const total =
    payments
      .filter(
        (
          payment
        ) =>
          payment.statusPayment ===
          'APPROVED'
      )
      .reduce(
        (
          accumulator,
          payment
        ) =>
          accumulator +
          Number(
            payment.amount
          ),
        0
      );

  return roundMoney(
    total
  );
}

// =====================================================
// ORDER PAYMENT STATUS
//
// Payment.statusPayment:
//
// PENDING
// APPROVED
// REJECTED
// REFUNDED
//
// Order.paymentStatus:
//
// PENDING
// PARTIAL
// PAID
// FAILED
// REFUNDED
// =====================================================

async function syncOrderPaymentStatus(
  orderDocumentId:
    string
) {
  const [
    orderResponse,
    paymentsResponse,
  ] =
    await Promise.all([
      orderService.findOne(
        orderDocumentId
      ),

      paymentService.findAll({
        orderDocumentId,

        page:
          1,

        pageSize:
          100,
      }),
    ]);

  const order =
    orderResponse.data;

  const payments =
    paymentsResponse.data;

  const orderTotal =
    roundMoney(
      Number(
        order.total
      ) ||
      0
    );

  const approvedAmount =
    calculateApprovedPayments(
      payments
    );

  const hasPending =
    payments.some(
      (
        item
      ) =>
        item.statusPayment ===
        'PENDING'
    );

  const hasRejected =
    payments.some(
      (
        item
      ) =>
        item.statusPayment ===
        'REJECTED'
    );

  const hasRefunded =
    payments.some(
      (
        item
      ) =>
        item.statusPayment ===
        'REFUNDED'
    );

  const hasApproved =
    payments.some(
      (
        item
      ) =>
        item.statusPayment ===
        'APPROVED'
    );

  let nextStatus:
    OrderPaymentStatus =
    'PENDING';

  // ===================================================
  // PAID
  // ===================================================

  if (
    orderTotal >
      0 &&
    approvedAmount >=
      orderTotal
  ) {
    nextStatus =
      'PAID';
  }

  // ===================================================
  // PARTIAL
  // ===================================================

  else if (
    approvedAmount >
    0
  ) {
    nextStatus =
      'PARTIAL';
  }

  // ===================================================
  // PENDING
  // ===================================================

  else if (
    hasPending
  ) {
    nextStatus =
      'PENDING';
  }

  // ===================================================
  // REFUNDED
  //
  // Ya no queda ningún pago aprobado,
  // pero existe un reembolso.
  // ===================================================

  else if (
    hasRefunded &&
    !hasApproved
  ) {
    nextStatus =
      'REFUNDED';
  }

  // ===================================================
  // FAILED
  //
  // No hay aprobados ni pendientes
  // y existe un pago rechazado.
  // ===================================================

  else if (
    hasRejected
  ) {
    nextStatus =
      'FAILED';
  }

  // ===================================================
  // UPDATE ORDER
  // ===================================================

  if (
    order.paymentStatus !==
    nextStatus
  ) {
    const response =
      await orderService.patch(
        orderDocumentId,
        {
          paymentStatus:
            nextStatus,
        }
      );

    emitOrderChange({
      type:
        'saved',

      order:
        response.data,
    });

    return response.data;
  }

  emitOrderChange({
    type:
      'saved',

    order,
  });

  return order;
}

// =====================================================
// CUSTOMER
// =====================================================

function getPrimaryUser(
  payment:
    Payment
) {
  return (
    payment.order
      ?.users?.[0] ??
    null
  );
}

function getCustomerName(
  payment:
    Payment
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
    .filter(
      Boolean
    )
    .join(
      ' '
    )
    .trim();

  return (
    fullName ||
    user.username ||
    'Cliente'
  );
}

// =====================================================
// RECEIPT
// =====================================================

function buildVirtualReceipt(
  payment:
    Payment
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
        100,

      sort:
        query?.sort ??
        'paidAt:desc',

      orderDocumentId:
        query
          ?.orderDocumentId,

      restaurantDocumentId:
        query
          ?.restaurantDocumentId,

      statusPayment:
        query
          ?.statusPayment,

      method:
        query?.method,

      paidFrom:
        query?.paidFrom,

      paidTo:
        query?.paidTo,
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

  const loadPayment =
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
            await paymentService
              .findOne(
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
              getErrorMessage(
                requestError,
                'No se pudo cargar el pago.'
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

  const loadPayments =
    useCallback(
      async (
        params:
          PaymentQueryParams = {}
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
            await paymentService
              .findAll(
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
              getErrorMessage(
                requestError,
                'No se pudieron cargar los pagos.'
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
                'No se pudo completar la operación de pago.'
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
  // CREATE PAYMENT
  // ===================================================

  const createPayment =
    useCallback(
      (
        data:
          CreatePaymentData
      ): Promise<Payment> =>
        runMutation(
          async () => {
            const payload =
              normalizeCreatePayment(
                data
              );

            const response =
              await paymentService
                .create(
                  payload
                );

            const created =
              response.data;

            if (
              mountedRef.current
            ) {
              setPayment(
                created
              );

              setPayments(
                (
                  current
                ) => [
                  created,
                  ...current,
                ]
              );
            }

            const orderDocumentId =
              typeof payload.order ===
              'string'
                ? payload.order
                : created.order
                    ?.documentId;

            /*
             * AUTOMÁTICO:
             * actualizamos el estado financiero
             * general de la Order.
             */
            if (
              orderDocumentId
            ) {
              await syncOrderPaymentStatus(
                orderDocumentId
              );
            }

            return created;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // CREATE PAYMENT FROM ORDER
  //
  // Calcula automáticamente:
  //
  // total orden
  // - pagos APPROVED
  // = saldo pendiente
  // ===================================================

  const createPaymentFromOrder =
    useCallback(
      (
        data:
          CreatePaymentFromOrderData
      ): Promise<Payment> =>
        runMutation(
          async () => {
            const {
              order,
              method,

              statusPayment =
                'PENDING',

              transactionReference =
                null,
            } = data;

            if (
              !order.documentId
            ) {
              throw new Error(
                'La orden no tiene documentId.'
              );
            }

            const paymentsResponse =
              await paymentService
                .findAll({
                  orderDocumentId:
                    order.documentId,

                  page:
                    1,

                  pageSize:
                    100,
                });

            const approvedAmount =
              calculateApprovedPayments(
                paymentsResponse
                  .data
              );

            const orderTotal =
              roundMoney(
                Number(
                  order.total
                ) ||
                0
              );

            const remaining =
              roundMoney(
                orderTotal -
                approvedAmount
              );

            if (
              remaining <=
              0
            ) {
              throw new Error(
                'La orden ya está completamente pagada.'
              );
            }

            const amount =
              roundMoney(
                data.amount ??
                remaining
              );

            if (
              amount <=
              0
            ) {
              throw new Error(
                'Ingresa un monto válido.'
              );
            }

            if (
              amount >
              remaining
            ) {
              throw new Error(
                `El pago no puede superar el saldo pendiente de Bs ${remaining.toFixed(
                  2
                )}.`
              );
            }

            const response =
              await paymentService
                .create({
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

            const created =
              response.data;

            if (
              mountedRef.current
            ) {
              setPayment(
                created
              );

              setPayments(
                (
                  current
                ) => [
                  created,
                  ...current,
                ]
              );
            }

            await syncOrderPaymentStatus(
              order.documentId
            );

            return created;
          }
        ),
      [
        runMutation,
      ]
    );

  // ===================================================
  // UPDATE PAYMENT
  // ===================================================

  const updatePayment =
    useCallback(
      (
        id:
          string,

        data:
          UpdatePaymentData
      ): Promise<Payment> =>
        runMutation(
          async () => {
            let currentPayment:
              | Payment
              | undefined =
              payment
                ?.documentId ===
              id
                ? payment
                : payments.find(
                    (
                      item
                    ) =>
                      item.documentId ===
                      id
                  );

            /*
             * Si el pago no está actualmente
             * cargado, lo buscamos para recuperar
             * su Order.
             */
            if (
              !currentPayment
            ) {
              try {
                const currentResponse =
                  await paymentService
                    .findOne(
                      id
                    );

                currentPayment =
                  currentResponse.data;
              } catch {
                currentPayment =
                  undefined;
              }
            }

            const response =
              await paymentService
                .update(
                  id,
                  normalizeUpdatePayment(
                    data
                  )
                );

            const updated =
              response.data;

            if (
              mountedRef.current
            ) {
              setPayment(
                (
                  current
                ) =>
                  current
                    ?.documentId ===
                  updated.documentId
                    ? updated
                    : current
              );

              setPayments(
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

            const orderDocumentId =
              updated.order
                ?.documentId ??
              currentPayment
                ?.order
                ?.documentId;

            if (
              orderDocumentId
            ) {
              await syncOrderPaymentStatus(
                orderDocumentId
              );
            }

            return updated;
          }
        ),
      [
        runMutation,
        payment,
        payments,
      ]
    );

  // ===================================================
  // APPROVE PAYMENT
  //
  // Payment.statusPayment = APPROVED
  //
  // Después:
  // Order.paymentStatus se recalcula.
  // ===================================================

  const approvePayment =
    useCallback(
      (
        id:
          string,

        transactionReference?:
          | string
          | null
      ) => {
        const data:
          UpdatePaymentData = {
          statusPayment:
            'APPROVED',

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
  // REJECT PAYMENT
  // ===================================================

  const rejectPayment =
    useCallback(
      (
        id:
          string
      ) =>
        updatePayment(
          id,
          {
            statusPayment:
              'REJECTED',
          }
        ),
      [
        updatePayment,
      ]
    );

  // ===================================================
  // REFUND PAYMENT
  // ===================================================

  const refundPayment =
    useCallback(
      (
        id:
          string
      ) =>
        updatePayment(
          id,
          {
            statusPayment:
              'REFUNDED',
          }
        ),
      [
        updatePayment,
      ]
    );

  // ===================================================
  // SET BACK TO PENDING
  // ===================================================

  const pendingPayment =
    useCallback(
      (
        id:
          string
      ) =>
        updatePayment(
          id,
          {
            statusPayment:
              'PENDING',
          }
        ),
      [
        updatePayment,
      ]
    );

  // ===================================================
  // DELETE PAYMENT
  // ===================================================

  const deletePayment =
    useCallback(
      (
        id:
          string
      ): Promise<void> =>
        runMutation(
          async () => {
            let currentPayment:
              | Payment
              | undefined =
              payment
                ?.documentId ===
              id
                ? payment
                : payments.find(
                    (
                      item
                    ) =>
                      item.documentId ===
                      id
                  );

            if (
              !currentPayment
            ) {
              try {
                const currentResponse =
                  await paymentService
                    .findOne(
                      id
                    );

                currentPayment =
                  currentResponse.data;
              } catch {
                currentPayment =
                  undefined;
              }
            }

            const orderDocumentId =
              currentPayment
                ?.order
                ?.documentId;

            await paymentService
              .remove(
                id
              );

            if (
              mountedRef.current
            ) {
              setPayments(
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

              setPayment(
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

            /*
             * Al eliminar un pago también
             * debemos recalcular la Order.
             */
            if (
              orderDocumentId
            ) {
              await syncOrderPaymentStatus(
                orderDocumentId
              );
            }
          }
        ),
      [
        runMutation,
        payment,
        payments,
      ]
    );

  // ===================================================
  // RECEIPT
  // ===================================================

  const getReceipt =
    useCallback(
      (
        selectedPayment?:
          | Payment
          | null
      ) => {
        const current =
          selectedPayment ??
          payment;

        if (!current) {
          return null;
        }

        return buildVirtualReceipt(
          current
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
    if (
      !autoLoad
    ) {
      return;
    }

    if (
      documentId
    ) {
      void loadPayment(
        documentId
      ).catch(
        () =>
          undefined
      );

      return;
    }

    void loadPayments(
      JSON.parse(
        queryKey
      ) as PaymentQueryParams
    ).catch(
      () =>
        undefined
    );
  }, [
    autoLoad,
    documentId,
    queryKey,
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
    createPaymentFromOrder,

    updatePayment,

    approvePayment,
    rejectPayment,
    refundPayment,
    pendingPayment,

    deletePayment,

    calculateApprovedPayments,

    getReceipt,

    refresh:
      documentId
        ? () =>
            loadPayment(
              documentId
            )
        : () =>
            loadPayments(
              JSON.parse(
                queryKey
              ) as PaymentQueryParams
            ),
  };
}