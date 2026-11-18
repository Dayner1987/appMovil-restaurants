import { api } from '@/services/api';
import { companyService } from '@/services/company.service';
import { mediaUrl } from '@/utils/media';
// config/generate.order-receipt.ts

import {
  Platform,
} from 'react-native';

import * as FileSystem from 'expo-file-system/legacy';
import {
  generateReceiptPdf,
  printReceipt,
  shareReceiptPdf,
} from '@/config/generate.receip';

import type {
  Receipt,
} from '@/types/receipt.types';

import type {
  Order,
} from '@/types/orders.types';

// =====================================================
// CUSTOMER LABEL
// =====================================================

interface ReceiptInfo {
  buyer: { name: string | null; ci: string | null; phone: string | null };
  restaurant: { name: string; nit: string | null; logoUrl: string | null };
}

async function printableLogo(path: string | null) {
  const url = mediaUrl(path);
  if (!url) return null;
  const response = await fetch(url);
  if (!response.ok) throw new Error('No se pudo descargar el logo del restaurante.');
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo preparar el logo del recibo.'));
    reader.readAsDataURL(blob);
  });
}

function buildReceiptFromOrder(
  order: Order, buyer: ReceiptInfo['buyer']
): Receipt {
  const receipt = {
    id:
      order.id,

    documentId:
      `order-${order.documentId}`,

    receiptNumber:
      order.orderCode,

    issuedAt:
      order.completeAt ??
      order.updatedAt ??
      order.orderedAt,

    completeName: buyer.name || 'Sin registrar',
    ci: buyer.ci,

    subtotal:
      Number(
        order.subtotal ??
        0
      ),

    discount:
      Number(
        order.discount ??
        0
      ),

    total:
      Number(
        order.total ??
        0
      ),

    order: {
      id:
        order.id,

      documentId:
        order.documentId,

      orderCode:
        order.orderCode,

      orderType:
        order.orderType,

      statusOrder:
        order.statusOrder,

      paymentStatus:
        order.paymentStatus,
    },
  } as Receipt;

  return receipt;
}

// =====================================================
// OPEN COMPLETED ORDER RECEIPT
// =====================================================

export async function openCompletedOrderReceipt(
  order:
    Order,
  download = false
): Promise<void> {
  if (
    order.statusOrder !==
    'COMPLETED'
  ) {
    throw new Error(
      'El recibo PDF solo está disponible para órdenes completadas.'
    );
  }

  const [context, companies] = await Promise.all([
    api.get<{ data: ReceiptInfo }>(`/api/orders/${encodeURIComponent(order.documentId)}/receipt-info`),
    companyService.findAll({ page: 1, pageSize: 1 }),
  ]);
  const { buyer, restaurant } = context.data.data;
  const company = companies.data[0];
  const options = {
    order, receipt: buildReceiptFromOrder(order, buyer), buyerPhone: buyer.phone,
    restaurant: { ...restaurant, logoUrl: await printableLogo(restaurant.logoUrl) },
    company: company ? { name: company.name, nit: company.nit } : null,
  };

  // ===================================================
  // WEB
  //
  // Abre la vista de impresión del navegador,
  // donde también se puede guardar como PDF.
  // ===================================================

  if (
    Platform.OS ===
    'web'
  ) {
    await printReceipt(
      options
    );

    return;
  }

  // ===================================================
  // ANDROID / IOS
  //
  // Genera el PDF real y abre las opciones del sistema.
  // ===================================================

  if (download && Platform.OS === 'android') {
    const directory = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!directory.granted) return;
    const generated = await generateReceiptPdf(options);
    const content = await FileSystem.readAsStringAsync(generated.uri, { encoding: FileSystem.EncodingType.Base64 });
    const safeName = String(order.orderCode || order.documentId).replace(/[^a-z0-9_-]/gi, '_');
    const destination = await FileSystem.StorageAccessFramework.createFileAsync(directory.directoryUri, safeName + '.pdf', 'application/pdf');
    await FileSystem.writeAsStringAsync(destination, content, { encoding: FileSystem.EncodingType.Base64 });
    return;
  }

  await shareReceiptPdf(
    options
  );
}