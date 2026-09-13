'use client';

import { invoicePayloadToHtml } from './invoice-to-html';
import { loadQz, getQzApi, connectQz, isQzConnected } from './qz-connection';

/**
 * Get list of printer names from QZ Tray. Returns [] if not connected.
 * Adds debug logging for diagnostics.
 * @returns {Promise<Array<{ name: string, default?: boolean }>>}
 */
export async function getPrinters() {
  const qz = getQzApi();
   
  console.log('[QZ] getPrinters: qz available:', Boolean(qz));
  if (!qz?.printers?.find) {
     
    console.warn('[QZ] getPrinters: printers API not available on qz');
    return [];
  }

  if (!isQzConnected()) {
     
    console.log('[QZ] getPrinters: not connected, attempting connect');
    const ok = await connectQz();
     
    console.log('[QZ] getPrinters: connect result:', ok);
    if (!ok) return [];
  }

  try {
    const list = await qz.printers.find();
     
    console.log('[QZ] getPrinters: printers found:', list);
    if (!Array.isArray(list)) return [];
    return list.map((p) =>
      typeof p === 'string' ? { name: p } : { name: p?.name ?? String(p), default: p?.default }
    );
  } catch (err) {
     
    console.error('[QZ] getPrinters: failed to list printers', err);
    return [];
  }
}

/**
 * Print invoice payload silently to the given printer via QZ Tray (HTML).
 * Adds debug logging around print execution.
 * @param {Object} payload - Invoice payload (same shape as buildInvoicePayload)
 * @param {string} printerName - Printer name from getPrinters() or saved selection
 * @returns {Promise<void>} Resolves when sent; rejects on error
 */
export async function printInvoiceSilent(payload, printerName) {
   
  console.log('[QZ] printInvoiceSilent: start', { printerName });
  const qz = getQzApi();
  if (!qz?.print || !qz?.configs?.create) {
     
    console.error('[QZ] printInvoiceSilent: qz API not ready');
    throw new Error('QZ Tray is not available');
  }

  if (!isQzConnected()) {
     
    console.log('[QZ] printInvoiceSilent: not connected, attempting connect');
    const ok = await connectQz();
     
    console.log('[QZ] printInvoiceSilent: connect result:', ok);
    if (!ok) throw new Error('QZ Tray is not connected');
  }

  const html = invoicePayloadToHtml(payload, { width: '80mm' });
  const config = qz.configs.create(printerName);

  const data = [
    {
      type: 'pixel',
      format: 'html',
      flavor: 'plain',
      data: html,
    },
  ];

   
  console.log('[QZ] printInvoiceSilent: sending job via qz.print');
  await qz.print(config, data);
   
  console.log('[QZ] printInvoiceSilent: print job sent');
}

/**
 * Try to print via QZ Tray; on failure or not connected, optionally call onFallback (e.g. window.print).
 * This function enforces that browser print is only used when allowBrowserFallback is explicitly true.
 * @param {Object} payload - Invoice payload
 * @param {string} printerName - Resolved printer name
 * @param {{ onSuccess?: () => void, onFallback?: () => void, allowBrowserFallback?: boolean, debugLabel?: string }} callbacks
 */
export async function trySilentPrintThenFallback(payload, printerName, callbacks = {}) {
  const { onSuccess, onFallback, allowBrowserFallback = false, debugLabel } = callbacks;

   
  console.log('[QZ] trySilentPrintThenFallback: invoked', {
    printerName,
    allowBrowserFallback,
    debugLabel,
  });

  const qzLoaded = await loadQz();
   
  console.log('[QZ] trySilentPrintThenFallback: QZ Loaded:', typeof qzLoaded);

  const qz = getQzApi();
  const initiallyConnected = isQzConnected();
   
  console.log('[QZ] trySilentPrintThenFallback: initial connection status:', initiallyConnected);

  if (!qz || !initiallyConnected) {
     
    console.log('[QZ] trySilentPrintThenFallback: not connected, attempting connect');
    const ok = await connectQz();
     
    console.log('[QZ] trySilentPrintThenFallback: connect result:', ok);
    if (!ok) {
       
      console.error('[QZ] trySilentPrintThenFallback: QZ not connected; cannot print');
      if (allowBrowserFallback && onFallback) {
         
        console.log(
          '[QZ] trySilentPrintThenFallback: invoking browser fallback (allowBrowserFallback=true)'
        );
        onFallback();
        return;
      }
      throw new Error('QZ Tray is not connected and browser fallback is disabled.');
    }
  }

  try {
    await printInvoiceSilent(payload, printerName);
    onSuccess?.();
  } catch (err) {
     
    console.error('[QZ] trySilentPrintThenFallback: print failed', err);
    if (allowBrowserFallback && onFallback) {
       
      console.log(
        '[QZ] trySilentPrintThenFallback: invoking browser fallback after failure (allowBrowserFallback=true)'
      );
      onFallback();
      return;
    }
    throw err;
  }
}

/**
 * Simple developer test helper for QZ Tray.
 * Can be called from the browser console as window.testQZPrint().
 * Prints a small text-only test payload using the default printer (or first available).
 * @param {string} [printerName] - Optional printer name; if omitted, uses default/first printer.
 */
export async function testQZPrint(printerName) {
   
  console.log('[QZ] testQZPrint: invoked', { printerName });
  const qz = await loadQz();
   
  console.log('[QZ] testQZPrint: QZ Loaded:', typeof qz);
  if (!qz) {
    throw new Error('QZ Tray API not available. Is QZ Tray installed and running?');
  }

  const connected = await connectQz();
   
  console.log('[QZ] testQZPrint: connect result:', connected);
  if (!connected) {
    throw new Error('Failed to connect to QZ Tray for test print.');
  }

  let resolvedPrinterName = printerName;
  if (!resolvedPrinterName) {
    const printers = await getPrinters();
     
    console.log('[QZ] testQZPrint: printers list:', printers);
    if (!printers.length) {
      throw new Error('No printers available for test print.');
    }
    const preferred = printers.find((p) => p.default) ?? printers[0];
    resolvedPrinterName = preferred.name;
  }

  const config = qz.configs.create(resolvedPrinterName);
  const data = [
    {
      type: 'raw',
      format: 'plain',
      data: '*** QZ Test Print ***\nHello from dashboard theme.\n\n',
    },
  ];

   
  console.log('[QZ] testQZPrint: sending raw test job to', resolvedPrinterName);
  await qz.print(config, data);
   
  console.log('[QZ] testQZPrint: test print sent successfully');
}

