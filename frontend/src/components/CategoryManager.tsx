import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { createCategory, deleteCategory, renameCategory } from '../api/admin';
import { fetchCategories } from '../api/categories';
import { getErrorMessage } from '../api/client';
import type { Category } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

type FormState = { open: false } | { open: true; category: Category | null };

function CategoryFormDialog({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: (message: string) => void }) {
  const [name, setName] = useState(category?.name ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return setError('Name must be at least 2 characters');
    setError('');
    setSaving(true);
    try {
      if (category) await renameCategory(category._id, trimmed);
      else await createCategory(trimmed);
      onSaved(category ? 'Category renamed' : 'Category created');
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{category ? 'Rename category' : 'New category'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField label="Category name" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus required sx={{ mt: 1 }} slotProps={{ htmlInput: { maxLength: 40 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>({ open: false });
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    fetchCategories()
      .then((list) => {
        setCategories(list);
        setError('');
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleSaved = (message: string) => {
    setForm({ open: false });
    setNotice(message);
    load();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const { reassignedExpenses } = await deleteCategory(deleting._id);
      setNotice(
        reassignedExpenses > 0
          ? `Category deleted. ${reassignedExpenses} expense${reassignedExpenses === 1 ? '' : 's'} moved to Uncategorized.`
          : 'Category deleted'
      );
      setDeleting(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography color="text.secondary">Deleting a category moves its expenses to “Uncategorized”.</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ open: true, category: null })}>
          Add category
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c._id} hover>
                  <TableCell>
                    {c.name} {c.isDefault && <Chip label="Default" size="small" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell align="right">
                    {c.isDefault ? (
                      <Typography variant="caption" color="text.secondary">
                        Cannot be changed
                      </Typography>
                    ) : (
                      <>
                        <Tooltip title="Rename">
                          <IconButton aria-label={`Rename ${c.name}`} size="small" onClick={() => setForm({ open: true, category: c })}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton aria-label={`Delete ${c.name}`} size="small" color="error" onClick={() => setDeleting(c)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {form.open && <CategoryFormDialog category={form.category} onClose={() => setForm({ open: false })} onSaved={handleSaved} />}
      {deleting && (
        <ConfirmDialog
          title="Delete category?"
          message={`"${deleting.name}" will be removed. Any expenses in it will be moved to Uncategorized.`}
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
      <Snackbar open={notice !== ''} autoHideDuration={4000} onClose={() => setNotice('')} message={notice} />
    </Box>
  );
}
