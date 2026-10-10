import { Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  caption?: string;
  color?: 'text.primary' | 'error.main' | 'success.main';
  icon?: ReactNode;
}

export function StatCard({ label, value, caption, color = 'text.primary', icon }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {icon}
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color, wordBreak: 'break-word' }}>
          {value}
        </Typography>
        {caption && (
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
