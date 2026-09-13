'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ForbiddenIllustration } from 'src/assets/illustrations';
import { SignOutButton } from 'src/layouts/components/sign-out-button';

// ----------------------------------------------------------------------

/**
 * 403 Forbidden page (generic access denied UI).
 */
export function View403() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        py: { xs: 5, md: 10 },
        px: 2,
      }}
    >
      <ForbiddenIllustration
        sx={{
          width: 1,
          maxWidth: 320,
          height: 'auto',
          mb: 3,
        }}
      />

      <Typography variant="h4" sx={{ mb: 1.5 }}>
        Access denied
      </Typography>

      <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 420, mb: 4 }}>
        You do not have permission to view this page. If you believe you should have access,
        contact your administrator.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
        <Button
          component={RouterLink}
          href={paths.dashboard.root}
          size="large"
          variant="contained"
        >
          Go to Dashboard
        </Button>

        <SignOutButton
          size="large"
          variant="outlined"
          color="error"
          fullWidth={false}
          sx={{ minWidth: 120 }}
        />
      </Box>
    </Box>
  );
}
