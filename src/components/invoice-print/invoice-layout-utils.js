'use client';

import { fNumber, fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const CURRENCY_OPTS = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

/**
 * Get a value from payload by dot-notation key (e.g. 'meta.invoiceNumber', 'header.projectName').
 * @param {Object} payload - Invoice payload
 * @param {string} dotKey - Key path
 * @returns {*} Value or undefined if missing
 */
export function getValue(payload, dotKey) {
  if (!payload || !dotKey || typeof dotKey !== 'string') return undefined;
  const keys = dotKey.split('.');
  let current = payload;
  for (let i = 0; i < keys.length; i += 1) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[keys[i]];
  }
  return current;
}

/**
 * Format a value for display using the same rules across all renderers (layout, HTML, ESC/POS).
 * @param {*} value - Raw value
 * @param {string} format - 'text' | 'number' | 'currency'
 * @param {Object} [options] - Optional: { currencyOpts } for currency
 * @returns {string}
 */
export function formatValue(value, format, options = {}) {
  const { currencyOpts = CURRENCY_OPTS } = options;
  if (format === 'currency') {
    const num = value != null && Number.isFinite(Number(value)) ? Number(value) : 0;
    return fCurrency(num, currencyOpts);
  }
  if (format === 'number') {
    if (value == null || value === '') return '';
    const num = Number(value);
    return Number.isFinite(num) ? fNumber(num) : String(value);
  }
  // text or default
  if (value == null || value === '') return '';
  return String(value);
}

/**
 * Currency options used by all invoice renderers (layout, HTML, ESC/POS).
 */
export const INVOICE_CURRENCY_OPTS = CURRENCY_OPTS;
