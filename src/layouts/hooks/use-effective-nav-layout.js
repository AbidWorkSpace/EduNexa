'use client';

import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

/**
 * Effective nav layout for dashboard chrome (sidebar, content padding).
 * Theme clone: no POS-specific mini layout overrides.
 */
export function useEffectiveNavLayout() {
  const { state } = useSettingsContext();

  return {
    isPosScreen: false,
    navLayout: state.navLayout,
    effectiveNavLayout: state.navLayout,
  };
}
