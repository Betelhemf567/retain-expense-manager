import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { store } from './store';

const theme = createTheme({
  palette: {
    primary: { main: '#1b7f5c', dark: '#0b3d2e' },
    secondary: { main: '#f59e0b' },
    background: { default: '#f3f6f5' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #e3e9e6' } } },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
