import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InsightsIcon from '@mui/icons-material/Insights';
import SavingsIcon from '@mui/icons-material/Savings';
import { Alert, Box, Button, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth';

interface Props {
  mode: 'login' | 'register';
}

const HIGHLIGHTS = [
  { icon: <InsightsIcon />, text: 'See exactly where every coin goes, by category and by month' },
  { icon: <SavingsIcon />, text: 'Set a monthly budget and get warned before you overspend' },
  { icon: <FilterAltIcon />, text: 'Search and filter every expense in seconds' },
];

export default function AuthForm({ mode }: Props) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = isRegister ? await register(name, email, password) : await login(email, password);
      navigate(from ?? (user.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          p: 8,
          color: '#fff',
          background: 'linear-gradient(135deg, #0b3d2e 0%, #1b7f5c 60%, #34a874 100%)',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 5 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.18)' }}>
            <SavingsIcon />
          </Box>
          <Typography variant="h4">Retain</Typography>
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.15, mb: 2 }}>
          Know where your money goes.
        </Typography>
        <Typography sx={{ opacity: 0.85, mb: 5, maxWidth: 440 }}>
          A simple way to track your spending, keep to a monthly budget, and keep what you earn.
        </Typography>
        <Stack spacing={2.5}>
          {HIGHLIGHTS.map((h) => (
            <Stack key={h.text} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.16)', flexShrink: 0 }}>{h.icon}</Box>
              <Typography sx={{ maxWidth: 380 }}>{h.text}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
        <Paper sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 420, border: '1px solid #e3e9e6' }} elevation={0}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1, display: { md: 'none' } }}>
            <SavingsIcon color="primary" />
            <Typography variant="h5" color="primary">
              Retain
            </Typography>
          </Stack>
          <Typography variant="h5" sx={{ mb: 0.5 }}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {isRegister ? 'Start tracking your expenses in under a minute.' : 'Sign in to manage your budget.'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {isRegister && <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />}
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                helperText={isRegister ? 'At least 8 characters' : undefined}
                slotProps={{ htmlInput: { minLength: isRegister ? 8 : undefined } }}
              />
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Please wait…' : isRegister ? 'Sign up' : 'Sign in'}
              </Button>
            </Stack>
          </form>
          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link component={RouterLink} to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Sign up'}
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
