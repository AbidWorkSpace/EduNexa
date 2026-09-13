'use client';

import { useState, useEffect, useCallback } from 'react';

import { loadQz, getQzApi, connectQz, disconnectQz, isQzConnected } from 'src/utils/qz-tray';

/**
 * Hook for QZ Tray connection state and actions.
 * Use in Printer Setup dialog and POS to show status and reconnect.
 * @returns {{ status: 'unavailable'|'disconnected'|'connecting'|'connected', connect: () => Promise<void>, disconnect: () => Promise<void>, retry: () => Promise<void>, isConnected: boolean }}
 */
export function useQzConnection() {
  const [status, setStatus] = useState('unavailable');

  const updateStatus = useCallback(() => {
    const qz = getQzApi();
    if (!qz) {
      setStatus('unavailable');
      return;
    }
    const connected = isQzConnected();
     
    console.log('[QZ] useQzConnection.updateStatus: connected =', connected);
    setStatus(connected ? 'connected' : 'disconnected');
  }, []);

  const connect = useCallback(async () => {
    setStatus('connecting');
    const qz = await loadQz();
     
    console.log('[QZ] useQzConnection.connect: loadQz result type:', typeof qz);
    if (!qz) {
      setStatus('unavailable');
      return;
    }
    const ok = await connectQz();
     
    console.log('[QZ] useQzConnection.connect: connect result:', ok);
    setStatus(ok ? 'connected' : 'disconnected');
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectQz();
    updateStatus();
  }, [updateStatus]);

  const retry = useCallback(() => connect(), [connect]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const qz = getQzApi();
    if (qz) {
      updateStatus();
    }
  }, [updateStatus]);

  return {
    status: status === 'connected' ? 'connected' : status,
    connect,
    disconnect,
    retry,
    isConnected: status === 'connected',
  };
}

