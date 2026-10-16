import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import type { CategorySpending } from '../types';
import { colorAt } from '../utils/colors';
import { formatMoney } from '../utils/format';
import { DonutChart } from './DonutChart';

export function CategoryBreakdown({ items, title = 'Spending by category' }: { items: CategorySpending[]; title?: string }) {
  const total = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">No spending recorded for this month yet.</Typography>
        ) : (
          <>
            <DonutChart items={items} total={total} />
            <Stack spacing={1.75} sx={{ mt: 3 }}>
              {items.map((item, i) => {
                const share = total > 0 ? (item.total / total) * 100 : 0;
                const color = colorAt(i);
                return (
                  <Box key={item.categoryId}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.name ?? 'Unknown'}
                          <Typography component="span" variant="caption" color="text.secondary">
                            {' '}
                            · {item.count}
                          </Typography>
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {formatMoney(item.total)}
                        <Typography component="span" variant="caption" color="text.secondary">
                          {' '}
                          ({Math.round(share)}%)
                        </Typography>
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={share}
                      aria-label={`${item.name} share of spending`}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#eef2f0', '& .MuiLinearProgress-bar': { bgcolor: color } }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
