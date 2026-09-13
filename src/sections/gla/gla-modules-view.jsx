'use client';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _glaDomains } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function GlaModulesView() {
  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3}>
        <CustomBreadcrumbs
          heading="GLA Modules"
          links={[
            { name: 'Dashboard', href: paths.dashboard.overview },
            { name: 'GLA POC', href: paths.dashboard.gla },
            { name: 'Modules' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.gla}
              variant="contained"
              startIcon={<Iconify icon="solar:clipboard-list-outline" />}
            >
              Open workspace
            </Button>
          }
        />

        <Grid container spacing={3}>
          {_glaDomains.map((domain, index) => {
            const readiness = domain.status === 'Ready' ? 90 : 65;

            return (
              <Grid key={domain.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <Card variant="outlined" sx={{ p: 3, height: 1 }}>
                  <Stack spacing={2.5} sx={{ height: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Iconify width={30} icon={domain.icon} sx={{ color: `${domain.color}.main` }} />
                      <Label color={domain.status === 'Ready' ? 'success' : 'warning'}>{domain.status}</Label>
                    </Stack>

                    <Stack spacing={1} sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{domain.name}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {domain.description}
                      </Typography>
                    </Stack>

                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          POC readiness
                        </Typography>
                        <Typography variant="caption">{readiness}%</Typography>
                      </Stack>
                      <LinearProgress
                        color={domain.color}
                        value={readiness}
                        variant="determinate"
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {domain.methods.slice(0, 3).map((method) => (
                        <Label key={method} color="default">
                          {method}
                        </Label>
                      ))}
                    </Stack>

                    <Button
                      fullWidth
                      component={RouterLink}
                      href={paths.dashboard.glaModuleDetails(domain.id)}
                      variant={index === 0 ? 'contained' : 'outlined'}
                      endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
                    >
                      View module
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Stack>
    </DashboardContent>
  );
}
