'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { baseApi } from 'src/store/api/base-api';
import { useGetSchoolConfigQuery } from 'src/store/api/school-config-api';

import { useAuthContext } from '../hooks';
import { SchoolThemeContext, DEFAULT_SCHOOL_THEME_CONTEXT } from './school-theme-context';

// ----------------------------------------------------------------------
// Implements the "Application starts -> authenticated user identified ->
// determine tenant -> fetch school configuration -> load theme configuration"
// flow. Mounted once in the root layout (between JwtAuthProvider and
// SettingsProvider) so it's inert on public pages and only starts fetching
// once a user with a schoolId is authenticated.
//
// The fetched design tokens (light/dark colors, typography, spacing, radius,
// shadow) are exposed via context for ThemeProvider to merge into its
// settingsState — deliberately NOT written into SettingsProvider's own
// (persisted, unscoped) state, so a tenant's brand never ends up cached
// under the single global 'app-settings' cookie/localStorage key.
// See src/theme/theme-provider.jsx.
// ----------------------------------------------------------------------

export function SchoolThemeProvider({ children }) {
  const dispatch = useDispatch();
  const { user, authenticated } = useAuthContext();
  const schoolId = user?.schoolId ?? null;

  const { data, isLoading, isFetching } = useGetSchoolConfigQuery(schoolId, {
    skip: !authenticated || !schoolId,
  });

  // Defense-in-depth for same-tab account switching (Step 10 / Test 7):
  // the query cache is already keyed per-schoolId so this isn't required for
  // correctness, but clearing the whole API cache when the authenticated
  // school actually changes guarantees no stale cross-tenant data lingers in
  // the store for the lifetime of the tab.
  const previousSchoolIdRef = useRef(schoolId);
  useEffect(() => {
    const previous = previousSchoolIdRef.current;
    if (previous && schoolId && previous !== schoolId) {
      dispatch(baseApi.util.resetApiState());
    }
    previousSchoolIdRef.current = schoolId;
  }, [schoolId, dispatch]);

  const value = useMemo(() => {
    if (!authenticated || !schoolId) {
      return DEFAULT_SCHOOL_THEME_CONTEXT;
    }

    if (!data?.configuration) {
      return { ...DEFAULT_SCHOOL_THEME_CONTEXT, isLoading: isLoading || isFetching };
    }

    const { school, configuration } = data;

    return {
      school,
      configuration,
      lightColors: configuration.theme?.light?.colors ?? null,
      darkColors: configuration.theme?.dark?.colors ?? null,
      defaultMode: configuration.theme?.defaultMode ?? null,
      fontFamily: configuration.typography?.fontFamily ?? null,
      typographyVariants: configuration.typography?.variants ?? null,
      spacing: configuration.spacing ?? null,
      radius: configuration.radius ?? null,
      shadow: configuration.shadow ?? null,
      isLoading: false,
    };
  }, [authenticated, schoolId, data, isLoading, isFetching]);

  return <SchoolThemeContext value={value}>{children}</SchoolThemeContext>;
}
