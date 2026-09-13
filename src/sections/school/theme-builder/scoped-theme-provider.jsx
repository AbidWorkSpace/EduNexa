'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

// ----------------------------------------------------------------------
// Renders `children` under an independent MUI theme, scoped to `node`
// (a DOM element, not the document root) — this is what lets the Theme
// Builder's live preview render with in-progress (unsaved) form values
// using the exact same createTheme() factory as the real app, WITHOUT
// touching the real app's theme (which must only ever reflect saved/
// persisted config).
//
// `colorSchemeNode` is what makes this safe to nest: MUI's CSS-variables
// mode normally stamps its color-scheme attribute on <html>, which would
// otherwise collide with the outer app's own ThemeProvider. Scoping it to
// the caller's own wrapper element keeps the preview's CSS variables (and
// its light/dark mode) fully independent of the page around it. The caller
// owns `node` (rather than this component creating it internally) so it can
// also be passed as a Dialog's `container` — MUI portals dialogs to
// document.body by default, which would otherwise render them outside this
// scoped subtree and break their CSS variables.
//
// `modeStorageKey` is just as important as the node scoping: MUI's mode
// persistence defaults to the SAME localStorage key the outer app's
// ThemeProvider uses ('theme-mode'). Without a distinct key here, the
// preview would silently read whichever mode the real app last saved
// (e.g. after visiting a school whose default is dark) instead of
// reflecting its own Light/Dark toggle — a real bug caught by testing this
// panel with the outer app left in dark mode.
//
// A single fixed key isn't enough either: once MUI persists a resolved
// mode under that key on first mount, `defaultMode` stops being honored on
// later remounts (a stored value wins over the prop) — so toggling the
// preview once would work, but toggling back would appear stuck. Keying
// the storage key BY `defaultMode` itself sidesteps this: each mode always
// reads its own always-empty-until-now slot, so `defaultMode` is honored
// every time, no matter how many times the toggle flips.
// ----------------------------------------------------------------------

export function ScopedThemeProvider({ theme, node, defaultMode, children }) {
  if (!node) return null;

  return (
    <ThemeProvider
      theme={theme}
      colorSchemeNode={node}
      modeStorageKey={`theme-builder-preview-mode-${defaultMode}`}
      defaultMode={defaultMode}
      disableNestedContext
      disableTransitionOnChange
    >
      <CssBaseline enableColorScheme={false} />
      {children}
    </ThemeProvider>
  );
}
