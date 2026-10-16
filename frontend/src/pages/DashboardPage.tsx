import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { Alert, Box, Button, CircularProgress, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { fetchDashboard } from '../api/dashboard';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetDialog } from '../components/BudgetDialog';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { RecentExpenses } from '../components/RecentExpenses';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import type { DashboardData } from '../types';
import { currentMonth, formatMoney, formatMonth } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Loading is derived: we are loading until the response for the current month/refresh has arrived.
  const requestKey = `${month}|${refreshKey}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(month, controller.signal)
      .then((result) => {
        setData(result);
        setError('');
        setLoadedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err));
        setLoadedKey(requestKey);
      });
    return () => controller.abort();
  }, [month, refreshKey, requestKey]);

  const overBudget = data !== null && data.remaining !== null && data.remaining < 0;

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Hello, {user?.name.split(' ')[0]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's your spending for {formatMonth(month)}.
          </Typography>
        </Box>
        <TextField
          label="Month"
          type="month"
          size="small"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={refresh}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading && !data ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : data ? (
        <Stack spacing={2} sx={{ opacity: loading ? 0.6 : 1 }}>
          <BudgetCard summary={data} onEdit={() => setBudgetOpen(true)} />

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
            <StatCard label="Total spent" value={formatMoney(data.totalSpent)} caption={`in ${formatMonth(month)}`} icon={<PaymentsOutlinedIcon />} accent="#3b82f6" />
            <StatCard
              label="Remaining budget"
              value={data.remaining === null ? 'No budget' : formatMoney(data.remaining)}
              caption={data.remaining === null ? 'Set a budget above' : overBudget ? 'You are over budget' : 'Left to spend this month'}
              color={overBudget ? 'error.main' : data.remaining === null ? 'text.primary' : 'success.main'}
              icon={<SavingsOutlinedIcon />}
              accent={overBudget ? '#ef4444' : '#1b7f5c'}
            />
            <StatCard
              label="Highest expense"
              value={data.highestExpense ? formatMoney(data.highestExpense.amount) : '—'}
              caption={data.highestExpense ? `${data.highestExpense.title} · ${data.highestExpense.category.name}` : 'No expenses yet'}
              icon={<EmojiEventsOutlinedIcon />}
              accent="#f59e0b"
            />
          </Box>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
            <CategoryBreakdown items={data.spendingByCategory} />
            <RecentExpenses expenses={data.recentExpenses} />
          </Box>
        </Stack>
      ) : null}

      {budgetOpen && data && (
        <BudgetDialog
          month={month}
          current={data.budget}
          onClose={() => setBudgetOpen(false)}
          onSaved={() => {
            setBudgetOpen(false);
            setNotice('Budget saved');
            refresh();
          }}
        />
      )}
      <Snackbar open={notice !== ''} autoHideDuration={3000} onClose={() => setNotice('')} message={notice} />
    </Box>
  );
}
