import { varAlpha } from 'minimal-shared/utils';

import { gridClasses } from '@mui/x-data-grid';
import { darken, lighten } from '@mui/material/styles';

/**
 * MUI colorManipulator (darken/lighten) only accepts hex/rgb/hsl — not CSS variables.
 */
function isCssVarColor(value) {
  return typeof value === 'string' && value.trimStart().startsWith('var(');
}

/**
 * First palette value safe for colorManipulator (darken/lighten) — not CSS variables.
 */
function pickManipulableColor(candidates, fallback) {
  for (const c of candidates) {
    if (c != null && !isCssVarColor(c)) {
      return c;
    }
  }
  return fallback;
}

/**
 * Matches `MuiDataGrid` columnHeader (`theme.vars.palette.background.neutral` in this app).
 * Prefer CSS variables so light/dark track the theme; never fall back to `common.white`.
 * @param {import('@mui/material/styles').Theme} theme
 */
function stickyHeaderBackground(theme) {
  const fromVars = theme.vars?.palette?.background?.neutral;
  if (fromVars) {
    return fromVars;
  }
  return pickManipulableColor(
    [theme.palette.background.neutral, theme.palette.background.paper],
    theme.palette.mode === 'dark'
      ? (theme.palette.grey?.[800] ?? theme.palette.grey?.[900] ?? '#1c252e')
      : (theme.palette.grey?.[100] ?? '#f5f5f5')
  );
}

/**
 * Body cells: align with grid row surface (`background.paper` / default in the design system).
 * Do not use `common.white` as a candidate — when `paper` is a CSS var it was skipped and white was wrongly chosen in dark mode.
 * @param {import('@mui/material/styles').Theme} theme
 */
function stickyCellBackground(theme) {
  const fromVars = theme.vars?.palette?.background?.paper ?? theme.vars?.palette?.background?.default;
  if (fromVars) {
    return fromVars;
  }
  return pickManipulableColor(
    [theme.palette.background.paper, theme.palette.background.default],
    theme.palette.mode === 'dark'
      ? (theme.palette.grey?.[900] ?? theme.palette.grey?.[800] ?? '#121212')
      : (theme.palette.grey?.[50] ?? '#ffffff')
  );
}

/**
 * `theme.vars.palette.action.hover` is often translucent — using it alone as backgroundColor
 * lets horizontally scrolled cells (and row stacking) show through the sticky rail.
 * Use an opaque base + a same-cell gradient tint (matches DataGrid-style primary wash).
 *
 * @param {import('@mui/material/styles').Theme} theme
 * @returns {{ backgroundColor: string; backgroundImage: string }}
 */
function stickyHeaderHoverSurface(theme) {
  const base = stickyHeaderBackground(theme);
  const tintChannel = theme.vars?.palette?.text?.primaryChannel ?? theme.vars?.palette?.primary?.mainChannel;
  const opacity = theme.palette.action?.hoverOpacity ?? 0.06;
  if (tintChannel) {
    const tint = varAlpha(tintChannel, opacity);
    return {
      backgroundColor: base,
      backgroundImage: `linear-gradient(${tint}, ${tint})`,
    };
  }
  const manip = pickManipulableColor(
    [theme.palette.background.neutral, theme.palette.background.paper],
    theme.palette.mode === 'dark'
      ? (theme.palette.grey?.[800] ?? '#1c252e')
      : (theme.palette.grey?.[100] ?? '#f5f5f5')
  );
  return {
    backgroundColor:
      theme.palette.mode === 'light'
        ? safeDarken(manip, 0.06, theme.palette.grey?.[200] ?? '#eeeeee')
        : safeLighten(manip, 0.08, theme.palette.grey?.[700] ?? '#616161'),
    backgroundImage: 'none',
  };
}

/**
 * @param {import('@mui/material/styles').Theme} theme
 * @returns {{ backgroundColor: string; backgroundImage: string }}
 */
function stickyCellRowHoverSurface(theme) {
  const base = stickyCellBackground(theme);
  const primaryCh = theme.vars?.palette?.primary?.mainChannel;
  const opacity = theme.palette.action?.hoverOpacity ?? 0.08;
  if (primaryCh) {
    const tint = varAlpha(primaryCh, opacity);
    return {
      backgroundColor: base,
      backgroundImage: `linear-gradient(${tint}, ${tint})`,
    };
  }
  const manip = pickManipulableColor(
    [theme.palette.background.paper, theme.palette.background.default],
    theme.palette.mode === 'dark'
      ? (theme.palette.grey?.[900] ?? '#121212')
      : (theme.palette.grey?.[50] ?? '#ffffff')
  );
  return {
    backgroundColor:
      theme.palette.mode === 'light'
        ? safeDarken(manip, 0.06, theme.palette.grey?.[200] ?? '#eeeeee')
        : safeLighten(manip, 0.08, theme.palette.grey?.[800] ?? '#424242'),
    backgroundImage: 'none',
  };
}

function safeDarken(color, coefficient, fallback) {
  if (isCssVarColor(color)) return fallback;
  try {
    return darken(color, coefficient);
  } catch {
    return fallback;
  }
}

function safeLighten(color, coefficient, fallback) {
  if (isCssVarColor(color)) return fallback;
  try {
    return lighten(color, coefficient);
  } catch {
    return fallback;
  }
}

/**
 * MUI X GridRootStyles: `.columnSeparator` is z-index 30; pinned `columnHeader` is 40 (above separators).
 * Sticky actions must beat the *previous* column's right separator when it overlaps this header.
 */
const STICKY_ACTIONS_HEADER_Z = 50;
const STICKY_ACTIONS_CELL_Z = 40;

/**
 * CSS sticky-right rules for the actions column (Community DataGrid; no pinnedColumns).
 * Handles hover, row selection, editing, and header hover with opaque colors so horizontal scroll does not bleed through.
 *
 * @param {string | null | undefined} field - `GridColDef.field` for the actions column
 * @returns {Record<string, unknown>}
 */
export function buildStickyActionsColumnSx(field) {
  if (field == null || field === '') {
    return {};
  }

  const stickyShadow = (theme) =>
    theme.palette.mode === 'dark'
      ? '-6px 0 12px rgba(0,0,0,0.35)'
      : '-6px 0 12px rgba(0,0,0,0.06)';

  return {
    [`& .${gridClasses.columnHeader}[data-field="${field}"]`]: {
      position: 'sticky',
      insetInlineEnd: 0,
      zIndex: STICKY_ACTIONS_HEADER_Z,
      isolation: 'isolate',
      backgroundColor: (theme) => stickyHeaderBackground(theme),
      backgroundImage: 'none',
      borderInlineStart: '1px solid',
      borderColor: 'divider',
      boxShadow: stickyShadow,
    },
    [`& .${gridClasses.columnHeader}[data-field="${field}"]:hover`]: (theme) => stickyHeaderHoverSurface(theme),
    [`& .${gridClasses.cell}[data-field="${field}"]`]: {
      position: 'sticky',
      insetInlineEnd: 0,
      zIndex: STICKY_ACTIONS_CELL_Z,
      isolation: 'isolate',
      backgroundColor: (theme) => stickyCellBackground(theme),
      backgroundImage: 'none',
      borderInlineStart: '1px solid',
      borderColor: 'divider',
      boxShadow: stickyShadow,
    },
    [`& .${gridClasses.cell}[data-field="${field}"] .MuiDataGrid-actionsCell`]: {
      backgroundColor: 'transparent',
    },
    [`& .${gridClasses.row}:hover .${gridClasses.cell}[data-field="${field}"]:not(.${gridClasses['cell--editing']})`]:
      (theme) => stickyCellRowHoverSurface(theme),
    [`& .${gridClasses.row}.Mui-selected .${gridClasses.cell}[data-field="${field}"]`]: {
      backgroundColor: (theme) => {
        const c = theme.palette.primary.main;
        return theme.palette.mode === 'light'
          ? safeLighten(c, 0.9, theme.palette.grey?.[100] ?? '#f5f5f5')
          : safeLighten(theme.palette.primary.dark, 0.12, theme.palette.grey?.[800] ?? '#424242');
      },
      backgroundImage: 'none',
    },
    [`& .${gridClasses.row}.Mui-selected:hover .${gridClasses.cell}[data-field="${field}"]`]: {
      backgroundColor: (theme) => {
        const c = theme.palette.primary.main;
        return theme.palette.mode === 'light'
          ? safeLighten(c, 0.84, theme.palette.grey?.[200] ?? '#eeeeee')
          : safeLighten(theme.palette.primary.dark, 0.2, theme.palette.grey?.[700] ?? '#616161');
      },
      backgroundImage: 'none',
    },
    [`& .${gridClasses.cell}[data-field="${field}"].${gridClasses['cell--editing']}`]: {
      backgroundColor: (theme) => {
        const c = theme.palette.primary.main;
        return theme.palette.mode === 'light'
          ? safeLighten(c, 0.88, theme.palette.grey?.[100] ?? '#f5f5f5')
          : safeLighten(c, 0.18, theme.palette.grey?.[800] ?? '#424242');
      },
      backgroundImage: 'none',
    },
    [`& .${gridClasses.row}.Mui-selected .${gridClasses.cell}[data-field="${field}"].${gridClasses['cell--editing']}`]: {
      backgroundColor: (theme) => {
        const c = theme.palette.primary.main;
        return theme.palette.mode === 'light'
          ? safeLighten(c, 0.82, theme.palette.grey?.[200] ?? '#eeeeee')
          : safeLighten(c, 0.24, theme.palette.grey?.[700] ?? '#616161');
      },
      backgroundImage: 'none',
    },
  };
}
