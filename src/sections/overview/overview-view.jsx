'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export default function OverviewView() {
  return (
    <Box sx={{ p: 3 }}>
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {CONFIG.appName} is ready. Add your product routes, data layer, and screens here.
        </Typography>
      </Card>
    </Box>
  );
}
