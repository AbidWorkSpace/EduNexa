import { grey, text, primary, success, warning, error as errorColor, background, secondary } from 'src/theme/core/palette';

import { readJsonFile, writeJsonFile } from './json-store';

// ----------------------------------------------------------------------

const FILE = 'school-configurations.json';

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Shallow-per-key deep merge: nested objects merge key-by-key, everything else is replaced. */
function deepMerge(target, patch) {
  if (!isPlainObject(patch)) return target;

  const result = { ...target };
  Object.keys(patch).forEach((key) => {
    const patchValue = patch[key];
    const targetValue = target?.[key];
    result[key] =
      isPlainObject(patchValue) && isPlainObject(targetValue)
        ? deepMerge(targetValue, patchValue)
        : patchValue;
  });
  return result;
}

/**
 * Platform-default design tokens, sourced directly from the app's own base
 * theme (src/theme/core/palette.js) rather than re-typed hex constants — so
 * an un-configured school renders identically to the platform default, and
 * "reset to default" restores exactly that, not an approximation of it.
 */
function buildDefaultThemeTokens() {
  return {
    defaultMode: 'light',
    light: {
      colors: {
        primary: primary.main,
        secondary: secondary.main,
        accent: primary.dark,
        success: success.main,
        warning: warning.main,
        error: errorColor.main,
        info: primary.light,
        background: background.light.default,
        surface: background.light.paper,
        textPrimary: text.light.primary,
        textSecondary: text.light.secondary,
        textMuted: text.light.disabled,
        border: grey[300],
      },
    },
    dark: {
      colors: {
        primary: primary.main,
        secondary: secondary.main,
        accent: primary.light,
        success: success.main,
        warning: warning.main,
        error: errorColor.main,
        info: primary.light,
        background: background.dark.default,
        surface: background.dark.paper,
        textPrimary: text.dark.primary,
        textSecondary: text.dark.secondary,
        textMuted: text.dark.disabled,
        border: grey[700],
      },
    },
  };
}

function buildDefaultDesignTokens() {
  return {
    theme: buildDefaultThemeTokens(),
    typography: {
      fontFamily: null,
      variants: {},
    },
    spacing: 8,
    radius: 8,
    shadow: 'md',
    componentDefaults: {},
  };
}

export function buildDefaultConfiguration(schoolId, { schoolName } = {}) {
  return {
    schoolId,
    branding: {
      schoolName: schoolName ?? '',
      tagline: null,
      logoUrl: null,
      faviconUrl: null,
    },
    ...buildDefaultDesignTokens(),
    updatedAt: new Date().toISOString(),
  };
}

export async function listConfigurations() {
  return readJsonFile(FILE, []);
}

export async function getConfigBySchoolId(schoolId) {
  const configs = await listConfigurations();
  return configs.find((config) => config.schoolId === schoolId) ?? null;
}

export async function createConfiguration(configuration) {
  const configs = await listConfigurations();

  if (configs.some((config) => config.schoolId === configuration.schoolId)) {
    throw new Error('Configuration already exists for this school');
  }

  await writeJsonFile(FILE, [...configs, configuration]);
  return configuration;
}

/** Deep-merges `patch` into the existing configuration and persists it. Returns the updated record, or null if not found. */
export async function updateConfiguration(schoolId, patch) {
  const configs = await listConfigurations();
  const index = configs.findIndex((config) => config.schoolId === schoolId);
  if (index === -1) return null;

  const updated = {
    ...deepMerge(configs[index], patch),
    schoolId, // never allow the patch to move a configuration to another school
    updatedAt: new Date().toISOString(),
  };

  const next = [...configs];
  next[index] = updated;
  await writeJsonFile(FILE, next);
  return updated;
}

/**
 * Resets a school's design tokens (theme/typography/spacing/radius/shadow/
 * componentDefaults) to the platform defaults. Deliberately leaves
 * `branding` untouched — resetting design tokens shouldn't wipe the
 * school's name/logo/tagline — and never touches any other school's record.
 */
export async function resetConfigurationToDefault(schoolId) {
  const configs = await listConfigurations();
  const index = configs.findIndex((config) => config.schoolId === schoolId);
  if (index === -1) return null;

  const updated = {
    ...configs[index],
    ...buildDefaultDesignTokens(),
    updatedAt: new Date().toISOString(),
  };

  const next = [...configs];
  next[index] = updated;
  await writeJsonFile(FILE, next);
  return updated;
}
