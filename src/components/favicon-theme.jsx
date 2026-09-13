'use client';

import { useEffect } from 'react';

import { useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';

/**
 * Sets document favicon to match app theme (dark vs light).
 * Renders nothing; runs effect to update link[rel="icon"].
 */
export function FaviconTheme() {
  const theme = useTheme();

  useEffect(() => {
    const href =
      theme.palette.mode === 'dark' ? CONFIG.logo.faviconDark : CONFIG.logo.faviconLight;

    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }, [theme.palette.mode]);

  return null;
}
