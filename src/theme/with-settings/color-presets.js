import { primary, secondary } from '../core/palette';

// ----------------------------------------------------------------------

export const primaryColorPresets = {
  default: {
    lighter: primary.lighter,
    light: primary.light,
    main: primary.main,
    dark: primary.dark,
    darker: primary.darker,
    contrastText: primary.contrastText,
  },
  preset1: {
    lighter: '#CCF4FE',
    light: '#68CDF9',
    main: '#078DEE',
    dark: '#0351AB',
    darker: '#012972',
    contrastText: '#FFFFFF',
  },
  preset2: {
    lighter: '#EBD6FD',
    light: '#B985F4',
    main: '#7635dc',
    dark: '#431A9E',
    darker: '#200A69',
    contrastText: '#FFFFFF',
  },
  preset3: {
    lighter: '#CDE9FD',
    light: '#6BB1F8',
    main: '#0C68E9',
    dark: '#063BA7',
    darker: '#021D6F',
    contrastText: '#FFFFFF',
  },
  preset4: {
    lighter: '#FEF4D4',
    light: '#FED680',
    main: '#fda92d',
    dark: '#B66816',
    darker: '#793908',
    contrastText: '#1C252E',
  },
  preset5: {
    lighter: '#FFE3D5',
    light: '#FFC1AC',
    main: '#FF3030',
    dark: '#B71833',
    darker: '#7A0930',
    contrastText: '#FFFFFF',
  },
};

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Resolves a settingsState color value (preset key, e.g. 'preset2', or a
 * literal hex string, e.g. '#1565C0') into a full preset-shaped palette
 * object. Arbitrary hex is what lets a tenant/school's own brand color flow
 * through the exact same pipeline as the built-in presets, instead of a
 * second theming mechanism.
 *
 * A single `main` hex can't reuse the pre-authored preset shade sets, so
 * lighter/dark/darker are derived from it with MUI's own lighten/darken.
 */
export function resolveColorPalette(value, presets) {
  if (typeof value === 'string' && HEX_COLOR_RE.test(value)) {
    return buildPaletteFromHex(value);
  }
  return presets[value] ?? presets.default;
}

export function buildPaletteFromHex(main) {
  return {
    lighter: mixHex(main, '#FFFFFF', 0.8),
    light: mixHex(main, '#FFFFFF', 0.4),
    main,
    dark: mixHex(main, '#000000', 0.2),
    darker: mixHex(main, '#000000', 0.4),
    contrastText: getReadableContrastText(main),
  };
}

function hexToRgbTuple(hex) {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Blends `hex` toward `target` hex by `weight` (0 = hex, 1 = target). Stays hex in, hex out. */
function mixHex(hex, target, weight) {
  const [r1, g1, b1] = hexToRgbTuple(hex);
  const [r2, g2, b2] = hexToRgbTuple(target);

  const mixed = [r1 + (r2 - r1) * weight, g1 + (g2 - g1) * weight, b1 + (b2 - b1) * weight];

  return `#${mixed.map((channel) => clampByte(channel).toString(16).padStart(2, '0')).join('')}`;
}

/** Relative luminance (WCAG) - simple, dependency-free light/dark contrast pick. */
function getReadableContrastText(hex) {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? '#1C252E' : '#FFFFFF';
}

export const secondaryColorPresets = {
  default: {
    lighter: secondary.lighter,
    light: secondary.light,
    main: secondary.main,
    dark: secondary.dark,
    darker: secondary.darker,
    contrastText: secondary.contrastText,
  },
  preset1: {
    lighter: '#CAFDEB',
    light: '#61F4D9',
    main: '#00DCDA',
    dark: '#00849E',
    darker: '#004569',
    contrastText: '#FFFFFF',
  },
  preset2: {
    lighter: '#D6E5FD',
    light: '#85A9F3',
    main: '#3562D7',
    dark: '#1A369A',
    darker: '#0A1967',
    contrastText: '#FFFFFF',
  },
  preset3: {
    lighter: '#FFF3D8',
    light: '#FFD18B',
    main: '#FFA03F',
    dark: '#B75D1F',
    darker: '#7A2D0C',
    contrastText: '#1C252E',
  },
  preset4: {
    lighter: '#FEEFD5',
    light: '#FBC182',
    main: '#F37F31',
    dark: '#AE4318',
    darker: '#741B09',
    contrastText: '#FFFFFF',
  },
  preset5: {
    lighter: '#FCF0DA',
    light: '#EEC18D',
    main: '#C87941',
    dark: '#904220',
    darker: '#601B0C',
    contrastText: '#FFFFFF',
  },
};
