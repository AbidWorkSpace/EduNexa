'use client';

import { SplashScreen } from 'src/components/loading-screen';

import { useSchoolThemeContext } from './school-theme-context';

// ----------------------------------------------------------------------
// Holds dashboard content back until the tenant's configuration has loaded,
// so the dashboard never paints with the wrong (default/previous tenant's)
// branding for a frame before re-rendering with the correct one.
// ----------------------------------------------------------------------

export function SchoolConfigGate({ children }) {
  const { isLoading } = useSchoolThemeContext();

  if (isLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
