import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { fetchInsights } from '../api/admin';
import { getErrorMessage } from '../api/client';
import type { AdminInsights, CategorySpending } from '../types';
import { formatDate, formatMoney } from '../utils/format';
import { StatCard } from './StatCard';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <TableContainer>{children}</TableContainer>
    </Paper>
  );
}

function CategoryTable({ title, rows, showSpent }: { title: string; rows: CategorySpending[]; showSpent: boolean }) {
  return (
    <Section title={title}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell align="right">Expenses</TableCell>
            {showSpent && <TableCell align="right">Total spent</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={showSpent ? 3 : 2}>No data yet</TableCell>
            </TableRow>
          )}
          {rows.map((r) => (
            <TableRow key={r.categoryId}>
              <TableCell>{r.name}</TableCell>
              <TableCell align="right">{r.count}</TableCell>
              {showSpent && <TableCell align="right">{formatMoney(r.total)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  );
}

export function InsightsPanel() {
  const [data, setData] = useState<AdminInsights | null>(null);
  const [loadedKey, setLoadedKey] = useState(-1);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const loading = loadedKey !== refreshKey;

  useEffect(() => {
    const controller = new AbortController();
    fetchInsights(controller.signal)
      .then((result) => {
        setData(result);
        setError('');
        setLoadedKey(refreshKey);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err));
        setLoadedKey(refreshKey);
      });
    return () => controller.abort();
  }, [refreshKey]);

  if (loading && !data)
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (!data)
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={refresh}>Retry</Button>}>
        {error || 'Could not load insights'}
      </Alert>
    );

  return (
    <Box sx={{ display: 'grid', gap: 2, opacity: loading ? 0.6 : 1 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
        <StatCard label="Registered users" value={String(data.totalUsers)} />
        <StatCard label="Expenses recorded" value={String(data.totalExpenses)} />
        <StatCard label="Total expense value" value={formatMoney(data.totalExpenseValue)} />
        <StatCard label="Expenses this month" value={String(data.expensesThisMonth)} />
      </Box>

      <CategoryTable title="Total spending per category" rows={data.spendingByCategory} showSpent />

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
        <CategoryTable title="Top 5 most-used categories" rows={data.topCategories} showSpent={false} />
        <CategoryTable title="Bottom 5 least-used categories" rows={data.bottomCategories} showSpent={false} />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
        <Section title="Recently added expenses">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>No expenses yet</TableCell>
                </TableRow>
              )}
              {data.recentExpenses.map((e) => (
                <TableRow key={e._id}>
                  <TableCell>{e.title}</TableCell>
                  <TableCell>{e.user?.name ?? '—'}</TableCell>
                  <TableCell>{e.category?.name ?? '—'}</TableCell>
                  <TableCell align="right">{formatMoney(e.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section title="Recently registered users">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentUsers.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      </Box>
    </Box>
  );
}
