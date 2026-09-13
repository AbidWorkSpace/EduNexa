'use client';

import { setQzSecurity } from './qz-signing';

const QZ_LOAD_TIMEOUT_MS = 8000;

let qzApi = null;
let loadPromise = null;

/**
 * Load QZ Tray API (dynamic import, client-only).
 * Adds debug logging so we can verify that QZ is actually loaded.
 * @returns {Promise<Object|null>} qz API or null if failed
 */
export function loadQz() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (qzApi) {
     
    console.log('[QZ] loadQz: reusing existing instance');
    return Promise.resolve(qzApi);
  }
  if (loadPromise) {
     
    console.log('[QZ] loadQz: using in-flight load promise');
    return loadPromise;
  }

   
  console.log('[QZ] loadQz: starting dynamic import');
  loadPromise = (async () => {
    try {
      const mod = await import('qz-tray');
      const qz = mod.default ?? mod;
       
      console.log('[QZ] loadQz: module loaded, has websocket:', Boolean(qz?.websocket));
      if (!qz?.websocket) return null;
      qzApi = qz;
      setQzSecurity(qz, { useBackendSign: false });
       
      console.log('[QZ] loadQz: security configured');
      return qz;
    } catch (err) {
       
      console.error('[QZ] loadQz: failed to load qz-tray module', err);
      return null;
    }
  })();

  return loadPromise;
}

/**
 * Connect to QZ Tray. Loads QZ if needed and sets security before connecting.
 * Adds debug logging for connection lifecycle.
 * @returns {Promise<boolean>} true if connected
 */
export async function connectQz() {
   
  console.log('[QZ] connectQz: attempting connection...');
  const qz = await loadQz();
  if (!qz) {
     
    console.error('[QZ] connectQz: qz API not available (is QZ Tray installed and running?)');
    return false;
  }
  try {
    // QZ Tray uses websocket.isActive(); some versions also expose isConnected()
    const alreadyActive =
      (typeof qz.websocket.isActive === 'function' && qz.websocket.isActive()) ||
      (typeof qz.websocket.isConnected === 'function' && qz.websocket.isConnected());
    if (alreadyActive) {
       
      console.log('[QZ] connectQz: already connected');
      return true;
    }
    await Promise.race([
      qz.websocket.connect(),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error('Connection timeout')), QZ_LOAD_TIMEOUT_MS)
      ),
    ]);
     
    console.log('[QZ] connectQz: connection established');
    return true;
  } catch (err) {
     
    console.error('[QZ] connectQz: failed to connect', err);
    return false;
  }
}

/**
 * Disconnect from QZ Tray.
 */
export async function disconnectQz() {
  if (!qzApi?.websocket) return;
  try {
    await qzApi.websocket.disconnect();
     
    console.log('[QZ] disconnectQz: disconnected');
  } catch (err) {
     
    console.warn('[QZ] disconnectQz: error while disconnecting (ignored)', err);
  }
}

/**
 * Check if QZ is currently connected (must have called loadQz first).
 * @returns {boolean}
 */
export function isQzConnected() {
  // QZ Tray uses websocket.isActive(); some versions also expose isConnected()
  const ws = qzApi?.websocket;
  const connected = Boolean(
    (typeof ws?.isActive === 'function' && ws.isActive()) ||
      (typeof ws?.isConnected === 'function' && ws.isConnected())
  );
   
  console.log('[QZ] isQzConnected:', connected);
  return connected;
}

/**
 * Get the QZ API instance (null if not loaded).
 * @returns {Object|null}
 */
export function getQzApi() {
  const hasApi = Boolean(qzApi);
   
  console.log('[QZ] getQzApi: has instance:', hasApi);
  return qzApi ?? null;
}

/**
 * Ensure QZ is loaded and connected, with a simple retry mechanism.
 * Can be used before attempting any print to guarantee connection.
 * @param {{ retries?: number }} options
 * @returns {Promise<boolean>}
 */
export async function ensureQzConnected(options = {}) {
  const { retries = 1 } = options;
   
  console.log('[QZ] ensureQzConnected: start, retries =', retries);
  let attempt = 0;
  while (attempt <= retries) {
     
    console.log('[QZ] ensureQzConnected: attempt', attempt + 1);
    const ok = await connectQz();
    if (ok) {
       
      console.log('[QZ] ensureQzConnected: connected');
      return true;
    }
    attempt += 1;
  }
   
  console.error('[QZ] ensureQzConnected: failed to connect after retries');
  return false;
}

