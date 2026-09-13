'use client';

/**
 * Single source of truth for invoice/receipt layout.
 * Structure, labels, and conditionals are defined here; layout, invoice-to-html, and escpos-builder all consume this.
 * For new receipt fields: add data in build-invoice-payload.js and add the section/field here.
 */

// ----------------------------------------------------------------------
// Style constants (used by layout sx and invoice-to-html inline styles so design matches)
// ----------------------------------------------------------------------

export const STYLE_CONSTANTS = {
  80: {
    paddingPx: 12,
    fontSizePx: 12,
    widthMm: '72mm',
    headerMarginBottomPx: 12,
    blockMarginBottomPx: 8,
    separatorMarginPx: 8,
    gapPx: 4,
    tableColGapPx: 12,
    productNameMinWidthPx: 24,
    rateTotalMinWidthPx: 40,
  },
  58: {
    paddingPx: 8,
    fontSizePx: 11,
    widthMm: '52mm',
    headerMarginBottomPx: 12,
    blockMarginBottomPx: 8,
    separatorMarginPx: 8,
    gapPx: 4,
    tableColGapPx: 10,
    productNameMinWidthPx: 20,
    rateTotalMinWidthPx: 36,
  },
};

export function getStyleConstants(widthPreset) {
  const is58 = widthPreset === '58mm';
  return is58 ? STYLE_CONSTANTS[58] : STYLE_CONSTANTS[80];
}

// ----------------------------------------------------------------------
// Sections (order defines render order)
// ----------------------------------------------------------------------

export const SECTION_IDS = {
  reprint: 'reprint',
  header: 'header',
  meta: 'meta',
  separator: 'separator',
  lines: 'lines',
  totals: 'totals',
  delivery: 'delivery',
  footer: 'footer',
};

export const INVOICE_LAYOUT_SECTIONS = [
  {
    id: SECTION_IDS.reprint,
    type: 'conditional',
    showWhen: (payload) => Boolean(payload?.isReprint),
    label: 'DUPLICATE COPY',
  },
  {
    id: SECTION_IDS.header,
    type: 'block',
    align: 'center',
    marginBottomPx: 12,
    fields: [
      { key: 'header.branchName', label: null, format: 'text', optional: true, bold: true },
      { key: 'header.address', label: null, format: 'text', optional: true, wordBreak: true },
      { key: 'header.ntn', label: 'NTN #', format: 'text', optional: true },
      { key: 'header.contact', label: 'Contact #', format: 'text', optional: true },
    ],
  },
  {
    id: SECTION_IDS.meta,
    type: 'meta',
    marginBottomPx: 8,
    fields: [
      { key: 'meta.paymentStatus', label: 'Payment Status:', format: 'text', block: true, labelBold: true },
      { key: 'meta.cashierName', label: 'Punched By:', format: 'text', block: true, labelBold: true },
      { key: 'meta.dateTime', label: 'Date:', format: 'text', block: true, labelBold: true },
      { key: 'meta.orderNumber', label: 'Order #', format: 'text', block: true, labelBold: true },
      { key: 'meta.orderType', label: 'Order Type:', format: 'text', block: true, labelBold: true },
      { key: 'meta.tableName', label: 'Table:', format: 'text', block: true, optional: true, labelBold: true },
    ],
  },
  {
    id: SECTION_IDS.delivery,
    type: 'block',
    showWhen: (payload) => payload?.delivery != null,
    align: 'left',
    marginBottomPx: 8,
    borderTop: true,
    paddingTopPx: 8,
    fields: [
      { key: 'delivery.contactName', label: 'Contact:', format: 'text', optional: true, labelBold: true },
      { key: 'delivery.phone', label: 'Phone:', format: 'text', optional: true, labelBold: true },
      { key: 'delivery.address', label: 'Address:', format: 'text', optional: true, wordBreak: true, labelBold: true },
      { key: 'delivery.city', label: 'City:', format: 'text', optional: true, labelBold: true },
      { key: 'delivery.postalCode', label: 'Postal Code:', format: 'text', optional: true, labelBold: true },
      { key: 'delivery.landmark', label: 'Landmark:', format: 'text', optional: true, labelBold: true },
      { key: 'delivery.instructions', label: 'Instructions:', format: 'text', optional: true, wordBreak: true, labelBold: true },
    ],
  },
  { id: 'sep1', type: 'separator' },
  {
    id: SECTION_IDS.lines,
    type: 'table',
    marginBottomPx: 8,
    columns: [
      { key: 'productName', header: 'Product', format: 'text', flex: 1, maxLengthEscpos: 24, headerBold: true },
      { key: 'qty', header: 'Qty', format: 'number', minWidthPx: 28, align: 'right', headerBold: true },
      { key: 'rate', header: 'Rate', format: 'number', minWidthPx: 44, align: 'right', headerBold: true },
      { key: 'total', header: 'Total', format: 'number', minWidthPx: 44, align: 'right', headerBold: true },
    ],
  },
  { id: 'sep2', type: 'separator' },
  {
    id: SECTION_IDS.totals,
    type: 'totals',
    marginBottomPx: 8,
    rows: [
      { key: 'totals.subtotal', label: 'Subtotal:', format: 'currency' },
      {
        key: 'totals.taxAmount',
        labelTemplate: (p) => {
          const pct = p?.totals?.taxPercentage;
          return pct != null ? `Tax ${pct}%:` : 'Tax:';
        },
        format: 'currency',
        showWhen: (p) => (p?.totals?.taxAmount ?? 0) > 0,
        signed: false,
      },
      {
        key: 'totals.discountAmount',
        labelTemplate: (p) => {
          const pct = p?.totals?.discountPercentage;
          return pct != null ? `Discount ${pct}%:` : 'Discount:';
        },
        format: 'currency',
        showWhen: (p) => (p?.totals?.discountAmount ?? 0) > 0,
        signed: true,
      },
      { key: 'totals.grandTotal', label: 'Grand Total:', format: 'currency', bold: true },
    ],
  },
  {
    id: SECTION_IDS.footer,
    type: 'block',
    align: 'center',
    borderTop: true,
    paddingTopPx: 8,
    fields: [
      { key: 'footer.poweredBy', label: null, format: 'text' },
      { key: 'footer.poweredByLine', label: null, format: 'text', caption: true },
    ],
  },
];
