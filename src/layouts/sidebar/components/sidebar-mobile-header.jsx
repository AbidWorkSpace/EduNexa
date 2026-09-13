'use client';

import Link from 'next/link';

import Backdrop from '@mui/material/Backdrop';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { useAuthContext } from 'src/auth/hooks';

import { useSidebar } from '../sidebar-context';

// Mobile header bar - visible below 1024px

export function SidebarMobileHeader() {
  const { isMobileOpen, openMobile } = useSidebar();
  const { user } = useAuthContext();
  const theme = useTheme();

  const initials = getInitials(user?.displayName || user?.email || '');

  const logoSrc =
    theme.palette.mode === 'dark' ? CONFIG.logo.faviconDark : CONFIG.logo.faviconLight;

  return (
    <header className={`mobile-header${isMobileOpen ? ' sidebar-open' : ''}`}>
      <button type="button" className="mobile-menu-toggle" onClick={openMobile} aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <Link href={paths.dashboard.overview} className="mobile-logo">
        <img
          src={logoSrc}
          alt={`${CONFIG.appName} logo`}
          width={28}
          height={28}
          style={{ objectFit: 'contain', display: 'block' }}
        />
        <span>{CONFIG.appName}</span>
      </Link>

      <div className="mobile-header-avatar">{initials}</div>
    </header>
  );
}

export function SidebarMobileOverlay() {
  const { isMobileOpen, closeMobile } = useSidebar();

  return (
    <Backdrop
      open={isMobileOpen}
      onClick={closeMobile}
      sx={{
        zIndex: 1199,
        display: { xs: 'block', lg: 'none' },
      }}
    />
  );
}

// ----------------------------------------------------------------------

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
