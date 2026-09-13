'use client';

import { useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { createTheme } from 'src/theme/create-theme';

import { Label } from 'src/components/label';
import { CustomTabs } from 'src/components/custom-tabs';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { ScopedThemeProvider } from './scoped-theme-provider';

// ----------------------------------------------------------------------
// This is the actual live-preview requirement (Step 10): every element
// below is a REAL generic component this app already ships (Label,
// CustomTabs, ConfirmDialog, plus MUI's own Button/Card/TextField/Chip/
// Switch/Avatar/Alert, all of which already read their styling from
// src/theme/core/components/*.jsx). Nothing here is a mock/fake preview —
// it's the same theme pipeline the real dashboard uses, scoped to this
// panel only via ScopedThemeProvider so unsaved edits never touch the real
// app theme.
// ----------------------------------------------------------------------

export function ThemePreviewPanel({ control }) {
  const [previewMode, setPreviewMode] = useState('light');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [node, setNode] = useState(null);

  const formValues = useWatch({ control });

  const previewTheme = useMemo(() => {
    const settingsState = {
      direction: 'ltr',
      contrast: 'default',
      primaryColor: 'default',
      secondaryColor: 'default',
      fontFamily: formValues?.typography?.fontFamily || undefined,
      lightColors: formValues?.theme?.light?.colors,
      darkColors: formValues?.theme?.dark?.colors,
      spacingUnit: formValues?.spacing,
      radiusBase: formValues?.radius,
      shadowLevel: formValues?.shadow,
      typographyVariants: formValues?.typography?.variants,
    };

    return createTheme({ settingsState });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(formValues?.theme),
    JSON.stringify(formValues?.typography),
    formValues?.spacing,
    formValues?.radius,
    formValues?.shadow,
  ]);

  return (
    <Card sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
      <Box sx={{ px: 2, pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1">Live preview</Typography>
        <CustomTabs value={previewMode} onChange={(_e, v) => setPreviewMode(v)} sx={{ width: 160 }}>
          <Tab value="light" label="Light" />
          <Tab value="dark" label="Dark" />
        </CustomTabs>
      </Box>

      <div ref={setNode}>
        <ScopedThemeProvider key={previewMode} theme={previewTheme} node={node} defaultMode={previewMode}>
          <Box sx={{ p: 2.5, bgcolor: 'background.default', color: 'text.primary' }}>
            <Stack spacing={2.5}>
              <Stack spacing={0.5}>
                <Typography variant="h3">Heading example</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Body large — the quick brown fox
                </Typography>
                <Typography variant="body1">Body — the quick brown fox jumps over the lazy dog.</Typography>
                <Typography variant="caption" color="text.secondary">
                  Caption text
                </Typography>
              </Stack>

              <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Sample card
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                    <Label color="success">Active</Label>
                    <Label color="warning">Pending</Label>
                    <Label color="error">Overdue</Label>
                    <Label color="info">Info</Label>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    <ButtonGroup variant="contained">
                      <Button color="primary">Primary</Button>
                      <Button color="secondary">Secondary</Button>
                    </ButtonGroup>
                    <Button variant="outlined">Outlined</Button>
                    <Button variant="text">Text</Button>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    <TextField size="small" label="Sample input" defaultValue="Value" />
                    <Chip label="Chip" color="primary" />
                    <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
                    <FormControlLabel control={<Switch defaultChecked />} label="Enabled" />
                  </Stack>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    This alert uses the school&apos;s info color.
                  </Alert>
                  <Button variant="soft" color="primary" onClick={() => setDialogOpen(true)}>
                    Open dialog preview
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          <ConfirmDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            container={node}
            title="Dialog preview"
            content="This dialog uses the same radius, shadow, and color tokens as the rest of the preview."
            action={
              <Button variant="contained" onClick={() => setDialogOpen(false)}>
                Confirm
              </Button>
            }
          />
        </ScopedThemeProvider>
      </div>
    </Card>
  );
}
