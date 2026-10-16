import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  caption?: string;
  color?: 'text.primary' | 'error.main' | 'success.main';
  icon?: ReactNode;
  accent?: string;
}

export function StatCard({ label, value, caption, color = 'text.primary', icon, accent = '#1b7f5c' }: Props) {
  return (
    <Card sx={{ height: '100%', borderTop: `4px solid ${accent}` }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5, color, wordBreak: 'break-word' }}>
              {value}
            </Typography>
            {caption && (
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                {caption}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box sx={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: '12px', color: accent, bgcolor: alpha(accent, 0.12), flexShrink: 0 }}>
              {icon}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
