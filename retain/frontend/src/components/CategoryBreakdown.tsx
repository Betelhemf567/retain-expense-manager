import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import type { CategorySpending } from '../types';
import { formatMoney } from '../utils/format';

export function CategoryBreakdown({ items, title = 'Spending by category' }: { items: CategorySpending[]; title?: string }) {
  const total = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {title}
        </Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">No spending recorded for this month yet.</Typography>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => {
              const share = total > 0 ? (item.total / total) * 100 : 0;
              return (
                <Box key={item.categoryId}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.name ?? 'Unknown'}
                      <Typography component="span" variant="caption" color="text.secondary">
                        {' '}
                        · {item.count} {item.count === 1 ? 'expense' : 'expenses'}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatMoney(item.total)}
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={share} sx={{ height: 8, borderRadius: 4 }} aria-label={`${item.name} share of spending`} />
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
