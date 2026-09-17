import { useCallback, useEffect, useRef, useState } from 'react';
import { receiptService } from '@/services/receipt.service';
import type {
  CreateReceiptData,
  Receipt,
  ReceiptQueryParams,
  UpdateReceiptData,
} from '@/types/receipt.types';
import type { AppUser } from '@/types/user.types';

interface UseReceiptOptions {
  documentId?: string;
  orderId?: number | string;
  autoLoad?: boolean;
  query?: ReceiptQueryParams;
}

function generateReceiptNumber(): string {
  const random = Math.floor(1000000 + Math.random() * 9000000);
  return String(random);
}

function buildCompleteName(user?: AppUser | null): string | null {
  if (!user) {
    return null;
  }

  return [
    user.firstName,
    user.middleName,
    user.lastName,
    user.secondLastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || null;
}

export function useReceipt(options: UseReceiptOptions = {}) {
  const { documentId, orderId, autoLoad = true, query } = options;

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadReceipt = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await receiptService.findOne(id);
      if (mountedRef.current) {
        setReceipt(response.data);
      }
      return response.data;
    } catch (error) {
      if (mountedRef.current) {
        setError('No se pudo cargar el recibo');
      }
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadReceipts = useCallback(async (params: ReceiptQueryParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await receiptService.findAll({
        ...params,
        orderId: orderId ?? params.orderId,
      });

      if (mountedRef.current) {
        setReceipts(response.data);
      }
      return response;
    } catch (error) {
      if (mountedRef.current) {
        setError('No se pudieron cargar los recibos');
      }
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [orderId]);

  const createReceipt = useCallback(async (
    data: CreateReceiptData,
    user?: AppUser | null
  ) => {
    setSaving(true);
    setError(null);

    try {
      const receiptData: CreateReceiptData = {
        receiptNumber: data.receiptNumber || generateReceiptNumber(),
        issuedAt: data.issuedAt || new Date().toISOString(),
        subtotal: Number(data.subtotal),
        discount: data.discount ?? 0,
        total: Number(data.total),
        completeName: data.completeName ?? buildCompleteName(user),
        ci: data.ci ?? user?.ci ?? null,
        order: data.order ?? orderId ?? null,
      };

      const response = await receiptService.create(receiptData);
      const newReceipt = response.data;

      if (mountedRef.current) {
        setReceipt(newReceipt);
        setReceipts((current) => [newReceipt, ...current]);
      }

      return newReceipt;
    } catch (error) {
      if (mountedRef.current) {
        setError('No se pudo generar el recibo');
      }
      throw error;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [orderId]);

  const updateReceipt = useCallback(async (
    id: string,
    data: UpdateReceiptData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response = await receiptService.update(id, data);
      const updated = response.data;

      if (mountedRef.current) {
        setReceipt(updated);
        setReceipts((current) =>
          current.map((item) =>
            item.documentId === updated.documentId ? updated : item
          )
        );
      }

      return updated;
    } catch (error) {
      if (mountedRef.current) {
        setError('No se pudo actualizar el recibo');
      }
      throw error;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const deleteReceipt = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await receiptService.remove(id);

      if (mountedRef.current) {
        setReceipts((current) =>
          current.filter((item) => item.documentId !== id)
        );

        if (receipt?.documentId === id) {
          setReceipt(null);
        }
      }
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [receipt?.documentId]);

  /**
   * Preparar datos para PDF
   */
  const buildReceiptPDFData = useCallback(
    (
      restaurant?: {
        name?: string;
        logo?: unknown;
      }
    ) => {
      if (!receipt) {
        return null;
      }

      return {
        restaurantName: restaurant?.name ?? '',
        restaurantLogo: restaurant?.logo ?? null,
        receiptNumber: receipt.receiptNumber,
        issuedAt: receipt.issuedAt,
        client: receipt.completeName,
        ci: receipt.ci,
        subtotal: receipt.subtotal,
        discount: receipt.discount,
        total: receipt.total,
        order: receipt.order,
      };
    },
    [receipt]
  );

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadReceipt(documentId);
      return;
    }

    void loadReceipts(query);
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

  return {
    receipt,
    receipts,
    loading,
    saving,
    error,
    loadReceipt,
    loadReceipts,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    buildReceiptPDFData,
    generateReceiptNumber,
    buildCompleteName,
    refresh: documentId
      ? () => loadReceipt(documentId)
      : () => loadReceipts(query),
  };
}