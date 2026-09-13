'use client';

/**
 * QZ Tray security: certificate and signature promises.
 * Required for production (HTTPS). For development, use dev certificate or allow unsigned.
 * @see https://github.com/qzind/tray/wiki/Signing
 */

const QZ_SIGNING_CERT_URL = '/signing/digital-certificate.txt';
const QZ_SIGN_API = '/api/print/sign';

/** Fake certificate string used in dev mode only. Not for production. */
const DEV_MODE_FAKE_CERT = 'FAKE_CERTIFICATE_FOR_DEV';

/**
 * Configure QZ security in dev mode: fake certificate + bypass signature.
 * Runs immediately after loading QZ, before any connect/getPrinters/print.
 * DEV MODE ONLY - do not use in production.
 * @param {Object} qz - QZ Tray API
 */
function setQzSecurityDevMode(qz) {
  if (!qz?.security) return;

  qz.security.setCertificatePromise((resolve) => {
    resolve(DEV_MODE_FAKE_CERT);
  });

  qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
    resolve();
  });

   
  console.log('[QZ] QZ Signing Configured (dev mode - bypass)');
}

/**
 * Set certificate and signature promises on qz.security for production (backend sign).
 * Call once before qz.websocket.connect().
 * @param {Object} qz - QZ Tray API (from dynamic import)
 * @param {{ useBackendSign?: boolean, certUrl?: string, signUrl?: string }} options
 */
function setQzSecurityProduction(qz, options) {
  if (!qz?.security) return;

  const certUrl = options.certUrl ?? QZ_SIGNING_CERT_URL;
  const signUrl = options.signUrl ?? QZ_SIGN_API;

  qz.security.setCertificatePromise((resolve, reject) => {
    fetch(certUrl)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('Certificate fetch failed'))))
      .then(resolve)
      .catch(reject);
  });

  qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
    fetch(signUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: toSign }),
    })
      .then((r) => r.json())
      .then((d) => (d?.signature ? resolve(d.signature) : reject(new Error('No signature in response'))))
      .catch(reject);
  });

   
  console.log('[QZ] QZ Signing Configured (production - backend sign)');
}

/**
 * Set certificate and signature promises on qz.security.
 * Call once before qz.websocket.connect().
 * When useBackendSign is false, uses dev-mode bypass (fake cert + no signature).
 * @param {Object} qz - QZ Tray API (from dynamic import)
 * @param {{ useBackendSign?: boolean, certUrl?: string, signUrl?: string }} options
 */
export function setQzSecurity(qz, options = {}) {
  if (!qz?.security) return;

  const useBackendSign = options.useBackendSign ?? true;

  if (useBackendSign) {
    setQzSecurityProduction(qz, options);
  } else {
    setQzSecurityDevMode(qz);
  }
}
