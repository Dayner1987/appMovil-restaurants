// config/generate.order-receipt.ts

import {
  Platform,
} from 'react-native';

import {
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

function getCustomerLabel(
  order:
    Order
): string {
  switch (
    order.orderType
  ) {
    case 'COUNTER':
      return 'Cliente mostrador';

    case 'PICKUP':
      return 'Cliente para recoger';

    case 'ONLINE':
      return 'Cliente online';

    default:
      return 'Cliente';
  }
}

// =====================================================
// VIRTUAL RECEIPT
//
// No crea otro registro en Strapi.
//
// Simplemente adapta la Order actual al formato que
// necesita generate.receip.ts para producir el PDF.
// =====================================================

function buildReceiptFromOrder(
  order:
    Order
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

    completeName:
      getCustomerLabel(
        order
      ),

    ci:
      null,

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
    Order
): Promise<void> {
  if (
    order.statusOrder !==
    'COMPLETED'
  ) {
    throw new Error(
      'El recibo PDF solo está disponible para órdenes completadas.'
    );
  }

  /*
   * Para mostrar información del pago preferimos
   * primero uno APPROVED.
   *
   * Si la orden antigua no tiene uno aprobado,
   * tomamos el primer pago existente.
   */
  const payment =
    order.payments
      ?.find(
        (
          item
        ) =>
          item.statusPayment ===
          'APPROVED'
      ) ??
    order.payments?.[0] ??
    null;

  const receipt =
    buildReceiptFromOrder(
      order
    );

  const options = {
    receipt,

    order,

    restaurant:
      order.restaurant
        ? {
            name:
              order.restaurant
                .name,

            email:
              order.restaurant
                .email,

            phone:
              order.restaurant
                .phone,

            address:
              order.restaurant
                .address,

            nit:
              order.restaurant
                .nit,

            /*
             * No mandamos logo porque con Order
             * no estamos haciendo populate profundo
             * de restaurant.logo.
             */
            logoUrl:
              null,
          }
        : null,

    payment:
      payment
        ? {
            method:
              payment.method ??
              undefined,

            status:
              payment.statusPayment,

            transactionReference:
              payment.transactionReference,
          }
        : null,
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

  await shareReceiptPdf(
    options
  );
}