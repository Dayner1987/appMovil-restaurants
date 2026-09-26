// config/generate.receip.ts

import {
  Platform,
} from 'react-native';

import * as Print from 'expo-print';

import * as Sharing from 'expo-sharing';

import {
  api,
} from '@/services/api';

import type {
  Receipt,
} from '@/types/receipt.types';

import type {
  Order,
} from '@/types/orders.types';

// =====================================================
// COMPANY
// =====================================================

export interface ReceiptCompanyPdfInfo {
  name?: string;

  description?:
    | string
    | null;

  email?:
    | string
    | null;

  phone?:
    | string
    | null;

  address?:
    | string
    | null;

  nit?:
    | string
    | null;

  logoUrl?:
    | string
    | null;
}

// =====================================================
// RESTAURANT
// =====================================================

export interface ReceiptRestaurantPdfInfo {
  name?: string;

  email?:
    | string
    | null;

  phone?:
    | string
    | null;

  address?:
    | string
    | null;

  nit?:
    | string
    | null;

  logoUrl?:
    | string
    | null;
}

// =====================================================
// PAYMENT
// =====================================================

export interface ReceiptPaymentPdfInfo {
  method?: string;

  status?:
    | string
    | null;

  transactionReference?:
    | string
    | null;
}

// =====================================================
// OPTIONS
// =====================================================

export interface ReceiptPdfOptions {
  receipt:
    Receipt;

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
// RESULT
// =====================================================

export interface GeneratedReceiptPdf {
  uri: string;

  shared: boolean;
}

// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(
  value:
    | string
    | number
    | null
    | undefined
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(
    value
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}

// =====================================================
// MONEY
// =====================================================

function formatMoney(
  value:
    | number
    | null
    | undefined
): string {
  const numberValue =
    Number(
      value ??
        0
    );

  if (
    !Number.isFinite(
      numberValue
    )
  ) {
    return 'Bs 0.00';
  }

  return `Bs ${numberValue.toFixed(
    2
  )}`;
}

// =====================================================
// DATE
// =====================================================

function formatDateTime(
  value?:
    | string
    | null
): string {
  if (!value) {
    return '';
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
    return value;
  }

  try {
    return new Intl.DateTimeFormat(
      'es-BO',
      {
        year:
          'numeric',

        month:
          '2-digit',

        day:
          '2-digit',

        hour:
          '2-digit',

        minute:
          '2-digit',
      }
    ).format(
      date
    );
  } catch {
    return date
      .toLocaleString();
  }
}

// =====================================================
// MEDIA URL
// =====================================================

function getAbsoluteMediaUrl(
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
    ) ||
    url.startsWith(
      'data:'
    )
  ) {
    return url;
  }

  const baseUrl =
    String(
      api.defaults
        .baseURL ??
        ''
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
// IMAGE HTML
// =====================================================

function buildLogoHtml(
  url?:
    | string
    | null,

  alt =
    'Logo'
): string {
  const absoluteUrl =
    getAbsoluteMediaUrl(
      url
    );

  if (!absoluteUrl) {
    return `
      <div class="logo-placeholder">
        R
      </div>
    `;
  }

  return `
    <img
      src="${escapeHtml(
        absoluteUrl
      )}"
      alt="${escapeHtml(
        alt
      )}"
      class="logo"
    />
  `;
}

// =====================================================
// ORDER ITEMS
// =====================================================

function buildOrderItemsHtml(
  order?:
    | Order
    | null
): string {
  const items =
    order?.order_items ??
    [];

  if (
    items.length ===
    0
  ) {
    return '';
  }

  const rows =
    items
      .map(
        (
          item
        ) => {
          const quantity =
            Number(
              item.quantity ??
                0
            );

          const unitPrice =
            Number(
              item.unitPrice ??
                0
            );

          const subtotal =
            Number(
              item.subtotal ??
                quantity *
                  unitPrice
            );

          return `
            <tr>
              <td>
                ${escapeHtml(
                  item.productName ??
                    'Producto'
                )}
              </td>

              <td class="center">
                ${escapeHtml(
                  quantity
                )}
              </td>

              <td class="right">
                ${formatMoney(
                  unitPrice
                )}
              </td>

              <td class="right strong">
                ${formatMoney(
                  subtotal
                )}
              </td>
            </tr>
          `;
        }
      )
      .join('');

  return `
    <section class="section">
      <div class="section-title">
        Detalle del pedido
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th class="center">Cant.</th>
            <th class="right">Precio</th>
            <th class="right">Subtotal</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>
      </table>
    </section>
  `;
}

// =====================================================
// PAYMENT HTML
// =====================================================

function buildPaymentHtml(
  payment?:
    | ReceiptPaymentPdfInfo
    | null,

  receipt?:
    Receipt
): string {
  const paymentStatus =
    payment?.status ??
    receipt?.order
      ?.paymentStatus;

  if (
    !payment?.method &&
    !paymentStatus &&
    !payment
      ?.transactionReference
  ) {
    return '';
  }

  return `
    <section class="section">
      <div class="section-title">
        Información de pago
      </div>

      <div class="info-grid">
        ${
          payment?.method
            ? `
              <div class="info-item">
                <span class="label">
                  Método
                </span>

                <span class="value">
                  ${escapeHtml(
                    payment.method
                  )}
                </span>
              </div>
            `
            : ''
        }

        ${
          paymentStatus
            ? `
              <div class="info-item">
                <span class="label">
                  Estado
                </span>

                <span class="value status-paid">
                  ${escapeHtml(
                    paymentStatus
                  )}
                </span>
              </div>
            `
            : ''
        }

        ${
          payment
            ?.transactionReference
            ? `
              <div class="info-item full">
                <span class="label">
                  Referencia
                </span>

                <span class="value">
                  ${escapeHtml(
                    payment.transactionReference
                  )}
                </span>
              </div>
            `
            : ''
        }
      </div>
    </section>
  `;
}

// =====================================================
// HTML
// =====================================================

export function buildReceiptHtml({
  receipt,
  order,
  company,
  restaurant,
  payment,
}: ReceiptPdfOptions): string {
  const currentOrder =
    order ??
    null;

  const orderCode =
    currentOrder
      ?.orderCode ??
    receipt.order
      ?.orderCode ??
    'Sin código';

  const orderType =
    currentOrder
      ?.orderType ??
    receipt.order
      ?.orderType ??
    '';

  const companyName =
    company?.name ??
    'Sistema móvil de restaurantes';

  const currentYear =
    new Date()
      .getFullYear();

  return `
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <style>
    @page {
      size: A4;
      margin: 22px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
      color: #252A20;
      background: #FFFFFF;
      font-size: 12px;
    }

    .page {
      width: 100%;
      padding: 10px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 18px;
      border-bottom: 2px solid #7B9646;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 68%;
    }

    .logo {
      width: 62px;
      height: 62px;
      object-fit: contain;
      border-radius: 14px;
    }

    .logo-placeholder {
      width: 62px;
      height: 62px;
      border-radius: 14px;
      background: #EEF3E3;
      color: #6F8C3E;
      font-size: 26px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .company-name {
      font-size: 20px;
      font-weight: 800;
      color: #171A15;
      margin-bottom: 4px;
    }

    .company-description {
      font-size: 10px;
      color: #7C8275;
      line-height: 1.5;
    }

    .receipt-title {
      text-align: right;
    }

    .receipt-title h1 {
      margin: 0;
      font-size: 25px;
      color: #171A15;
    }

    .receipt-number {
      margin-top: 5px;
      color: #6F8C3E;
      font-weight: 700;
      font-size: 11px;
    }

    .section {
      margin-top: 20px;
    }

    .section-title {
      margin-bottom: 9px;
      font-size: 12px;
      font-weight: 800;
      color: #171A15;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .box {
      background: #F7F8F2;
      border: 1px solid #E5E8DE;
      border-radius: 14px;
      padding: 13px 15px;
    }

    .info-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .info-item {
      width: 48%;
      padding: 10px 12px;
      background: #F7F8F2;
      border-radius: 10px;
    }

    .info-item.full {
      width: 100%;
    }

    .label {
      display: block;
      color: #858A7A;
      font-size: 9px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .value {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #252A20;
    }

    .status-paid {
      color: #6F8C3E;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: 12px;
    }

    th {
      padding: 10px;
      background: #EEF3E3;
      color: #53672F;
      font-size: 10px;
      text-align: left;
    }

    td {
      padding: 10px;
      border-bottom: 1px solid #ECEEE8;
      font-size: 10px;
    }

    .center {
      text-align: center;
    }

    .right {
      text-align: right;
    }

    .strong {
      font-weight: 700;
    }

    .summary {
      width: 280px;
      margin-left: auto;
      margin-top: 20px;
      border-radius: 15px;
      background: #F7F8F2;
      padding: 15px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      color: #666C60;
    }

    .summary-row.discount {
      color: #D47A24;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #DADFD2;
      padding-top: 12px;
      margin-top: 5px;
      font-size: 16px;
      font-weight: 800;
      color: #171A15;
    }

    .restaurant-box {
      margin-top: 18px;
      padding: 13px 15px;
      border-left: 4px solid #D47A24;
      background: #FFF7ED;
      border-radius: 10px;
    }

    .restaurant-name {
      font-weight: 800;
      margin-bottom: 5px;
    }

    .small {
      font-size: 9px;
      color: #7C8275;
      line-height: 1.6;
    }

    .footer {
      margin-top: 34px;
      padding-top: 18px;
      border-top: 1px solid #E5E8DE;
      text-align: center;
    }

    .thank-you {
      font-size: 13px;
      font-weight: 800;
      color: #6F8C3E;
      margin-bottom: 7px;
    }

    .legal {
      color: #979C90;
      font-size: 8px;
      line-height: 1.6;
    }
  </style>
</head>

<body>
  <div class="page">

    <div class="header">

      <div class="brand">

        ${buildLogoHtml(
          company?.logoUrl,
          companyName
        )}

        <div>
          <div class="company-name">
            ${escapeHtml(
              companyName
            )}
          </div>

          ${
            company
              ?.description
              ? `
                <div class="company-description">
                  ${escapeHtml(
                    company.description
                  )}
                </div>
              `
              : ''
          }
        </div>

      </div>

      <div class="receipt-title">
        <h1>
          RECIBO
        </h1>

        <div class="receipt-number">
          N.º ${escapeHtml(
            receipt.receiptNumber
          )}
        </div>
      </div>

    </div>

    <section class="section">

      <div class="section-title">
        Información del recibo
      </div>

      <div class="info-grid">

        <div class="info-item">
          <span class="label">
            Fecha
          </span>

          <span class="value">
            ${escapeHtml(
              formatDateTime(
                receipt.issuedAt
              )
            )}
          </span>
        </div>

        <div class="info-item">
          <span class="label">
            Pedido
          </span>

          <span class="value">
            ${escapeHtml(
              orderCode
            )}
          </span>
        </div>

        ${
          orderType
            ? `
              <div class="info-item">
                <span class="label">
                  Tipo de pedido
                </span>

                <span class="value">
                  ${escapeHtml(
                    orderType
                  )}
                </span>
              </div>
            `
            : ''
        }

        ${
          receipt.order
            ?.statusOrder ||
          currentOrder
            ?.statusOrder
            ? `
              <div class="info-item">
                <span class="label">
                  Estado
                </span>

                <span class="value">
                  ${escapeHtml(
                    currentOrder
                      ?.statusOrder ??
                    receipt.order
                      ?.statusOrder
                  )}
                </span>
              </div>
            `
            : ''
        }

      </div>

    </section>

    <section class="section">

      <div class="section-title">
        Información del cliente
      </div>

      <div class="box">

        <div class="info-grid">

          <div class="info-item">
            <span class="label">
              Nombre completo
            </span>

            <span class="value">
              ${escapeHtml(
                receipt.completeName ??
                  'Cliente'
              )}
            </span>
          </div>

          <div class="info-item">
            <span class="label">
              CI
            </span>

            <span class="value">
              ${escapeHtml(
                receipt.ci ??
                  'No registrado'
              )}
            </span>
          </div>

        </div>

      </div>

    </section>

    ${buildOrderItemsHtml(
      currentOrder
    )}

    ${buildPaymentHtml(
      payment,
      receipt
    )}

    <div class="summary">

      <div class="summary-row">
        <span>
          Subtotal
        </span>

        <strong>
          ${formatMoney(
            receipt.subtotal
          )}
        </strong>
      </div>

      <div class="summary-row discount">
        <span>
          Descuento
        </span>

        <strong>
          - ${formatMoney(
            receipt.discount ??
              0
          )}
        </strong>
      </div>

      <div class="summary-total">
        <span>
          TOTAL
        </span>

        <span>
          ${formatMoney(
            receipt.total
          )}
        </span>
      </div>

    </div>

    ${
      restaurant
        ? `
          <div class="restaurant-box">

            <div class="restaurant-name">
              ${escapeHtml(
                restaurant.name ??
                  'Restaurante'
              )}
            </div>

            <div class="small">

              ${
                restaurant.nit
                  ? `NIT: ${escapeHtml(
                      restaurant.nit
                    )}<br />`
                  : ''
              }

              ${
                restaurant.address
                  ? `${escapeHtml(
                      restaurant.address
                    )}<br />`
                  : ''
              }

              ${
                restaurant.phone
                  ? `Tel.: ${escapeHtml(
                      restaurant.phone
                    )}<br />`
                  : ''
              }

              ${
                restaurant.email
                  ? `${escapeHtml(
                      restaurant.email
                    )}`
                  : ''
              }

            </div>

          </div>
        `
        : ''
    }

    <div class="footer">

      <div class="thank-you">
        Gracias por su compra
      </div>

      <div class="legal">

        ${
          company?.nit
            ? `NIT: ${escapeHtml(
                company.nit
              )} · `
            : ''
        }

        ${
          company?.address
            ? `${escapeHtml(
                company.address
              )} · `
            : ''
        }

        ${
          company?.phone
            ? `Tel. ${escapeHtml(
                company.phone
              )}<br />`
            : '<br />'
        }

        ${
          company?.email
            ? `${escapeHtml(
                company.email
              )}<br />`
            : ''
        }

        © ${currentYear}
        ${escapeHtml(
          companyName
        )}.
        Todos los derechos reservados.

      </div>

    </div>

  </div>
</body>

</html>
  `;
}

// =====================================================
// GENERATE PDF
// =====================================================

export async function generateReceiptPdf(
  options:
    ReceiptPdfOptions
): Promise<GeneratedReceiptPdf> {
  const html =
    buildReceiptHtml(
      options
    );

  const result =
    await Print.printToFileAsync({
      html,
    });

  return {
    uri:
      result.uri,

    shared:
      false,
  };
}

// =====================================================
// SHARE PDF
// =====================================================

export async function shareReceiptPdf(
  options:
    ReceiptPdfOptions
): Promise<GeneratedReceiptPdf> {
  const generated =
    await generateReceiptPdf(
      options
    );

  if (
    Platform.OS ===
    'web'
  ) {
    /*
     * En web expo-sharing no puede compartir
     * un archivo local por URI.
     */
    return generated;
  }

  const available =
    await Sharing.isAvailableAsync();

  if (!available) {
    return generated;
  }

  await Sharing.shareAsync(
    generated.uri,
    {
      mimeType:
        'application/pdf',

      UTI:
        'com.adobe.pdf',

      dialogTitle:
        `Recibo ${options.receipt.receiptNumber}`,
    }
  );

  return {
    ...generated,

    shared:
      true,
  };
}

// =====================================================
// PRINT
// =====================================================

export async function printReceipt(
  options:
    ReceiptPdfOptions
): Promise<void> {
  const html =
    buildReceiptHtml(
      options
    );

  await Print.printAsync({
    html,
  });
}