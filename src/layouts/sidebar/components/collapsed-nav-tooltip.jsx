'use client';

import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

import { useEffectiveNavLayout } from 'src/layouts/hooks/use-effective-nav-layout';

import { useSidebar } from '../sidebar-context';

// ----------------------------------------------------------------------

export function CollapsedNavTooltip({ title, children }) {
  const theme = useTheme();
  const { isCollapsed, isMobileOpen } = useSidebar();
  const { effectiveNavLayout } = useEffectiveNavLayout();

  const isMiniMode = effectiveNavLayout === 'mini';
  const showTooltip = (isCollapsed || isMiniMode) && !isMobileOpen && Boolean(title);

  if (!showTooltip) {
    return children;
  }

  return (
    <Tooltip
      title={title}
      placement={theme.direction === 'rtl' ? 'left' : 'right'}
      arrow
      disableInteractive
      enterDelay={200}
    >
      {children}
    </Tooltip>
  );
}
