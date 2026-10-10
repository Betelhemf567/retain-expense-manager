import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { Expense } from '../types';
import { formatDate, formatMoney } from '../utils/format';

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent expenses
          </Typography>
          <Button component={RouterLink} to="/expenses" size="small">
            View all
          </Button>
        </Stack>
        {expenses.length === 0 ? (
          <Typography color="text.secondary">No expenses recorded for this month yet.</Typography>
        ) : (
          expenses.map((e, i) => (
            <Fragment key={e._id}>
              {i > 0 && <Divider />}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', py: 1.25, gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{e.title}</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(e.date)}
                    </Typography>
                    <Chip label={e.category.name} size="small" variant="outlined" />
                  </Stack>
                </Box>
                <Typography sx={{ fontWeight: 600 }}>{formatMoney(e.amount)}</Typography>
              </Stack>
            </Fragment>
          ))
        )}
      </CardContent>
    </Card>
  );
}
