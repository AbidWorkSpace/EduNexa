'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _glaReviewQueue } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomTable } from 'src/components/custom-table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const statusColor = {
  Approved: 'success',
  'Needs changes': 'warning',
  'Ready for review': 'info',
};

export function GlaReviewView() {
  const columns = [
    { field: 'id', headerName: 'Plan ID', width: 110 },
    { field: 'title', headerName: 'Plan', flex: 1, minWidth: 240 },
    { field: 'domain', headerName: 'Domain', width: 190 },
    { field: 'owner', headerName: 'Owner', width: 160 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => <Label color={statusColor[params.value] ?? 'default'}>{params.value}</Label>,
    },
    {
      field: 'completeness',
      headerName: 'Completeness',
      width: 180,
      renderCell: (params) => (
        <Stack spacing={0.75} sx={{ width: 1 }}>
          <Typography variant="caption">{params.value}%</Typography>
          <LinearProgress
            value={params.value}
            color={params.value >= 90 ? 'success' : 'warning'}
            variant="determinate"
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Stack>
      ),
    },
    { field: 'reviewer', headerName: 'Reviewer', width: 170 },
    { field: 'dueDate', headerName: 'Due', width: 120 },
  ];

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3}>
        <CustomBreadcrumbs
          heading="GLA Review"
          links={[
            { name: 'Dashboard', href: paths.dashboard.overview },
            { name: 'GLA POC', href: paths.dashboard.gla },
            { name: 'Review' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.gla}
              variant="contained"
              startIcon={<Iconify icon="solar:pen-new-square-outline" />}
            >
              Open workspace
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
          <Stack spacing={1}>
            <Typography variant="h5">Reviewer validation queue</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 760 }}>
              Demo view for evaluator workflows: check completeness, review status, owner, domain, and
              approval readiness before the final implementation adds permissions and comment history.
            </Typography>
          </Stack>
        </Card>

        <Card variant="outlined">
          <CustomTable
            rows={_glaReviewQueue}
            columns={columns}
            height={520}
            toolbar={{ show: true, quickFilter: true, columns: true, export: true, settings: true }}
            pagination={{ enabled: true, pageSize: 5, pageSizeOptions: [5, 10] }}
            sorting={{ enabled: true }}
            filtering={{ enabled: true, quickFilter: true }}
            actions={[
              {
                id: 'review',
                label: 'Review',
                icon: 'solar:eye-outline',
                onClick: () => {},
              },
            ]}
          />
        </Card>
      </Stack>
    </DashboardContent>
  );
}
