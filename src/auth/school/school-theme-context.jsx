'use client';

import { use, createContext } from 'react';

// ----------------------------------------------------------------------
// Unlike AuthContext (which throws outside its provider by design), this
// context has a safe default so ThemeProvider — mounted once at the app
// root, above where the school's data is ever fetched — can always read it,
// including on public/unauthenticated pages where no school is known yet.
// ----------------------------------------------------------------------

export const DEFAULT_SCHOOL_THEME_CONTEXT = {
  school: null,
  configuration: null,
  primaryColor: null,
  secondaryColor: null,
  fontFamily: null,
  isLoading: false,
};

export const SchoolThemeContext = createContext(DEFAULT_SCHOOL_THEME_CONTEXT);

export function useSchoolThemeContext() {
  return use(SchoolThemeContext);
}
