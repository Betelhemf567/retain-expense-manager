import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import type { BudgetStatus, BudgetSummary } from '../types';
import { formatMoney, formatMonth } from '../utils/format';

const STATUS: Record<BudgetStatus, { label: string; chipBg: string; chipText: string; bar: string }> = {
  none: { label: 'No budget set', chipBg: 'rgba(255,255,255,0.9)', chipText: '#334155', bar: '#ffffff' },
  within: { label: 'Within budget', chipBg: '#d1fae5', chipText: '#065f46', bar: '#6ee7b7' },
  approaching: { label: 'Approaching budget', chipBg: '#fef3c7', chipText: '#92400e', bar: '#fcd34d' },
  over: { label: 'Over budget', chipBg: '#fee2e2', chipText: '#991b1b', bar: '#fca5a5' },
};

const MESSAGE: Record<BudgetStatus, string> = {
  none: 'Set a monthly budget to track how much you can still spend.',
  within: "You're on track. Keep it up!",
  approaching: "You've used most of your budget. Spend carefully for the rest of the month.",
  over: "You've gone over your budget for this month.",
};

interface Props {
  summary: BudgetSummary;
  onEdit: () => void;
}

export function BudgetCard({ summary, onEdit }: Props) {
  const { budget, spent, remaining, status, month } = summary;
  const percent = budget && budget > 0 ? (spent / budget) * 100 : 0;
  const look = STATUS[status];

  return (
    <Card sx={{ color: '#fff', border: 'none', background: 'linear-gradient(135deg, #0b3d2e 0%, #1b7f5c 70%, #2f9e72 100%)' }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Monthly budget · {formatMonth(month)}
            </Typography>
            <Typography variant="h4">{budget === null ? '—' : formatMoney(budget)}</Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label={look.label} sx={{ bgcolor: look.chipBg, color: look.chipText, fontWeight: 700 }} />
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}
              variant="outlined"
            >
              {budget === null ? 'Set budget' : 'Update'}
            </Button>
          </Stack>
        </Stack>

        {budget !== null && (
          <Box sx={{ mt: 2.5 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, percent)}
              aria-label="Budget used"
              sx={{ height: 14, borderRadius: 7, bgcolor: 'rgba(255,255,255,0.22)', '& .MuiLinearProgress-bar': { bgcolor: look.bar, borderRadius: 7 } }}
            />
            <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 0.75 }}>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {formatMoney(spent)} spent ({Math.round(percent)}%)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: remaining !== null && remaining < 0 ? '#fecaca' : '#fff' }}>
                {remaining !== null && remaining < 0 ? `${formatMoney(-remaining)} over` : `${formatMoney(remaining ?? 0)} left`}
              </Typography>
            </Stack>
          </Box>
        )}
        <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.9 }}>
          {MESSAGE[status]}
        </Typography>
      </CardContent>
    </Card>
  );
}
