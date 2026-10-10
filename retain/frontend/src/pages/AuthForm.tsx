import { Alert, Box, Button, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth';

interface Props {
  mode: 'login' | 'register';
}

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
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'grey.100', p: 2 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 420 }} elevation={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
          Retain
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {isRegister ? 'Create your account to start tracking expenses.' : 'Sign in to manage your budget.'}
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
  );
}
