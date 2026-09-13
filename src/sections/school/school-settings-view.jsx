'use client';

import { z as zod } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';

import { getApiErrorMessage } from 'src/utils/api-error-message';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { QueryStateContent } from 'src/components/query-state-content';

import { useAuthContext } from 'src/auth/hooks';
import { useGetSchoolConfigQuery, useUpdateSchoolConfigMutation } from 'src/store/api/school-config-api';

// ----------------------------------------------------------------------

const PRIMARY_COLOR_OPTIONS = [
  '#1565C0', '#0C68E9', '#00838F', '#2E7D32', '#558B2F',
  '#F9A825', '#EF6C00', '#D84315', '#C62828', '#7635DC',
];

const SECONDARY_COLOR_OPTIONS = [
  '#00B8D9', '#00DCDA', '#3562D7', '#66BB6A', '#9CCC65',
  '#F9A825', '#FFA03F', '#C87941', '#AD1457', '#5E35B1',
];

const SchoolSettingsSchema = zod.object({
  branding: zod.object({
    schoolName: zod.string().trim().min(1, { message: 'School name is required' }).max(120),
    logoUrl: zod
      .string()
      .trim()
      .url({ message: 'Must be a valid URL' })
      .or(zod.literal(''))
      .optional(),
  }),
  theme: zod.object({
    primaryColor: zod.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
    secondaryColor: zod.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
    defaultMode: zod.enum(['light', 'dark']),
  }),
});

function toFormValues(data) {
  return {
    branding: {
      schoolName: data?.branding?.schoolName ?? '',
      logoUrl: data?.branding?.logoUrl ?? '',
    },
    theme: {
      primaryColor: data?.theme?.primaryColor ?? PRIMARY_COLOR_OPTIONS[0],
      secondaryColor: data?.theme?.secondaryColor ?? SECONDARY_COLOR_OPTIONS[0],
      defaultMode: data?.theme?.defaultMode ?? 'light',
    },
  };
}

export function SchoolSettingsView() {
  const { user } = useAuthContext();
  const schoolId = user?.schoolId;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSchoolConfigQuery(schoolId, { skip: !schoolId });

  const [updateSchoolConfig] = useUpdateSchoolConfigMutation();

  const methods = useForm({
    resolver: zodResolver(SchoolSettingsSchema),
    values: toFormValues(data?.configuration),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      await updateSchoolConfig({ schoolId, patch: formValues }).unwrap();
      toast.success('School configuration saved.');
    } catch (err) {
      const { message } = getApiErrorMessage(err, {
        defaultMessage: 'Unable to save school configuration.',
      });
      toast.error(message);
    }
  });

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, md: 3 }, py: 5 }}>
      <CustomBreadcrumbs
        heading="School branding"
        links={[{ name: 'Dashboard', href: '/dashboard' }, { name: 'School branding' }]}
        sx={{ mb: 3 }}
      />

      <QueryStateContent
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        errorMessageOptions={{ defaultMessage: 'Unable to load school configuration.' }}
        minHeight={280}
      >
        {data?.school && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Editing configuration for <strong>{data.school.name}</strong> — loaded from the
            backend, scoped to this school only.
          </Alert>
        )}

        <Form methods={methods} onSubmit={onSubmit}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack spacing={2}>
                <Typography variant="subtitle1">Profile</Typography>
                <Field.Text name="branding.schoolName" label="School name" />
                <Field.Text
                  name="branding.logoUrl"
                  label="Logo URL"
                  placeholder="https://…"
                  helperText="Pasted URL only for this POC — file upload will reuse the existing Upload component later."
                />
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Primary color</Typography>
                <Controller
                  name="theme.primaryColor"
                  control={control}
                  render={({ field }) => (
                    <ColorPicker value={field.value} onChange={field.onChange} options={PRIMARY_COLOR_OPTIONS} />
                  )}
                />
                {errors.theme?.primaryColor && (
                  <FormHelperText error>{errors.theme.primaryColor.message}</FormHelperText>
                )}
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Secondary color</Typography>
                <Controller
                  name="theme.secondaryColor"
                  control={control}
                  render={({ field }) => (
                    <ColorPicker value={field.value} onChange={field.onChange} options={SECONDARY_COLOR_OPTIONS} />
                  )}
                />
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Default color mode</Typography>
                <Field.RadioGroup
                  name="theme.defaultMode"
                  row
                  options={[
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                  ]}
                  helperText="Stored with the school's configuration; applying it as the sign-in default requires server-side tenant resolution, which is a later phase."
                />
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Field.Button type="submit" variant="contained" loading={isSubmitting}>
                  Save changes
                </Field.Button>
              </Box>
            </Stack>
          </Card>
        </Form>
      </QueryStateContent>
    </Box>
  );
}
