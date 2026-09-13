'use client';

import { merge } from 'es-toolkit';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { DashboardContentPreparing } from 'src/components/loading-screen';
import { BreadcrumbsPortalProvider } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { NavHorizontal } from './nav-horizontal';
import { _account } from '../nav-config-account';
import { MenuButton } from '../components/menu-button';
import { useDynamicNavData } from '../nav-config-dynamic';
import { SettingsButton } from '../components/settings-button';
import { AccountPopover } from '../components/account-popover';
import { Sidebar, useSidebar, SidebarProvider } from '../sidebar';
import { ModeToggleButton } from '../components/mode-toggle-button';
import { MainSection, HeaderSection, LayoutSection } from '../core';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';

// Matches sidebar drawer vs desktop (`sidebar.css`, `sidebar-context.jsx`).
const NAV_MOBILE_MAX_PX = 1024;
const NAV_DESKTOP_MIN_PX = 1025;
const NAV_MID_MAX_PX = 1200;
const NAV_COMPACT_BRANCH_MAX_PX = 360;

const mq = {
  mobile: `@media (max-width: ${NAV_MOBILE_MAX_PX}px)`,
  desktop: `@media (min-width: ${NAV_DESKTOP_MIN_PX}px)`,
  wide: `@media (min-width: ${NAV_MID_MAX_PX + 1}px)`,
  compactBranch: `@media (max-width: ${NAV_COMPACT_BRANCH_MAX_PX}px)`,
};

// ----------------------------------------------------------------------

export function DashboardLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner
        sx={sx}
        cssVars={cssVars}
        slotProps={slotProps}
        layoutQuery={layoutQuery}
      >
        {children}
      </DashboardLayoutInner>
    </SidebarProvider>
  );
}

// Inner component has access to SidebarProvider context
function DashboardLayoutInner({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }) {
  const theme = useTheme();
  const { isCollapsed, openMobile } = useSidebar();
  const { user } = useAuthContext();
  const settings = useSettingsContext();
  const { navData: dynamicNavData, isNavReady } = useDynamicNavData();

  const branchDisplayName = (() => {
    const raw = user?.branch?.name ?? user?.branch?.Name;
    if (raw == null) return '';
    const s = String(raw).trim();
    return s;
  })();
  const hasCustomNavSource =
    slotProps?.nav != null &&
    Object.prototype.hasOwnProperty.call(slotProps.nav, 'data');
  const isNavBootstrapping = !hasCustomNavSource && !isNavReady;

  const navDataToUse = slotProps?.nav?.data ?? dynamicNavData;
  const { navLayout, navColor } = settings.state;

  const renderHeader = () => {
    const headerSlotProps = {
      container: {
        maxWidth: false,
        sx: {
          px: { [layoutQuery]: 0 },
          columnGap: { xs: 0.5, sm: 1 },
        },
      },
      centerArea: {
        sx: {
          minWidth: 0,
          maxWidth: '100%',
          flex: '1 1 0%',
          overflow: 'hidden',
        },
      },
    };

    // Get nav color vars for horizontal navigation
    const navColorVars = dashboardNavColorVars(theme, navColor, navLayout);

    const headerSlots = {
      topArea: (
        <>
          {navLayout === 'horizontal' && (
            <NavHorizontal
              data={navDataToUse}
              layoutQuery={layoutQuery}
              cssVars={navColorVars?.section}
              navLoading={isNavBootstrapping}
            />
          )}
          <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
            This is an info Alert.
          </Alert>
        </>
      ),
      leftArea: (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5 },
            minWidth: 0,
            flex: '0 1 auto',
            flexShrink: 1,
            maxWidth: {
              [mq.mobile]: 'min(calc(100vw - 9.25rem), 88vw)',
            },
            mr: { xs: 0, sm: 0.5, md: 1 },
          }}
        >
          <MenuButton
            onClick={openMobile}
            sx={[
              { ml: -1, flexShrink: 0 },
              { [theme.breakpoints.up(NAV_DESKTOP_MIN_PX)]: { display: 'none' } },
            ]}
          />
          {branchDisplayName ? (
            <Box
              role="status"
              aria-label={`Branch: ${branchDisplayName}`}
              title={branchDisplayName}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.75, sm: 1.25 },
                minWidth: 0,
                flexShrink: 1,
                overflow: 'hidden',
                maxWidth: {
                  [mq.mobile]: 'min(100%, calc(100vw - 13.75rem))',
                  [mq.desktop]: 300,
                  [mq.wide]: 400,
                },
                px: { xs: 1, sm: 1.5 },
                py: { xs: 0.375, sm: 0.625 },
                [mq.compactBranch]: {
                  px: 1,
                  py: 0.35,
                  gap: 0.65,
                },
                borderRadius: 2,
                border: (t) =>
                  `1px solid ${varAlpha(t.vars.palette.primary.mainChannel, 0.22)}`,
                bgcolor: (t) =>
                  varAlpha(t.vars.palette.primary.mainChannel, 0.08),
              }}
            >
              <Iconify
                icon="solar:buildings-2-bold-duotone"
                width={22}
                sx={{
                  flexShrink: 0,
                  color: 'primary.main',
                  width: { xs: 18, sm: 22 },
                  height: { xs: 18, sm: 22 },
                  [mq.compactBranch]: { width: 18, height: 18 },
                }}
              />
              <Box sx={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', textAlign: 'left' }}>
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    lineHeight: 1.15,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    [mq.compactBranch]: { display: 'none' },
                  }}
                >
                  Branch
                </Typography>
                <Typography
                  component="span"
                  variant="subtitle1"
                  noWrap
                  sx={{
                    display: 'block',
                    mt: { xs: 0.125, [mq.compactBranch]: 0 },
                    fontWeight: 700,
                    lineHeight: 1.2,
                    fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
                    color: 'text.primary',
                    [mq.compactBranch]: {
                      fontSize: '0.8125rem',
                      lineHeight: 1.25,
                    },
                  }}
                >
                  {branchDisplayName}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </Box>
      ),
      rightArea: (
        <Box
          sx={{
            display: 'flex',
            flexShrink: 0,
            alignItems: 'center',
            gap: { xs: 0, sm: 0.75 },
            minWidth: 'min-content',
          }}
        >
          <SettingsButton />
          <ModeToggleButton />
          <AccountPopover data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderMain = () => {
    const mainSx = slotProps?.main?.sx;
    return (
      <MainSection
        {...slotProps?.main}
        sx={[
          { maxWidth: '100%', pr: 0, pl: 0 },
          ...(Array.isArray(mainSx) ? mainSx : mainSx ? [mainSx] : []),
        ]}
      >
        {isNavBootstrapping ? <DashboardContentPreparing /> : children}
      </MainSection>
    );
  };

  // Calculate layout padding based on navLayout
  const getLayoutPadding = () => {
    // Standard horizontal padding for consistency (4 * 8px = 32px at lg breakpoint)
    const horizontalPadding = { [layoutQuery]: 4 };
    // Mobile padding (2 * 8px = 16px)
    const mobilePadding = 2;

    // Horizontal layout: Add left padding for consistency when sidebar is hidden
    if (navLayout === 'horizontal') {
      return {
        '@media (min-width: 1025px)': {
          pl: horizontalPadding,
          pr: horizontalPadding,
        },
        '@media (max-width: 1024px)': {
          pl: mobilePadding,
          pr: mobilePadding,
        },
      };
    }

    // Standard right padding for vertical and mini modes
    const rightPadding = { [layoutQuery]: 4 };

    // Mini mode always uses collapsed width
    if (navLayout === 'mini') {
      return {
        '@media (min-width: 1025px)': {
          pl: 'calc(var(--sidebar-collapsed-width) + 16px)',
          pr: rightPadding,
          transition: 'padding-left var(--transition-slow) cubic-bezier(0.25, 1.15, 0.5, 1)',
        },
        '@media (max-width: 1024px)': {
          pl: mobilePadding,
          pr: mobilePadding,
        },
      };
    }

    // Vertical mode uses normal padding logic
    return {
      '@media (min-width: 1025px)': {
        pl: isCollapsed
          ? 'calc(var(--sidebar-collapsed-width) + 16px)'
          : 'calc(var(--sidebar-width) + 16px)',
        pr: rightPadding,
        transition: 'padding-left var(--transition-slow) cubic-bezier(0.25, 1.15, 0.5, 1)',
      },
      '@media (max-width: 1024px)': {
        pl: mobilePadding,
        pr: mobilePadding,
      },
    };
  };

  // Get nav color vars for layout
  const navColorVarsForLayout = dashboardNavColorVars(theme, navColor, navLayout);

  return (
    <BreadcrumbsPortalProvider>
      {/* Always render Sidebar - CSS handles desktop hiding for horizontal mode */}
      {/* Mobile drawer must always be available regardless of navLayout */}
      <Sidebar navData={navDataToUse} navLoading={isNavBootstrapping} />

      <LayoutSection
        headerSection={renderHeader()}
        sidebarSection={null}
        footerSection={null}
        cssVars={{
          ...dashboardLayoutVars(theme),
          ...navColorVarsForLayout?.layout,
          ...cssVars,
        }}
        sx={[getLayoutPadding(), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {renderMain()}
      </LayoutSection>
    </BreadcrumbsPortalProvider>
  );
}
