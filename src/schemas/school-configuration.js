import { z as zod } from 'zod';

// ----------------------------------------------------------------------

const hexColor = zod
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { message: 'Must be a valid hex color (e.g. #1565C0)' });

const nullableHexColor = zod.union([hexColor, zod.null()]).optional();

export const SchoolBrandingSchema = zod
  .object({
    schoolName: zod.string().trim().min(1, { message: 'School name is required' }).max(120),
    tagline: zod.string().trim().max(160).nullable().optional(),
    logoUrl: zod.string().trim().url({ message: 'Must be a valid URL' }).nullable().optional().or(zod.literal('')),
    faviconUrl: zod.string().trim().url({ message: 'Must be a valid URL' }).nullable().optional().or(zod.literal('')),
  })
  .partial();

// ----------------------------------------------------------------------
// Semantic color tokens — one full set per color scheme (light/dark), so a
// school's dark theme is a genuinely independent configuration, not a
// derived/inverted version of its light one.
// ----------------------------------------------------------------------

export const SemanticColorsSchema = zod
  .object({
    primary: nullableHexColor,
    secondary: nullableHexColor,
    accent: nullableHexColor,
    success: nullableHexColor,
    warning: nullableHexColor,
    error: nullableHexColor,
    info: nullableHexColor,
    background: nullableHexColor,
    surface: nullableHexColor,
    textPrimary: nullableHexColor,
    textSecondary: nullableHexColor,
    textMuted: nullableHexColor,
    border: nullableHexColor,
  })
  .partial();

const ColorSchemeSchema = zod
  .object({
    colors: SemanticColorsSchema,
  })
  .partial();

// ----------------------------------------------------------------------
// Typography — bounded ranges so a school can never submit a value that
// would break layout (e.g. a 400px heading or a negative line-height).
// ----------------------------------------------------------------------

const TypographyVariantSchema = zod
  .object({
    fontSize: zod.number().min(8).max(96),
    fontWeight: zod.number().int().min(100).max(900),
    lineHeight: zod.number().min(0.8).max(3),
    letterSpacing: zod.number().min(-2).max(4),
  })
  .partial();

export const TYPOGRAPHY_VARIANT_KEYS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'bodyLarge',
  'body',
  'bodySmall',
  'caption',
  'label',
  'button',
];

const TypographyVariantsSchema = zod
  .object(Object.fromEntries(TYPOGRAPHY_VARIANT_KEYS.map((key) => [key, TypographyVariantSchema])))
  .partial();

export const SchoolTypographySchema = zod
  .object({
    fontFamily: zod.string().trim().max(120).nullable(),
    variants: TypographyVariantsSchema,
  })
  .partial();

// ----------------------------------------------------------------------

export const SHADOW_LEVELS = ['none', 'sm', 'md', 'lg', 'xl'];

/**
 * Top-level School Configuration. Every section is optional (deep-merged
 * server-side onto the stored configuration), and componentDefaults is
 * deliberately a loose, mostly-empty record: it is the reserved growth point
 * for future per-component tokens (button height, table density, nav
 * colors, ...) and is not read by the theme pipeline yet — see the Theme
 * Builder audit notes in school-theme-provider.jsx.
 */
export const SchoolConfigurationUpdateSchema = zod
  .object({
    branding: SchoolBrandingSchema,
    theme: zod
      .object({
        defaultMode: zod.enum(['light', 'dark']),
        light: ColorSchemeSchema,
        dark: ColorSchemeSchema,
      })
      .partial(),
    typography: SchoolTypographySchema,
    spacing: zod.number().min(4).max(16),
    radius: zod.number().min(0).max(32),
    shadow: zod.enum(SHADOW_LEVELS),
    componentDefaults: zod.record(zod.string(), zod.unknown()),
  })
  .partial();
