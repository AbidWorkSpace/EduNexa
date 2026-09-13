'use client';

import { FormProvider } from 'react-hook-form';
import { memo, useRef, useMemo, Component, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Toolbar, DataGrid, gridClasses } from '@mui/x-data-grid';

import { getApiErrorMessage } from 'src/utils/api-error-message';
import { useActionsColumn, createActionsColumn } from 'src/utils/create-actions-column';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import {
  useToolbarSettings,
  CustomToolbarQuickFilter,
  CustomToolbarExportButton,
  CustomToolbarFilterButton,
  CustomToolbarColumnsButton,
  CustomToolbarSettingsButton,
} from 'src/components/custom-data-grid';

import { useCustomTable } from './use-custom-table';
import { buildStickyActionsColumnSx } from './sticky-actions-column-sx';
import { useListDeleteToggleActions } from './use-list-delete-toggle-actions';
import { normalizeRows, normalizeColumns, normalizeToolbar, hasConfirmationDialogs } from './table-utils';
import {
  DEFAULT_DENSITY,
  DEFAULT_TOOLBAR,
  DEFAULT_ACTIONS_COLUMN,
  DEFAULT_AUTOSIZE_OPTIONS,
  STICKY_ACTIONS_MIN_COLUMN_BUFFER_PX,
} from './table-defaults';

// ----------------------------------------------------------------------
// CustomTable Component
// ----------------------------------------------------------------------

/**
 * CustomTable - A production-grade wrapper around MUI X DataGrid
 *
 * @param {object} props - Component props
 * @param {Array} props.rows - Data array (required)
 * @param {Array} props.columns - GridColDef array (required)
 * @param {boolean} props.loading - Loading state
 * @param {Array} props.actions - Actions config for createActionsColumn
 * @param {object} props.actionsColumnOptions - Options for actions column
 * @param {object|boolean} props.pagination - Pagination config
 * @param {object|boolean} props.sorting - Sorting config
 * @param {object|boolean} props.filtering - Filtering config
 * @param {object|boolean} props.selection - Row selection config
 * @param {object|boolean|ReactNode} props.toolbar - Toolbar config
 * @param {string} props.density - Row density: 'compact' | 'standard' | 'comfortable'
 * @param {number|string} props.height - Grid height
 * @param {object} props.sx - MUI sx prop
 * @param {object} props.slots - Custom DataGrid slots
 * @param {object} props.slotProps - Custom DataGrid slotProps
 * @param {Function} props.onRowClick - Row click handler
 * @param {Function} props.onCellClick - Cell click handler
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {Function} props.getRowId - Custom row ID getter
 * @param {Function} props.getRowClassName - Dynamic row className
 * @param {object} props.initialState - Initial grid state
 * @param {ReactNode} props.emptyContent - Custom empty content component
 * @param {unknown} props.error - RTK Query / API error; when set, table shows error state instead of grid
 * @param {Function} [props.onRetry] - Callback when user clicks Retry (e.g. refetch)
 * @param {string} [props.errorEntityLabel] - Label for error message, e.g. "recipes" -> "Error loading recipes"
 * @param {object} [props.errorMessageOptions] - Options for getApiErrorMessage (e.g. noContextMessage for 5xx tenant-context). HTTP 403 uses a fixed app-wide message.
 * @param {object} [props.deleteActionConfig] - Optional config for built-in delete action (mutation, permission, messages, ConfirmDialog)
 * @param {object} [props.toggleActionConfig] - Optional config for built-in toggle-active action (mutation, permission, messages, Switch form)
 * @param {boolean} [props.stickyActionsColumn=true] - Stick the actions column to the end on horizontal scroll (CSS; free DataGrid has no pinnedColumns)
 * @param {object} props.otherProps - All other DataGrid props
 */
function CustomTableComponent({
  rows: rowsProp = [],
  columns: columnsProp = [],
  loading = false,
  actions,
  actionsColumnOptions,
  deleteActionConfig,
  toggleActionConfig,
  pagination: paginationProp,
  sorting: sortingProp,
  filtering: filteringProp,
  selection: selectionProp,
  toolbar: toolbarProp,
  density: densityProp,
  height,
  sx,
  slots: slotsProp,
  slotProps: slotPropsProp,
  onRowClick,
  onCellClick,
  onSelectionChange,
  getRowId,
  getRowClassName,
  initialState: initialStateProp,
  emptyContent,
  error: errorProp,
  onRetry,
  errorEntityLabel = 'data',
  errorMessageOptions,
  stickyActionsColumn = true,
  ...otherProps
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Normalize and validate data with error handling
  const rows = useMemo(() => {
    try {
      return normalizeRows(rowsProp, getRowId);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('CustomTable: Error normalizing rows:', error);
      }
      return [];
    }
  }, [rowsProp, getRowId]);

  const { builtInActions, DeleteConfirmDialog, toggleForm, hasToggle } = useListDeleteToggleActions(
    deleteActionConfig,
    toggleActionConfig,
    rows
  );

  const mergedActions = useMemo(
    () => [...(actions || []), ...builtInActions],
    [actions, builtInActions]
  );

  const baseColumns = useMemo(() => {
    try {
      return normalizeColumns(columnsProp);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('CustomTable: Error normalizing columns:', error);
      }
      return [];
    }
  }, [columnsProp]);

  // Memoize row IDs to prevent unnecessary re-renders
  const rowIdsRef = useRef(new Set());
  useEffect(() => {
    const newIds = new Set(rows.map((row) => row.id));
    const hasChanged = rowIdsRef.current.size !== newIds.size || 
      Array.from(rowIdsRef.current).some(id => !newIds.has(id));
    if (hasChanged) {
      rowIdsRef.current = newIds;
    }
  }, [rows]);

  // Check if actions need confirmation dialogs (only from consumer actions; built-in delete has its own dialog)
  const needsConfirmationDialog = useMemo(() => hasConfirmationDialogs(actions), [actions]);

  // Handle actions column with confirmation support (use mergedActions so built-in delete/toggle appear)
  const actionsColumnResult = useActionsColumn(mergedActions || [], {
    ...DEFAULT_ACTIONS_COLUMN,
    ...actionsColumnOptions,
    isMobile,
  });

  // Merge actions column if actions provided
  const columns = useMemo(() => {
    if (!mergedActions || mergedActions.length === 0) {
      return baseColumns;
    }

    const actionsColumn = needsConfirmationDialog
      ? actionsColumnResult.column
      : createActionsColumn(mergedActions, {
          ...DEFAULT_ACTIONS_COLUMN,
          ...actionsColumnOptions,
          isMobile,
        });

    if (!actionsColumn) {
      return baseColumns;
    }

    // Check if actions column already exists
    const hasActionsColumn = baseColumns.some((col) => col.type === 'actions' || col.field === 'actions');

    if (hasActionsColumn) {
      return baseColumns;
    }

    return [...baseColumns, actionsColumn];
  }, [baseColumns, mergedActions, actionsColumnOptions, needsConfirmationDialog, actionsColumnResult.column, isMobile]);

  const actionsStickyField = useMemo(
    () => (stickyActionsColumn ? columns.find((col) => col.type === 'actions')?.field ?? null : null),
    [columns, stickyActionsColumn]
  );

  // Use custom table hook for state management
  // Pagination callbacks: prefer from pagination config (views pass onPageChange there), fallback to top-level props
  const tableState = useCustomTable({
    rows,
    pagination: paginationProp,
    sorting: sortingProp,
    filtering: filteringProp,
    selection: selectionProp,
    getRowId,
    onSelectionChange,
    onPageChange: paginationProp?.onPageChange ?? otherProps.onPageChange,
    onPageSizeChange: paginationProp?.onPageSizeChange ?? otherProps.onPageSizeChange,
    onSortModelChange: otherProps.onSortModelChange,
    onFilterModelChange: otherProps.onFilterModelChange,
  });

  // Normalize toolbar configuration
  const toolbarConfig = useMemo(() => normalizeToolbar(toolbarProp ?? DEFAULT_TOOLBAR), [toolbarProp]);

  // Toolbar settings hook
  const toolbarSettings = useToolbarSettings(
    useMemo(
      () => ({
        density: densityProp || DEFAULT_DENSITY,
      }),
      [densityProp]
    )
  );

  // Build toolbar component
  const toolbarComponent = useMemo(() => {
    if (toolbarConfig === false || (typeof toolbarConfig === 'object' && !toolbarConfig.show)) {
      return null;
    }

    if (typeof toolbarConfig === 'object' && toolbarConfig.custom) {
      return toolbarConfig.custom;
    }

    if (typeof toolbarConfig === 'object' && toolbarConfig.show) {
      return (
        <CustomToolbar
          settings={toolbarSettings.settings}
          onChangeSettings={toolbarSettings.onChangeSettings}
          config={toolbarConfig}
        />
      );
    }

    return null;
  }, [toolbarConfig, toolbarSettings]);

  // Build slots
  const slots = useMemo(() => {
    const defaultSlots = {
      noRowsOverlay: () => (emptyContent || <EmptyContent />),
      noResultsOverlay: () => (emptyContent || <EmptyContent title="No results found" />),
    };

    if (toolbarComponent) {
      defaultSlots.toolbar = () => toolbarComponent;
    } else if (toolbarProp === false) {
      // Only hide when explicitly toolbar={false}; otherwise DataGrid can show its default toolbar
      defaultSlots.toolbar = () => null;
    }

    return {
      ...defaultSlots,
      ...slotsProp,
    };
  }, [toolbarComponent, toolbarProp, slotsProp, emptyContent]);

  // Build slotProps
  const slotProps = useMemo(() => {
    const defaultSlotProps = {};

    if (toolbarConfig && typeof toolbarConfig === 'object' && toolbarConfig.columns !== false) {
      defaultSlotProps.columnsManagement = {
        getTogglableColumns: () => columns
            .filter((col) => {
              if (col.type === 'actions') return false;
              if (col.field === 'actions') return false;
              if (col.hideable === false) return false;
              return col.field;
            })
            .map((col) => col.field),
      };
    }

    // Force toolbar quick filter off unless explicitly enabled (overrides any consumer slotProps.toolbar.showQuickFilter)
    const toolbarQuickFilterEnabled = typeof toolbarConfig === 'object' && toolbarConfig.quickFilter === true;
    defaultSlotProps.toolbar = {
      ...slotPropsProp?.toolbar,
      showQuickFilter: toolbarQuickFilterEnabled,
    };

    return {
      ...defaultSlotProps,
      ...slotPropsProp,
      toolbar: {
        ...slotPropsProp?.toolbar,
        showQuickFilter: toolbarQuickFilterEnabled,
      },
    };
  }, [columns, toolbarConfig, slotPropsProp]);

  // Performance optimization: Enable virtualization for large datasets
  const shouldEnableVirtualization = useMemo(() => rows.length > 1000, [rows.length]);

  // Build DataGrid props
  const dataGridProps = useMemo(() => {
    const props = {
      rows,
      columns,
      loading,
      ...otherProps,
    };

    // Enable virtualization for large datasets
    if (shouldEnableVirtualization) {
      props.disableVirtualization = false;
    }

    // Pagination
    if (tableState.paginationConfig.enabled) {
      props.pagination = true; // Required by MUI DataGrid to enable footer and onPaginationModelChange
      props.paginationModel = tableState.paginationModel;
      props.onPaginationModelChange = tableState.handlePaginationModelChange;
      props.pageSizeOptions = tableState.paginationConfig.pageSizeOptions;

      if (tableState.paginationConfig.mode === 'server') {
        props.paginationMode = 'server';
        if (tableState.paginationConfig.rowCount !== undefined) {
          props.rowCount = tableState.paginationConfig.rowCount;
        }
      }
    } else {
      props.pagination = false;
    }

    // Sorting
    if (tableState.sortingConfig.enabled) {
      props.sortModel = tableState.sortModel;
      props.onSortModelChange = tableState.handleSortModelChange;

      if (tableState.sortingConfig.mode === 'server') {
        props.sortingMode = 'server';
      }

      if (tableState.sortingConfig.disableMultipleColumns) {
        props.disableMultipleColumnsSorting = true;
      }
    } else {
      props.disableColumnSorting = true;
    }

    // Filtering
    if (tableState.filteringConfig.enabled) {
      // Ensure filterModel has the correct structure with items array
      props.filterModel = tableState.filterModel?.items
        ? tableState.filterModel
        : { items: [] };
      props.onFilterModelChange = tableState.handleFilterModelChange;

      if (tableState.filteringConfig.mode === 'server') {
        props.filterMode = 'server';
      }

      if (tableState.filteringConfig.disableMultipleColumns) {
        props.disableMultipleColumnsFiltering = true;
      }

      if (!tableState.filteringConfig.quickFilter) {
        props.disableQuickFilter = true;
      }
    } else {
      props.disableColumnFilter = true;
    }

    // Keep quick filter disabled unless toolbar explicitly enables it (toolbar config wins over filtering config for toolbar UX)
    const toolbarQuickFilterOn = typeof toolbarConfig === 'object' && toolbarConfig.quickFilter === true;
    if (!toolbarQuickFilterOn) {
      props.disableQuickFilter = true;
    }

    // Selection
    if (tableState.selectionConfig.enabled) {
      props.checkboxSelection = tableState.selectionConfig.checkboxSelection;
      props.disableRowSelectionOnClick = tableState.selectionConfig.disableRowSelectionOnClick;
      // Ensure rowSelectionModel is always an array
      props.rowSelectionModel = Array.isArray(tableState.selectionModel) ? tableState.selectionModel : [];
      props.onRowSelectionModelChange = tableState.handleSelectionModelChange;

      if (tableState.selectionConfig.isRowSelectable) {
        props.isRowSelectable = tableState.selectionConfig.isRowSelectable;
      }
    } else {
      // When selection is disabled, explicitly turn off DataGrid row selection.
      // DataGrid defaults rowSelection to true, so without this, row click still selects and shows "X row(s) selected".
      props.rowSelection = false;
      props.hideFooterSelectedRowCount = true;
    }

    // Density
    if (toolbarSettings.settings.density) {
      props.density = toolbarSettings.settings.density;
    }

    // Auto-adjust column width on mount; omit actions column from autosize so expand does not widen it
    props.autosizeOnMount = otherProps.autosizeOnMount !== undefined ? otherProps.autosizeOnMount : true;
    const consumerAutosizeOptions = otherProps.autosizeOptions ?? {};
    props.autosizeOptions = {
      ...DEFAULT_AUTOSIZE_OPTIONS,
      ...consumerAutosizeOptions,
    };
    const actionsFieldForAutosize = columns.find((c) => c.type === 'actions')?.field;
    if (consumerAutosizeOptions.columns === undefined && actionsFieldForAutosize) {
      const autosizeFields = columns
        .map((c) => c.field)
        .filter((f) => f != null && f !== actionsFieldForAutosize);
      if (autosizeFields.length > 0) {
        props.autosizeOptions = {
          ...props.autosizeOptions,
          columns: autosizeFields,
        };
      }
    }

    // Column virtualization: default buffer is ~150px; trailing columns (e.g. Status, Notes, Actions)
    // stay outside that range when scrolled and are unmounted — CSS sticky cannot apply. Raise the floor.
    if (actionsStickyField != null) {
      const muiDefaultColumnBuffer = 150;
      const consumerBuffer = otherProps.columnBufferPx;
      const resolvedBuffer =
        typeof consumerBuffer === 'number' && consumerBuffer >= 0
          ? consumerBuffer
          : muiDefaultColumnBuffer;
      props.columnBufferPx = Math.max(resolvedBuffer, STICKY_ACTIONS_MIN_COLUMN_BUFFER_PX);
    }

    // Base grid sx for horizontal scroll on small screens (minWidth: 0 in flex layouts)
    const baseGridSx = { minWidth: 0, width: '100%' };

    const stickyActionsSx = buildStickyActionsColumnSx(actionsStickyField);

    const gridSurfaceSx = { ...baseGridSx, ...stickyActionsSx };

    // Height - Make it flexible when there's no data to show empty content properly
    const hasData = rows.length > 0;
    if (!hasData) {
      // When there's no data, enable autoHeight so the grid expands to show empty content
      props.autoHeight = true;
      if (height) {
        props.sx = { ...gridSurfaceSx, minHeight: 400, ...sx };
      } else if (sx) {
        props.sx = { ...gridSurfaceSx, minHeight: 400, ...sx };
      } else {
        props.sx = { ...gridSurfaceSx, minHeight: 400 };
      }
    } else if (height) {
      props.sx = { ...gridSurfaceSx, height, ...sx };
    } else if (sx) {
      props.sx = { ...gridSurfaceSx, ...sx };
    } else {
      props.sx = gridSurfaceSx;
    }

    // Row ID
    if (getRowId) {
      props.getRowId = getRowId;
    }

    // Row className
    if (getRowClassName) {
      props.getRowClassName = getRowClassName;
    }

    // Event handlers
    if (onRowClick) {
      props.onRowClick = onRowClick;
    }

    if (onCellClick) {
      props.onCellClick = onCellClick;
    }

    // Initial state
    if (initialStateProp) {
      props.initialState = initialStateProp;
    } else if (tableState.paginationConfig.enabled) {
      props.initialState = {
        pagination: {
          paginationModel: {
            page: tableState.paginationModel.page,
            pageSize: tableState.paginationModel.pageSize,
          },
        },
      };
    }

    // Slots
    props.slots = slots;

    // SlotProps
    props.slotProps = slotProps;

    return props;
  }, [
    rows,
    columns,
    loading,
    tableState,
    toolbarConfig,
    toolbarSettings.settings.density,
    height,
    sx,
    getRowId,
    getRowClassName,
    onRowClick,
    onCellClick,
    initialStateProp,
    slots,
    slotProps,
    shouldEnableVirtualization,
    actionsStickyField,
    otherProps,
  ]);

  // Handle empty columns
  if (columns.length === 0) {
    return <EmptyContent title="No columns defined" description="Please provide at least one column definition." />;
  }

  // API error state: show error in table area (inline UX), use getApiErrorMessage for message
  if (errorProp) {
    const { message } = getApiErrorMessage(errorProp, {
      defaultMessage: `Error loading ${errorEntityLabel}`,
      ...errorMessageOptions,
    });
    const title = `Error loading ${errorEntityLabel}`;
    return (
      <Card sx={{ p: 6 }}>
        <EmptyContent
          title={title}
          description={message}
          action={
            onRetry ? (
              <Button variant="contained" onClick={onRetry} startIcon={<Iconify icon="solar:refresh-bold" />}>
                Retry
              </Button>
            ) : null
          }
        />
      </Card>
    );
  }

  // Edge case: Handle empty rows (already handled by DataGrid's noRowsOverlay slot)

  return (
    <TableErrorBoundary>
      {hasToggle && toggleForm ? (
        <FormProvider {...toggleForm}>
          <DataGrid
            {...dataGridProps}
            sx={[
              {
                [`& .${gridClasses.cell}`]: {
                  display: 'flex',
                  alignItems: 'center',
                },
                [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                  outline: 'none',
                },
                [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
                  outline: 'none',
                },
              },
              ...(Array.isArray(dataGridProps.sx) ? dataGridProps.sx : [dataGridProps.sx]),
            ]}
          />
        </FormProvider>
      ) : (
        <DataGrid
          {...dataGridProps}
          sx={[
            {
              [`& .${gridClasses.cell}`]: {
                display: 'flex',
                alignItems: 'center',
              },
              [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                outline: 'none',
              },
              [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
                outline: 'none',
              },
            },
            ...(Array.isArray(dataGridProps.sx) ? dataGridProps.sx : [dataGridProps.sx]),
          ]}
        />
      )}
      {needsConfirmationDialog && actionsColumnResult.ConfirmationDialog}
      {DeleteConfirmDialog}
    </TableErrorBoundary>
  );
}

// ----------------------------------------------------------------------
// Error Boundary Component
// ----------------------------------------------------------------------

class TableErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('CustomTable Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <EmptyContent title="Error loading table" description="Please refresh the page." />;
    }

    return this.props.children;
  }
}

// ----------------------------------------------------------------------
// Memoized Export
// ----------------------------------------------------------------------

export const CustomTable = memo(CustomTableComponent, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  if (
    prevProps.rows !== nextProps.rows ||
    prevProps.columns !== nextProps.columns ||
    prevProps.loading !== nextProps.loading ||
    prevProps.actions !== nextProps.actions ||
    prevProps.deleteActionConfig !== nextProps.deleteActionConfig ||
    prevProps.toggleActionConfig !== nextProps.toggleActionConfig ||
    prevProps.pagination !== nextProps.pagination ||
    prevProps.sorting !== nextProps.sorting ||
    prevProps.filtering !== nextProps.filtering ||
    prevProps.selection !== nextProps.selection ||
    prevProps.toolbar !== nextProps.toolbar ||
    prevProps.density !== nextProps.density ||
    prevProps.height !== nextProps.height ||
    prevProps.error !== nextProps.error ||
    prevProps.onRetry !== nextProps.onRetry ||
    prevProps.errorEntityLabel !== nextProps.errorEntityLabel ||
    prevProps.errorMessageOptions !== nextProps.errorMessageOptions ||
    prevProps.stickyActionsColumn !== nextProps.stickyActionsColumn
  ) {
    return false;
  }
  return true;
});

// ----------------------------------------------------------------------
// Custom Toolbar Component
// ----------------------------------------------------------------------

function CustomToolbar({ settings, onChangeSettings, config }) {
  return (
    <Toolbar>
      {config.quickFilter === true && <CustomToolbarQuickFilter />}
      <Box component="span" sx={{ flexGrow: 1 }} />
      {config.customActions && <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>{config.customActions}</Box>}
      {config.columns !== false && <CustomToolbarColumnsButton />}
      {config.filter === true && <CustomToolbarFilterButton />}
      {config.export === true && <CustomToolbarExportButton />}
      {config.settings !== false && (
        <CustomToolbarSettingsButton settings={settings} onChangeSettings={onChangeSettings} />
      )}
    </Toolbar>
  );
}


