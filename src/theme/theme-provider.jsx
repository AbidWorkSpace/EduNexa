'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import { useSchoolThemeContext } from 'src/auth/school/school-theme-context';

import { createTheme } from './create-theme';
import { Rtl } from './with-settings/right-to-left';

// ----------------------------------------------------------------------

export function ThemeProvider({ themeOverrides, children, ...other }) {
  const settings = useSettingsContext();
  const { currentLang } = useTranslate();
  const schoolTheme = useSchoolThemeContext();

  // The authenticated user's school configuration (once loaded) overrides
  // brand color/font on top of the user's own personal settings — never
  // persisted into settings' own storage, see SchoolThemeProvider.
  const settingsState = {
    ...settings.state,
    ...(schoolTheme.primaryColor && { primaryColor: schoolTheme.primaryColor }),
    ...(schoolTheme.secondaryColor && { secondaryColor: schoolTheme.secondaryColor }),
    ...(schoolTheme.fontFamily && { fontFamily: schoolTheme.fontFamily }),
  };

  const theme = createTheme({
    settingsState,
    localeComponents: currentLang?.systemValue,
    themeOverrides,
  });

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={theme} {...other}>
      <CssBaseline />
      <Rtl direction={settings.state.direction}>{children}</Rtl>
    </ThemeVarsProvider>
  );
}
