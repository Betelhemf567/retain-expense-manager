import { Box, Typography } from '@mui/material';
import type { CategorySpending } from '../types';
import { colorAt } from '../utils/colors';
import { formatMoney } from '../utils/format';

const SIZE = 190;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A small dependency-free SVG donut chart. */
export function DonutChart({ items, total }: { items: CategorySpending[]; total: number }) {
  const segments = items.map((item, i) => ({
    item,
    color: colorAt(i),
    length: total > 0 ? (item.total / total) * CIRCUMFERENCE : 0,
    start: total > 0 ? (items.slice(0, i).reduce((sum, x) => sum + x.total, 0) / total) * CIRCUMFERENCE : 0,
  }));

  return (
    <Box sx={{ position: 'relative', width: SIZE, height: SIZE, mx: 'auto' }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Spending by category">
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#e8eeeb" strokeWidth={STROKE} />
          {segments.map((s) => (
            <circle
              key={s.item.categoryId}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={s.color}
              strokeWidth={STROKE}
              strokeDasharray={`${s.length} ${CIRCUMFERENCE - s.length}`}
              strokeDashoffset={-s.start}
            />
          ))}
        </g>
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', px: 4 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total
          </Typography>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>{formatMoney(total)}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
