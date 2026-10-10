import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { PAYMENT_LABELS, type Expense } from '../types';
import { formatDate, formatMoney } from '../utils/format';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography sx={{ textAlign: 'right', wordBreak: 'break-word' }}>{value}</Typography>
    </Stack>
  );
}

export function ExpenseDetailsDialog({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{expense.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Row label="Amount" value={formatMoney(expense.amount)} />
          <Row label="Category" value={expense.category.name} />
          <Row label="Date" value={formatDate(expense.date)} />
          <Row label="Payment method" value={PAYMENT_LABELS[expense.paymentMethod]} />
          <Row label="Notes" value={expense.notes || '—'} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
