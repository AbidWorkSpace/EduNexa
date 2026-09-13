'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function GlaMethodCard({ method, selected, onToggle }) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        height: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'primary.lighter' : 'background.paper',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{method.name}</Typography>
            <Label color={selected ? 'primary' : 'default'}>{selected ? 'Included' : 'Recommended'}</Label>
          </Stack>
          <Button
            size="small"
            variant={selected ? 'contained' : 'outlined'}
            onClick={() => onToggle(method.id)}
            startIcon={<Iconify icon={selected ? 'solar:minus-circle-bold' : 'solar:add-circle-bold'} />}
          >
            {selected ? 'Remove' : 'Add'}
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
          <Stack spacing={0.5}>
            <Typography variant="caption">Effort</Typography>
            <Rating readOnly size="small" max={5} value={method.effort} />
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption">Value</Typography>
            <Rating readOnly size="small" max={5} value={method.value} />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
