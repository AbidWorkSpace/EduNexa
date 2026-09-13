'use client';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function GlaReviewChecklist({ items }) {
  return (
    <Stack spacing={1.25}>
      {items.map((item) => (
        <Alert
          key={item.label}
          severity={item.done ? 'success' : 'warning'}
          icon={<Iconify icon={item.done ? 'solar:check-circle-bold' : 'solar:danger-triangle-bold'} />}
          sx={{ alignItems: 'center' }}
        >
          <Typography variant="body2">{item.label}</Typography>
        </Alert>
      ))}
    </Stack>
  );
}
