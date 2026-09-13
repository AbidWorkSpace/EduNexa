'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function GlaSectionCard({ title, icon, action, children }) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            {icon && <Iconify width={22} icon={icon} sx={{ color: 'primary.main' }} />}
            <Typography variant="h6">{title}</Typography>
          </Stack>
          {action}
        </Stack>
        {children}
      </Stack>
    </Card>
  );
}
