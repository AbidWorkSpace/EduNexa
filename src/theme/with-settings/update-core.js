import { setFont, hexToRgbChannel, createPaletteChannel } from 'minimal-shared/utils';

import { buildPaletteFromHex, resolveColorPalette, primaryColorPresets, secondaryColorPresets } from './color-presets';
import { createShadowColor } from '../core/custom-shadows';
import { SHADOW_LEVEL_FACTORS, scaleShadowIntensity } from './shadow-intensity';

// ----------------------------------------------------------------------
// Two independent color-override mechanisms coexist here, layered:
//
// 1. settingsState.primaryColor/secondaryColor (preset key or hex) — the
//    user's OWN personal preference from the Settings Drawer, applied
//    identically to both light and dark schemes. Unchanged from before.
//
// 2. settingsState.lightColors/darkColors (full semantic color sets) — a
//    school/tenant's configuration, scheme-specific and independent per
//    mode (School A's dark theme is not a derived inversion of its light
//    one). When present for a scheme, these override #1 for that scheme
//    only. See src/auth/school/school-theme-provider.jsx for where these
//    are populated from the backend, and src/theme/theme-provider.jsx for
//    where they're merged into settingsState (never into the persisted
//    settings cookie — see that file's comments on why).
//
// Semantic keys map onto MUI's own palette slots where MUI already has one
// (success/warning/error/info/background/surface->paper/text/divider) so
// every existing component that already reads those slots picks up the
// tenant's colors automatically. `accent` has no built-in MUI slot; it's
// applied to a custom `theme.palette.accent` key for forward use, though no
// existing generic component reads it yet.
// ----------------------------------------------------------------------

const TYPOGRAPHY_VARIANT_TO_MUI = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  bodyLarge: 'subtitle1',
  body: 'body1',
  bodySmall: 'body2',
  caption: 'caption',
  label: 'overline',
  button: 'button',
};

const SEMANTIC_MUI_PALETTE_KEYS = ['success', 'warning', 'error', 'info'];

/**
 * Updates the core theme with the provided settings state.
 * @param theme - The base theme options to update.
 * @param settingsState - direction, fontFamily, contrast, primaryColor, secondaryColor,
 *   lightColors, darkColors, spacingUnit, radiusBase, shadowLevel, typographyVariants.
 * @returns Updated theme options with applied settings.
 */
export function applySettingsToTheme(theme, settingsState) {
  const {
    direction,
    fontFamily,
    contrast = 'default',
    primaryColor = 'default',
    secondaryColor = 'default',
    lightColors,
    darkColors,
    spacingUnit,
    radiusBase,
    shadowLevel,
    typographyVariants,
  } = settingsState ?? {};

  const isDefaultContrast = contrast === 'default';
  const isDefaultPrimaryColor = primaryColor === 'default';
  const isDefaultSecondaryColor = secondaryColor === 'default';

  const lightPalette = theme.colorSchemes?.light?.palette;

  // primaryColor/secondaryColor accept either a built-in preset key (e.g.
  // 'preset2') or a literal hex string (e.g. '#1565C0').
  const primaryColorPalette = createPaletteChannel(resolveColorPalette(primaryColor, primaryColorPresets));
  const secondaryColorPalette = createPaletteChannel(
    resolveColorPalette(secondaryColor, secondaryColorPresets)
  );

  const shadowFactor = shadowLevel != null ? (SHADOW_LEVEL_FACTORS[shadowLevel] ?? 1) : 1;

  const updateColorScheme = (schemeName) => {
    const currentScheme = theme.colorSchemes?.[schemeName];
    const schemeColors = (schemeName === 'light' ? lightColors : darkColors) ?? {};

    const semanticOverrides = {};
    SEMANTIC_MUI_PALETTE_KEYS.forEach((key) => {
      if (schemeColors[key]) {
        semanticOverrides[key] = createPaletteChannel(buildPaletteFromHex(schemeColors[key]));
      }
    });
    if (schemeColors.accent) {
      semanticOverrides.accent = createPaletteChannel(buildPaletteFromHex(schemeColors.accent));
    }

    const updatedPalette = {
      ...currentScheme?.palette,
      ...(!isDefaultPrimaryColor && { primary: primaryColorPalette }),
      ...(!isDefaultSecondaryColor && { secondary: secondaryColorPalette }),
      ...(schemeColors.primary && { primary: createPaletteChannel(buildPaletteFromHex(schemeColors.primary)) }),
      ...(schemeColors.secondary && {
        secondary: createPaletteChannel(buildPaletteFromHex(schemeColors.secondary)),
      }),
      ...semanticOverrides,
      text: {
        ...currentScheme?.palette?.text,
        ...(schemeColors.textPrimary && { primary: schemeColors.textPrimary }),
        ...(schemeColors.textSecondary && { secondary: schemeColors.textSecondary }),
        ...(schemeColors.textMuted && { disabled: schemeColors.textMuted }),
      },
      ...(schemeColors.border && { divider: schemeColors.border }),
      background: {
        ...currentScheme?.palette?.background,
        ...(schemeName === 'light' &&
          !isDefaultContrast && {
            default: lightPalette.grey[200],
            defaultChannel: hexToRgbChannel(lightPalette.grey[200]),
          }),
        ...(schemeColors.background && { default: schemeColors.background }),
        ...(schemeColors.surface && { paper: schemeColors.surface }),
      },
    };

    const updatedCustomShadows = {
      ...currentScheme?.customShadows,
      ...(!isDefaultPrimaryColor && { primary: createShadowColor(primaryColorPalette.mainChannel) }),
      ...(!isDefaultSecondaryColor && { secondary: createShadowColor(secondaryColorPalette.mainChannel) }),
      ...(schemeColors.primary && {
        primary: createShadowColor(updatedPalette.primary.mainChannel),
      }),
      ...(schemeColors.secondary && {
        secondary: createShadowColor(updatedPalette.secondary.mainChannel),
      }),
    };

    return {
      ...currentScheme,
      palette: updatedPalette,
      shadows: scaleShadowIntensity(currentScheme?.shadows, shadowFactor),
      customShadows: scaleShadowIntensity(updatedCustomShadows, shadowFactor),
    };
  };

  const updatedTypography = {
    ...theme.typography,
    fontFamily: setFont(fontFamily),
  };
  if (typographyVariants) {
    Object.entries(typographyVariants).forEach(([key, value]) => {
      const muiKey = TYPOGRAPHY_VARIANT_TO_MUI[key];
      if (muiKey && value) {
        updatedTypography[muiKey] = { ...updatedTypography[muiKey], ...value };
      }
    });
  }

  return {
    ...theme,
    direction,
    ...(spacingUnit != null && { spacing: spacingUnit }),
    ...(radiusBase != null && { shape: { ...theme.shape, borderRadius: radiusBase } }),
    colorSchemes: {
      light: updateColorScheme('light'),
      dark: updateColorScheme('dark'),
    },
    typography: updatedTypography,
  };
}
