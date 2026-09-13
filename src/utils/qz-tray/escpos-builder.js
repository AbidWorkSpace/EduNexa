'use client';

import { getValue, formatValue } from 'src/components/invoice-print/invoice-layout-utils';
import {
  SECTION_IDS,
  INVOICE_LAYOUT_SECTIONS,
} from 'src/components/invoice-print/invoice-layout-descriptor';

const ESC = '\x1b';
const GS = '\x1d';

/** Max characters per line for 80mm thermal paper; keeps content from cutting off on the right. */
const ESCPOS_LINE_WIDTH_80MM = 48;

function escEscpos(s) {
  if (s == null) return '';
  return String(s)
    .split('')
    .map((c) => {
      const code = c.charCodeAt(0);
      if (c === '\n') return '\n';
      if (code < 32 || code > 126) return '?';
      return c;
    })
    .join('');
}

function truncateLine(str, maxLen = ESCPOS_LINE_WIDTH_80MM) {
  const s = String(str ?? '');
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen);
}

/**
 * Build ESC/POS raw data from invoice payload (descriptor-driven; same structure as InvoicePrintLayout).
 * Uses ASCII-safe text; thermal printers typically support code page 437 or UTF-8.
 * @param {Object} payload - { header, meta, lines, totals, footer, isReprint }
 * @returns {string} ESC/POS command string
 */
export function invoicePayloadToEscpos(payload) {
  if (!payload) return '';

  const linesOut = [];

  linesOut.push(ESC + '@');
  linesOut.push(ESC + 'a' + '\x00');
  linesOut.push('');

  INVOICE_LAYOUT_SECTIONS.forEach((section) => {
    if (section.type === 'conditional') {
      if (!section.showWhen(payload)) return;
      linesOut.push(truncateLine(escEscpos(section.label)));
      return;
    }

    if (section.type === 'block') {
      if (section.showWhen && !section.showWhen(payload)) return;
      const { fields, id } = section;
      const isFooter = id === SECTION_IDS.footer;
      const visibleFields = fields.filter((f) => {
        if (!f.optional) return true;
        const v = getValue(payload, f.key);
        return v != null && v !== '';
      });
      if (visibleFields.length === 0) return;
      visibleFields.forEach((field) => {
        const raw = getValue(payload, field.key);
        const display = formatValue(raw, field.format) || '—';
        const labelOnlyBold = field.labelBold && field.label;
        const labelPrefix = field.label ? field.label + ' ' : '';
        const valueStr = escEscpos(display);
        const fullPrintable = labelPrefix + valueStr;
        const truncatedPrintable = truncateLine(fullPrintable);
        const line = labelOnlyBold
          ? ESC + 'E' + '\x01' + escEscpos(field.label) + ' ' + ESC + 'E' + '\x00' + (truncatedPrintable.length > labelPrefix.length ? truncatedPrintable.slice(labelPrefix.length) : '')
          : escEscpos(truncatedPrintable);
        linesOut.push(line);
      });
      if (isFooter) {
        linesOut.push('\n\n\n');
        linesOut.push(GS + 'V' + '\x00');
      }
      return;
    }

    if (section.type === 'meta') {
      const { fields } = section;
      const inlineStart = fields.find((f) => !f.block && !f.center && !f.inlineEnd);
      const center = fields.find((f) => !f.block && f.center);
      const inlineEnd = fields.find((f) => !f.block && f.inlineEnd);
      const blockFields = fields.filter((f) => f.block);
      const hasInlineRow = center || inlineEnd;

      if (hasInlineRow) {
        if (inlineStart) {
          const v = formatValue(getValue(payload, inlineStart.key), inlineStart.format) || '—';
          linesOut.push(truncateLine(inlineStart.label ? inlineStart.label + ' ' + escEscpos(v) : escEscpos(v)));
        }
        if (center && inlineEnd) {
          const cv = formatValue(getValue(payload, center.key), center.format) || '—';
          const ev = formatValue(getValue(payload, inlineEnd.key), inlineEnd.format) || '—';
          linesOut.push(truncateLine(escEscpos(cv) + '  ' + inlineEnd.label + ' ' + escEscpos(ev)));
        } else if (center) {
          linesOut.push(truncateLine(escEscpos(formatValue(getValue(payload, center.key), center.format) || '—')));
        } else if (inlineEnd) {
          const v = formatValue(getValue(payload, inlineEnd.key), inlineEnd.format) || '—';
          linesOut.push(truncateLine(inlineEnd.label + ' ' + escEscpos(v)));
        }
      }

      blockFields.forEach((field) => {
        if (field.optional && (getValue(payload, field.key) == null || getValue(payload, field.key) === '')) return;
        const raw = getValue(payload, field.key);
        const value = formatValue(raw, field.format) || '—';
        const valueStr = escEscpos(value);
        const labelPrefix = field.label ? field.label + ' ' : '';
        const fullPrintable = labelPrefix + valueStr;
        const truncatedPrintable = truncateLine(fullPrintable);
        if (field.labelBold && field.label) {
          linesOut.push(ESC + 'E' + '\x01' + escEscpos(field.label) + ESC + 'E' + '\x00' + ' ' + (truncatedPrintable.length > labelPrefix.length ? truncatedPrintable.slice(labelPrefix.length) : ''));
        } else {
          linesOut.push(escEscpos(truncatedPrintable));
        }
      });
      return;
    }

    if (section.type === 'separator') {
      linesOut.push('--------------------------------');
      return;
    }

    if (section.type === 'table') {
      const { columns } = section;
      const lines = payload?.lines ?? [];
      const productCol = columns.find((c) => c.key === 'productName');
      const maxLen = productCol?.maxLengthEscpos ?? 24;

      const headerLine = truncateLine(columns.map((c) => c.header).join('   '));
      const headerBold = columns.some((c) => c.headerBold);
      if (headerBold) linesOut.push(ESC + 'E' + '\x01' + escEscpos(headerLine) + ESC + 'E' + '\x00');
      else linesOut.push(escEscpos(headerLine));
      lines.forEach((line) => {
        const name = (line.productName || '—').slice(0, maxLen);
        const qty = formatValue(line.qty, 'number');
        const rate = formatValue(line.rate, 'number');
        const total = formatValue(line.total, 'number');
        linesOut.push(truncateLine(`${escEscpos(name)}  ${qty}  ${rate}  ${total}`));
      });
      return;
    }

    if (section.type === 'totals') {
      const { rows } = section;
      const visibleRows = rows.filter((r) => !r.showWhen || r.showWhen(payload));
      linesOut.push('--------------------------------');
      visibleRows.forEach((row, idx) => {
        const label = typeof row.labelTemplate === 'function' ? row.labelTemplate(payload) : row.label;
        const raw = getValue(payload, row.key);
        const value =
          row.signed && Number(raw) > 0 ? '-' + formatValue(raw, row.format) : formatValue(raw, row.format);
        if (row.bold && idx > 0) linesOut.push('--------------------------------');
        linesOut.push(truncateLine(escEscpos(label) + '        ' + value));
      });
      linesOut.push('--------------------------------');
    }
  });

  linesOut.push('');
  return linesOut.join('\n');
}
