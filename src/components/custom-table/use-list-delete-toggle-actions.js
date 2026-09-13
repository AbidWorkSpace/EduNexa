'use client';

import { useForm } from 'react-hook-form';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import { getApiErrorMessage } from 'src/utils/api-error-message';

import { toast } from 'src/components/snackbar';
import { Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog/confirm-dialog';

// ----------------------------------------------------------------------

const TOGGLE_ORDER = 3;
const DELETE_ORDER = 4;

/**
 * Hook that provides built-in delete and toggle-active actions for list tables.
 * Manages state, handlers, ConfirmDialog, and toggle form. When a config is undefined,
 * that action is omitted from builtInActions.
 *
 * @param {object} [deleteConfig] - Delete action config (optional)
 * @param {object} [toggleConfig] - Toggle active action config (optional)
 * @param {Array} rows - Current rows (for toggle form sync)
 * @returns {{ builtInActions: Array, DeleteConfirmDialog: ReactNode, toggleForm: object, hasToggle: boolean }}
 */
export function useListDeleteToggleActions(deleteConfig, toggleConfig, rows = []) {
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);

  // Toggle state
  const [togglingId, setTogglingId] = useState(null);
  const inFlightIdsRef = useRef(new Set());
  const pendingRefetchIdsRef = useRef(new Set());

  // Toggle form (always created so hooks are unconditional)
  const toggleForm = useForm({
    defaultValues: {},
  });

  const hasDelete = Boolean(deleteConfig && typeof deleteConfig.deleteMutation === 'function');
  const hasToggle = Boolean(toggleConfig && typeof toggleConfig.toggleMutation === 'function');

  // Sync toggle form when rows change. Preserve in-flight toggle value(s) so reset() does not overwrite with stale row data (prevents flicker).
  // Support multiple in-flight toggles: preserve every id in inFlightIdsRef, not just a single togglingId.
  // Also preserve "pending refetch" ids until rows contain the updated isActive (refetch runs after mutation success; first sync may see stale rows).
  useEffect(() => {
    if (!hasToggle || !Array.isArray(rowsRef.current)) return;
    const values = {};
    const inFlightIds = inFlightIdsRef.current;
    const pendingIds = pendingRefetchIdsRef.current;
    rowsRef.current.forEach((row) => {
      const id = row?.id != null ? row.id : undefined;
      if (id !== undefined) {
        const formValue = toggleForm.getValues(`active_${id}`);
        const rowValue = Boolean(row?.isActive);
        const preserveInFlight = inFlightIds.has(id);
        const preservePending = pendingIds.has(id);
        const rowCaughtUp = preservePending && formValue === rowValue;
        if (rowCaughtUp) pendingIds.delete(id);
        if (preserveInFlight || preservePending) {
          values[`active_${id}`] = formValue !== undefined ? formValue : rowValue;
        } else {
          values[`active_${id}`] = rowValue;
        }
      }
    });
    inFlightIds.forEach((id) => {
      if (values[`active_${id}`] === undefined) {
        const current = toggleForm.getValues(`active_${id}`);
        values[`active_${id}`] = current !== undefined ? current : false;
      }
    });
    pendingIds.forEach((id) => {
      if (values[`active_${id}`] === undefined) {
        const current = toggleForm.getValues(`active_${id}`);
        values[`active_${id}`] = current !== undefined ? current : false;
      }
    });
    toggleForm.reset(values);
  }, [hasToggle, rows, togglingId, toggleForm]);

  const handleDeleteClick = useCallback(
    (row) => {
      if (!hasDelete) return;
      setDeleteRow(row);
      setDeleteOpen(true);
    },
    [hasDelete]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!hasDelete || !deleteRow) return;
    const config = deleteConfig;
    const id = deleteRow.id;
    try {
      await config.deleteMutation(id).unwrap();
      toast.success(config.successMessage || 'Deleted successfully');
      setDeleteOpen(false);
      setDeleteRow(null);
      config.onDeleted?.(id);
    } catch (err) {
      const { message } = getApiErrorMessage(err, {
        defaultMessage: 'Failed to delete',
        notFoundMessage: config.notFoundMessage,
      });
      toast.error(message);
    }
  }, [hasDelete, deleteConfig, deleteRow]);

  const handleToggleActive = useCallback(
    async (id, onRevert) => {
      if (!hasToggle) return;
      if (inFlightIdsRef.current.has(id)) return;
      inFlightIdsRef.current.add(id);
      setTogglingId(id);
      const config = toggleConfig;
      try {
        await config.toggleMutation(id).unwrap();
        pendingRefetchIdsRef.current.add(id);
        toast.success(config.successMessage || 'Status updated successfully');
      } catch (err) {
        const { message } = getApiErrorMessage(err, {
          defaultMessage: 'Failed to update status',
          notFoundMessage: config.notFoundMessage,
        });
        toast.error(message);
        if (typeof onRevert === 'function') onRevert();
      } finally {
        inFlightIdsRef.current.delete(id);
        setTogglingId(null);
      }
    },
    [hasToggle, toggleConfig]
  );

  const getRowId = useCallback(
    (row) => {
      if (!toggleConfig?.getRowId) return row?.id;
      return toggleConfig.getRowId(row);
    },
    [toggleConfig]
  );

  const getRowName = useCallback(
    (row) => {
      if (!toggleConfig?.getRowName) return row?.name ?? 'item';
      return toggleConfig.getRowName(row) ?? 'item';
    },
    [toggleConfig]
  );

  const builtInActions = useMemo(() => {
    const actions = [];

    if (hasToggle) {
      const tc = toggleConfig;
      const toggleAction = {
        id: 'toggle-active',
        label: typeof tc.getToggleLabel === 'function' ? tc.getToggleLabel : (row) => (row?.isActive ? 'Deactivate' : 'Activate'),
        icon: (row) => {
          const id = getRowId(row);
          const isInFlight = inFlightIdsRef.current.has(id);
          if (isInFlight) {
            return (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', minHeight: 24 }}>
                <Skeleton
                  variant="rounded"
                  width={34}
                  height={20}
                  sx={{ flexShrink: 0 }}
                  aria-label={`Updating active status for ${getRowName(row)}`}
                />
              </Box>
            );
          }
          return (
          <Field.Switch
            name={`active_${id}`}
            onChange={() => {
              const previous = row?.isActive;
              const nextValue = !previous;
              toggleForm.setValue(`active_${id}`, nextValue, { shouldDirty: false });
              handleToggleActive(id, () => toggleForm.setValue(`active_${id}`, previous));
            }}
            slotProps={{
              wrapper: { onClick: (e) => e.stopPropagation() },
              switch: {
                size: 'small',
                slotProps: {
                  input: {
                    id: `table-toggle-${id}`,
                    'aria-label': `Toggle active status for ${getRowName(row)}`,
                  },
                },
              },
            }}
          />
          );
        },
        order: TOGGLE_ORDER,
        permission: typeof tc.permission === 'function' ? tc.permission : undefined,
      };
      if (typeof tc.getVisible === 'function') toggleAction.visible = tc.getVisible;
      else if (typeof tc.visible === 'function') toggleAction.visible = tc.visible;
      actions.push(toggleAction);
    }

    if (hasDelete) {
      const dc = deleteConfig;
      const deleteAction = {
        id: 'delete',
        label: 'Delete',
        icon: 'solar:trash-bin-trash-bold',
        onClick: handleDeleteClick,
        order: DELETE_ORDER,
        permission: typeof dc.permission === 'function' ? dc.permission : undefined,
        color: 'error',
      };
      if (typeof dc.getVisible === 'function') deleteAction.visible = dc.getVisible;
      else if (typeof dc.visible === 'function') deleteAction.visible = dc.visible;
      actions.push(deleteAction);
    }

    return actions;
  }, [
    hasToggle,
    hasDelete,
    toggleConfig,
    deleteConfig,
    handleToggleActive,
    handleDeleteClick,
    toggleForm,
    getRowId,
    getRowName,
  ]);

  const DeleteConfirmDialog = useMemo(() => {
    if (!hasDelete) return null;
    const dc = deleteConfig;
    const isDeleting = Boolean(dc.isDeleting);
    return (
      <ConfirmDialog
        open={deleteOpen}
        title={dc.confirmTitle || 'Delete'}
        content={
          typeof dc.getConfirmContent === 'function'
            ? dc.getConfirmContent(deleteRow)
            : 'Are you sure you want to delete this item?'
        }
        action={
          <Field.Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            loading={isDeleting}
          >
            Delete
          </Field.Button>
        }
        loading={isDeleting}
        disableClose={isDeleting}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteRow(null);
        }}
      />
    );
  }, [hasDelete, deleteConfig, deleteOpen, deleteRow, handleDeleteConfirm]);

  return {
    builtInActions,
    DeleteConfirmDialog,
    toggleForm,
    hasToggle,
  };
}
