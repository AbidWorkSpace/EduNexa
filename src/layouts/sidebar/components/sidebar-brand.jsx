'use client';

import Link from 'next/link';
import Image from 'next/image';

import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

// BrandGradientDef is no longer needed (logo is a PNG now), but kept as
// a no-op export so existing imports don't break.
export function BrandGradientDef() {
  return null;
}

// ----------------------------------------------------------------------

export function SidebarBrand() {
  const theme = useTheme();
  const logoSrc =
    theme.palette.mode === 'dark' ? CONFIG.logo.faviconDark : CONFIG.logo.faviconLight;

  return (
    <Link href={paths.dashboard.overview} className="brand-capsule">
      <div className="logo-icon">
        <Image
          src={logoSrc}
          alt={`${CONFIG.appName} logo`}
          width={160}
          height={160}
          style={{ objectFit: 'contain', transform: 'scale(2)' }}
          priority
        />
      </div>
      <div className="brand-text">
        <span className="brand-name">{CONFIG.appName}</span>
        <span className="brand-tagline">Dashboard</span>
      </div>
    </Link>
  );
}
