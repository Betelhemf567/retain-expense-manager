import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { CategoryManager } from '../components/CategoryManager';
import { InsightsPanel } from '../components/InsightsPanel';

export default function AdminPage() {
  const [tab, setTab] = useState<'insights' | 'categories'>('insights');

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Admin dashboard
      </Typography>
      <Tabs value={tab} onChange={(_, value: 'insights' | 'categories') => setTab(value)} sx={{ mb: 3 }} variant="scrollable" allowScrollButtonsMobile>
        <Tab label="Platform insights" value="insights" />
        <Tab label="Categories" value="categories" />
      </Tabs>
      {tab === 'insights' ? <InsightsPanel /> : <CategoryManager />}
    </Box>
  );
}
