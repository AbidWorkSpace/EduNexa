'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { getApiErrorMessage } from 'src/utils/api-error-message';
import { SchoolConfigurationUpdateSchema, TYPOGRAPHY_VARIANT_KEYS } from 'src/schemas/school-configuration';

import { toast } from 'src/components/snackbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { QueryStateContent } from 'src/components/query-state-content';

import { useAuthContext } from 'src/auth/hooks';
import {
  useGetSchoolConfigQuery,
  useResetSchoolConfigMutation,
  useUpdateSchoolConfigMutation,
} from 'src/store/api/school-config-api';

import { ThemePreviewPanel } from './theme-preview-panel';
import { TypographyVariantRow } from './typography-variant-row';

// ----------------------------------------------------------------------

const PRIMARY_COLOR_OPTIONS = [
  '#1565C0', '#0C68E9', '#00838F', '#2E7D32', '#558B2F',
  '#F9A825', '#EF6C00', '#D84315', '#C62828', '#7635DC',
];

const SECONDARY_COLOR_OPTIONS = [
  '#00B8D9', '#00DCDA', '#3562D7', '#66BB6A', '#9CCC65',
  '#F9A825', '#FFA03F', '#C87941', '#AD1457', '#5E35B1',
];

const ACCENT_COLOR_OPTIONS = [
  '#0D47A1', '#1B5E20', '#B71C1C', '#4A148C', '#E65100', '#004D40',
];

const FONT_FAMILY_OPTIONS = [
  { label: 'Public Sans', value: 'Public Sans Variable' },
  { label: 'Manrope', value: 'Manrope Variable' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans Variable' },
  { label: 'DM Sans', value: 'DM Sans Variable' },
  { label: 'Inter', value: 'Inter Variable' },
  { label: 'Nunito Sans', value: 'Nunito Sans Variable' },
  { label: 'Poppins', value: 'Poppins' },
];

const RADIUS_OPTIONS = [
  { label: 'None', value: 0 },
  { label: 'Small', value: 4 },
  { label: 'Medium', value: 8 },
  { label: 'Large', value: 16 },
  { label: 'Extra large', value: 24 },
];

const SHADOW_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Extra large', value: 'xl' },
];

const TYPOGRAPHY_ROWS = [
  { key: 'h1', label: 'Heading 1' },
  { key: 'h2', label: 'Heading 2' },
  { key: 'h3', label: 'Heading 3' },
  { key: 'h4', label: 'Heading 4' },
  { key: 'bodyLarge', label: 'Body large' },
  { key: 'body', label: 'Body' },
  { key: 'bodySmall', label: 'Body small' },
  { key: 'caption', label: 'Caption' },
  { key: 'label', label: 'Label' },
  { key: 'button', label: 'Button' },
];

const DEFAULT_TYPOGRAPHY_VARIANTS = {
  h1: { fontSize: 40, fontWeight: 800 },
  h2: { fontSize: 32, fontWeight: 800 },
  h3: { fontSize: 24, fontWeight: 700 },
  h4: { fontSize: 20, fontWeight: 700 },
  bodyLarge: { fontSize: 16, fontWeight: 600 },
  body: { fontSize: 16, fontWeight: 400 },
  bodySmall: { fontSize: 14, fontWeight: 400 },
  caption: { fontSize: 12, fontWeight: 400 },
  label: { fontSize: 12, fontWeight: 700 },
  button: { fontSize: 14, fontWeight: 700 },
};

const EMPTY_COLOR_SET = {
  primary: '',
  secondary: '',
  accent: '',
  background: '',
  surface: '',
  textPrimary: '',
  textSecondary: '',
  border: '',
};

function toColorSet(colors) {
  return { ...EMPTY_COLOR_SET, ...colors };
}

function toFormValues(configuration) {
  const variants = {};
  TYPOGRAPHY_VARIANT_KEYS.forEach((key) => {
    variants[key] = {
      ...DEFAULT_TYPOGRAPHY_VARIANTS[key],
      ...configuration?.typography?.variants?.[key],
    };
  });

  return {
    branding: {
      schoolName: configuration?.branding?.schoolName ?? '',
      tagline: configuration?.branding?.tagline ?? '',
      logoUrl: configuration?.branding?.logoUrl ?? '',
      faviconUrl: configuration?.branding?.faviconUrl ?? '',
    },
    theme: {
      defaultMode: configuration?.theme?.defaultMode ?? 'light',
      light: { colors: toColorSet(configuration?.theme?.light?.colors) },
      dark: { colors: toColorSet(configuration?.theme?.dark?.colors) },
    },
    typography: {
      fontFamily: configuration?.typography?.fontFamily ?? FONT_FAMILY_OPTIONS[2].value,
      variants,
    },
    spacing: configuration?.spacing ?? 8,
    radius: configuration?.radius ?? 8,
    shadow: configuration?.shadow ?? 'md',
  };
}

export function SchoolThemeBuilderView() {
  const { user } = useAuthContext();
  const schoolId = user?.schoolId;

  const { data, isLoading, isError, error, refetch } = useGetSchoolConfigQuery(schoolId, { skip: !schoolId });
  const [updateSchoolConfig] = useUpdateSchoolConfigMutation();
  const [resetSchoolConfig, { isLoading: isResetting }] = useResetSchoolConfigMutation();

  const [tab, setTab] = useState('brand');
  const [colorMode, setColorMode] = useState('light');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const methods = useForm({
    resolver: zodResolver(SchoolConfigurationUpdateSchema),
    values: toFormValues(data?.configuration),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      await updateSchoolConfig({ schoolId, patch: formValues }).unwrap();
      toast.success('Theme saved.');
    } catch (err) {
      const { message } = getApiErrorMessage(err, { defaultMessage: 'Unable to save theme.' });
      toast.error(message);
    }
  });

  const handleReset = async () => {
    try {
      await resetSchoolConfig(schoolId).unwrap();
      toast.success('Theme reset to platform defaults.');
    } catch (err) {
      const { message } = getApiErrorMessage(err, { defaultMessage: 'Unable to reset theme.' });
      toast.error(message);
    } finally {
      setResetDialogOpen(false);
    }
  };

  const colorsPrefix = `theme.${colorMode}.colors`;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: 5 }}>
      <CustomBreadcrumbs
        heading="Theme Builder"
        links={[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Theme Builder' }]}
        sx={{ mb: 3 }}
      />

      <QueryStateContent
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        errorMessageOptions={{ defaultMessage: 'Unable to load school configuration.' }}
        minHeight={320}
      >
        {data?.school && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Editing the design system for <strong>{data.school.name}</strong> — every change here is
            backend-persisted and scoped to this school only.
          </Alert>
        )}

        <Form methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card>
                <CustomTabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 2, pt: 1 }}>
                  <Tab value="brand" label="Brand" />
                  <Tab value="colors" label="Colors" />
                  <Tab value="typography" label="Typography" />
                  <Tab value="shape" label="Shape & elevation" />
                </CustomTabs>
                <Divider />

                <Box sx={{ p: 3 }}>
                  {tab === 'brand' && (
                    <Stack spacing={2.5}>
                      <Field.Text name="branding.schoolName" label="School name" />
                      <Field.Text name="branding.tagline" label="Tagline" />
                      <Field.Text name="branding.logoUrl" label="Logo URL" placeholder="https://…" />
                      <Field.Text name="branding.faviconUrl" label="Favicon URL" placeholder="https://…" />
                    </Stack>
                  )}

                  {tab === 'colors' && (
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2">Editing colors for</Typography>
                        <CustomTabs value={colorMode} onChange={(_e, v) => setColorMode(v)} sx={{ width: 180 }}>
                          <Tab value="light" label="Light theme" />
                          <Tab value="dark" label="Dark theme" />
                        </CustomTabs>
                      </Stack>

                      <Stack spacing={1}>
                        <Typography variant="body2">Primary</Typography>
                        <ColorField name={`${colorsPrefix}.primary`} control={control} options={PRIMARY_COLOR_OPTIONS} />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="body2">Secondary</Typography>
                        <ColorField
                          name={`${colorsPrefix}.secondary`}
                          control={control}
                          options={SECONDARY_COLOR_OPTIONS}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="body2">Accent</Typography>
                        <ColorField name={`${colorsPrefix}.accent`} control={control} options={ACCENT_COLOR_OPTIONS} />
                      </Stack>

                      <Divider />

                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Field.Text name={`${colorsPrefix}.background`} label="Background" />
                        </Grid>
                        <Grid size={6}>
                          <Field.Text name={`${colorsPrefix}.surface`} label="Surface (cards, dialogs)" />
                        </Grid>
                        <Grid size={6}>
                          <Field.Text name={`${colorsPrefix}.textPrimary`} label="Text primary" />
                        </Grid>
                        <Grid size={6}>
                          <Field.Text name={`${colorsPrefix}.textSecondary`} label="Text secondary" />
                        </Grid>
                        <Grid size={6}>
                          <Field.Text name={`${colorsPrefix}.border`} label="Border" />
                        </Grid>
                      </Grid>

                      <Divider />
                      <Stack spacing={1}>
                        <Typography variant="body2">Default color mode for this school</Typography>
                        <Field.RadioGroup
                          name="theme.defaultMode"
                          row
                          options={[
                            { label: 'Light', value: 'light' },
                            { label: 'Dark', value: 'dark' },
                          ]}
                          helperText="Applied once per login/session — the usual mode toggle still works afterward."
                        />
                      </Stack>
                    </Stack>
                  )}

                  {tab === 'typography' && (
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <Typography variant="body2">Font family</Typography>
                        <Field.RadioGroup
                          name="typography.fontFamily"
                          row
                          options={FONT_FAMILY_OPTIONS}
                        />
                      </Stack>
                      <Divider />
                      <Stack spacing={0.5}>
                        {TYPOGRAPHY_ROWS.map(({ key, label }) => (
                          <TypographyVariantRow key={key} variantKey={key} label={label} />
                        ))}
                      </Stack>
                    </Stack>
                  )}

                  {tab === 'shape' && (
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <Typography variant="body2">Corner radius</Typography>
                        <Field.RadioGroup name="radius" row options={RADIUS_OPTIONS} />
                      </Stack>
                      <Divider />
                      <Stack spacing={1}>
                        <Typography variant="body2">Shadow depth</Typography>
                        <Field.RadioGroup name="shadow" row options={SHADOW_OPTIONS} />
                      </Stack>
                      <Divider />
                      <Stack spacing={1} sx={{ maxWidth: 200 }}>
                        <Typography variant="body2">Spacing unit (px)</Typography>
                        <Field.NumberInput name="spacing" min={4} max={16} />
                      </Stack>
                    </Stack>
                  )}
                </Box>

                <Divider />
                <Stack direction="row" spacing={1.5} sx={{ p: 2.5 }} justifyContent="flex-end">
                  <Field.Button
                    variant="outlined"
                    color="error"
                    onClick={() => setResetDialogOpen(true)}
                  >
                    Reset to default
                  </Field.Button>
                  <Field.Button type="submit" variant="contained" loading={isSubmitting}>
                    Save changes
                  </Field.Button>
                </Stack>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <ThemePreviewPanel control={control} />
            </Grid>
          </Grid>
        </Form>
      </QueryStateContent>

      <ConfirmDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        title="Reset to platform default?"
        content="This restores this school's colors, typography, spacing, radius, and shadow to the platform defaults. The school's name, logo, and other branding fields are not affected. This cannot be undone."
        action={
          <Field.Button variant="contained" color="error" onClick={handleReset} loading={isResetting}>
            Reset
          </Field.Button>
        }
      />
    </Box>
  );
}

// ----------------------------------------------------------------------
// Thin Controller -> ColorPicker bridge: ColorPicker (src/components/color-utils)
// is a plain generic component, not an RHF Field.* wrapper, so it needs a
// Controller to bind to the form the same way every Field.* component
// already does internally.
// ----------------------------------------------------------------------

function ColorField({ name, control, options }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} options={options} />}
    />
  );
}
