'use client';

const POS_PRINTER_KEY_PREFIX = 'pos_printer_';

const DEFAULT_PRINTER = 'Default';

/**
 * Resolve printer name: optional localStorage per branch, else default label.
 * @param {string|null} branchId
 * @returns {string}
 */
export function getResolvedPrinterName(branchId) {
  if (typeof window !== 'undefined' && branchId) {
    const fromStorage = localStorage.getItem(POS_PRINTER_KEY_PREFIX + branchId);
    if (fromStorage && String(fromStorage).trim()) return String(fromStorage).trim();
  }
  return DEFAULT_PRINTER;
}

/**
 * Save selected printer for a branch (local only).
 * @param {string} branchId
 * @param {string|null} printerName
 */
export function setLocalPrinterForBranch(branchId, printerName) {
  if (typeof window === 'undefined') return;
  const key = POS_PRINTER_KEY_PREFIX + branchId;
  if (printerName == null || String(printerName).trim() === '') {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, String(printerName).trim());
  }
}

export { POS_PRINTER_KEY_PREFIX };
