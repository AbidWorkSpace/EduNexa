'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import 'src/components/invoice-print/invoice-print-print.css';
import { getValue, formatValue } from 'src/components/invoice-print/invoice-layout-utils';
import {
  getStyleConstants,
  INVOICE_LAYOUT_SECTIONS,
} from 'src/components/invoice-print/invoice-layout-descriptor';

// ----------------------------------------------------------------------

/**
 * Standard thermal receipt layout driven by invoice-layout-descriptor.
 * Same structure/labels as invoice-to-html and escpos-builder for consistent design.
 */
export function InvoicePrintLayout({ payload, widthPreset = '80mm', className, ...rest }) {
  if (!payload) return null;

  const styles = getStyleConstants(widthPreset);

  const renderSection = (section) => {
    if (section.type === 'conditional') {
      if (!section.showWhen(payload)) return null;
      return (
        <Typography
          key={section.id}
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            fontWeight: 700,
            mb: 0.5,
            borderBottom: 1,
            borderColor: 'divider',
            pb: 0.5,
          }}
        >
          {section.label}
        </Typography>
      );
    }

    if (section.type === 'separator') {
      return (
        <Box
          key={section.id}
          sx={{ borderTop: 1, borderColor: 'divider', my: 1 }}
        />
      );
    }

    if (section.type === 'block') {
      if (section.showWhen && !section.showWhen(payload)) return null;
      const { fields, align, marginBottomPx, borderTop, paddingTopPx } = section;
      const visibleFields = fields.filter((f) => {
        if (!f.optional) return true;
        const v = getValue(payload, f.key);
        return v != null && v !== '';
      });
      if (visibleFields.length === 0) return null;
      return (
        <Box
          key={section.id}
          sx={{
            textAlign: align || 'left',
            mb: marginBottomPx ? `${marginBottomPx}px` : 1,
            ...(borderTop && { pt: 1, borderTop: 1, borderColor: 'divider' }),
            ...(paddingTopPx && { pt: `${paddingTopPx}px` }),
          }}
        >
          {visibleFields.map((field) => {
            const raw = getValue(payload, field.key);
            const value = formatValue(raw, field.format) || '—';
            const labelOnlyBold = field.labelBold && field.label;
            return (
              <Typography
                key={field.key}
                component="div"
                variant={field.caption ? 'caption' : 'body2'}
                sx={{
                  fontWeight: !labelOnlyBold && field.bold ? 700 : undefined,
                  fontSize: field.caption ? '0.85em' : undefined,
                  color: field.caption ? 'text.secondary' : undefined,
                  wordBreak: field.wordBreak ? 'break-word' : undefined,
                  mb: 0.25,
                }}
              >
                {labelOnlyBold ? (
                  <>
                    <Box component="span" sx={{ fontWeight: 700 }}>{field.label} </Box>
                    <Box component="span">{value}</Box>
                  </>
                ) : (
                  field.label ? `${field.label} ${value}` : value
                )}
              </Typography>
            );
          })}
        </Box>
      );
    }

    if (section.type === 'meta') {
      const { fields, marginBottomPx } = section;
      const inlineStart = fields.find((f) => !f.block && !f.center && !f.inlineEnd);
      const center = fields.find((f) => !f.block && f.center);
      const inlineEnd = fields.find((f) => !f.block && f.inlineEnd);
      const blockFields = fields.filter((f) => f.block);
      const hasInlineRow = center || inlineEnd;

      return (
        <Box key={section.id} sx={{ mb: marginBottomPx ? `${marginBottomPx}px` : 1 }}>
          {hasInlineRow && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.5,
            }}
          >
            {inlineStart && (
              <Typography component="span" variant="body2">
                {inlineStart.label} {formatValue(getValue(payload, inlineStart.key), inlineStart.format) || '—'}
              </Typography>
            )}
            {center && (
              <Typography
                component="span"
                variant="body2"
                sx={{ fontWeight: center.bold ? 700 : undefined, flex: 1, textAlign: 'center' }}
              >
                {formatValue(getValue(payload, center.key), center.format) || '—'}
              </Typography>
            )}
            {inlineEnd && (
              <Typography component="span" variant="body2" sx={{ textAlign: 'right' }}>
                {inlineEnd.label} {formatValue(getValue(payload, inlineEnd.key), inlineEnd.format) || '—'}
              </Typography>
            )}
          </Box>
          )}
          {blockFields.map((field) => {
            if (field.optional && (getValue(payload, field.key) == null || getValue(payload, field.key) === ''))
              return null;
            const value = formatValue(getValue(payload, field.key), field.format) || '—';
            const labelOnlyBold = field.labelBold && field.label;
            return (
              <Typography
                key={field.key}
                component="div"
                variant="body2"
                sx={{
                  mt: 0.25,
                  fontWeight: !labelOnlyBold && field.bold ? 700 : undefined,
                  textAlign: field.center ? 'center' : 'left',
                  my: field.center ? 0.25 : undefined,
                }}
              >
                {labelOnlyBold ? (
                  <>
                    <Box component="span" sx={{ fontWeight: 700 }}>{field.label} </Box>
                    <Box component="span">{value}</Box>
                  </>
                ) : (
                  field.label ? `${field.label} ${value}` : value
                )}
              </Typography>
            );
          })}
        </Box>
      );
    }

    if (section.type === 'table') {
      const { columns, marginBottomPx } = section;
      const lines = payload?.lines ?? [];
      return (
        <Box key={section.id} sx={{ mb: marginBottomPx ? `${marginBottomPx}px` : 1 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              borderBottom: 1,
              borderColor: 'divider',
              pb: 0.25,
              mb: 0.5,
            }}
          >
            {columns.map((col) => (
              <Typography
                key={col.key}
                component="span"
                variant="body2"
                sx={{
                  fontWeight: col.headerBold ? 700 : 600,
                  flex: col.flex ?? undefined,
                  minWidth: col.flex ? 0 : (col.minWidthPx ?? undefined),
                  flexShrink: col.flex ? undefined : 0,
                  textAlign: col.align ?? 'left',
                }}
              >
                {col.header}
              </Typography>
            ))}
          </Box>
          {lines.map((line, idx) => (
            <Box
              key={idx}
              data-print-no-break=""
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                py: 0.25,
                breakInside: 'avoid',
              }}
            >
              {columns.map((col) => {
                const raw = line[col.key];
                const display = formatValue(raw, col.format);
                return (
                  <Typography
                    key={col.key}
                    component={col.flex ? 'div' : 'span'}
                    variant="body2"
                    sx={{
                      flex: col.flex ?? undefined,
                      minWidth: col.flex ? 0 : (col.minWidthPx ?? undefined),
                      flexShrink: col.flex ? undefined : 0,
                      textAlign: col.align ?? 'left',
                      wordBreak: col.flex ? 'break-word' : undefined,
                    }}
                  >
                    {display || '—'}
                  </Typography>
                );
              })}
            </Box>
          ))}
        </Box>
      );
    }

    if (section.type === 'totals') {
      const { rows, marginBottomPx } = section;
      const visibleRows = rows.filter((r) => !r.showWhen || r.showWhen(payload));
      return (
        <Box key={section.id} data-print-no-break="" sx={{ mb: marginBottomPx ? `${marginBottomPx}px` : 1 }}>
          {visibleRows.map((row, idx) => {
            const isLast = idx === visibleRows.length - 1;
            const label = typeof row.labelTemplate === 'function'
              ? row.labelTemplate(payload)
              : row.label;
            const raw = getValue(payload, row.key);
            const value = row.signed && Number(raw) > 0 ? `-${formatValue(raw, row.format)}` : formatValue(raw, row.format);
            return (
              <Box
                key={row.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  py: 0.25,
                  ...(isLast && {
                    py: 0.5,
                    mt: 0.5,
                    borderTop: 1,
                    borderColor: 'divider',
                  }),
                }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ fontWeight: row.bold ? 700 : undefined }}
                >
                  {label}
                </Typography>
                {!isLast && (
                  <Box
                    sx={{
                      flex: 1,
                      borderBottom: '1px dotted',
                      borderColor: 'divider',
                      mx: 0.5,
                      alignSelf: 'baseline',
                    }}
                  />
                )}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ fontWeight: row.bold ? 700 : undefined }}
                >
                  {value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      );
    }

    return null;
  };

  const rootClassName = widthPreset === '58mm' ? `invoice-print-58mm ${className || ''}`.trim() : className;

  return (
    <Box
      className={rootClassName || undefined}
      sx={{
        maxWidth: styles.widthMm,
        width: '100%',
        margin: 0,
        padding: `${styles.paddingPx}px`,
        fontFamily: 'monospace',
        fontSize: styles.fontSizePx,
        color: 'text.primary',
        bgcolor: 'background.paper',
        ...rest.sx,
      }}
      {...rest}
    >
      {INVOICE_LAYOUT_SECTIONS.map(renderSection)}
    </Box>
  );
}
