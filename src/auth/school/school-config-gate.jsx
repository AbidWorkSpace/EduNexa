'use client';

import { useRef, useEffect } from 'react';
import { useColorScheme } from '@mui/material/styles';

import { SplashScreen } from 'src/components/loading-screen';

import { useSchoolThemeContext } from './school-theme-context';

// ----------------------------------------------------------------------
// Two jobs, both scoped to the authenticated dashboard tree only:
//
// 1. Hold content back until the tenant's configuration has loaded, so the
//    dashboard never paints with the wrong (default/previous tenant's)
//    branding for a frame before re-rendering with the correct one.
//
// 2. Apply the school's configured default color mode once per school
//    session (tracked by school id, not on every render) — a soft default,
//    not a lock: the existing mode toggle still works normally afterward.
//    This must live below ThemeProvider (useColorScheme requires a
//    CssVarsProvider ancestor), which is exactly where dashboard/layout.jsx
//    mounts this gate.
// ----------------------------------------------------------------------

export function SchoolConfigGate({ children }) {
  const { isLoading, school, defaultMode } = useSchoolThemeContext();
  const { setMode } = useColorScheme();

  const appliedForSchoolIdRef = useRef(null);
  useEffect(() => {
    if (!school?.id || !defaultMode) return;
    if (appliedForSchoolIdRef.current === school.id) return;

    appliedForSchoolIdRef.current = school.id;
    setMode(defaultMode);
  }, [school?.id, defaultMode, setMode]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
