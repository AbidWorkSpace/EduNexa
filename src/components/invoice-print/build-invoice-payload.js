'use client';

import { fDateTime, formatPatterns } from 'src/utils/format-time';

import { CONFIG } from 'src/global-config';

import { getStoredUser } from 'src/auth/context/jwt/utils';

// ----------------------------------------------------------------------

/**
 * Resolve option label by id from options array.
 * @param {Array<{ id, label?, name? }>} options
 * @param {string|object|null} value - id or option object
 * @returns {string}
 */
function getOptionLabel(options, value) {
  if (!options || !Array.isArray(options)) return '';
  if (value == null) return '';
  const id = typeof value === 'object' && value !== null ? value.id : value;
  const opt = options.find((o) => (o?.id ?? o) === id);
  return (opt?.label ?? opt?.name ?? opt?.id ?? '').trim() || '—';
}

/**
 * Build normalized invoice payload for InvoicePrintLayout.
 * Used for both print (after save, with createOrder response when available) and preview (form only).
 * For new receipt fields: add data here and add the corresponding section/field in
 * invoice-layout-descriptor.js; all three renderers (layout, invoice-to-html, escpos-builder) will pick it up.
 *
 * @param {Object} formValues - Current form state (branchId, orderTypeId, tableId, staffId, items, tax*, discount*, notes, deliveryDetails)
 * @param {Object} options - { branchOptions, orderTypeOptions, tableOptions, staffOptions, paymentModeOptions, itemOptions }
 * @param {Object|null} createOrderResponse - Optional API response from createOrder (id, invoiceNumber?, orderNumber?, createdAt?, items?, branchName?, orderTypeName?, tableName?, staffName?, subTotal?, totalAmount?, taxAmount?, discountAmount?)
 * @param {{ isReprint?: boolean }} overrides - e.g. { isReprint: true } for reprint
 * @returns {Object} Payload for InvoicePrintLayout
 */
export function buildInvoicePayload(formValues, options, createOrderResponse = null, overrides = {}) {
  const {
    branchOptions = [],
    orderTypeOptions = [],
    tableOptions = [],
    paymentModeOptions = [],
    itemOptions = [],
  } = options || {};

  const branchLabel = getOptionLabel(branchOptions, formValues?.branchId);
  const orderTypeLabel = getOptionLabel(orderTypeOptions, formValues?.orderTypeId);
  const tableLabel = getOptionLabel(tableOptions, formValues?.tableId);
  const paymentModeLabel = getOptionLabel(paymentModeOptions, formValues?.paymentModeId);

  const items = formValues?.items ?? [];
  const subtotalFromForm = items.reduce((sum, row) => {
    const q = Number(row.quantity) || 0;
    const p = Number(row.unitPrice) || 0;
    return sum + q * p;
  }, 0);
  const taxPct = formValues?.taxPercentage != null ? Number(formValues.taxPercentage) : null;
  const discPct = formValues?.discountPercentage != null ? Number(formValues.discountPercentage) : null;
  const calculatedTax =
    taxPct != null && taxPct > 0
      ? Math.round(subtotalFromForm * (taxPct / 100) * 100) / 100
      : Number(formValues?.taxAmount) || 0;
  const calculatedDiscount =
    discPct != null && discPct > 0
      ? Math.round(subtotalFromForm * (discPct / 100) * 100) / 100
      : Number(formValues?.discountAmount) || 0;
  const grandTotalFromForm = subtotalFromForm + calculatedTax - calculatedDiscount;

  const useResponse = createOrderResponse && typeof createOrderResponse === 'object';

  const invoiceNumber = useResponse
    ? createOrderResponse.invoiceNumber ?? createOrderResponse.id ?? '—'
    : '—';
  const orderNumberRaw = useResponse
    ? String(createOrderResponse.orderNumber ?? createOrderResponse.id ?? '—')
    : '—';
  const orderNumber =
    orderNumberRaw.length > 14 ? `${orderNumberRaw.slice(0, 14)}..` : orderNumberRaw;
  const dateTime = fDateTime(new Date(), formatPatterns.paramCase.dateTime);

  const responseItems = useResponse && Array.isArray(createOrderResponse.items) ? createOrderResponse.items : null;
  const lines = responseItems
    ? responseItems.map((item) => ({
        productName: item.itemName ?? item.name ?? '—',
        qty: Number(item.quantity) || 0,
        rate: Number(item.unitPrice) || 0,
        total: Number(item.subTotal) || Number(item.quantity) * Number(item.unitPrice) || 0,
      }))
    : items.map((row) => {
        const q = Number(row.quantity) || 0;
        const p = Number(row.unitPrice) || 0;
        const itemId = row?.itemId;
        const id = typeof itemId === 'object' && itemId !== null ? itemId.id : itemId;
        const productName = getOptionLabel(itemOptions, id) || (itemId?.name ?? '—');
        return {
          productName,
          qty: q,
          rate: p,
          total: q * p,
        };
      });

  const subtotal = useResponse ? Number(createOrderResponse.subTotal ?? createOrderResponse.subtotal) : subtotalFromForm;
  const taxAmount = useResponse ? Number(createOrderResponse.taxAmount) : calculatedTax;
  const discountAmount = useResponse ? Number(createOrderResponse.discountAmount) : calculatedDiscount;
  const grandTotal = useResponse
    ? Number(createOrderResponse.totalAmount ?? createOrderResponse.grandTotal)
    : grandTotalFromForm;

  const header = {
    projectName: CONFIG.appName || 'App',
    branchName: useResponse ? createOrderResponse.branchName ?? branchLabel : branchLabel,
    address: useResponse ? createOrderResponse.branchAddress ?? null : null,
    ntn: useResponse ? createOrderResponse.ntn ?? null : null,
    contact: useResponse ? createOrderResponse.contact ?? null : null,
  };

  const storedUser = getStoredUser();
  const currentUserName = storedUser?.userName ?? storedUser?.displayName ?? '';

  const meta = {
    invoiceNumber: String(invoiceNumber),
    paymentStatus: paymentModeLabel ? 'Paid' : 'Unpaid',
    cashierName: currentUserName,
    dateTime,
    orderNumber,
    orderType: useResponse ? createOrderResponse.orderTypeName ?? orderTypeLabel : orderTypeLabel,
    tableName: useResponse ? createOrderResponse.tableName ?? tableLabel : tableLabel,
  };

  const totals = {
    subtotal: Number.isFinite(subtotal) ? subtotal : subtotalFromForm,
    grandTotal: Number.isFinite(grandTotal) ? grandTotal : grandTotalFromForm,
    taxAmount: Number.isFinite(taxAmount) ? taxAmount : calculatedTax,
    taxPercentage: taxPct,
    discountAmount: Number.isFinite(discountAmount) ? discountAmount : calculatedDiscount,
    discountPercentage: discPct,
  };

  const footer = {
    poweredBy: CONFIG.appName || 'POS',
    poweredByLine: 'Powered By : ---',
  };

  const deliveryDetails = formValues?.deliveryDetails;
  const hasDeliveryDetails =
    deliveryDetails &&
    typeof deliveryDetails === 'object' &&
    (deliveryDetails.contactName ||
      deliveryDetails.phone ||
      deliveryDetails.address ||
      deliveryDetails.city ||
      deliveryDetails.postalCode ||
      deliveryDetails.landmark ||
      deliveryDetails.instructions);
  const delivery = hasDeliveryDetails
    ? {
        contactName: deliveryDetails.contactName ?? '',
        phone: deliveryDetails.phone ?? '',
        address: deliveryDetails.address ?? '',
        city: deliveryDetails.city ?? '',
        postalCode: deliveryDetails.postalCode ?? '',
        landmark: deliveryDetails.landmark ?? '',
        instructions: deliveryDetails.instructions ?? '',
      }
    : null;

  return {
    header,
    meta,
    lines,
    totals,
    footer,
    delivery,
    isReprint: Boolean(overrides?.isReprint),
  };
}

/**
 * Build a sample invoice payload for test print (same shape as buildInvoicePayload result).
 * @returns {Object} Payload for InvoicePrintLayout / QZ print
 */
export function buildSampleInvoicePayload() {
  const dateStr = fDateTime(new Date(), formatPatterns.paramCase.dateTime);
  return {
    header: {
      projectName: CONFIG.appName || 'App',
      branchName: 'Sample Branch',
      address: null,
      ntn: null,
      contact: null,
    },
    meta: {
      invoiceNumber: 'TEST-001',
      paymentStatus: 'Paid',
      cashierName: 'POS User',
      dateTime: dateStr,
      orderNumber: '1001',
      orderType: 'Dine In',
      tableName: 'Table 1',
    },
    lines: [
      { productName: 'Sample Item 1', qty: 2, rate: 150, total: 300 },
      { productName: 'Sample Item 2', qty: 1, rate: 250, total: 250 },
    ],
    totals: {
      subtotal: 550,
      grandTotal: 550,
      taxAmount: 0,
      taxPercentage: null,
      discountAmount: 0,
      discountPercentage: null,
    },
    footer: {
      poweredBy: CONFIG.appName || 'POS',
      poweredByLine: 'Powered By : ---',
    },
    delivery: null,
    isReprint: false,
  };
}

