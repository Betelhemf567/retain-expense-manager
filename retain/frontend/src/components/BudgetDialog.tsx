import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '../api/client';
import { saveBudget } from '../api/dashboard';
import { formatMonth } from '../utils/format';

interface Props {
  month: string;
  current: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export function BudgetDialog({ month, current, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState(current === null ? '' : String(current));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (amount === '' || !Number.isFinite(value) || value < 0) return setError('Enter a budget of 0 or more');
    setError('');
    setSaving(true);
    try {
      await saveBudget(month, value);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{current === null ? 'Set' : 'Update'} budget for {formatMonth(month)}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Monthly budget"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            autoFocus
            required
            sx={{ mt: 1 }}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
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
