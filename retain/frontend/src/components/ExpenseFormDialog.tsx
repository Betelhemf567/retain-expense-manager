import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { createExpense, updateExpense } from '../api/expenses';
import { getErrorMessage } from '../api/client';
import { PAYMENT_LABELS, PAYMENT_METHODS, type Category, type Expense, type PaymentMethod } from '../types';
import { todayInput, toDateInput } from '../utils/format';

interface Props {
  expense: Expense | null; // null = create
  categories: Category[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function ExpenseFormDialog({ expense, categories, onClose, onSaved }: Props) {
  const defaultCategoryId = categories.find((c) => c.isDefault)?._id ?? '';

  const [title, setTitle] = useState(expense?.title ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [categoryId, setCategoryId] = useState(expense?.category._id ?? '');
  const [date, setDate] = useState(expense ? toDateInput(expense.date) : todayInput());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(expense?.paymentMethod ?? 'cash');
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!title.trim()) return setError('Title is required');
    if (!Number.isFinite(value) || value <= 0) return setError('Amount must be greater than 0');
    if (!date) return setError('Date is required');

    setError('');
    setSaving(true);
    const input = {
      title: title.trim(),
      amount: value,
      category: categoryId || defaultCategoryId || undefined,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
    };
    try {
      if (expense) await updateExpense(expense._id, input);
      else await createExpense(input);
      onSaved(expense ? 'Expense updated' : 'Expense added');
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{expense ? 'Edit expense' : 'Add expense'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth autoFocus />
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
            <TextField select label="Category" value={categoryId || defaultCategoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth>
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField select label="Payment method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} fullWidth>
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m} value={m}>
                  {PAYMENT_LABELS[m]}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={2} fullWidth slotProps={{ htmlInput: { maxLength: 500 } }} />
          </Stack>
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
