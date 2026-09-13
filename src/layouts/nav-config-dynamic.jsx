'use client';

import { useMemo, useState, useEffect } from 'react';

import { navData as baseNavData } from './nav-config-dashboard';

// ----------------------------------------------------------------------

/**
 * Returns nav data for the dashboard shell (no permission filtering).
 * Defers to client-only after mount to avoid SSR/client hydration mismatch.
 *
 * @returns {{ navData: Array, isNavReady: boolean }}
 */
export function useDynamicNavData() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navData = useMemo(() => (mounted ? baseNavData : []), [mounted]);

  return {
    navData,
    isNavReady: mounted,
  };
}
