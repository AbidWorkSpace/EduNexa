import dayjs from 'dayjs';
import { lazy, Suspense, forwardRef } from 'react';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { Controller, useFormContext } from 'react-hook-form';
import { transformValue, transformValueOnBlur, transformValueOnChange } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import Rating from '@mui/material/Rating';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { mergeComboboxHtmlInput } from 'src/utils/combobox-html-input';

import { Iconify } from '../iconify';
import { HelperText } from './help-text';
import { PhoneInput } from '../phone-input';
import { NumberInput } from '../number-input';
import { CountrySelect } from '../country-select';
import { Upload, UploadBox, UploadAvatar } from '../upload';

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/**
 * Normalizes date values from various formats (dayjs, string, timestamp, null)
 * @param {any} value - The date value to normalize
 * @returns {dayjs.Dayjs|null} - Normalized dayjs object or null
 */
function normalizeDateValue(value) {
  if (dayjs.isDayjs(value)) return value;

  const parsed = value ? dayjs(value) : null;
  return parsed?.isValid() ? parsed : null;
}

/**
 * Generates a unique field ID for accessibility
 * @param {string} name - Field name
 * @param {string} suffix - Optional suffix for the ID
 * @returns {string} - Unique field ID
 */
function generateFieldId(name, suffix = '') {
  return `${name}${suffix ? `-${suffix}` : ''}`;
}

/**
 * Ensures multi-select value is always an array
 * @param {any} value - The value to normalize
 * @returns {Array} - Array value (empty array if null/undefined)
 */
function handleMultiSelectValue(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

/**
 * Prevents leading spaces in input values
 * Removes leading whitespace while allowing spaces after characters
 * @param {string} newValue - The new input value
 * @param {string} previousValue - The previous value (default: '')
 * @returns {string} - Value with leading spaces removed
 */
function preventLeadingSpaces(newValue, previousValue = '') {
  if (!newValue || typeof newValue !== 'string') return newValue;

  // Remove all leading whitespace characters
  const trimmed = newValue.replace(/^\s+/, '');

  // If value was empty and user tried to add leading space, return empty
  if (!previousValue && newValue.startsWith(' ')) {
    return '';
  }

  return trimmed;
}

/** Sx applied when a field is disabled: no-drop cursor and grey background */
const disabledFieldSx = { cursor: 'no-drop', backgroundColor: 'grey.200' };

/**
 * Clamps a numeric value to [min, max] when min/max are provided.
 * Returns the original value if empty or not a number; otherwise returns clamped number.
 */
function clampNumberValue(value, min, max) {
  if (value === '' || value === null || value === undefined) return value;
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  const minNum = min != null && min !== '' ? Number(min) : null;
  const maxNum = max != null && max !== '' ? Number(max) : null;
  let result = num;
  if (minNum != null) result = Math.max(minNum, result);
  if (maxNum != null) result = Math.min(maxNum, result);
  return result;
}

// ----------------------------------------------------------------------
// TextField Component
// ----------------------------------------------------------------------

/**
 * React Hook Form TextField component
 * Handles text, number, email, password, and other input types
 * @param {string} name - Field name (required)
 * @param {string} type - Input type (default: 'text')
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} slotProps - MUI slot props for customization
 * @param {object} other - Additional props passed to TextField
 */
export function RHFTextField({ name, helperText, slotProps, type = 'text', ...other }) {
  const { control } = useFormContext();

  const isNumberType = type === 'number';
  const isMultiline = other.multiline || other.rows || other.rowsMax || other.rowsMin;
  const inputMin = slotProps?.input?.inputProps?.min;
  const inputMax = slotProps?.input?.inputProps?.max;
  const hasMinMax = isNumberType && (inputMin != null || inputMax != null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          value={
            isNumberType
              ? (field.value === null || field.value === undefined
                  ? ''
                  : transformValue(field.value))
              : field.value ?? ''
          }
          onChange={(event) => {
            let transformedValue = event.target.value;

            if (isNumberType) {
              // Number type handling (existing)
              transformedValue = transformValueOnChange(transformedValue);
              if (hasMinMax) {
                transformedValue = clampNumberValue(transformedValue, inputMin, inputMax);
              }
            } else {
              // Prevent leading spaces for text inputs
              // For multiline, only prevent on first line
              if (isMultiline) {
                // Split by newlines, prevent leading spaces on first line only
                const lines = transformedValue.split('\n');
                if (lines.length > 0 && lines[0]) {
                  lines[0] = preventLeadingSpaces(lines[0], field.value?.split('\n')[0] || '');
                }
                transformedValue = lines.join('\n');
              } else {
                transformedValue = preventLeadingSpaces(transformedValue, field.value || '');
              }
            }

            field.onChange(transformedValue);
          }}
          onBlur={(event) => {
            let transformedValue = event.target.value;

            if (isNumberType) {
              transformedValue = transformValueOnBlur(transformedValue);
              if (hasMinMax) {
                transformedValue = clampNumberValue(transformedValue, inputMin, inputMax);
              }
            } else {
              // Also prevent leading spaces on blur (handles paste operations)
              if (isMultiline) {
                const lines = transformedValue.split('\n');
                if (lines.length > 0 && lines[0]) {
                  lines[0] = preventLeadingSpaces(lines[0], '');
                }
                transformedValue = lines.join('\n');
              } else {
                transformedValue = preventLeadingSpaces(transformedValue, '');
              }
            }

            field.onChange(transformedValue);
          }}
          type={isNumberType ? 'text' : type}
          error={!!error}
          helperText={error?.message ?? helperText}
          slotProps={{
            ...slotProps,
            input: {
              ...slotProps?.input,
              sx: [
                ...(Array.isArray(slotProps?.input?.sx) ? slotProps.input.sx : [slotProps?.input?.sx].filter(Boolean)),
                ...(other.disabled ? [disabledFieldSx] : []),
              ],
            },
            htmlInput: {
              ...slotProps?.htmlInput,
              ...(isNumberType && {
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*',
              }),
              autoComplete: 'new-password', // Disable autocomplete and autofill
            },
          }}
          {...other}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------
// PhoneInput Component
// ----------------------------------------------------------------------

/**
 * React Hook Form PhoneInput component
 * Handles international phone number input with country selection
 * @param {string} name - Field name (required)
 * @param {ReactNode} helperText - Helper text to display
 * @param {string} country - Locked country code
 * @param {string} defaultCountry - Default country code (defaults to 'PK' for Pakistan)
 * @param {object} other - Additional props passed to PhoneInput
 */
export function RHFPhoneInput({ name, helperText, country, defaultCountry = 'PK', ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <PhoneInput
          {...field}
          fullWidth
          country={country}
          defaultCountry={defaultCountry}
          error={!!error}
          helperText={error?.message ?? helperText}
          sx={[
            ...(Array.isArray(other.sx) ? other.sx : [other.sx].filter(Boolean)),
            ...(other.disabled ? [disabledFieldSx] : []),
          ]}
          {...other}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------
// DatePicker Components
// ----------------------------------------------------------------------

/**
 * React Hook Form DatePicker component
 * Handles date selection with dayjs normalization
 * @param {string} name - Field name (required)
 * @param {object} slotProps - MUI slot props for customization
 * @param {object} other - Additional props passed to DatePicker
 */
export function RHFDatePicker({ name, slotProps, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...field}
          value={normalizeDateValue(field.value)}
          onChange={(newValue) => {
            if (!newValue) {
              field.onChange(null);
              return;
            }

            const parsedValue = dayjs(newValue);
            field.onChange(parsedValue.isValid() ? parsedValue.format() : newValue);
          }}
          slotProps={{
            ...slotProps,
            textField: {
              ...slotProps?.textField,
              error: !!error,
              helperText: error?.message ?? slotProps?.textField?.helperText,
              ...(other.disabled && { sx: disabledFieldSx }),
            },
          }}
          {...other}
        />
      )}
    />
  );
}

/**
 * React Hook Form TimePicker component
 * Handles time selection with dayjs normalization
 * @param {string} name - Field name (required)
 * @param {object} slotProps - MUI slot props for customization
 * @param {object} other - Additional props passed to TimePicker
 */
export function RHFTimePicker({ name, slotProps, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TimePicker
          {...field}
          value={normalizeDateValue(field.value)}
          onChange={(newValue) => {
            if (!newValue) {
              field.onChange(null);
              return;
            }

            const parsedValue = dayjs(newValue);
            field.onChange(parsedValue.isValid() ? parsedValue.format() : newValue);
          }}
          slotProps={{
            ...slotProps,
            textField: {
              ...slotProps?.textField,
              error: !!error,
              helperText: error?.message ?? slotProps?.textField?.helperText,
              ...(other.disabled && { sx: disabledFieldSx }),
            },
          }}
          {...other}
        />
      )}
    />
  );
}

/**
 * React Hook Form DateTimePicker component
 * Handles date and time selection with dayjs normalization
 * @param {string} name - Field name (required)
 * @param {object} slotProps - MUI slot props for customization
 * @param {object} other - Additional props passed to DateTimePicker
 */
export function RHFDateTimePicker({ name, slotProps, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DateTimePicker
          {...field}
          value={normalizeDateValue(field.value)}
          onChange={(newValue) => {
            if (!newValue) {
              field.onChange(null);
              return;
            }

            const parsedValue = dayjs(newValue);
            field.onChange(parsedValue.isValid() ? parsedValue.format() : newValue);
          }}
          slotProps={{
            ...slotProps,
            textField: {
              ...slotProps?.textField,
              error: !!error,
              helperText: error?.message ?? slotProps?.textField?.helperText,
              ...(other.disabled && { sx: disabledFieldSx }),
            },
          }}
          {...other}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------
// MultiSelect Component
// ----------------------------------------------------------------------

/**
 * React Hook Form MultiSelect component
 * Handles multiple selection with Autocomplete, search, and clear icon
 * @param {string} name - Field name (required)
 * @param {boolean} chip - Display selected items as chips (default: true)
 * @param {string} label - Field label
 * @param {Array} options - Array of {value, label} objects
 * @param {boolean} checkbox - Show checkboxes in dropdown
 * @param {boolean} showSelectAll - Show "Select all" row in dropdown (default: false)
 * @param {string} placeholder - Placeholder text when empty
 * @param {object} slotProps - MUI slot props for customization
 * @param {ReactNode} helperText - Helper text to display
 * @param {function} filterOptions - Custom filter function (optional)
 * @param {function} getOptionLabel - Custom label getter (optional)
 * @param {number} limitTags - Limit number of chips displayed
 * @param {boolean} fullWidth - Full width component (default: true)
 * @param {object} other - Additional props passed to Autocomplete
 */
export function RHFMultiSelect({
  name,
  chip = true,
  label,
  options = [],
  checkbox,
  showSelectAll = false,
  placeholder,
  slotProps,
  helperText,
  filterOptions: filterOptionsProp,
  getOptionLabel: getOptionLabelProp,
  limitTags,
  fullWidth = true,
  ...other
}) {
  const { control, setValue } = useFormContext();

  const labelId = generateFieldId(name, 'multi-select');
  const paperSxArray = Array.isArray(slotProps?.autocomplete?.paper?.sx)
    ? slotProps.autocomplete.paper.sx
    : [slotProps?.autocomplete?.paper?.sx].filter(Boolean);
  const listboxMaxHeight =
    paperSxArray.reduce((acc, obj) => (obj?.maxHeight != null ? obj.maxHeight : acc), null) ?? 220;

  // Default filter function - case-insensitive search by label
  const defaultFilterOptions = (optionsToFilter, { inputValue }) => {
    if (!inputValue) return optionsToFilter;
    const searchLower = inputValue.toLowerCase();
    return optionsToFilter.filter((option) =>
      option.label?.toLowerCase().includes(searchLower)
    );
  };

  // Default getOptionLabel - extract label from option object
  const defaultGetOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return option?.label ?? '';
  };

  // Default isOptionEqualToValue - compare by value property
  const isOptionEqualToValue = (option, value) => {
    if (!option || !value) return false;
    return option.value === value.value;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const fieldValue = handleMultiSelectValue(field.value);

        // Get selected option objects from values
        const selectedOptions = options.filter((option) =>
          fieldValue.includes(option.value)
        );

        const allSelected = options.length > 0 && fieldValue.length === options.length;
        const someSelected = fieldValue.length > 0;

        const SelectAllListbox = forwardRef((listboxProps, listboxRef) => {
          const { children, ...listboxRest } = listboxProps;
          return (
            <ul ref={listboxRef} {...listboxRest}>
              {showSelectAll && options.length > 0 && (
                <li
                  key="__select-all__"
                  style={{ listStyle: 'none' }}
                  role="presentation"
                >
                  <FormControlLabel
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      width: '100%',
                      mx: 0,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                    control={
                      <Checkbox
                        size="small"
                        disableRipple
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={() => {
                          if (allSelected) {
                            setValue(name, [], { shouldValidate: true });
                          } else {
                            setValue(
                              name,
                              options.map((o) => o.value),
                              { shouldValidate: true }
                            );
                          }
                        }}
                      />
                    }
                    label="Select all"
                  />
                </li>
              )}
              {children}
            </ul>
          );
        });

        // Handle input change with leading space prevention
        const handleInputChange = (event, value, reason) => {
          // Only prevent leading spaces when user is typing (not when selecting from options)
          if (reason === 'input' && typeof value === 'string') {
            const cleanedValue = preventLeadingSpaces(value, '');
            // If value was cleaned, update it
            if (cleanedValue !== value && event?.target) {
              event.target.value = cleanedValue;
            }
          }
        };

        return (
          <Autocomplete
            {...field}
            multiple
            fullWidth={fullWidth}
            id={labelId}
            options={options}
            value={selectedOptions}
            onChange={(event, newValue) => {
              const values = newValue.map((option) => option.value);
              setValue(name, values, { shouldValidate: true });
            }}
            onInputChange={handleInputChange}
            filterOptions={filterOptionsProp || defaultFilterOptions}
            getOptionLabel={getOptionLabelProp || defaultGetOptionLabel}
            isOptionEqualToValue={isOptionEqualToValue}
            disableCloseOnSelect
            limitTags={limitTags}
            ListboxComponent={showSelectAll ? SelectAllListbox : undefined}
            ListboxProps={{
              ...slotProps?.autocomplete?.listbox,
              sx: [
                { maxHeight: listboxMaxHeight, overflowY: 'auto' },
                ...(Array.isArray(slotProps?.autocomplete?.listbox?.sx)
                  ? slotProps.autocomplete.listbox.sx
                  : [slotProps?.autocomplete?.listbox?.sx].filter(Boolean)),
              ],
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoComplete="off"
                label={label}
                placeholder={placeholder}
                error={!!error}
                helperText={error?.message ?? helperText}
                slotProps={{
                  ...slotProps?.textField?.slotProps,
                  htmlInput: mergeComboboxHtmlInput(labelId, params.inputProps, {
                    ...slotProps?.textField?.slotProps?.htmlInput,
                  }),
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    ...slotProps?.textField?.slotProps?.input,
                  },
                  ...slotProps?.textField?.slotProps,
                }}
                {...slotProps?.textField}
              />
            )}
            renderOption={(props, option, state) => {
              const { key, ...otherProps } = props;
              const isSelected = fieldValue.includes(option.value);

              return (
                <li key={key} {...otherProps}>
                  {checkbox && (
                    <Checkbox
                      size="small"
                      disableRipple
                      checked={isSelected}
                      slotProps={{
                        input: {
                          id: `${labelId}-option-${option.value}`,
                          'aria-label': `${option.label} checkbox`,
                        },
                      }}
                      {...slotProps?.checkbox}
                    />
                  )}
                  {option.label}
                </li>
              );
            }}
            renderTags={(value, getTagProps) => {
              if (!chip) {
                // If chip is false, show comma-separated text in a single element
                const text = value.map((option) => option.label).join(', ');
                return (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      color: 'text.primary',
                      typography: 'body2',
                    }}
                  >
                    {text}
                  </Box>
                );
              }

              // Render chips
              return value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.value}
                  size="small"
                  variant="soft"
                  label={option.label}
                  {...slotProps?.chip}
                />
              ));
            }}
            slotProps={{
              ...slotProps?.autocomplete,
              paper: {
                ...slotProps?.autocomplete?.paper,
                sx: [
                  { maxHeight: listboxMaxHeight, overflow: 'hidden' },
                  ...(Array.isArray(slotProps?.autocomplete?.paper?.sx)
                    ? slotProps.autocomplete.paper.sx
                    : [slotProps?.autocomplete?.paper?.sx].filter(Boolean)),
                ],
              },
              listbox: {
                ...slotProps?.autocomplete?.listbox,
                sx: [
                  { maxHeight: listboxMaxHeight, overflowY: 'auto' },
                  ...(Array.isArray(slotProps?.autocomplete?.listbox?.sx)
                    ? slotProps.autocomplete.listbox.sx
                    : [slotProps?.autocomplete?.listbox?.sx].filter(Boolean)),
                ],
              },
            }}
            {...other}
            sx={[
              ...(Array.isArray(other.sx) ? other.sx : [other.sx].filter(Boolean)),
              ...(other.disabled ? [disabledFieldSx] : []),
            ]}
          />
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------
// Autocomplete Component
// ----------------------------------------------------------------------

/**
 * React Hook Form Autocomplete component
 * Handles autocomplete input with search functionality
 * @param {string} name - Field name (required)
 * @param {string} label - Field label
 * @param {object} slotProps - MUI slot props for customization
 * @param {ReactNode} helperText - Helper text to display
 * @param {string} placeholder - Placeholder text
 * @param {object} other - Additional props passed to Autocomplete
 */
export function RHFAutocomplete({ name, label, slotProps, helperText, placeholder, rules, ...other }) {
  const { control, setValue } = useFormContext();

  const { textField, ...otherSlotProps } = slotProps ?? {};

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        // Handle input change with leading space prevention (user typing only).
        // "reset" and "clear" reasons must NOT call setValue because `value` is the
        // display text (a string), not the option object. The `onChange` handler
        // already sets the correct option object / null for those cases.
        const handleInputChange = (event, value, reason) => {
          if (reason !== 'input') return;
          if (typeof value === 'string') {
            const previousValue = typeof field.value === 'string' ? field.value : '';
            const cleanedValue = preventLeadingSpaces(value, previousValue);
            if (cleanedValue !== value) {
              setValue(name, cleanedValue, { shouldValidate: true });
              if (event?.target) {
                event.target.value = cleanedValue;
              }
            }
          }
        };

        return (
          <Autocomplete
            {...field}
            id={generateFieldId(name, 'rhf-autocomplete')}
            onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
            onInputChange={handleInputChange}
            renderInput={(params) => (
              <TextField
                {...params}
                {...textField}
                autoComplete="off"
                label={label}
                placeholder={placeholder}
                error={!!error}
                helperText={error?.message ?? helperText}
                slotProps={{
                  ...textField?.slotProps,
                  htmlInput: mergeComboboxHtmlInput(
                    generateFieldId(name, 'rhf-autocomplete'),
                    params.inputProps,
                    textField?.slotProps?.htmlInput
                  ),
                }}
              />
            )}
            slotProps={otherSlotProps}
            {...other}
            sx={[
              ...(Array.isArray(other.sx) ? other.sx : [other.sx].filter(Boolean)),
              ...(other.disabled ? [disabledFieldSx] : []),
            ]}
          />
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------
// Checkbox Components
// ----------------------------------------------------------------------

/**
 * React Hook Form Checkbox component
 * Handles single checkbox input
 * @param {object} sx - MUI sx prop
 * @param {string} name - Field name (required)
 * @param {string} label - Checkbox label
 * @param {object} slotProps - MUI slot props for customization
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} other - Additional props passed to FormControlLabel
 */
export function RHFCheckbox({ sx, name, label, slotProps, helperText, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box {...slotProps?.wrapper}>
          <FormControlLabel
            label={label}
            control={
              <Checkbox
                {...field}
                checked={!!field.value}
                {...slotProps?.checkbox}
                slotProps={{
                  ...slotProps?.checkbox?.slotProps,
                  input: {
                    id: generateFieldId(name, 'checkbox'),
                    ...(!label && { 'aria-label': `${name} checkbox` }),
                    ...slotProps?.checkbox?.slotProps?.input,
                  },
                }}
              />
            }
            sx={[
              { mx: 0 },
              ...(Array.isArray(sx) ? sx : [sx]),
              ...(other.disabled ? [disabledFieldSx] : []),
            ]}
            {...other}
          />

          <HelperText
            {...slotProps?.helperText}
            errorMessage={error?.message}
            helperText={helperText}
          />
        </Box>
      )}
    />
  );
}

/**
 * React Hook Form MultiCheckbox component
 * Handles multiple checkbox selection
 * @param {string} name - Field name (required)
 * @param {string} label - Field label
 * @param {Array} options - Array of {value, label} objects
 * @param {object} slotProps - MUI slot props for customization
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} other - Additional props passed to FormGroup
 */
export function RHFMultiCheckbox({ name, label, options, slotProps, helperText, ...other }) {
  const { control } = useFormContext();

  const getSelected = (selectedItems, item) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const fieldValue = handleMultiSelectValue(field.value);

        return (
          <FormControl
            component="fieldset"
            {...slotProps?.wrapper}
            sx={[...(other.disabled ? [disabledFieldSx] : []), ...(Array.isArray(slotProps?.wrapper?.sx) ? slotProps.wrapper.sx : [slotProps?.wrapper?.sx].filter(Boolean))]}
          >
            {label && (
              <FormLabel
                component="legend"
                {...slotProps?.formLabel}
                sx={[
                  { mb: 1, typography: 'body2' },
                  ...(Array.isArray(slotProps?.formLabel?.sx)
                    ? slotProps.formLabel.sx
                    : [slotProps?.formLabel?.sx]),
                ]}
              >
                {label}
              </FormLabel>
            )}

            <FormGroup {...other}>
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={fieldValue.includes(option.value)}
                      onChange={() => field.onChange(getSelected(fieldValue, option.value))}
                      {...slotProps?.checkbox}
                      slotProps={{
                        ...slotProps?.checkbox?.slotProps,
                        input: {
                          id: generateFieldId(option.label, 'checkbox'),
                          ...(!option.label && { 'aria-label': `${option.label} checkbox` }),
                          ...slotProps?.checkbox?.slotProps?.input,
                        },
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>

            <HelperText
              {...slotProps?.helperText}
              disableGutters
              errorMessage={error?.message}
              helperText={helperText}
            />
          </FormControl>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------
// Switch Components
// ----------------------------------------------------------------------

/**
 * React Hook Form Switch component
 * Handles single switch toggle
 * @param {string} name - Field name (required)
 * @param {ReactNode} helperText - Helper text to display
 * @param {string} label - Switch label
 * @param {object} slotProps - MUI slot props for customization
 * @param {object} sx - MUI sx prop
 * @param {object} other - Additional props passed to FormControlLabel
 */
export function RHFSwitch({ name, helperText, label, slotProps, sx, onChange, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box {...slotProps?.wrapper}>
          <FormControlLabel
            label={label}
            control={
              <Switch
                {...field}
                checked={!!field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  onChange?.(e, e.target.checked);
                }}
                {...slotProps?.switch}
                slotProps={{
                  ...slotProps?.switch?.slotProps,
                  input: {
                    id: generateFieldId(name, 'switch'),
                    ...(!label && { 'aria-label': `${name} switch` }),
                    ...slotProps?.switch?.slotProps?.input,
                  },
                }}
              />
            }
            sx={[
              { mx: 0 },
              ...(Array.isArray(sx) ? sx : [sx]),
              ...(other.disabled ? [disabledFieldSx] : []),
            ]}
            {...other}
          />

          <HelperText
            {...slotProps?.helperText}
            errorMessage={error?.message}
            helperText={helperText}
          />
        </Box>
      )}
    />
  );
}

/**
 * React Hook Form MultiSwitch component
 * Handles multiple switch toggles
 * @param {string} name - Field name (required)
 * @param {string} label - Field label
 * @param {Array} options - Array of {value, label} objects
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} slotProps - MUI slot props for customization
 * @param {object} other - Additional props passed to FormGroup
 */
export function RHFMultiSwitch({ name, label, options, helperText, slotProps, ...other }) {
  const { control } = useFormContext();

  const getSelected = (selectedItems, item) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const fieldValue = handleMultiSelectValue(field.value);

        return (
          <FormControl
            component="fieldset"
            {...slotProps?.wrapper}
            sx={[...(other.disabled ? [disabledFieldSx] : []), ...(Array.isArray(slotProps?.wrapper?.sx) ? slotProps.wrapper.sx : [slotProps?.wrapper?.sx].filter(Boolean))]}
          >
            {label && (
              <FormLabel
                component="legend"
                {...slotProps?.formLabel}
                sx={[
                  { mb: 1, typography: 'body2' },
                  ...(Array.isArray(slotProps?.formLabel?.sx)
                    ? slotProps.formLabel.sx
                    : [slotProps?.formLabel?.sx]),
                ]}
              >
                {label}
              </FormLabel>
            )}

            <FormGroup {...other}>
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Switch
                      checked={fieldValue.includes(option.value)}
                      onChange={() => field.onChange(getSelected(fieldValue, option.value))}
                      {...slotProps?.switch}
                      slotProps={{
                        ...slotProps?.switch?.slotProps,
                        input: {
                          id: generateFieldId(option.label, 'switch'),
                          ...(!option.label && {
                            'aria-label': `${option.label} switch`,
                          }),
                          ...slotProps?.switch?.slotProps?.input,
                        },
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>

            <HelperText
              {...slotProps?.helperText}
              disableGutters
              errorMessage={error?.message}
              helperText={helperText}
            />
          </FormControl>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------
// RadioGroup Component
// ----------------------------------------------------------------------

/**
 * React Hook Form RadioGroup component
 * Handles radio button group selection
 * @param {object} sx - MUI sx prop
 * @param {string} name - Field name (required)
 * @param {string} label - Field label
 * @param {Array} options - Array of {value, label} objects
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} slotProps - MUI slot props for customization
 * @param {object} other - Additional props passed to RadioGroup
 */
export function RHFRadioGroup({ sx, name, label, options, helperText, slotProps, ...other }) {
  const { control } = useFormContext();

  const labelledby = generateFieldId(name, 'radios');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          component="fieldset"
          {...slotProps?.wrapper}
          sx={[...(other.disabled ? [disabledFieldSx] : []), ...(Array.isArray(slotProps?.wrapper?.sx) ? slotProps.wrapper.sx : [slotProps?.wrapper?.sx].filter(Boolean))]}
        >
          {label && (
            <FormLabel
              id={labelledby}
              component="legend"
              {...slotProps?.formLabel}
              sx={[
                { mb: 1, typography: 'body2' },
                ...(Array.isArray(slotProps?.formLabel?.sx)
                  ? slotProps.formLabel.sx
                  : [slotProps?.formLabel?.sx]),
              ]}
            >
              {label}
            </FormLabel>
          )}

          <RadioGroup {...field} aria-labelledby={labelledby} sx={sx} {...other}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={
                  <Radio
                    {...slotProps?.radio}
                    slotProps={{
                      ...slotProps?.radio?.slotProps,
                      input: {
                        id: generateFieldId(option.label, 'radio'),
                        ...(!option.label && { 'aria-label': `${option.label} radio` }),
                        ...slotProps?.radio?.slotProps?.input,
                      },
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </RadioGroup>

          <HelperText
            {...slotProps?.helperText}
            disableGutters
            errorMessage={error?.message}
            helperText={helperText}
          />
        </FormControl>
      )}
    />
  );
}

// ----------------------------------------------------------------------
// NumberInput Component
// ----------------------------------------------------------------------

/**
 * React Hook Form NumberInput component
 * Handles numeric input with increment/decrement buttons.
 * Supports label (rendered above) and placeholder (passed to input).
 * @param {string} name - Field name (required)
 * @param {string} label - Label text shown above the input
 * @param {string} placeholder - Placeholder for the input
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} slotProps - Slot props for wrapper, label, and NumberInput
 * @param {object} other - Additional props passed to NumberInput
 */
export function RHFNumberInput({ name, label, placeholder, helperText, slotProps: slotPropsProp, ...other }) {
  const { control } = useFormContext();
  const labelId = generateFieldId(name, 'number-input');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const slotProps = {
          ...slotPropsProp,
          input: {
            ...slotPropsProp?.input,
            ...(placeholder != null && placeholder !== '' && {
              placeholder,
            }),
            ...(label && {
              id: labelId,
              'aria-labelledby': labelId ? `${labelId}-label` : undefined,
            }),
          },
        };

        return (
          <Box
            {...slotPropsProp?.wrapper}
            sx={[
              { display: 'flex', flexDirection: 'column', alignItems: 'stretch' },
              ...(Array.isArray(slotPropsProp?.wrapper?.sx)
                ? slotPropsProp.wrapper.sx
                : [slotPropsProp?.wrapper?.sx].filter(Boolean)),
            ]}
          >
            {label && (
              <FormLabel
                id={labelId ? `${labelId}-label` : undefined}
                sx={[
                  { mb: 0.75, typography: 'body2', color: 'text.primary' },
                  ...(Array.isArray(slotPropsProp?.label?.sx)
                    ? slotPropsProp.label.sx
                    : [slotPropsProp?.label?.sx].filter(Boolean)),
                ]}
                {...slotPropsProp?.label}
              >
                {label}
                {other.required && (
                  <Box component="span" sx={{ color: 'error.main', ml: 0.25 }} aria-hidden>
                    *
                  </Box>
                )}
              </FormLabel>
            )}
            <NumberInput
              {...field}
              onChange={(event, value) => field.onChange(value)}
              {...other}
              error={!!error}
              helperText={error?.message ?? helperText}
              slotProps={slotProps}
              sx={[
                ...(Array.isArray(other.sx) ? other.sx : [other.sx].filter(Boolean)),
                ...(other.disabled ? [disabledFieldSx] : []),
              ]}
            />
          </Box>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------
// CountrySelect Component
// ----------------------------------------------------------------------

/**
 * React Hook Form CountrySelect component
 * Handles country selection with flag display
 * @param {string} name - Field name (required)
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} other - Additional props passed to CountrySelect
 */
export function RHFCountrySelect({ name, helperText, ...other }) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <CountrySelect
          id={generateFieldId(name, 'rhf-country-select')}
          value={field.value ?? ''}
          onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
          error={!!error}
          helperText={error?.message ?? helperText}
          {...other}
          sx={[
            ...(Array.isArray(other.sx) ? other.sx : [other.sx].filter(Boolean)),
            ...(other.disabled ? [disabledFieldSx] : []),
          ]}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------
// Upload Components
// ----------------------------------------------------------------------

/**
 * React Hook Form Upload — stores `File` objects in the form state (no cloud upload in theme).
 * Props `useS3`, `s3Mode`, `compressImage`, and `compressImageOptions` are accepted for API
 * compatibility but ignored; wire your own upload in the app when needed.
 */
export function RHFUpload({
  name,
  multiple,
  useS3: _useS3,
  s3Mode: _s3Mode,
  compressImage: _compressImage,
  compressImageOptions: _compressImageOptions,
  helperText,
  ...other
}) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const uploadProps = {
          multiple,
          accept: { 'image/*': [] },
          error: !!error,
          helperText: error?.message ?? helperText,
          disabled: other.disabled,
        };

        const onDelete = () => {
          if (other.disabled) return;
          setValue(name, multiple ? [] : null, { shouldValidate: true });
        };

        const onDrop = (acceptedFiles, fileRejections) => {
          if (other.disabled) return;
          if (fileRejections.length > 0) return;
          if (acceptedFiles.length === 0) return;

          const value = multiple
            ? [...(Array.isArray(field.value) ? field.value : field.value ? [field.value] : []), ...acceptedFiles]
            : acceptedFiles[0];

          setValue(name, value, { shouldValidate: true });
        };

        return (
          <Upload
            {...uploadProps}
            value={field.value}
            onDrop={onDrop}
            onDelete={onDelete}
            {...other}
            sx={[
              ...(Array.isArray(other.sx) ? other.sx : [other.sx].filter(Boolean)),
              ...(other.disabled ? [disabledFieldSx] : []),
            ]}
          />
        );
      }}
    />
  );
}

/**
 * React Hook Form UploadBox component
 * Handles file upload in box format
 * @param {string} name - Field name (required)
 * @param {object} other - Additional props passed to UploadBox
 */
export function RHFUploadBox({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox
          value={field.value}
          error={!!error}
          {...other}
          sx={[
            ...(Array.isArray(other.sx) ? other.sx : [other.sx].filter(Boolean)),
            ...(other.disabled ? [disabledFieldSx] : []),
          ]}
        />
      )}
    />
  );
}

/**
 * React Hook Form UploadAvatar — stores a `File` in form state (no cloud upload in theme).
 * Props `useS3`, `s3Mode`, `compressImage`, and `compressImageOptions` are ignored for API compatibility.
 */
export function RHFUploadAvatar({
  name,
  useS3: _useS3,
  s3Mode: _s3Mode,
  compressImage: _compressImage,
  compressImageOptions: _compressImageOptions,
  slotProps,
  ...other
}) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const onDrop = (acceptedFiles, fileRejections) => {
          if (other.disabled) return;
          if (fileRejections.length > 0) return;
          if (acceptedFiles.length === 0) return;

          setValue(name, acceptedFiles[0], { shouldValidate: true });
        };

        return (
          <Box
            {...slotProps?.wrapper}
            sx={[
              ...(other.disabled ? [disabledFieldSx] : []),
              ...(Array.isArray(slotProps?.wrapper?.sx)
                ? slotProps.wrapper.sx
                : [slotProps?.wrapper?.sx].filter(Boolean)),
            ]}
          >
            <UploadAvatar
              value={field.value}
              error={!!error}
              onDrop={onDrop}
              disabled={other.disabled}
              {...other}
            />

            <HelperText errorMessage={error?.message} sx={{ textAlign: 'center' }} />
          </Box>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------
// Code Component
// ----------------------------------------------------------------------

/**
 * React Hook Form Code component (OTP Input)
 * Handles one-time password input
 * @param {string} name - Field name (required)
 * @param {object} slotProps - MUI slot props for customization
 * @param {ReactNode} helperText - Helper text to display
 * @param {number} maxSize - Maximum size for input boxes
 * @param {string} placeholder - Placeholder character
 * @param {object} other - Additional props passed to MuiOtpInput
 */
export function RHFCode({
  name,
  slotProps,
  helperText,
  maxSize = 56,
  placeholder = '-',
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box
          {...slotProps?.wrapper}
          sx={[
            {
              [`& .${inputBaseClasses.input}`]: {
                p: 0,
                height: 'auto',
                aspectRatio: '1/1',
                maxWidth: maxSize,
              },
            },
            ...(Array.isArray(slotProps?.wrapper?.sx)
              ? slotProps.wrapper.sx
              : [slotProps?.wrapper?.sx]),
            ...(other.disabled ? [disabledFieldSx] : []),
          ]}
        >
          <MuiOtpInput
            {...field}
            autoFocus
            gap={1.5}
            length={6}
            TextFieldsProps={{
              placeholder,
              error: !!error,
              ...slotProps?.textField,
            }}
            {...other}
          />

          <HelperText
            {...slotProps?.helperText}
            errorMessage={error?.message}
            helperText={helperText}
          />
        </Box>
      )}
    />
  );
}

// ----------------------------------------------------------------------
// Rating Component
// ----------------------------------------------------------------------

/**
 * React Hook Form Rating component
 * Handles star rating input
 * @param {string} name - Field name (required)
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} slotProps - MUI slot props for customization
 * @param {object} other - Additional props passed to Rating
 */
export function RHFRating({ name, helperText, slotProps, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box
          {...slotProps?.wrapper}
          sx={[
            { display: 'flex', flexDirection: 'column' },
            ...(Array.isArray(slotProps?.wrapper?.sx)
              ? slotProps.wrapper.sx
              : [slotProps?.wrapper?.sx]),
            ...(other.disabled ? [disabledFieldSx] : []),
          ]}
        >
          <Rating
            {...field}
            onChange={(event, newValue) => field.onChange(Number(newValue))}
            {...other}
          />

          <HelperText
            {...slotProps?.helperText}
            disableGutters
            errorMessage={error?.message}
            helperText={helperText}
          />
        </Box>
      )}
    />
  );
}

// ----------------------------------------------------------------------
// Slider Component
// ----------------------------------------------------------------------

/**
 * React Hook Form Slider component
 * Handles range slider input
 * @param {string} name - Field name (required)
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} slotProps - MUI slot props for customization
 * @param {object} other - Additional props passed to Slider
 */
export function RHFSlider({ name, helperText, slotProps, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box
          {...slotProps?.wrapper}
          sx={[
            ...(other.disabled ? [disabledFieldSx] : []),
            ...(Array.isArray(slotProps?.wrapper?.sx) ? slotProps.wrapper.sx : [slotProps?.wrapper?.sx].filter(Boolean)),
          ]}
        >
          <Slider {...field} valueLabelDisplay="auto" {...other} />

          <HelperText
            {...slotProps?.helperText}
            disableGutters
            errorMessage={error?.message}
            helperText={helperText}
          />
        </Box>
      )}
    />
  );
}

// ----------------------------------------------------------------------
// Button Component
// ----------------------------------------------------------------------

/**
 * Normalizes icon prop - handles string (iconify) or ReactNode
 * @param {string|ReactNode} icon - Icon as string or ReactNode
 * @returns {ReactNode|null} - Normalized icon component or null
 */
function normalizeIcon(icon) {
  if (!icon) return null;
  if (typeof icon === 'string') {
    return <Iconify icon={icon} />;
  }
  return icon;
}

/**
 * Button component that uses form context
 */
function RHFButtonWithForm({
  loading: loadingProp,
  formLoading,
  ...buttonProps
}) {
  // Determine loading state: manual > formState > false
  const loading = loadingProp !== undefined ? loadingProp : formLoading;
  return <RHFButtonBase loading={loading} {...buttonProps} />;
}

/**
 * Base button component (no form context)
 */
function RHFButtonBase({
  loading: loadingProp = false,
  type = 'button',
  startIcon: startIconProp,
  endIcon: endIconProp,
  icon: iconProp,
  loadingIndicator,
  loadingPosition = 'start',
  variant,
  color,
  size,
  fullWidth,
  disabled: disabledProp,
  children,
  ...other
}) {
  // Determine disabled state: manual > loading
  const disabled = disabledProp !== undefined ? disabledProp : loadingProp;

  // Normalize icons (handle string as Iconify icon)
  const startIcon = normalizeIcon(startIconProp);
  const endIcon = normalizeIcon(endIconProp);
  const icon = normalizeIcon(iconProp);

  // Handle icon-only button
  const isIconOnly = !!icon && !children;

  // Handle loading with icons
  // When loading, hide icons and show loading indicator in position
  const finalStartIcon = loadingProp && loadingPosition === 'start' ? null : !loadingProp ? startIcon : null;
  const finalEndIcon = loadingProp && loadingPosition === 'end' ? null : !loadingProp ? endIcon : null;

  // Validate: icon-only button should have aria-label for accessibility
  if (isIconOnly && !other['aria-label'] && process.env.NODE_ENV !== 'production') {
    console.warn('RHFButton: Icon-only button should have an aria-label for accessibility.');
  }

  // Filter out internal MUI ButtonBase ref props that shouldn't be passed to DOM elements
  // These are internal refs used by ButtonBase and should not be spread to the Button component
  const {
    touchRippleRef: _touchRippleRef,
    focusRipple: _focusRipple,
    centerRipple: _centerRipple,
    ...buttonProps
  } = other;

  // If icon prop is provided, render icon-only button
  if (isIconOnly) {
    return (
      <Button
        type={type}
        variant={variant}
        color={color}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        loading={loadingProp}
        loadingIndicator={loadingIndicator}
        loadingPosition={loadingPosition}
        {...buttonProps}
        sx={[
          ...(Array.isArray(buttonProps.sx) ? buttonProps.sx : [buttonProps.sx].filter(Boolean)),
          ...(disabled ? [disabledFieldSx] : []),
        ]}
      >
        {icon}
      </Button>
    );
  }

  // Render button with text and optional icons
  return (
    <Button
      type={type}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      loading={loadingProp}
      loadingIndicator={loadingIndicator}
      loadingPosition={loadingPosition}
      startIcon={finalStartIcon}
      endIcon={finalEndIcon}
      {...buttonProps}
      sx={[
        ...(Array.isArray(buttonProps.sx) ? buttonProps.sx : [buttonProps.sx].filter(Boolean)),
        ...(disabled ? [disabledFieldSx] : []),
      ]}
    >
      {children}
    </Button>
  );
}

/**
 * React Hook Form Button component
 * Handles button with form integration, loading states, and icon support
 * 
 * Note: If useFormState is true, component must be used within a Form component.
 * Set useFormState to false to use button outside form context (default behavior).
 * 
 * @param {boolean} useFormState - Use formState.isSubmitting for loading (default: false)
 * @param {boolean} loading - Manual loading state (overrides formState)
 * @param {string} type - Button type: 'button' | 'submit' | 'reset' (default: 'button')
 * @param {ReactNode|string} startIcon - Icon before text (string will be wrapped with Iconify)
 * @param {ReactNode|string} endIcon - Icon after text (string will be wrapped with Iconify)
 * @param {ReactNode|string} icon - Single icon (no text) - replaces children (string will be wrapped with Iconify)
 * @param {string} loadingIndicator - Custom loading text
 * @param {string} loadingPosition - Loading spinner position: 'start' | 'end' | 'center' (default: 'start')
 * @param {string} variant - Button variant: 'text' | 'outlined' | 'contained' | 'soft'
 * @param {string} color - Button color: 'inherit' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'
 * @param {string} size - Button size: 'small' | 'medium' | 'large'
 * @param {boolean} fullWidth - Full width button
 * @param {boolean} disabled - Disabled state
 * @param {ReactNode} children - Button content
 * @param {object} other - Additional props passed to Button
 */
export function RHFButton({
  useFormState = false,
  loading: loadingProp,
  ...buttonProps
}) {
  if (useFormState) {
    return <RHFButtonFormLoader loading={loadingProp} {...buttonProps} />;
  }
  return <RHFButtonBase loading={loadingProp} {...buttonProps} />;
}

/**
 * Loader that reads form context and passes formLoading to RHFButtonWithForm.
 * Only rendered when useFormState is true so hooks are not conditional in parent.
 */
function RHFButtonFormLoader({ loading: loadingProp, ...buttonProps }) {
  const formContext = useFormContext();
  const formLoading = formContext?.formState?.isSubmitting ?? false;
  return <RHFButtonWithForm loading={loadingProp} formLoading={formLoading} {...buttonProps} />;
}

// ----------------------------------------------------------------------
// Editor Component (Lazy-loaded)
// ----------------------------------------------------------------------

// Lazy-load RHFEditor to prevent Tiptap (~200KB) from bundling into every page using Field.*
const LazyRHFEditor = lazy(() =>
  import('src/components/hook-form/rhf-editor').then((mod) => ({ default: mod.RHFEditor }))
);

/**
 * React Hook Form Editor component (Lazy-loaded)
 * Handles rich text editor input
 * @param {string} name - Field name (required)
 * @param {ReactNode} helperText - Helper text to display
 * @param {object} other - Additional props passed to Editor
 */
function RHFEditorLazy(props) {
  return (
    <Suspense fallback={<div style={{ minHeight: 200 }} />}>
      <LazyRHFEditor {...props} />
    </Suspense>
  );
}

// ----------------------------------------------------------------------
// ChipStrip Component (presentational + RHF)
// ----------------------------------------------------------------------

const CHIP_STRIP_MIN_TOUCH_HEIGHT = 44;
const CHIP_STRIP_SKELETON_WIDTHS = [72, 96, 88, 64, 80];

/**
 * Normalizes a chip strip option to { id, label }.
 * Supports object ({ id, name, label }) or primitive (used as id and label).
 * @param {object|string|number} item - Raw option item
 * @returns {{ id: string|number, label: string }}
 */
function normalizeChipStripOption(item) {
  if (item === null || item === undefined) {
    return { id: '', label: '' };
  }
  if (typeof item === 'object' && item !== null) {
    const id = item.id ?? item.value ?? '';
    const label = [item.name, item.label, item.title].find((v) => v != null && v !== '') ?? String(id);
    return { id, label };
  }
  const v = String(item);
  return { id: v, label: v };
}

/**
 * Presentational horizontal scrollable chip strip (single selection).
 * Use with value/onChange (controlled) or via RHFChipStrip with name (form).
 * Min 44px touch targets per spec.
 *
 * @param {Array<object|string|number>} categories - List of options (objects with id/name/label or primitives)
 * @param {string|number|null} selectedId - Currently selected option id (null = "All" selected)
 * @param {function(string|number|null): void} onSelect - Called when selection changes
 * @param {boolean} loading - Show skeleton placeholders
 * @param {string} allOptionLabel - Label for "All" chip (default: "All Products")
 * @param {boolean} showAllOption - Show the "All" chip (default: true)
 * @param {function(any): string|number} getOptionId - Custom id getter (optional)
 * @param {function(any): string} getOptionLabel - Custom label getter (optional)
 * @param {boolean} disabled - Disabled state (cursor no-drop, grey bg)
 * @param {boolean} error - Error state (e.g. failed required validation)
 * @param {object} slotProps - MUI slot props (wrapper sx, etc.)
 * @param {string} color - Chip color (default: "primary")
 * @param {string} variant - Chip variant
 * @param {number} minTouchHeight - Min height for touch targets (default: 44)
 */
export function ChipStripUI({
  categories = [],
  selectedId,
  onSelect,
  loading = false,
  allOptionLabel = 'All Products',
  showAllOption = true,
  getOptionId,
  getOptionLabel,
  disabled = false,
  error = false,
  slotProps,
  color = 'primary',
  variant,
  minTouchHeight = CHIP_STRIP_MIN_TOUCH_HEIGHT,
  ...other
}) {
  const normalizedCategories = Array.isArray(categories) ? categories : [];
  const getId = getOptionId ?? ((item) => normalizeChipStripOption(item).id);
  const getLabel = getOptionLabel ?? ((item) => normalizeChipStripOption(item).label);

  const chipErrorSx = error
    ? [
        { border: '1px solid', borderColor: 'error.main' },
      ]
    : [];

  return (
    <Box
      {...slotProps?.wrapper}
      aria-invalid={error ? 'true' : undefined}
      sx={[
        {
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          minHeight: minTouchHeight + 8,
          alignItems: 'center',
          '&::-webkit-scrollbar': { height: 6 },
        },
        ...(Array.isArray(slotProps?.wrapper?.sx)
          ? slotProps.wrapper.sx
          : [slotProps?.wrapper?.sx].filter(Boolean)),
        ...(disabled ? [disabledFieldSx] : []),
        ...(Array.isArray(other.sx) ? other.sx : [other.sx].filter(Boolean)),
      ]}
    >
      {showAllOption && (
        <Chip
          label={allOptionLabel}
          onClick={() => !disabled && onSelect?.(null)}
          variant={selectedId === null || selectedId === undefined ? 'filled' : 'outlined'}
          color={color}
          disabled={disabled}
          sx={[{ minHeight: minTouchHeight, flexShrink: 0 }, ...chipErrorSx]}
        />
      )}
      {loading
        ? CHIP_STRIP_SKELETON_WIDTHS.map((width, i) => (
            <Skeleton
              key={`skeleton-${i}`}
              variant="rounded"
              width={width}
              height={minTouchHeight}
              sx={{ flexShrink: 0 }}
            />
          ))
        : normalizedCategories.map((cat, index) => {
            const id = getId(cat);
            const label = getLabel(cat);
            const isSelected =
              id === selectedId ||
              (selectedId != null && String(id) === String(selectedId));
            return (
              <Chip
                key={id != null && id !== '' ? id : `cat-${index}`}
                label={label != null && label !== '' ? label : String(id)}
                onClick={() => !disabled && onSelect?.(id)}
                variant={isSelected ? 'filled' : 'outlined'}
                color={color}
                disabled={disabled}
                sx={[{ minHeight: minTouchHeight, flexShrink: 0 }, ...chipErrorSx]}
              />
            );
          })}
    </Box>
  );
}

/**
 * Normalizes ChipStrip form value for display and validation.
 * Treats null, undefined, and empty string as "no selection".
 * @param {any} value - Raw field value
 * @returns {string|number|null} - Normalized selected id or null
 */
function normalizeChipStripValue(value) {
  if (value === null || value === undefined) return null;
  if (value === '') return null;
  return value;
}

/**
 * React Hook Form ChipStrip component.
 * Renders a horizontal scrollable chip strip; value is the selected option id (null = "All" or no selection).
 * Shows validation error (e.g. required) via HelperText and error state on the strip.
 *
 * @param {string} name - Field name (required)
 * @param {Array<object|string|number>} categories - List of options
 * @param {boolean} loading - Show loading skeletons
 * @param {string} allOptionLabel - Label for "All" chip
 * @param {boolean} showAllOption - Show the "All" chip (default: true)
 * @param {function(any): string|number} getOptionId - Custom id getter
 * @param {function(any): string} getOptionLabel - Custom label getter
 * @param {ReactNode} helperText - Optional helper text below the strip
 * @param {object} slotProps - Slot props for wrapper and helperText
 * @param {object} other - Additional props passed to ChipStripUI
 */
export function RHFChipStrip({
  name,
  categories = [],
  loading = false,
  allOptionLabel = 'All Products',
  showAllOption = true,
  getOptionId,
  getOptionLabel,
  helperText,
  slotProps,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const normalizedValue = normalizeChipStripValue(field.value);
        const handleSelect = (newId) => {
          field.onChange(normalizeChipStripValue(newId));
        };

        return (
          <Box
            {...slotProps?.wrapper}
            sx={[
              { display: 'flex', flexDirection: 'column', alignItems: 'stretch' },
              ...(Array.isArray(slotProps?.wrapper?.sx)
                ? slotProps.wrapper.sx
                : [slotProps?.wrapper?.sx].filter(Boolean)),
            ]}
          >
            <ChipStripUI
              categories={categories}
              selectedId={normalizedValue}
              onSelect={handleSelect}
              loading={loading}
              allOptionLabel={allOptionLabel}
              showAllOption={showAllOption}
              getOptionId={getOptionId}
              getOptionLabel={getOptionLabel}
              error={!!error}
              slotProps={slotProps}
              {...other}
            />
            <HelperText
              {...slotProps?.helperText}
              disableGutters
              errorMessage={error?.message}
              helperText={helperText}
            />
          </Box>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------
// Export Field Namespace
// ----------------------------------------------------------------------

export const Field = {
  Code: RHFCode,
  Editor: RHFEditorLazy,
  Upload: RHFUpload,
  Switch: RHFSwitch,
  Slider: RHFSlider,
  Rating: RHFRating,
  Text: RHFTextField,
  Phone: RHFPhoneInput,
  Checkbox: RHFCheckbox,
  UploadBox: RHFUploadBox,
  RadioGroup: RHFRadioGroup,
  NumberInput: RHFNumberInput,
  MultiSelect: RHFMultiSelect,
  MultiSwitch: RHFMultiSwitch,
  UploadAvatar: RHFUploadAvatar,
  Autocomplete: RHFAutocomplete,
  MultiCheckbox: RHFMultiCheckbox,
  CountrySelect: RHFCountrySelect,
  Button: RHFButton,
  ChipStrip: RHFChipStrip,
  // Pickers
  DatePicker: RHFDatePicker,
  TimePicker: RHFTimePicker,
  DateTimePicker: RHFDateTimePicker,
};

