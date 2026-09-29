// hooks/useEmployeeOperations.ts

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  employeeOperationsService,
} from '@/services/employee-operations.service';

import type {
  CreateEmployeeOrderInput,
  CreateEmployeeReceiptInput,
  EmployeeOrder,
  EmployeeOrderPaymentStatus,
  EmployeePayment,
  EmployeeReceipt,
  RegisterEmployeePaymentInput,
} from '@/types/employee.types';

import type {
  OrderStatus,
} from '@/types/orders.types';

// =====================================================
// OPTIONS
// =====================================================

interface UseEmployeeOperationsOptions {
  employeeId?:
    number;

  restaurantDocumentId?:
    string;

  shiftDocumentId?:
    string;

  autoLoad?:
    boolean;

  pollingMs?:
    number;
}

// =====================================================
// MONEY
// =====================================================

function roundMoney(
  value:
    number
) {
  return Number(
    Math.max(
      Number(
        value
      ) ||
      0,
      0
    ).toFixed(
      2
    )
  );
}

// =====================================================
// ORDER CODE
// =====================================================

function generateEmployeeOrderCode() {
  const now =
    new Date();

  const value =
    now
      .toISOString()
      .replace(
        /\D/g,
        ''
      )
      .slice(
        2,
        14
      );

  const random =
    Math.floor(
      100 +
      Math.random() *
        900
    );

  return `ORD-${value}-${random}`;
}

// =====================================================
// RECEIPT NUMBER
// =====================================================

function generateReceiptNumber() {
  const now =
    new Date();

  const value =
    now
      .toISOString()
      .replace(
        /\D/g,
        ''
      )
      .slice(
        2,
        14
      );

  return `REC-${value}`;
}

// =====================================================
// HOOK
// =====================================================

export function useEmployeeOperations(
  options:
    UseEmployeeOperationsOptions = {}
) {
  const {
    employeeId,

    restaurantDocumentId,

    shiftDocumentId,

    autoLoad =
      true,

    pollingMs =
      0,
  } = options;

  const [
    orders,
    setOrders,
  ] =
    useState<EmployeeOrder[]>(
      []
    );

  const [
    payments,
    setPayments,
  ] =
    useState<EmployeePayment[]>(
      []
    );

  const [
    receipts,
    setReceipts,
  ] =
    useState<EmployeeReceipt[]>(
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
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  // ===================================================
  // LOAD
  // ===================================================

  const loadOperations =
    useCallback(
      async (
        silent =
          false
      ) => {
        if (
          !employeeId ||
          !restaurantDocumentId
        ) {
          return;
        }

        if (
          !silent
        ) {
          setLoading(
            true
          );
        }

        setError(
          null
        );

        try {
          const [
            orderResponse,
            paymentResponse,
            receiptResponse,
          ] =
            await Promise.all([
              employeeOperationsService
                .findOrders({
                  restaurantDocumentId,

                  createdByUserId:
                    employeeId,

                  shiftDocumentId,

                  page:
                    1,

                  pageSize:
                    100,
                }),

              employeeOperationsService
                .findPayments({
                  restaurantDocumentId,

                  processedById:
                    employeeId,

                  shiftDocumentId,

                  page:
                    1,

                  pageSize:
                    100,
                }),

              employeeOperationsService
                .findReceipts(
                  employeeId
                ),
            ]);

          if (
            mountedRef.current
          ) {
            setOrders(
              orderResponse.data
            );

            setPayments(
              paymentResponse.data
            );

            setReceipts(
              receiptResponse.data
            );
          }
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
                : 'No se pudieron cargar las operaciones.'
            );
          }

          throw requestError;
        } finally {
          if (
            !silent &&
            mountedRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        employeeId,
        restaurantDocumentId,
        shiftDocumentId,
      ]
    );

  // ===================================================
  // CREATE ORDER
  // ===================================================

  const createOrder =
    useCallback(
      async (
        input:
          CreateEmployeeOrderInput
      ) => {
        if (
          !employeeId ||
          !restaurantDocumentId ||
          !shiftDocumentId
        ) {
          throw new Error(
            'El empleado debe tener una jornada abierta.'
          );
        }

        if (
          input.lines.length ===
          0
        ) {
          throw new Error(
            'La orden debe contener productos.'
          );
        }

        setSaving(
          true
        );

        let createdOrder:
          | EmployeeOrder
          | null =
          null;

        const createdItems:
          string[] = [];

        try {
          // =============================================
          // TOTALS
          // =============================================

          let subtotal =
            0;

          let lineDiscount =
            0;

          for (
            const line of
            input.lines
          ) {
            subtotal +=
              Number(
                line.quantity
              ) *
              Number(
                line.unitPrice
              );

            lineDiscount +=
              Number(
                line.discount ??
                0
              );
          }

          subtotal =
            roundMoney(
              subtotal
            );

          lineDiscount =
            roundMoney(
              lineDiscount
            );

          const generalDiscount =
            roundMoney(
              input.generalDiscount ??
              0
            );

          const discount =
            roundMoney(
              lineDiscount +
              generalDiscount
            );

          const total =
            roundMoney(
              subtotal -
              discount
            );

          if (
            total <=
            0
          ) {
            throw new Error(
              'El total de la orden debe ser mayor a 0.'
            );
          }

          // =============================================
          // ORDER
          // =============================================

          const orderResponse =
            await employeeOperationsService
              .createOrder({
                orderCode:
                  generateEmployeeOrderCode(),

                orderType:
                  input.orderType,

                statusOrder:
                  'PENDING',

                paymentStatus:
                  'PENDING',

                subtotal,

                discount,

                total,

                orderedAt:
                  new Date()
                    .toISOString(),

                completeAt:
                  null,

                restaurant:
                  restaurantDocumentId,

                createdByUser:
                  employeeId,

                shift:
                  shiftDocumentId,

                customer:
                  input.customerId,
              });

          createdOrder =
            orderResponse.data;

          // =============================================
          // ORDER ITEMS
          // =============================================

          for (
            const line of
            input.lines
          ) {
            const quantity =
              Math.max(
                1,
                Math.floor(
                  Number(
                    line.quantity
                  )
                )
              );

            const unitPrice =
              roundMoney(
                line.unitPrice
              );

            const discountLine =
              roundMoney(
                line.discount ??
                0
              );

            const lineSubtotal =
              roundMoney(
                quantity *
                  unitPrice -
                  discountLine
              );

            const itemResponse =
              await employeeOperationsService
                .createOrderItem({
                  quantity,

                  unitPrice,

                  discount:
                    discountLine,

                  subtotal:
                    lineSubtotal,

                  productName:
                    line.productName,

                  order:
                    createdOrder
                      .documentId,

                  product:
                    line.productDocumentId,
                });

            if (
              itemResponse.data
                .documentId
            ) {
              createdItems.push(
                itemResponse.data
                  .documentId
              );
            }
          }

          // =============================================
          // RELOAD COMPLETE ORDER
          // =============================================

          const complete =
            await employeeOperationsService
              .findOrder(
                createdOrder
                  .documentId
              );

          if (
            mountedRef.current
          ) {
            setOrders(
              (
                current
              ) => [
                complete.data,
                ...current,
              ]
            );
          }

          return complete.data;
        } catch (
          requestError
        ) {
          /*
           * Rollback simple si falla la creación
           * de OrderItems.
           */
          for (
            const documentId of
            createdItems
          ) {
            try {
              await employeeOperationsService
                .removeOrderItem(
                  documentId
                );
            } catch {
              // rollback best effort
            }
          }

          if (
            createdOrder
          ) {
            try {
              await employeeOperationsService
                .removeOrder(
                  createdOrder
                    .documentId
                );
            } catch {
              // rollback best effort
            }
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
        employeeId,
        restaurantDocumentId,
        shiftDocumentId,
      ]
    );

  // ===================================================
  // REGISTER PAYMENT
  // ===================================================

  const registerPayment =
    useCallback(
      async (
        input:
          RegisterEmployeePaymentInput
      ) => {
        if (
          !employeeId ||
          !shiftDocumentId
        ) {
          throw new Error(
            'El empleado debe tener una jornada abierta.'
          );
        }

        setSaving(
          true
        );

        try {
          const response =
            await employeeOperationsService
              .createPayment({
                amount:
                  roundMoney(
                    input.amount
                  ),

                method:
                  input.method,

                statusPayment:
                  input.statusPayment ??
                  'APPROVED',

                transactionReference:
                  input.transactionReference ??
                  null,

                paidAt:
                  new Date()
                    .toISOString(),

                order:
                  input.orderDocumentId,

                processedBy:
                  employeeId,

                shift:
                  shiftDocumentId,
              });

          // =============================================
          // RECALCULATE ORDER PAYMENT STATUS
          // =============================================

          const [
            orderResponse,
            paymentResponse,
          ] =
            await Promise.all([
              employeeOperationsService
                .findOrder(
                  input.orderDocumentId
                ),

              employeeOperationsService
                .findPayments({
                  orderDocumentId:
                    input.orderDocumentId,

                  statusPayment:
                    'APPROVED',

                  page:
                    1,

                  pageSize:
                    100,
                }),
            ]);

          const approvedTotal =
            roundMoney(
              paymentResponse.data
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
                )
            );

          const orderTotal =
            roundMoney(
              orderResponse.data
                .total
            );

          let paymentStatus:
            EmployeeOrderPaymentStatus =
            'PENDING';

          if (
            approvedTotal >=
            orderTotal
          ) {
            paymentStatus =
              'PAID';
          } else if (
            approvedTotal >
            0
          ) {
            paymentStatus =
              'PARTIAL';
          }

          await employeeOperationsService
            .patchOrder(
              input.orderDocumentId,
              {
                paymentStatus,
              }
            );

          if (
            mountedRef.current
          ) {
            setPayments(
              (
                current
              ) => [
                response.data,
                ...current,
              ]
            );
          }

          return response.data;
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
        employeeId,
        shiftDocumentId,
      ]
    );

  // ===================================================
  // CHANGE STATUS
  // ===================================================

  const changeOrderStatus =
    useCallback(
      async (
        documentId:
          string,

        status:
          OrderStatus
      ) => {
        if (
          !employeeId
        ) {
          throw new Error(
            'No se pudo identificar al empleado.'
          );
        }

        setSaving(
          true
        );

        try {
          if (
            status ===
            'COMPLETED'
          ) {
            const current =
              await employeeOperationsService
                .findOrder(
                  documentId
                );

            if (
              current.data
                .paymentStatus !==
              'PAID'
            ) {
              throw new Error(
                'La orden debe estar pagada antes de completarse.'
              );
            }

            const response =
              await employeeOperationsService
                .patchOrder(
                  documentId,
                  {
                    statusOrder:
                      'COMPLETED',

                    paymentStatus:
                      'PAID',

                    completeAt:
                      new Date()
                        .toISOString(),

                    /*
                     * Campo ACTUAL de Strapi.
                     */
                    completeBy:
                      employeeId,
                  }
                );

            return response.data;
          }

          const response =
            await employeeOperationsService
              .patchOrder(
                documentId,
                {
                  statusOrder:
                    status,
                }
              );

          return response.data;
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
        employeeId,
      ]
    );

  // ===================================================
  // CREATE RECEIPT
  // ===================================================

  const createReceipt =
    useCallback(
      async (
        input:
          CreateEmployeeReceiptInput
      ) => {
        if (
          !employeeId
        ) {
          throw new Error(
            'No se pudo identificar al empleado.'
          );
        }

        setSaving(
          true
        );

        try {
          const orderResponse =
            await employeeOperationsService
              .findOrder(
                input.orderDocumentId
              );

          const order =
            orderResponse.data;

          if (
            order.statusOrder !==
            'COMPLETED'
          ) {
            throw new Error(
              'Solo se puede emitir un recibo para una orden completada.'
            );
          }

          const response =
            await employeeOperationsService
              .createReceipt({
                receiptNumber:
                  generateReceiptNumber(),

                issuedAt:
                  new Date()
                    .toISOString(),

                subtotal:
  roundMoney(
    order.subtotal ??
    0
  ),

discount:
  roundMoney(
    order.discount ??
    0
  ),

total:
  roundMoney(
    order.total ??
    0
  ),

                completeName:
                  input.completeName ??
                  'Cliente mostrador',

                ci:
                  input.ci ??
                  null,

                order:
                  order.documentId,

                issuedBy:
                  employeeId,
              });

          if (
            mountedRef.current
          ) {
            setReceipts(
              (
                current
              ) => [
                response.data,
                ...current,
              ]
            );
          }

          return response.data;
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
        employeeId,
      ]
    );

  // ===================================================
  // SUMMARY
  // ===================================================

  const summary =
    useMemo(
      () => {
        const activeOrders =
          orders.filter(
            (
              order
            ) =>
              order.statusOrder !==
                'COMPLETED' &&
              order.statusOrder !==
                'CANCELLED'
          );

        const completedOrders =
          orders.filter(
            (
              order
            ) =>
              order.statusOrder ===
              'COMPLETED'
          );

        const approvedPayments =
          payments.filter(
            (
              payment
            ) =>
              payment.statusPayment ===
              'APPROVED'
          );

        const collected =
          approvedPayments.reduce(
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

        return {
          orders:
            orders.length,

          activeOrders:
            activeOrders.length,

          completedOrders:
            completedOrders.length,

          approvedPayments:
            approvedPayments.length,

          collectedAmount:
            roundMoney(
              collected
            ),

          receipts:
            receipts.length,
        };
      },
      [
        orders,
        payments,
        receipts,
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

    void loadOperations()
      .catch(
        () =>
          undefined
      );
  }, [
    autoLoad,
    loadOperations,
  ]);

  // ===================================================
  // OPTIONAL POLLING
  // ===================================================

  useEffect(() => {
    if (
      pollingMs <=
      0
    ) {
      return;
    }

    const id =
      setInterval(
        () => {
          void loadOperations(
            true
          ).catch(
            () =>
              undefined
          );
        },
        pollingMs
      );

    return () => {
      clearInterval(
        id
      );
    };
  }, [
    pollingMs,
    loadOperations,
  ]);

  return {
    orders,
    payments,
    receipts,

    summary,

    loading,
    saving,
    error,

    loadOperations,

    createOrder,

    registerPayment,

    changeOrderStatus,

    createReceipt,

    refresh:
      loadOperations,
  };
}