'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function GlaDomainCard({ domain, selected, onSelect }) {
  return (
    <Card
      variant="outlined"
      onClick={() => onSelect(domain.id)}
      sx={{
        p: 2.5,
        height: 1,
        cursor: 'pointer',
        transition: (theme) => theme.transitions.create(['border-color', 'box-shadow', 'transform']),
        borderColor: selected ? `${domain.color}.main` : 'divider',
        bgcolor: selected ? `${domain.color}.lighter` : 'background.paper',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.vars.customShadows.z8,
        },
      }}
    >
      <Stack spacing={2} sx={{ height: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Iconify width={28} icon={domain.icon} sx={{ color: `${domain.color}.main` }} />
          <Label color={selected ? domain.color : 'default'}>{selected ? 'Selected' : domain.status}</Label>
        </Stack>

        <Stack spacing={0.75} sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1">{domain.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {domain.description}
          </Typography>
        </Stack>

        <Button
          fullWidth
          size="small"
          color={domain.color}
          variant={selected ? 'contained' : 'outlined'}
          startIcon={<Iconify icon={selected ? 'solar:check-circle-bold' : 'solar:add-circle-outline'} />}
        >
          {selected ? 'Active domain' : 'Use domain'}
        </Button>
      </Stack>
    </Card>
  );
}
