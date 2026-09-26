// hooks/usePromotion.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  promotionService,
} from '@/services/promotion.service';

import type {
  CreatePromotionData,
  Promotion,
  PromotionQueryParams,
  PromotionType,
  UpdatePromotionData,
} from '@/types/promotion.types';

// =====================================================
// OPTIONS
// =====================================================

interface UsePromotionOptions {
  documentId?: string;

  productId?:
    | number
    | string;

  autoLoad?: boolean;

  query?: PromotionQueryParams;
}

// =====================================================
// CÁLCULO DE UN PRODUCTO
// =====================================================

export interface PromotionCalculation {
  originalTotal: number;

  discount: number;

  finalTotal: number;

  appliedPromotion:
    | Promotion
    | null;

  freeQuantity: number;
}

// =====================================================
// LÍNEA DE PEDIDO
// =====================================================

export interface PromotionOrderLine {
  productId:
    | number
    | string;

  quantity: number;

  unitPrice: number;

  /*
   * Si se envía, fuerza esa promoción.
   * Si no, busca una activa.
   */
  promotion?:
    | Promotion
    | null;
}

// =====================================================
// RESULTADO DE LÍNEA
// =====================================================

export interface PromotionOrderLineResult
  extends PromotionCalculation {
  productId:
    | number
    | string;

  quantity: number;

  unitPrice: number;
}

// =====================================================
// TOTAL DEL PEDIDO
// =====================================================

export interface PromotionOrderTotals {
  subtotal: number;

  discount: number;

  total: number;

  totalQuantity: number;

  freeQuantity: number;

  lines:
    PromotionOrderLineResult[];
}

// =====================================================
// MONEY
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

// =====================================================
// NUMBER
// =====================================================

function safeNumber(
  value:
    | number
    | null
    | undefined,
  fallback = 0
): number {
  const parsed =
    Number(
      value
    );

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return fallback;
  }

  return parsed;
}

// =====================================================
// FECHA VÁLIDA
// =====================================================

function getValidDate(
  value?:
    | string
    | null
): Date | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

// =====================================================
// PROMOCIÓN ACTIVA
// =====================================================

export function isPromotionActive(
  promotion: Promotion,
  date =
    new Date()
): boolean {
  const startAt =
    getValidDate(
      promotion.startAt
    );

  const endAt =
    getValidDate(
      promotion.endAt
    );

  if (
    promotion.startAt &&
    !startAt
  ) {
    return false;
  }

  if (
    promotion.endAt &&
    !endAt
  ) {
    return false;
  }

  if (
    startAt &&
    date < startAt
  ) {
    return false;
  }

  if (
    endAt &&
    date > endAt
  ) {
    return false;
  }

  return true;
}

// =====================================================
// PRODUCTO PERTENECE A PROMOCIÓN
//
// Permite:
// id numérico
// documentId
// =====================================================

function promotionHasProduct(
  promotion: Promotion,

  productId:
    | number
    | string
): boolean {
  const target =
    String(
      productId
    );

  return Boolean(
    promotion.products?.some(
      (
        product
      ) =>
        String(
          product.id
        ) ===
          target ||
        (
          product.documentId &&
          product.documentId ===
            target
        )
    )
  );
}

// =====================================================
// BUSCAR PROMOCIÓN
// =====================================================

function findPromotionForProduct(
  promotions: Promotion[],

  productId:
    | number
    | string,

  date =
    new Date()
): Promotion | null {
  return (
    promotions.find(
      (
        promotion
      ) => {
        if (
          !isPromotionActive(
            promotion,
            date
          )
        ) {
          return false;
        }

        return promotionHasProduct(
          promotion,
          productId
        );
      }
    ) ??
    null
  );
}

// =====================================================
// CALCULAR PROMOCIÓN
// =====================================================

function calculatePromotion(
  promotion: Promotion,

  quantity: number,

  unitPrice: number
): PromotionCalculation {
  const safeQuantity =
    Math.max(
      0,
      Math.floor(
        safeNumber(
          quantity
        )
      )
    );

  const safeUnitPrice =
    roundMoney(
      safeNumber(
        unitPrice
      )
    );

  const originalTotal =
    roundMoney(
      safeQuantity *
        safeUnitPrice
    );

  if (
    safeQuantity <= 0 ||
    safeUnitPrice <= 0 ||
    !isPromotionActive(
      promotion
    )
  ) {
    return {
      originalTotal,

      discount: 0,

      finalTotal:
        originalTotal,

      appliedPromotion:
        null,

      freeQuantity: 0,
    };
  }

  let discount =
    0;

  let freeQuantity =
    0;

  // ===================================================
  // TIPO
  // ===================================================

  switch (
    promotion.type
  ) {
    // =================================================
    // PORCENTAJE
    // =================================================

    case 'PERCENTAGE': {
      const percentage =
        Math.min(
          100,
          Math.max(
            0,
            safeNumber(
              promotion.percentage
            )
          )
        );

      discount =
        originalTotal *
        (
          percentage /
          100
        );

      break;
    }

    // =================================================
    // MONTO FIJO
    // =================================================

    case 'FIXED_AMOUNT': {
      discount =
        Math.max(
          0,
          safeNumber(
            promotion.discountAmount
          )
        );

      break;
    }

    // =================================================
    // 2X1 / NxM
    // =================================================

    case 'TWO_FOR_ONE': {
      const buyQuantity =
        Math.max(
          2,
          Math.floor(
            safeNumber(
              promotion.buyQuantity,
              2
            )
          )
        );

      const payQuantity =
        Math.max(
          1,
          Math.min(
            buyQuantity -
              1,

            Math.floor(
              safeNumber(
                promotion.payQuantity,
                1
              )
            )
          )
        );

      const groups =
        Math.floor(
          safeQuantity /
            buyQuantity
        );

      freeQuantity =
        groups *
        (
          buyQuantity -
          payQuantity
        );

      discount =
        freeQuantity *
        safeUnitPrice;

      break;
    }

    default:
      discount = 0;
  }

  discount =
    roundMoney(
      Math.min(
        discount,
        originalTotal
      )
    );

  const finalTotal =
    roundMoney(
      originalTotal -
        discount
    );

  return {
    originalTotal,

    discount,

    finalTotal,

    appliedPromotion:
      promotion,

    freeQuantity,
  };
}

// =====================================================
// NORMALIZAR CREATE
// =====================================================

function normalizeCreatePromotion(
  data:
    CreatePromotionData
): CreatePromotionData {
  const type =
    data.type;

  const normalized:
    CreatePromotionData = {
      ...data,

      name:
        data.name.trim(),

      description:
        data.description
          ?.trim() ||
        null,

      percentage:
        0,

      discountAmount:
        null,

      buyQuantity:
        null,

      payQuantity:
        null,
  };

  if (
    !normalized.name
  ) {
    throw new Error(
      'El nombre de la promoción es obligatorio.'
    );
  }

  switch (type) {
    case 'PERCENTAGE':
      normalized.percentage =
        Math.min(
          100,
          Math.max(
            0,
            safeNumber(
              data.percentage
            )
          )
        );

      break;

    case 'FIXED_AMOUNT':
      normalized.percentage =
        0;

      normalized.discountAmount =
        roundMoney(
          safeNumber(
            data.discountAmount
          )
        );

      break;

    case 'TWO_FOR_ONE': {
      const buyQuantity =
        Math.max(
          2,
          Math.floor(
            safeNumber(
              data.buyQuantity,
              2
            )
          )
        );

      const payQuantity =
        Math.max(
          1,
          Math.min(
            buyQuantity -
              1,

            Math.floor(
              safeNumber(
                data.payQuantity,
                1
              )
            )
          )
        );

      normalized.percentage =
        0;

      normalized.buyQuantity =
        buyQuantity;

      normalized.payQuantity =
        payQuantity;

      break;
    }

    default:
      normalized.percentage =
        Math.max(
          0,
          safeNumber(
            data.percentage
          )
        );
  }

  // ===================================================
  // VALIDAR FECHAS
  // ===================================================

  const startAt =
    getValidDate(
      normalized.startAt
    );

  const endAt =
    getValidDate(
      normalized.endAt
    );

  if (
    startAt &&
    endAt &&
    startAt > endAt
  ) {
    throw new Error(
      'La fecha de inicio no puede ser posterior a la fecha final.'
    );
  }

  return normalized;
}

// =====================================================
// NORMALIZAR PATCH
// =====================================================

function normalizeUpdatePromotion(
  data:
    UpdatePromotionData,

  currentPromotion?:
    | Promotion
    | null
): UpdatePromotionData {
  const normalized:
    UpdatePromotionData = {
      ...data,
  };

  if (
    data.name !==
    undefined
  ) {
    const name =
      data.name.trim();

    if (!name) {
      throw new Error(
        'El nombre de la promoción es obligatorio.'
      );
    }

    normalized.name =
      name;
  }

  if (
    data.description !==
    undefined
  ) {
    normalized.description =
      data.description
        ?.trim() ||
      null;
  }

  if (
    data.percentage !==
    undefined
  ) {
    normalized.percentage =
      Math.min(
        100,
        Math.max(
          0,
          safeNumber(
            data.percentage
          )
        )
      );
  }

  if (
    data.discountAmount !==
    undefined
  ) {
    normalized.discountAmount =
      data.discountAmount ===
      null
        ? null
        : roundMoney(
            safeNumber(
              data.discountAmount
            )
          );
  }

  if (
    data.buyQuantity !==
    undefined
  ) {
    normalized.buyQuantity =
      data.buyQuantity ===
      null
        ? null
        : Math.max(
            2,
            Math.floor(
              safeNumber(
                data.buyQuantity,
                2
              )
            )
          );
  }

  if (
    data.payQuantity !==
    undefined
  ) {
    normalized.payQuantity =
      data.payQuantity ===
      null
        ? null
        : Math.max(
            1,
            Math.floor(
              safeNumber(
                data.payQuantity,
                1
              )
            )
          );
  }

  // ===================================================
  // SI CAMBIA TIPO, LIMPIAR CAMPOS QUE YA NO APLICAN
  // ===================================================

  const type:
    PromotionType =
      data.type ??
      currentPromotion
        ?.type ??
      '';

  if (
    data.type !==
    undefined
  ) {
    switch (type) {
      case 'PERCENTAGE':
        normalized.discountAmount =
          null;

        normalized.buyQuantity =
          null;

        normalized.payQuantity =
          null;

        normalized.percentage =
          Math.min(
            100,
            Math.max(
              0,
              safeNumber(
                data.percentage ??
                  currentPromotion
                    ?.percentage
              )
            )
          );

        break;

      case 'FIXED_AMOUNT':
        normalized.percentage =
          0;

        normalized.buyQuantity =
          null;

        normalized.payQuantity =
          null;

        break;

      case 'TWO_FOR_ONE': {
        normalized.percentage =
          0;

        normalized.discountAmount =
          null;

        const buyQuantity =
          Math.max(
            2,
            Math.floor(
              safeNumber(
                data.buyQuantity ??
                  currentPromotion
                    ?.buyQuantity,
                2
              )
            )
          );

        const payQuantity =
          Math.max(
            1,
            Math.min(
              buyQuantity -
                1,

              Math.floor(
                safeNumber(
                  data.payQuantity ??
                    currentPromotion
                      ?.payQuantity,
                  1
                )
              )
            )
          );

        normalized.buyQuantity =
          buyQuantity;

        normalized.payQuantity =
          payQuantity;

        break;
      }
    }
  }

  // ===================================================
  // VALIDAR FECHAS USANDO VALORES NUEVOS + ACTUALES
  // ===================================================

  const finalStartAt =
    data.startAt !==
    undefined
      ? data.startAt
      : currentPromotion
          ?.startAt;

  const finalEndAt =
    data.endAt !==
    undefined
      ? data.endAt
      : currentPromotion
          ?.endAt;

  const startAt =
    getValidDate(
      finalStartAt
    );

  const endAt =
    getValidDate(
      finalEndAt
    );

  if (
    startAt &&
    endAt &&
    startAt > endAt
  ) {
    throw new Error(
      'La fecha de inicio no puede ser posterior a la fecha final.'
    );
  }

  return normalized;
}

// =====================================================
// HOOK
// =====================================================

export function usePromotion(
  options:
    UsePromotionOptions = {}
) {
  const {
    documentId,
    productId,
    autoLoad = true,
    query,
  } = options;

  const [
    promotion,
    setPromotion,
  ] =
    useState<
      Promotion | null
    >(null);

  const [
    promotions,
    setPromotions,
  ] =
    useState<
      Promotion[]
    >([]);

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
  // GET ONE
  // ===================================================

  const loadPromotion =
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
            await promotionService.findOne(
              id
            );

          if (
            mountedRef.current
          ) {
            setPromotion(
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
              'No se pudo cargar la promoción'
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

  const loadPromotions =
    useCallback(
      async (
        params:
          PromotionQueryParams = {}
      ) => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await promotionService.findAll({
              ...params,

              productId:
                productId ??
                params.productId,
            });

          if (
            mountedRef.current
          ) {
            setPromotions(
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
              'No se pudieron cargar las promociones'
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
        productId,
      ]
    );

  // ===================================================
  // CREATE
  // ===================================================

  const createPromotion =
    useCallback(
      async (
        data:
          CreatePromotionData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const normalizedData =
            normalizeCreatePromotion(
              data
            );

          const response =
            await promotionService.create(
              normalizedData
            );

          const newPromotion =
            response.data;

          if (
            mountedRef.current
          ) {
            setPromotion(
              newPromotion
            );

            setPromotions(
              (
                currentPromotions
              ) => [
                newPromotion,
                ...currentPromotions,
              ]
            );
          }

          return newPromotion;
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
                : 'No se pudo crear la promoción'
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
  // UPDATE
  // ===================================================

  const updatePromotion =
    useCallback(
      async (
        id: string,

        data:
          UpdatePromotionData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const currentPromotion =
            promotion
              ?.documentId ===
            id
              ? promotion
              : promotions.find(
                  (
                    item
                  ) =>
                    item.documentId ===
                    id
                ) ??
                null;

          const normalizedData =
            normalizeUpdatePromotion(
              data,
              currentPromotion
            );

          const response =
            await promotionService.update(
              id,
              normalizedData
            );

          const updatedPromotion =
            response.data;

          if (
            mountedRef.current
          ) {
            setPromotion(
              (
                current
              ) =>
                current
                  ?.documentId ===
                updatedPromotion.documentId
                  ? updatedPromotion
                  : current
            );

            setPromotions(
              (
                currentPromotions
              ) =>
                currentPromotions.map(
                  (
                    item
                  ) =>
                    item.documentId ===
                    updatedPromotion.documentId
                      ? updatedPromotion
                      : item
                )
            );
          }

          return updatedPromotion;
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
                : 'No se pudo actualizar la promoción'
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
        promotion,
        promotions,
      ]
    );

  // ===================================================
  // DELETE
  // ===================================================

  const deletePromotion =
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
          await promotionService.remove(
            id
          );

          if (
            mountedRef.current
          ) {
            setPromotions(
              (
                currentPromotions
              ) =>
                currentPromotions.filter(
                  (
                    item
                  ) =>
                    item.documentId !==
                    id
                )
            );

            setPromotion(
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
              'No se pudo eliminar la promoción'
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
  // PROMOCIÓN ACTIVA DEL PRODUCTO
  // ===================================================

  const getActivePromotionForProduct =
    useCallback(
      (
        id:
          | number
          | string =
          productId ??
          0,

        date =
          new Date()
      ) => {
        return findPromotionForProduct(
          promotions,
          id,
          date
        );
      },
      [
        promotions,
        productId,
      ]
    );

  // ===================================================
  // CALCULAR PRECIO DE UN PRODUCTO
  // ===================================================

  const calculateProductPrice =
    useCallback(
      (
        quantity: number,

        unitPrice: number,

        selectedPromotion?:
          | Promotion
          | null,

        selectedProductId:
          | number
          | string =
          productId ??
          0
      ): PromotionCalculation => {
        const safeQuantity =
          Math.max(
            0,
            Math.floor(
              safeNumber(
                quantity
              )
            )
          );

        const safeUnitPrice =
          roundMoney(
            safeNumber(
              unitPrice
            )
          );

        const activePromotion =
          selectedPromotion ??
          (
            selectedProductId
              ? findPromotionForProduct(
                  promotions,
                  selectedProductId
                )
              : null
          );

        if (
          !activePromotion
        ) {
          const originalTotal =
            roundMoney(
              safeQuantity *
                safeUnitPrice
            );

          return {
            originalTotal,

            discount: 0,

            finalTotal:
              originalTotal,

            appliedPromotion:
              null,

            freeQuantity: 0,
          };
        }

        return calculatePromotion(
          activePromotion,
          safeQuantity,
          safeUnitPrice
        );
      },
      [
        productId,
        promotions,
      ]
    );

  // ===================================================
  // CALCULAR TODO EL PEDIDO
  //
  // ESTE RESULTADO SE PODRÁ MANDAR DIRECTAMENTE A ORDER:
  //
  // subtotal
  // discount
  // total
  // ===================================================

  const calculateOrderTotals =
    useCallback(
      (
        lines:
          PromotionOrderLine[]
      ): PromotionOrderTotals => {
        const calculatedLines =
          lines.map(
            (
              line
            ): PromotionOrderLineResult => {
              const quantity =
                Math.max(
                  0,
                  Math.floor(
                    safeNumber(
                      line.quantity
                    )
                  )
                );

              const unitPrice =
                roundMoney(
                  safeNumber(
                    line.unitPrice
                  )
                );

              const selectedPromotion =
                line.promotion !==
                undefined
                  ? line.promotion
                  : findPromotionForProduct(
                      promotions,
                      line.productId
                    );

              const calculation =
                selectedPromotion
                  ? calculatePromotion(
                      selectedPromotion,
                      quantity,
                      unitPrice
                    )
                  : {
                      originalTotal:
                        roundMoney(
                          quantity *
                            unitPrice
                        ),

                      discount: 0,

                      finalTotal:
                        roundMoney(
                          quantity *
                            unitPrice
                        ),

                      appliedPromotion:
                        null,

                      freeQuantity:
                        0,
                    };

              return {
                productId:
                  line.productId,

                quantity,

                unitPrice,

                ...calculation,
              };
            }
          );

        const subtotal =
          roundMoney(
            calculatedLines.reduce(
              (
                total,
                line
              ) =>
                total +
                line.originalTotal,
              0
            )
          );

        const discount =
          roundMoney(
            calculatedLines.reduce(
              (
                total,
                line
              ) =>
                total +
                line.discount,
              0
            )
          );

        const total =
          roundMoney(
            Math.max(
              subtotal -
                discount,
              0
            )
          );

        const totalQuantity =
          calculatedLines.reduce(
            (
              total,
              line
            ) =>
              total +
              line.quantity,
            0
          );

        const freeQuantity =
          calculatedLines.reduce(
            (
              total,
              line
            ) =>
              total +
              line.freeQuantity,
            0
          );

        return {
          subtotal,

          discount,

          total,

          totalQuantity,

          freeQuantity,

          lines:
            calculatedLines,
        };
      },
      [
        promotions,
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
      void loadPromotion(
        documentId
      );

      return;
    }

    void loadPromotions(
      query
    );
  }, [
    autoLoad,
    documentId,
    productId,

    query?.page,
    query?.pageSize,
    query?.sort,
    query?.restaurantId,
    query?.productId,
    query?.type,

    loadPromotion,
    loadPromotions,
  ]);

  // ===================================================
  // RETURN
  // ===================================================

  return {
    promotion,
    promotions,

    loading,
    saving,
    error,

    loadPromotion,
    loadPromotions,

    createPromotion,
    updatePromotion,
    deletePromotion,

    getActivePromotionForProduct,

    calculateProductPrice,

    /*
     * Nuevo:
     * calcula subtotal, descuento y total
     * completo de un carrito/pedido.
     */
    calculateOrderTotals,

    isPromotionActive,

    refresh:
      documentId
        ? () =>
            loadPromotion(
              documentId
            )
        : () =>
            loadPromotions(
              query
            ),
  };
}