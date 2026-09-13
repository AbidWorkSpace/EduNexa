/**
 * Disables native browser autofill/datalist overlays that clash with MUI Autocomplete popovers.
 * Merge with params.inputProps from Autocomplete renderInput.
 *
 * @param {string} labelId - Stable id for the input (and name prefix)
 * @param {object} paramsInputProps - Autocomplete TextField params.inputProps
 * @param {object} [extra] - Caller htmlInput props (applied before forced attrs)
 * @returns {object} htmlInput props for TextField slotProps.htmlInput
 */
export function mergeComboboxHtmlInput(labelId, paramsInputProps, extra = {}) {
  const safeId = String(labelId || 'combobox').replace(/[^a-zA-Z0-9_-]/g, '-');
  return {
    ...paramsInputProps,
    ...extra,
    id: extra.id ?? labelId,
    autoComplete: 'off',
    name: `${safeId}-combobox`,
    'data-lpignore': 'true',
    'data-1p-ignore': 'true',
    'data-form-type': 'other',
  };
}
