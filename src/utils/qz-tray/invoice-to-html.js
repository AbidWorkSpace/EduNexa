'use client';

import { getValue, formatValue } from 'src/components/invoice-print/invoice-layout-utils';
import {
  getStyleConstants,
  INVOICE_LAYOUT_SECTIONS,
} from 'src/components/invoice-print/invoice-layout-descriptor';

// ----------------------------------------------------------------------

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build thermal receipt HTML from invoice payload (descriptor-driven; same structure as InvoicePrintLayout).
 * Used for QZ Tray HTML print. Inline styles from shared style constants for design parity.
 * @param {Object} payload - { header, meta, lines, totals, footer, isReprint }
 * @param {{ width?: string }} options - e.g. { width: '80mm' }
 * @returns {string} HTML string
 */
export function invoicePayloadToHtml(payload, options = {}) {
  if (!payload) return '';

  const widthPreset = options.width ?? '80mm';
  const styles = getStyleConstants(widthPreset);
  const borderColor = '#ccc';

  const parts = [];
  parts.push(
    `<div style="max-width:${styles.widthMm};width:100%;margin:0 auto;padding:${styles.paddingPx}px;font-family:monospace;font-size:${styles.fontSizePx}px;text-align:left;box-sizing:border-box;">`
  );

  INVOICE_LAYOUT_SECTIONS.forEach((section) => {
    if (section.type === 'conditional') {
      if (!section.showWhen(payload)) return;
      parts.push(
        `<div style="text-align:center;font-weight:700;margin-bottom:${styles.gapPx}px;border-bottom:1px solid ${borderColor};padding-bottom:${styles.gapPx}px;">${esc(section.label)}</div>`
      );
      return;
    }

    if (section.type === 'separator') {
      parts.push(`<div style="border-top:1px solid ${borderColor};margin:${styles.separatorMarginPx}px 0;"></div>`);
      return;
    }

    if (section.type === 'block') {
      if (section.showWhen && !section.showWhen(payload)) return;
      const { fields, align, marginBottomPx, borderTop, paddingTopPx } = section;
      const visibleFields = fields.filter((f) => {
        if (!f.optional) return true;
        const v = getValue(payload, f.key);
        return v != null && v !== '';
      });
      if (visibleFields.length === 0) return;
      const style = [
        align ? `text-align:${align}` : '',
        marginBottomPx ? `margin-bottom:${marginBottomPx}px` : '',
        borderTop ? `border-top:1px solid ${borderColor}` : '',
        paddingTopPx ? `padding-top:${paddingTopPx}px` : '',
      ]
        .filter(Boolean)
        .join(';');
      parts.push(`<div style="${style}">`);
      visibleFields.forEach((field) => {
        const raw = getValue(payload, field.key);
        const value = esc(formatValue(raw, field.format) || '—');
        const labelOnlyBold = field.labelBold && field.label;
        const display = labelOnlyBold
          ? `<span style="font-weight:700">${esc(field.label)} </span><span>${value}</span>`
          : field.label
            ? `${esc(field.label)} ${value}`
            : value;
        const fStyle = [
          !labelOnlyBold && field.bold ? 'font-weight:700' : '',
          field.caption ? 'font-size:11px;color:#666' : '',
          field.wordBreak ? 'word-break:break-word' : '',
        ]
          .filter(Boolean)
          .join(';');
        parts.push(`<div${fStyle ? ` style="${fStyle}"` : ''}>${display}</div>`);
      });
      parts.push('</div>');
      return;
    }

    if (section.type === 'meta') {
      const { fields, marginBottomPx } = section;
      const inlineStart = fields.find((f) => !f.block && !f.center && !f.inlineEnd);
      const center = fields.find((f) => !f.block && f.center);
      const inlineEnd = fields.find((f) => !f.block && f.inlineEnd);
      const blockFields = fields.filter((f) => f.block);
      const hasInlineRow = center || inlineEnd;

      parts.push(`<div style="margin-bottom:${marginBottomPx}px;">`);
      if (hasInlineRow) {
        parts.push('<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:2px;">');
        if (inlineStart) {
          const v = formatValue(getValue(payload, inlineStart.key), inlineStart.format) || '—';
          parts.push(`<span>${esc(inlineStart.label)} ${esc(v)}</span>`);
        }
        if (center) {
          const v = formatValue(getValue(payload, center.key), center.format) || '—';
          parts.push(
            `<span style="font-weight:${center.bold ? '700' : 'normal'};flex:1;text-align:center;">${esc(v)}</span>`
          );
        }
        if (inlineEnd) {
          const v = formatValue(getValue(payload, inlineEnd.key), inlineEnd.format) || '—';
          parts.push(`<span style="text-align:right;">${esc(inlineEnd.label)} ${esc(v)}</span>`);
        }
        parts.push('</div>');
      }
      blockFields.forEach((field) => {
        if (field.optional && (getValue(payload, field.key) == null || getValue(payload, field.key) === '')) return;
        const raw = getValue(payload, field.key);
        const value = esc(formatValue(raw, field.format) || '—');
        const labelOnlyBold = field.labelBold && field.label;
        const content = labelOnlyBold
          ? `<span style="font-weight:700">${esc(field.label)}</span> ${value}`
          : (field.label ? `${esc(field.label)} ${value}` : value);
        const style = [
          'margin-top:2px',
          !labelOnlyBold && field.bold ? 'font-weight:700' : '',
          field.center ? 'text-align:center;margin:4px 0' : '',
        ]
          .filter(Boolean)
          .join(';');
        parts.push(`<div style="${style}">${content}</div>`);
      });
      parts.push('</div>');
      return;
    }

    if (section.type === 'table') {
      const { columns, marginBottomPx } = section;
      const lines = payload?.lines ?? [];
      parts.push(`<div style="margin-bottom:${marginBottomPx}px;">`);
      parts.push(
        `<div style="display:flex;gap:8px;border-bottom:1px solid ${borderColor};padding-bottom:2px;margin-bottom:4px;">`
      );
      columns.forEach((col) => {
        const colStyle = [
          col.headerBold ? 'font-weight:700' : 'font-weight:600',
          col.flex ? 'flex:1;min-width:0' : '',
          !col.flex && col.minWidthPx ? `min-width:${col.minWidthPx}px;flex-shrink:0` : '',
          col.align === 'right' ? 'text-align:right' : '',
        ]
          .filter(Boolean)
          .join(';');
        parts.push(`<span style="${colStyle}">${esc(col.header)}</span>`);
      });
      parts.push('</div>');
      lines.forEach((line) => {
        const rowParts = columns.map((col) => {
          const raw = line[col.key];
          const display = formatValue(raw, col.format) || '—';
          const cellStyle = [
            col.flex ? 'flex:1;min-width:0;word-break:break-word' : '',
            !col.flex && col.minWidthPx ? `min-width:${col.minWidthPx}px;flex-shrink:0` : '',
            col.align === 'right' ? 'text-align:right' : '',
          ]
            .filter(Boolean)
            .join(';');
          return `<span style="${cellStyle}">${col.format === 'text' ? esc(display) : display}</span>`;
        });
        parts.push(`<div style="display:flex;gap:8px;padding:2px 0;">${rowParts.join('')}</div>`);
      });
      parts.push('</div>');
      return;
    }

    if (section.type === 'totals') {
      const { rows, marginBottomPx } = section;
      const visibleRows = rows.filter((r) => !r.showWhen || r.showWhen(payload));
      parts.push(`<div style="margin-bottom:${marginBottomPx}px;">`);
      visibleRows.forEach((row, idx) => {
        const isLast = idx === visibleRows.length - 1;
        const label = typeof row.labelTemplate === 'function' ? row.labelTemplate(payload) : row.label;
        const raw = getValue(payload, row.key);
        const value =
          row.signed && Number(raw) > 0 ? `-${formatValue(raw, row.format)}` : formatValue(raw, row.format);
        const lineStyle = [
          'display:flex',
          'justify-content:space-between',
          'padding:2px 0',
          isLast ? 'padding:8px 0;margin-top:4px;border-top:1px solid ' + borderColor : '',
        ]
          .filter(Boolean)
          .join(';');
        const filler =
          isLast
            ? ''
            : ` <span style="border-bottom:1px dotted ${borderColor};flex:1;margin:0 4px;"></span> `;
        parts.push(
          `<div style="${lineStyle}">${esc(label)}${filler}<span style="font-weight:${row.bold ? '700' : 'normal'}">${value}</span></div>`
        );
      });
      parts.push('</div>');
    }
  });

  parts.push('</div>');
  return parts.join('');
}
