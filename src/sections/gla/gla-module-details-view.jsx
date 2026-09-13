'use client';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _glaDomains } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function GlaModuleDetailsView({ id }) {
  const domain = _glaDomains.find((item) => item.id === id);

  if (!domain) {
    return (
      <DashboardContent>
        <EmptyContent
          title="Module not found"
          description="The requested GLA module does not exist in the POC data."
          action={
            <Button component={RouterLink} href={paths.dashboard.glaModules} variant="contained">
              Back to modules
            </Button>
          }
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3}>
        <CustomBreadcrumbs
          heading={domain.name}
          links={[
            { name: 'Dashboard', href: paths.dashboard.overview },
            { name: 'GLA POC', href: paths.dashboard.gla },
            { name: 'Modules', href: paths.dashboard.glaModules },
            { name: domain.shortName },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.gla}
              variant="contained"
              startIcon={<Iconify icon="solar:play-circle-outline" />}
            >
              Start with this module
            </Button>
          }
        />

        <Card
          sx={{
            p: { xs: 2.5, md: 3 },
            bgcolor: 'background.neutral',
            border: (theme) => `solid 1px ${theme.vars.palette.divider}`,
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
            <Iconify width={48} icon={domain.icon} sx={{ color: `${domain.color}.main` }} />
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h4">{domain.name}</Typography>
                <Label color={domain.color}>{domain.priority} priority</Label>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 840 }}>
                {domain.description}
              </Typography>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Typography variant="h6">Required planning inputs</Typography>
                <Grid container spacing={1.5}>
                  {domain.inputs.map((input) => (
                    <Grid key={input} size={{ xs: 12, sm: 6 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: 'background.neutral',
                        }}
                      >
                        <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
                        <Typography variant="body2">{input}</Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>

                <Divider />

                <Typography variant="h6">Planning sections generated</Typography>
                <Stack spacing={1}>
                  {domain.sections.map((section, index) => (
                    <Stack key={section} direction="row" spacing={1.5} alignItems="center">
                      <Label color={domain.color}>{index + 1}</Label>
                      <Typography variant="body2">{section}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Typography variant="h6">Recommended methods</Typography>
                <Stack spacing={1.5}>
                  {domain.methods.map((method) => (
                    <Stack
                      key={method}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2">{method}</Typography>
                      <Label color="primary">POC</Label>
                    </Stack>
                  ))}
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Typography variant="subtitle2">Sample objective</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {domain.sampleObjective}
                  </Typography>
                </Stack>

                <Button
                  component={RouterLink}
                  href={paths.dashboard.gla}
                  variant="contained"
                  endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
                >
                  Build plan
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </DashboardContent>
  );
}
