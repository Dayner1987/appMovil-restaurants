import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { promotionService } from '@/services/promotion.service';

import type {
  CreatePromotionData,
  Promotion,
  PromotionQueryParams,
  UpdatePromotionData,
} from '@/types/promotion.types';

interface UsePromotionOptions {
  documentId?: string;
  productId?: number | string;
  autoLoad?: boolean;
  query?: PromotionQueryParams;
}

export interface PromotionCalculation {
  originalTotal: number;
  discount: number;
  finalTotal: number;
  appliedPromotion: Promotion | null;
  freeQuantity: number;
}

function roundMoney(value: number): number {
  return Number(Math.max(value, 0).toFixed(2));
}

function isPromotionActive(
  promotion: Promotion,
  date = new Date()
): boolean {
  const startAt = promotion.startAt
    ? new Date(promotion.startAt)
    : null;

  const endAt = promotion.endAt
    ? new Date(promotion.endAt)
    : null;

  if (startAt && date < startAt) {
    return false;
  }

  if (endAt && date > endAt) {
    return false;
  }

  return true;
}

function calculatePromotion(
  promotion: Promotion,
  quantity: number,
  unitPrice: number
): PromotionCalculation {
  const safeQuantity = Math.max(0, Math.floor(quantity));
  const safeUnitPrice = Math.max(0, unitPrice);
  const originalTotal = roundMoney(
    safeQuantity * safeUnitPrice
  );

  if (
    safeQuantity <= 0 ||
    safeUnitPrice <= 0 ||
    !isPromotionActive(promotion)
  ) {
    return {
      originalTotal,
      discount: 0,
      finalTotal: originalTotal,
      appliedPromotion: null,
      freeQuantity: 0,
    };
  }

  let discount = 0;
  let freeQuantity = 0;

  switch (promotion.type) {
    case 'PERCENTAGE':
      discount =
        originalTotal *
        (Math.max(promotion.percentage, 0) / 100);
      break;

    case 'FIXED_AMOUNT':
      discount =
        promotion.discountAmount ?? 0;
      break;

    case 'TWO_FOR_ONE': {
      const buyQuantity =
        Math.max(
          1,
          Math.floor(promotion.buyQuantity ?? 2)
        );

      const payQuantity =
        Math.min(
          buyQuantity,
          Math.max(
            1,
            Math.floor(promotion.payQuantity ?? 1)
          )
        );

      const groups = Math.floor(
        safeQuantity / buyQuantity
      );

      freeQuantity = groups * (buyQuantity - payQuantity);
      discount = freeQuantity * safeUnitPrice;
      break;
    }

    default:
      discount = 0;
  }

  const finalTotal = roundMoney(
    Math.max(originalTotal - discount, 0)
  );

  return {
    originalTotal,
    discount: roundMoney(
      Math.min(discount, originalTotal)
    ),
    finalTotal,
    appliedPromotion: promotion,
    freeQuantity,
  };
}

function findPromotionForProduct(
  promotions: Promotion[],
  productId: number | string,
  date = new Date()
): Promotion | null {
  const numericProductId = Number(productId);

  return (
    promotions.find((promotion) => {
      if (!isPromotionActive(promotion, date)) {
        return false;
      }

      return promotion.products?.some(
        (product) => product.id === numericProductId
      );
    }) ?? null
  );
}

export function usePromotion(
  options: UsePromotionOptions = {}
) {
  const {
    documentId,
    productId,
    autoLoad = true,
    query,
  } = options;

  const [promotion, setPromotion] =
    useState<Promotion | null>(null);

  const [promotions, setPromotions] =
    useState<Promotion[]>([]);

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

  const loadPromotion = useCallback(async (
    id: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await promotionService.findOne(id);

      if (mountedRef.current) {
        setPromotion(response.data);
      }

      return response.data;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo cargar la promoción');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadPromotions = useCallback(async (
    params: PromotionQueryParams = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await promotionService.findAll({
          ...params,
          productId: productId ?? params.productId,
        });

      if (mountedRef.current) {
        setPromotions(response.data);
      }

      return response;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudieron cargar las promociones');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [productId]);

  const createPromotion = useCallback(async (
    data: CreatePromotionData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response =
        await promotionService.create({
          ...data,
          name: data.name.trim(),
          percentage: Number(data.percentage ?? 0),
          discountAmount:
            data.discountAmount ?? null,
          buyQuantity:
            data.buyQuantity ?? null,
          payQuantity:
            data.payQuantity ?? null,
        });

      const newPromotion = response.data;

      if (mountedRef.current) {
        setPromotion(newPromotion);
        setPromotions((currentPromotions) => [
          newPromotion,
          ...currentPromotions,
        ]);
      }

      return newPromotion;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo crear la promoción');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const updatePromotion = useCallback(async (
    id: string,
    data: UpdatePromotionData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response =
        await promotionService.update(id, data);

      const updatedPromotion = response.data;

      if (mountedRef.current) {
        setPromotion(updatedPromotion);

        setPromotions((currentPromotions) =>
          currentPromotions.map((item) =>
            item.documentId ===
            updatedPromotion.documentId
              ? updatedPromotion
              : item
          )
        );
      }

      return updatedPromotion;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar la promoción');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const deletePromotion = useCallback(async (
    id: string
  ) => {
    setSaving(true);
    setError(null);

    try {
      await promotionService.remove(id);

      if (mountedRef.current) {
        setPromotions((currentPromotions) =>
          currentPromotions.filter(
            (item) => item.documentId !== id
          )
        );

        if (promotion?.documentId === id) {
          setPromotion(null);
        }
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo eliminar la promoción');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [promotion?.documentId]);

  const getActivePromotionForProduct = useCallback((
    id: number | string = productId ?? 0
  ) => {
    return findPromotionForProduct(promotions, id);
  }, [promotions, productId]);

  const calculateProductPrice = useCallback((
    quantity: number,
    unitPrice: number,
    selectedPromotion?: Promotion | null
  ): PromotionCalculation => {
    const activePromotion =
      selectedPromotion ??
      (productId !== undefined
        ? findPromotionForProduct(
            promotions,
            productId
          )
        : null);

    if (!activePromotion) {
      const originalTotal = roundMoney(
        quantity * unitPrice
      );

      return {
        originalTotal,
        discount: 0,
        finalTotal: originalTotal,
        appliedPromotion: null,
        freeQuantity: 0,
      };
    }

    return calculatePromotion(
      activePromotion,
      quantity,
      unitPrice
    );
  }, [productId, promotions]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadPromotion(documentId);
      return;
    }

    void loadPromotions(query);
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
    isPromotionActive,
  };
}
