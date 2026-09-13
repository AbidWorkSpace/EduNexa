'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

const shimmerSlide = keyframes`
  0% {
    left: '-45%';
  }
  100% {
    left: 100%;
  }
`;

function ShimmerBar({ delay = 0, widthPercent }) {
  const theme = useTheme();
  const track = alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.12 : 0.08);
  const highlight = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.22);

  return (
    <Box
      sx={{
        position: 'relative',
        height: 11,
        borderRadius: 1,
        width: widthPercent,
        maxWidth: '100%',
        overflow: 'hidden',
        bgcolor: track,
        '@media (prefers-reduced-motion: reduce)': {
          '&::after': {
            display: 'none',
          },
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '45%',
          left: '-45%',
          background: `linear-gradient(90deg, transparent 0%, ${highlight} 50%, transparent 100%)`,
          animation: `${shimmerSlide} 1.35s ease-in-out infinite`,
          animationDelay: `${delay}s`,
        },
      }}
    />
  );
}

// ----------------------------------------------------------------------

/**
 * Localized loading state for the dashboard main column while shell data (e.g. permission nav)
 * is not ready yet. Centered shimmer blocks; respects prefers-reduced-motion.
 */
export function DashboardContentPreparing() {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading content"
      sx={{
        width: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: {
          xs: 'calc(100dvh - var(--layout-header-mobile-height, 64px) - 32px)',
          md: 'calc(100dvh - var(--layout-header-desktop-height, 72px) - 40px)',
        },
        py: { xs: 2, md: 3 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Stack
        spacing={2.25}
        alignItems="center"
        sx={{
          width: 1,
          maxWidth: 520,
        }}
      >
        <ShimmerBar widthPercent="72%" delay={0} />
        <ShimmerBar widthPercent="92%" delay={0.12} />
        <ShimmerBar widthPercent="58%" delay={0.24} />
        <Typography variant="body2" color="text.secondary" sx={{ pt: 1.5, textAlign: 'center' }}>
          Just a moment while content loads.
        </Typography>
      </Stack>
    </Box>
  );
}
