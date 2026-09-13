'use client';

import './sidebar.css';

import { useMemo } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import { useTheme } from '@mui/material/styles';

import { primaryColorPresets } from 'src/theme/with-settings';
import { dashboardNavColorVars } from 'src/layouts/dashboard/css-vars';
import { useEffectiveNavLayout } from 'src/layouts/hooks/use-effective-nav-layout';

import { useSettingsContext } from 'src/components/settings';

import { useSidebar } from './sidebar-context';
import { SidebarAILayer } from './components/sidebar-ai-layer';
import { SidebarNavItem } from './components/sidebar-nav-item';
import { SidebarNavDropdown } from './components/sidebar-nav-dropdown';
import { SidebarNavSkeleton } from './components/sidebar-nav-skeleton';
import { SidebarMobileOverlay } from './components/sidebar-mobile-header';
import { SidebarBrand, BrandGradientDef } from './components/sidebar-brand';

// ----------------------------------------------------------------------

export function Sidebar({ navData, navLoading = false }) {
  const { isCollapsed, toggleCollapse, isPanelOpen, closePanel, isMobileOpen, closeMobile } =
    useSidebar();
  const theme = useTheme();
  const settings = useSettingsContext();
  const { effectiveNavLayout } = useEffectiveNavLayout();

  // Get current color scheme
  const colorScheme = theme.palette.mode || 'light';
  const isDark = colorScheme === 'dark';

  // Get all settings
  const {
    mode: _mode,
    contrast,
    direction,
    compactLayout,
    navColor,
    primaryColor,
    fontFamily,
    fontSize,
  } = settings.state;

  // Get primary color preset
  const primaryPreset = primaryColorPresets[primaryColor] || primaryColorPresets.default;

  // Get nav color vars
  const _navColorVars = useMemo(
    () => dashboardNavColorVars(theme, navColor, effectiveNavLayout),
    [theme, navColor, effectiveNavLayout]
  );

  // Calculate CSS variables based on theme and settings
  const cssVars = useMemo(() => {
    const {
      vars: { palette },
    } = theme;

    // Base colors from theme
    const textPrimary = palette.text.primary;
    const textSecondary = palette.text.secondary;
    const bgDefault = palette.background.default;
    const bgPaper = palette.background.paper;

    // Nav color affects sidebar background
    const _sidebarBgColor =
      navColor === 'apparent' ? (isDark ? palette.grey[800] : palette.grey[900]) : bgDefault;

    // Sidebar background gradient
    const sidebarBg = isDark
      ? `linear-gradient(180deg, ${palette.grey[800]} 0%, ${palette.grey[900]} 100%)`
      : navColor === 'apparent'
        ? `linear-gradient(180deg, ${palette.grey[900]} 0%, ${palette.grey[800]} 100%)`
        : `linear-gradient(180deg, ${bgPaper} 0%, ${bgDefault} 100%)`;

    // Text colors based on navColor
    const sidebarText = navColor === 'apparent' && !isDark ? palette.common.white : textPrimary;
    const sidebarTextMuted = navColor === 'apparent' && !isDark ? palette.grey[500] : textSecondary;

    // Border color - adjust for contrast
    const borderOpacity = contrast === 'hight' ? (isDark ? 0.12 : 0.16) : isDark ? 0.08 : 0.12;
    const sidebarBorder =
      navColor === 'apparent' ? 'transparent' : varAlpha(palette.grey['500Channel'], borderOpacity);

    // Primary color from preset
    const primaryMain = primaryPreset.main;
    const primaryLight = primaryPreset.light;
    const primaryDark = primaryPreset.dark;

    // Use theme's primary color channel for alpha calculations
    const primaryMainChannel = palette.primary.mainChannel || primaryMain;
    const _primaryLightChannel = palette.primary.lightChannel || primaryLight;

    // Brand gradient from primary color
    const brandGradient = `linear-gradient(135deg, ${primaryLight} 0%, ${primaryMain} 100%)`;
    const brandGlow = varAlpha(primaryMainChannel, 0.3);

    // Active state background
    const activeBg = brandGradient;
    const activeGlow = brandGlow;

    // Hover background - adjust opacity based on contrast
    const hoverOpacity = contrast === 'hight' ? 0.08 : 0.04;
    const hoverBg = varAlpha(primaryMainChannel, hoverOpacity);

    // Tooltip colors
    const tooltipBg = isDark
      ? `linear-gradient(135deg, ${palette.grey[800]}, ${palette.grey[900]})`
      : `linear-gradient(135deg, ${palette.grey[800]}, ${palette.grey[900]})`;
    const tooltipBorder = varAlpha(primaryMainChannel, 0.2);

    // Dark background for AI layer and switch card
    const darkBg = isDark ? palette.grey[800] : '#0b0e14';

    return {
      '--sidebar-bg': sidebarBg,
      '--sidebar-dark-bg': darkBg,
      '--sidebar-text': sidebarText,
      '--sidebar-text-muted': sidebarTextMuted,
      '--sidebar-text-label': sidebarTextMuted,
      '--sidebar-border': sidebarBorder,
      '--sidebar-hover-bg': hoverBg,
      '--sidebar-active-bg': activeBg,
      '--sidebar-active-glow': activeGlow,
      '--sidebar-primary': primaryMain,
      '--sidebar-primary-light': primaryLight,
      '--sidebar-primary-dark': primaryDark,
      '--brand-gradient': brandGradient,
      '--brand-glow': brandGlow,
      '--shadow-float': isDark
        ? '0 8px 24px -8px rgba(0, 0, 0, 0.3)'
        : '0 8px 24px -8px rgba(0, 75, 150, 0.12)',
      '--tooltip-bg': tooltipBg,
      '--tooltip-border': tooltipBorder,
      // Font settings
      '--sidebar-font-family': fontFamily || theme.typography.fontFamily,
      '--sidebar-font-size': `${fontSize}px`,
      // Compact layout spacing
      '--sidebar-compact-spacing': compactLayout ? '0.75rem' : '1rem',
    };
  }, [theme, isDark, navColor, primaryPreset, contrast, fontFamily, fontSize, compactLayout]);

  // CSS variables are applied via inline styles on the aside element

  const isMiniMode = effectiveNavLayout === 'mini';

  // Mini mode forces collapsed on desktop rail; mobile drawer must render expanded (POS included).
  const effectiveCollapsed = (isMiniMode ? true : isCollapsed) && !isMobileOpen;

  // RTL/LTR direction classes and navLayout classes
  const wrapperClasses = [
    'sidebar-wrapper',
    effectiveCollapsed && 'collapsed',
    isMobileOpen && 'mobile-open',
    direction === 'rtl' && 'rtl',
    isMiniMode && 'nav-layout-mini',
    effectiveNavLayout === 'horizontal' && 'nav-layout-horizontal',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Hidden SVG gradient defs */}
      <BrandGradientDef />

      {/* Mobile overlay backdrop (header handled by MUI HeaderSection) */}
      <SidebarMobileOverlay />

      {/* Main sidebar */}
      <aside className={wrapperClasses} style={cssVars}>
        {/* Back layer: AI Processor */}
        <SidebarAILayer />

        {/* Front layer: Dashboard Deck */}
        <div
          className="layer-dash"
          onClick={isPanelOpen ? closePanel : undefined}
          role={isPanelOpen ? 'button' : undefined}
          tabIndex={isPanelOpen ? 0 : undefined}
        >
          {/* Handle text (visible only in AI mode) */}
          <div className="handle-text">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            <span>Return to Dashboard</span>
          </div>

          {/* Dashboard Content */}
          <div className="dash-content">
            {/* Header: brand + avatar + collapse toggle */}
            <div className="dash-header">
              <SidebarBrand />

              <div className="header-right">
                <button
                  type="button"
                  className="collapse-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    // On mobile, close instead of collapse
                    if (window.innerWidth <= 1024 && isMobileOpen) {
                      closeMobile();
                      return;
                    }
                    // Prevent toggle in mini mode
                    if (isMiniMode) return;
                    if (isPanelOpen) closePanel();
                    toggleCollapse();
                  }}
                  title={isMiniMode ? 'Mini mode (always collapsed)' : 'Collapse sidebar'}
                  disabled={isMiniMode}
                  style={{
                    opacity: isMiniMode ? 0.5 : 1,
                    cursor: isMiniMode ? 'not-allowed' : 'pointer',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 19l-7-7 7-7" />
                    <path d="M18 19l-7-7 7-7" opacity="0.4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav
              className="nav-section"
              aria-busy={navLoading}
              aria-label={navLoading ? 'Loading navigation' : undefined}
            >
              {navLoading ? (
                <SidebarNavSkeleton collapsed={effectiveCollapsed} />
              ) : (
                navData?.map((section) => (
                  <NavSection key={section.subheader} section={section} />
                ))
              )}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

// ----------------------------------------------------------------------

function NavSection({ section }) {
  return (
    <>
      <div className="nav-label">{section.subheader}</div>
      {section.items?.map((item) =>
        item.children ? (
          <SidebarNavDropdown key={item.title} item={item} />
        ) : (
          <SidebarNavItem key={item.title} item={item} />
        )
      )}
    </>
  );
}
