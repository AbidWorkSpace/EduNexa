'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------
// One row per typography variant (H1, Body, Button, ...) — fontSize and
// fontWeight only. lineHeight/letterSpacing stay in the schema for a school
// that needs them via the API, but aren't exposed here; Step 3 asks the
// data model to *support* all four, not that the builder UI must edit all
// four on day one (rule 11: don't overbuild the builder beyond POC scope).
// ----------------------------------------------------------------------

export function TypographyVariantRow({ variantKey, label }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
      <Typography variant="body2" sx={{ width: 110, flexShrink: 0 }}>
        {label}
      </Typography>
      <Field.NumberInput
        name={`typography.variants.${variantKey}.fontSize`}
        label="Size (px)"
        min={8}
        max={96}
        sx={{ width: 140 }}
      />
      <Field.NumberInput
        name={`typography.variants.${variantKey}.fontWeight`}
        label="Weight"
        min={100}
        max={900}
        sx={{ width: 140 }}
      />
    </Stack>
  );
}
