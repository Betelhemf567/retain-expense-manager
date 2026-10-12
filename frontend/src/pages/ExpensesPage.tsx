import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { deleteExpense, fetchExpenses } from '../api/expenses';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExpenseDetailsDialog } from '../components/ExpenseDetailsDialog';
import { ExpenseFilters } from '../components/ExpenseFilters';
import { ExpenseFormDialog } from '../components/ExpenseFormDialog';
import { useCategories } from '../hooks/useCategories';
import { setPage } from '../store/filtersSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { PAYMENT_LABELS, type Expense, type PaginatedExpenses } from '../types';
import { formatDate, formatMoney } from '../utils/format';

type FormState = { open: false } | { open: true; expense: Expense | null };

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const categories = useCategories();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [result, setResult] = useState<PaginatedExpenses | null>(null);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [form, setForm] = useState<FormState>({ open: false });
  const [viewing, setViewing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Loading is derived: we are loading until the response for the current filters/refresh has arrived.
  const requestKey = `${JSON.stringify(filters)}|${refreshKey}`;
  const loading = loadedKey !== requestKey;

  // Re-fetch whenever a Redux filter changes or after a create/edit/delete.
  useEffect(() => {
    const controller = new AbortController();
    fetchExpenses(filters, controller.signal)
      .then((data) => {
        setResult(data);
        setError('');
        setLoadedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err));
        setLoadedKey(requestKey);
      });
    return () => controller.abort();
  }, [filters, refreshKey, requestKey]);

  // If the last item on a page is deleted, step back one page.
  useEffect(() => {
    if (result && result.data.length === 0 && filters.page > 1) dispatch(setPage(filters.page - 1));
  }, [result, filters.page, dispatch]);

  const handleSaved = (message: string) => {
    setForm({ open: false });
    setNotice(message);
    refresh();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteExpense(deleting._id);
      setNotice('Expense deleted');
      setDeleting(null);
      refresh();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const actions = (expense: Expense) => (
    <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
      <Tooltip title="View details">
        <IconButton aria-label={`View ${expense.title}`} onClick={() => setViewing(expense)} size="small">
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton aria-label={`Edit ${expense.title}`} onClick={() => setForm({ open: true, expense })} size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton aria-label={`Delete ${expense.title}`} onClick={() => setDeleting(expense)} size="small" color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  const expenses = result?.data ?? [];

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Expenses
          </Typography>
          {result && (
            <Typography variant="body2" color="text.secondary">
              {result.total} {result.total === 1 ? 'expense' : 'expenses'} found
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ open: true, expense: null })}>
          Add expense
        </Button>
      </Stack>

      <ExpenseFilters categories={categories} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={refresh}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading && !result ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : expenses.length === 0 && !error ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No expenses found</Typography>
          <Typography color="text.secondary">Try changing your filters, or add a new expense.</Typography>
        </Paper>
      ) : isMobile ? (
        <Stack spacing={1.5} sx={{ opacity: loading ? 0.6 : 1 }}>
          {expenses.map((e) => (
            <Card key={e._id}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{e.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(e.date)} · {PAYMENT_LABELS[e.paymentMethod]}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, ml: 1 }}>{formatMoney(e.amount)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Chip label={e.category.name} size="small" />
                  {actions(e)}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ opacity: loading ? 0.6 : 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e._id} hover>
                  <TableCell sx={{ maxWidth: 240, wordBreak: 'break-word' }}>{e.title}</TableCell>
                  <TableCell>
                    <Chip label={e.category.name} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(e.date)}</TableCell>
                  <TableCell>{PAYMENT_LABELS[e.paymentMethod]}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatMoney(e.amount)}
                  </TableCell>
                  <TableCell align="right">{actions(e)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {result && result.pages > 1 && (
        <Stack sx={{ alignItems: 'center', mt: 3 }}>
          <Pagination count={result.pages} page={filters.page} onChange={(_, p) => dispatch(setPage(p))} color="primary" siblingCount={isMobile ? 0 : 1} />
        </Stack>
      )}

      {form.open && <ExpenseFormDialog expense={form.expense} categories={categories} onClose={() => setForm({ open: false })} onSaved={handleSaved} />}
      {viewing && <ExpenseDetailsDialog expense={viewing} onClose={() => setViewing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete expense?"
          message={`"${deleting.title}" (${formatMoney(deleting.amount)}) will be permanently removed.`}
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
      <Snackbar open={notice !== ''} autoHideDuration={3000} onClose={() => setNotice('')} message={notice} />
    </Box>
  );
}
