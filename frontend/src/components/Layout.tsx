import LogoutIcon from '@mui/icons-material/Logout';
import SavingsIcon from '@mui/icons-material/Savings';
import { AppBar, Avatar, Box, Button, Chip, Container, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navSx = {
  color: '#fff',
  borderRadius: 2,
  px: 1.75,
  '&.active': { bgcolor: 'rgba(255,255,255,0.18)' },
  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
};

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'linear-gradient(90deg, #0b3d2e 0%, #1b7f5c 100%)' }}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.18)', mr: 1 }}>
            <SavingsIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: 0.3 }}>
            Retain
          </Typography>
          {user?.role === 'user' && (
            <>
              <Button component={NavLink} to="/" end sx={navSx}>
                Dashboard
              </Button>
              <Button component={NavLink} to="/expenses" sx={navSx}>
                Expenses
              </Button>
            </>
          )}
          {user?.role === 'admin' && (
            <Button component={NavLink} to="/admin" sx={navSx}>
              Admin panel
            </Button>
          )}
          {user && (
            <Chip
              avatar={<Avatar sx={{ bgcolor: '#f59e0b !important', color: '#fff !important', fontWeight: 700 }}>{user.name.charAt(0).toUpperCase()}</Avatar>}
              label={user.name}
              variant="outlined"
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.45)', display: { xs: 'none', sm: 'inline-flex' } }}
            />
          )}
          <Button startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ color: '#fff' }}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
