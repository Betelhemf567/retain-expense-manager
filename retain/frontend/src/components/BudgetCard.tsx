import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import type { BudgetStatus, BudgetSummary } from '../types';
import { formatMoney, formatMonth } from '../utils/format';

const STATUS: Record<BudgetStatus, { label: string; color: 'default' | 'success' | 'warning' | 'error' }> = {
  none: { label: 'No budget set', color: 'default' },
  within: { label: 'Within budget', color: 'success' },
  approaching: { label: 'Approaching budget', color: 'warning' },
  over: { label: 'Over budget', color: 'error' },
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
  const barColor = status === 'over' ? 'error' : status === 'approaching' ? 'warning' : 'success';

  return (
    <Card>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Monthly budget · {formatMonth(month)}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {budget === null ? '—' : formatMoney(budget)}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label={STATUS[status].label} color={STATUS[status].color} />
            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEdit}>
              {budget === null ? 'Set budget' : 'Update'}
            </Button>
          </Stack>
        </Stack>

        {budget !== null && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, percent)}
              color={barColor}
              sx={{ height: 12, borderRadius: 6 }}
              aria-label="Budget used"
            />
            <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                {formatMoney(spent)} spent ({Math.round(percent)}%)
              </Typography>
              <Typography variant="caption" color={remaining !== null && remaining < 0 ? 'error' : 'text.secondary'}>
                {remaining !== null && remaining < 0 ? `${formatMoney(-remaining)} over` : `${formatMoney(remaining ?? 0)} left`}
              </Typography>
            </Stack>
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {MESSAGE[status]}
        </Typography>
      </CardContent>
    </Card>
  );
}
