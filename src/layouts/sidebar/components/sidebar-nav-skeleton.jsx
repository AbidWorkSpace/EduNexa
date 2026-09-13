'use client';

import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------

/**
 * Sidebar nav placeholders while permission-filtered nav is not ready yet.
 */
export function SidebarNavSkeleton({ collapsed = false }) {
  const itemWidth = collapsed ? 40 : '85%';

  return (
    <Stack spacing={2} sx={{ px: collapsed ? 0.5 : 1, py: 1 }} aria-hidden>
      <Skeleton variant="text" width={collapsed ? 24 : '45%'} height={20} sx={{ mx: collapsed ? 'auto' : 0 }} />
      <Stack spacing={1.25}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={itemWidth}
            height={collapsed ? 40 : 44}
            sx={{
              mx: collapsed ? 'auto' : 0,
              borderRadius: 1.25,
            }}
          />
        ))}
      </Stack>
      <Skeleton variant="text" width={collapsed ? 24 : '40%'} height={20} sx={{ mx: collapsed ? 'auto' : 0, mt: 1 }} />
      <Stack spacing={1.25}>
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={itemWidth}
            height={collapsed ? 40 : 44}
            sx={{
              mx: collapsed ? 'auto' : 0,
              borderRadius: 1.25,
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
