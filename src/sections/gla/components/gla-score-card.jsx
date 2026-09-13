'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function GlaScoreCard({ title, value, icon, color = 'primary', helper }) {
  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2">{title}</Typography>
          <Iconify width={22} icon={icon} sx={{ color: `${color}.main` }} />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="h4">{value}/5</Typography>
          <LinearProgress
            color={color}
            variant="determinate"
            value={(value / 5) * 100}
            sx={{ height: 8, borderRadius: 1 }}
          />
          {helper && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {helper}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
