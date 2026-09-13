// ----------------------------------------------------------------------
// Scales every px length inside a boxShadow string (blur/spread/offset) by a
// factor, leaving the color untouched. Applied uniformly to both MUI's
// standard 25-level `theme.shadows` array and the app's own named
// `customShadows` object (z1-z24, card, dialog, dropdown, per-color) — the
// same transform works on both because it only touches px numbers, not the
// structure around them.
//
// A factor of 0 collapses every shadow to effectively zero offset/blur/
// spread, which renders identically to no shadow at all — deliberately not
// special-cased to the literal string 'none', since the regex already
// produces the same visual result and this keeps the function total (works
// on any string, including the literal 'none' entry at shadows[0], which
// has no px values to replace and passes through unchanged).
// ----------------------------------------------------------------------

function scaleShadowString(value, factor) {
  if (typeof value !== 'string') return value;
  return value.replace(/(-?\d+(?:\.\d+)?)px/g, (_match, num) => `${Math.round(parseFloat(num) * factor * 100) / 100}px`);
}

export function scaleShadowIntensity(value, factor) {
  if (factor === 1 || value == null) return value;

  if (Array.isArray(value)) {
    return value.map((entry) => scaleShadowIntensity(entry, factor));
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, scaleShadowIntensity(entry, factor)])
    );
  }
  return scaleShadowString(value, factor);
}

export const SHADOW_LEVEL_FACTORS = { none: 0, sm: 0.5, md: 1, lg: 1.5, xl: 2 };
