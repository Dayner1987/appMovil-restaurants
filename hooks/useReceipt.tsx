// hooks/useReceipt.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  receiptService,
} from '@/services/receipt.service';

import {
  generateReceiptPdf,
  printReceipt,
  shareReceiptPdf,
} from '@/config/generate.receip';

import type {
  GeneratedReceiptPdf,
  ReceiptCompanyPdfInfo,
  ReceiptPaymentPdfInfo,
  ReceiptRestaurantPdfInfo,
} from '@/config/generate.receip';

import type {
  CreateReceiptData,
  Receipt,
  ReceiptQueryParams,
  UpdateReceiptData,
} from '@/types/receipt.types';

import type {
  AppUser,
} from '@/types/user.types';

import type {
  Order,
} from '@/types/orders.types';

// =====================================================
// OPTIONS
// =====================================================

interface UseReceiptOptions {
  documentId?: string;

  orderId?:
    | number
    | string;

  autoLoad?: boolean;

  query?: ReceiptQueryParams;
}

// =====================================================
// CREATE FROM ORDER
// =====================================================

export interface CreateReceiptFromOrderData {
  order:
    Order;

  user?:
    | AppUser
    | null;

  receiptNumber?: string;

  issuedAt?: string;

  completeName?:
    | string
    | null;

  ci?:
    | string
    | null;
}

// =====================================================
// PDF CONTEXT
// =====================================================

export interface ReceiptPdfContext {
  order?:
    | Order
    | null;

  company?:
    | ReceiptCompanyPdfInfo
    | null;

  restaurant?:
    | ReceiptRestaurantPdfInfo
    | null;

  payment?:
    | ReceiptPaymentPdfInfo
    | null;
}

// =====================================================
// MONEY
// =====================================================

function roundMoney(
  value:
    | number
    | null
    | undefined
): number {
  const parsed =
    Number(
      value ??
        0
    );

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return 0;
  }

  return Number(
    Math.max(
      parsed,
      0
    ).toFixed(2)
  );
}

// =====================================================
// RECEIPT NUMBER
// =====================================================

export function generateReceiptNumber():
  string {
  const date =
    new Date();

  const year =
    String(
      date.getFullYear()
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

  const hour =
    String(
      date.getHours()
    ).padStart(
      2,
      '0'
    );

  const minute =
    String(
      date.getMinutes()
    ).padStart(
      2,
      '0'
    );

  const second =
    String(
      date.getSeconds()
    ).padStart(
      2,
      '0'
    );

  const random =
    String(
      Math.floor(
        100 +
          Math.random() *
            900
      )
    );

  return `${year}${month}${day}${hour}${minute}${second}${random}`;
}

// =====================================================
// COMPLETE NAME
// =====================================================

export function buildCompleteName(
  user?:
    | AppUser
    | null
): string | null {
  if (!user) {
    return null;
  }

  const completeName = [
    user.firstName,
    user.middleName,
    user.lastName,
    user.secondLastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    completeName ||
    user.username ||
    null
  );
}

// =====================================================
// NORMALIZE CREATE
// =====================================================

function normalizeReceiptData(
  data:
    CreateReceiptData,

  user?:
    | AppUser
    | null,

  defaultOrderId?:
    | number
    | string
): CreateReceiptData {
  const subtotal =
    roundMoney(
      data.subtotal
    );

  const discount =
    roundMoney(
      data.discount ??
        0
    );

  const total =
    roundMoney(
      data.total
    );

  if (
    subtotal < 0 ||
    total < 0
  ) {
    throw new Error(
      'Los montos del recibo no son válidos.'
    );
  }

  return {
    receiptNumber:
      data.receiptNumber
        ?.trim() ||
      generateReceiptNumber(),

    issuedAt:
      data.issuedAt ||
      new Date()
        .toISOString(),

    subtotal,

    discount,

    total,

    completeName:
      data.completeName
        ?.trim() ||
      buildCompleteName(
        user
      ),

    ci:
      data.ci
        ?.trim() ||
      user?.ci
        ?.trim() ||
      null,

    order:
      data.order ??
      defaultOrderId ??
      null,
  };
}

// =====================================================
// HOOK
// =====================================================

export function useReceipt(
  options:
    UseReceiptOptions = {}
) {
  const {
    documentId,
    orderId,
    autoLoad = true,
    query,
  } = options;

  const [
    receipt,
    setReceipt,
  ] =
    useState<Receipt | null>(
      null
    );

  const [
    receipts,
    setReceipts,
  ] =
    useState<Receipt[]>(
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
    generatingPdf,
    setGeneratingPdf,
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
  // GET ONE
  // ===================================================

  const loadReceipt =
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
            await receiptService.findOne(
              id
            );

          if (
            mountedRef.current
          ) {
            setReceipt(
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
              'No se pudo cargar el recibo'
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
  // GET ALL
  // ===================================================

  const loadReceipts =
    useCallback(
      async (
        params:
          ReceiptQueryParams = {}
      ) => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await receiptService.findAll({
              ...params,

              orderId:
                orderId ??
                params.orderId,
            });

          if (
            mountedRef.current
          ) {
            setReceipts(
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
              'No se pudieron cargar los recibos'
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
      [
        orderId,
      ]
    );

  // ===================================================
  // CREATE
  // ===================================================

  const createReceipt =
    useCallback(
      async (
        data:
          CreateReceiptData,

        user?:
          | AppUser
          | null
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const receiptData =
            normalizeReceiptData(
              data,
              user,
              orderId
            );

          const response =
            await receiptService.create(
              receiptData
            );

          const newReceipt =
            response.data;

          if (
            mountedRef.current
          ) {
            setReceipt(
              newReceipt
            );

            setReceipts(
              (
                current
              ) => [
                newReceipt,
                ...current,
              ]
            );
          }

          return newReceipt;
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
                : 'No se pudo generar el recibo'
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
        orderId,
      ]
    );

  // ===================================================
  // CREATE FROM ORDER
  //
  // Los totales ya vienen calculados desde Order.
  // NO recalculamos promociones aquí.
  // ===================================================

  const createReceiptFromOrder =
    useCallback(
      async ({
        order,
        user,
        receiptNumber,
        issuedAt,
        completeName,
        ci,
      }: CreateReceiptFromOrderData) => {
        if (
          !order.documentId
        ) {
          throw new Error(
            'La orden no tiene documentId.'
          );
        }

        return createReceipt(
          {
            receiptNumber:
              receiptNumber ??
              '',

            issuedAt:
              issuedAt ??
              '',

            subtotal:
              order.subtotal,

            discount:
              order.discount ??
              0,

            total:
              order.total,

            completeName:
              completeName ??
              null,

            ci:
              ci ??
              null,

            order:
              order.documentId,
          },
          user
        );
      },
      [
        createReceipt,
      ]
    );

  // ===================================================
  // UPDATE
  // PATCH
  // ===================================================

  const updateReceipt =
    useCallback(
      async (
        id: string,

        data:
          UpdateReceiptData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const normalizedData:
            UpdateReceiptData = {
              ...data,
          };

          if (
            data.subtotal !==
            undefined
          ) {
            normalizedData.subtotal =
              roundMoney(
                data.subtotal
              );
          }

          if (
            data.discount !==
            undefined
          ) {
            normalizedData.discount =
              data.discount ===
              null
                ? null
                : roundMoney(
                    data.discount
                  );
          }

          if (
            data.total !==
            undefined
          ) {
            normalizedData.total =
              roundMoney(
                data.total
              );
          }

          if (
            data.completeName !==
            undefined
          ) {
            normalizedData.completeName =
              data.completeName
                ?.trim() ||
              null;
          }

          if (
            data.ci !==
            undefined
          ) {
            normalizedData.ci =
              data.ci
                ?.trim() ||
              null;
          }

          const response =
            await receiptService.update(
              id,
              normalizedData
            );

          const updated =
            response.data;

          if (
            mountedRef.current
          ) {
            setReceipt(
              (
                current
              ) =>
                current
                  ?.documentId ===
                updated.documentId
                  ? updated
                  : current
            );

            setReceipts(
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
              'No se pudo actualizar el recibo'
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
  // DELETE
  // ===================================================

  const deleteReceipt =
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
          await receiptService.remove(
            id
          );

          if (
            mountedRef.current
          ) {
            setReceipts(
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

            setReceipt(
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
              'No se pudo eliminar el recibo'
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
  // BUILD PDF DATA
  // ===================================================

  const buildReceiptPDFData =
    useCallback(
      (
        context:
          ReceiptPdfContext = {},

        selectedReceipt?:
          | Receipt
          | null
      ) => {
        const currentReceipt =
          selectedReceipt ??
          receipt;

        if (
          !currentReceipt
        ) {
          return null;
        }

        return {
          receipt:
            currentReceipt,

          order:
            context.order ??
            null,

          company:
            context.company ??
            null,

          restaurant:
            context.restaurant ??
            null,

          payment:
            context.payment ??
            null,
        };
      },
      [
        receipt,
      ]
    );

  // ===================================================
  // GENERATE PDF
  // ===================================================

  const generateReceiptPDF =
    useCallback(
      async (
        context:
          ReceiptPdfContext = {},

        selectedReceipt?:
          | Receipt
          | null
      ): Promise<GeneratedReceiptPdf> => {
        const pdfData =
          buildReceiptPDFData(
            context,
            selectedReceipt
          );

        if (!pdfData) {
          throw new Error(
            'No hay un recibo disponible para generar el PDF.'
          );
        }

        setGeneratingPdf(
          true
        );

        setError(
          null
        );

        try {
          return await generateReceiptPdf(
            pdfData
          );
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo generar el PDF del recibo'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setGeneratingPdf(
              false
            );
          }
        }
      },
      [
        buildReceiptPDFData,
      ]
    );

  // ===================================================
  // SHARE PDF
  // ===================================================

  const shareReceiptPDF =
    useCallback(
      async (
        context:
          ReceiptPdfContext = {},

        selectedReceipt?:
          | Receipt
          | null
      ): Promise<GeneratedReceiptPdf> => {
        const pdfData =
          buildReceiptPDFData(
            context,
            selectedReceipt
          );

        if (!pdfData) {
          throw new Error(
            'No hay un recibo disponible para compartir.'
          );
        }

        setGeneratingPdf(
          true
        );

        setError(
          null
        );

        try {
          return await shareReceiptPdf(
            pdfData
          );
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo compartir el recibo'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setGeneratingPdf(
              false
            );
          }
        }
      },
      [
        buildReceiptPDFData,
      ]
    );

  // ===================================================
  // PRINT PDF
  // ===================================================

  const printReceiptPDF =
    useCallback(
      async (
        context:
          ReceiptPdfContext = {},

        selectedReceipt?:
          | Receipt
          | null
      ) => {
        const pdfData =
          buildReceiptPDFData(
            context,
            selectedReceipt
          );

        if (!pdfData) {
          throw new Error(
            'No hay un recibo disponible para imprimir.'
          );
        }

        setGeneratingPdf(
          true
        );

        setError(
          null
        );

        try {
          await printReceipt(
            pdfData
          );
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo imprimir el recibo'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setGeneratingPdf(
              false
            );
          }
        }
      },
      [
        buildReceiptPDFData,
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
      void loadReceipt(
        documentId
      );

      return;
    }

    void loadReceipts(
      query
    );
  }, [
    autoLoad,
    documentId,
    orderId,

    query?.page,
    query?.pageSize,
    query?.sort,
    query?.orderId,
    query?.receiptNumber,
    query?.ci,

    loadReceipt,
    loadReceipts,
  ]);

  // ===================================================
  // RETURN
  // ===================================================

  return {
    receipt,
    receipts,

    loading,
    saving,
    generatingPdf,

    error,

    loadReceipt,
    loadReceipts,

    createReceipt,

    /*
     * Preferido cuando una orden ya terminó.
     */
    createReceiptFromOrder,

    updateReceipt,
    deleteReceipt,

    buildReceiptPDFData,

    generateReceiptPDF,
    shareReceiptPDF,
    printReceiptPDF,

    generateReceiptNumber,
    buildCompleteName,

    refresh:
      documentId
        ? () =>
            loadReceipt(
              documentId
            )
        : () =>
            loadReceipts(
              query
            ),
  };
}