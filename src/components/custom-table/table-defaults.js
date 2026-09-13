// ----------------------------------------------------------------------
// Default Configurations for CustomTable
// ----------------------------------------------------------------------

export const DEFAULT_PAGINATION = {
  enabled: true,
  mode: 'client',
  pageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
};

export const DEFAULT_SORTING = {
  enabled: false,
  mode: 'client',
  disableMultipleColumns: false,
};

export const DEFAULT_FILTERING = {
  enabled: false,
  mode: 'client',
  quickFilter: false,
  disableMultipleColumns: false,
};

export const DEFAULT_SELECTION = {
  enabled: false,
  checkboxSelection: false,
  disableRowSelectionOnClick: false,
};

export const DEFAULT_TOOLBAR = {
  /** Use CustomToolbar so the grid does not fall back to MUI default toolbar (which includes Export). */
  show: true,
  quickFilter: false,
  /** Opt-in per view: pass toolbar={{ export: true }} to show Export. */
  export: false,
  columns: true,
  filter: false,
  settings: true,
  position: 'top',
};

export const DEFAULT_DENSITY = 'standard';

export const DEFAULT_ACTIONS_COLUMN = {
  field: 'actions',
  headerName: 'Actions',
  // width is not set here - it will be calculated dynamically based on number of actions
  // If explicit width is needed, it can be provided via actionsColumnOptions
  align: 'right',
  headerAlign: 'right',
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  hideInMenu: false,
};

export const DEFAULT_GRID_HEIGHT = 400;

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Toolbar primary action (Create / Register / etc.) in list filter rows.
 * Filter fields often use `size="small"`; primary buttons typically use default (medium) size.
 */
export const LIST_TOOLBAR_PRIMARY_ACTION_SX = { ml: { sm: 'auto' }, flexShrink: 0 };

/** Default minWidth for flex columns when not set (improves mobile readability and horizontal scroll) */
export const DEFAULT_FLEX_COLUMN_MIN_WIDTH = 100;

/** Default autosize options: size to content including headers, expand to fill remaining width */
export const DEFAULT_AUTOSIZE_OPTIONS = {
  includeHeaders: true,
  expand: true,
};

/** Show actions dropdown on mobile when visible action count is greater than this (otherwise show icon row) */
export const ACTIONS_DROPDOWN_THRESHOLD = 2;

/** Actions column width on mobile: fits dropdown (1 button) or up to 2 icons; keeps more space for data columns */
export const ACTIONS_COLUMN_MOBILE_WIDTH = 128;

/** Desktop actions column: horizontal padding + per-icon slot + gap (tight fit to action count) */
export const ACTIONS_COLUMN_DESKTOP_PAD_X = 12;
export const ACTIONS_COLUMN_ICON_SLOT = 38;
export const ACTIONS_COLUMN_ICON_GAP = 4;

/**
 * Minimum horizontal overscan (MUI `columnBufferPx`) when the actions column is sticky.
 * Default DataGrid buffer (~150px) is too small: column virtualization unmounts trailing columns
 * (e.g. Status, Notes, Actions), so the sticky rail never mounts. This keeps the tail columns in the DOM.
 * Consumers may set a higher `columnBufferPx`; we use Math.max(theirs, this floor).
 */
export const STICKY_ACTIONS_MIN_COLUMN_BUFFER_PX = 1600;

