import type { Promotion } from '@/types/promotion.types';
import type { Product, ProductPromotion } from '@/types/product.types';

type PromotionRule = {
  type?: string;
  percentage?: number | null;
  discountAmount?: number | null;
  buyQuantity?: number | null;
  payQuantity?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  name?: string;
  id?: number;
  documentId?: string;
  products?: Array<{ id?: number; documentId?: string }>;
};

export interface PromotionPriceResult {
  originalTotal: number;
  discount: number;
  finalTotal: number;
  freeQuantity: number;
  appliedPromotion: PromotionRule | null;
}

const money = (value: number) => Number(Math.max(0, Number.isFinite(value) ? value : 0).toFixed(2));

export function isPromotionActive(promotion: PromotionRule, now = new Date()): boolean {
  const start = promotion.startAt ? new Date(promotion.startAt) : null;
  const end = promotion.endAt ? new Date(promotion.endAt) : null;
  if (start && Number.isNaN(start.getTime())) return false;
  if (end && Number.isNaN(end.getTime())) return false;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

export function calculatePromotionPrice(
  promotion: PromotionRule | null | undefined,
  quantity: number,
  unitPrice: number,
  now = new Date()
): PromotionPriceResult {
  const safeQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
  const safeUnitPrice = money(Number(unitPrice) || 0);
  const originalTotal = money(safeQuantity * safeUnitPrice);
  if (!promotion || !isPromotionActive(promotion, now) || safeQuantity <= 0 || safeUnitPrice <= 0) {
    return { originalTotal, discount: 0, finalTotal: originalTotal, freeQuantity: 0, appliedPromotion: null };
  }

  let discount = 0;
  let freeQuantity = 0;
  switch (promotion.type) {
    case 'PERCENTAGE': {
      const percentage = Math.min(100, Math.max(0, Number(promotion.percentage) || 0));
      discount = originalTotal * percentage / 100;
      break;
    }
    case 'FIXED_AMOUNT':
      // Monto fijo aplicado una vez al total de esta línea, no por unidad.
      discount = Math.max(0, Number(promotion.discountAmount) || 0);
      break;
    case 'TWO_FOR_ONE': {
      const buy = Math.max(2, Math.floor(Number(promotion.buyQuantity) || 2));
      const pay = Math.max(1, Math.min(buy - 1, Math.floor(Number(promotion.payQuantity) || 1)));
      freeQuantity = Math.floor(safeQuantity / buy) * (buy - pay);
      discount = freeQuantity * safeUnitPrice;
      break;
    }
    default:
      discount = 0;
  }

  discount = money(Math.min(discount, originalTotal));
  return {
    originalTotal,
    discount,
    finalTotal: money(originalTotal - discount),
    freeQuantity,
    appliedPromotion: discount > 0 ? promotion : null,
  };
}

export function findPromotionForProduct(
  promotions: Promotion[],
  product: Pick<Product, 'id' | 'documentId'>,
  now = new Date()
): Promotion | null {
  return promotions.find((promotion) =>
    isPromotionActive(promotion, now) &&
    Boolean(promotion.products?.some((item) =>
      String(item.id) === String(product.id) ||
      (item.documentId && item.documentId === product.documentId)
    ))
  ) ?? null;
}

export function getProductActivePromotion(product: Product, now = new Date()): ProductPromotion | null {
  return (product.promotions ?? []).find((promotion) => isPromotionActive(promotion, now)) ?? null;
}

export function promotionShortLabel(promotion: PromotionRule): string {
  switch (promotion.type) {
    case 'PERCENTAGE': return `${Number(promotion.percentage) || 0}% de descuento`;
    case 'FIXED_AMOUNT': return `Bs ${Number(promotion.discountAmount) || 0} menos`;
    case 'TWO_FOR_ONE': return 'Promoción 2x1';
    default: return 'En promoción';
  }
}
