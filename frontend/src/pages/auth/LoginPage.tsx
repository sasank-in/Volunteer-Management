import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import apiService from '@services/api';
import { useAuthStore } from '@store/index';
import type { LoginRequest } from '../../types';
import AuthLayout from '@components/AuthLayout';

const demoCredentials = [
  { role: 'Volunteer', email: 'volunteer@example.com', password: 'password123' },
  { role: 'Organizer', email: 'organizer@example.com', password: 'password123' },
  { role: 'Admin', email: 'admin@example.com', password: 'password123' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isAuthenticated) {
      navigate('/events');
    }
  }, [user, isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credentials: LoginRequest = { email, password };
      const response = await apiService.login(credentials);
      if (!response.user) {
        setError('Login failed: invalid server response');
        setLoading(false);
        return;
      }
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your credentials to access your workspace.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          type="email"
          label="Email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          size="medium"
          autoComplete="email"
        />

        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          size="medium"
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  disabled={loading}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ textAlign: 'right' }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            underline="hover"
            sx={{ fontSize: '0.8125rem', color: 'primary.main', fontWeight: 500 }}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 1, height: 44 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
            DEMO ACCOUNTS
          </Typography>
        </Divider>

        <Stack spacing={1}>
          {demoCredentials.map((cred) => (
            <Button
              key={cred.role}
              fullWidth
              variant="outlined"
              size="small"
              disabled={loading}
              onClick={() => {
                setEmail(cred.email);
                setPassword(cred.password);
              }}
              sx={{ justifyContent: 'space-between', textAlign: 'left', color: 'text.primary', borderColor: 'divider' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {cred.role}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {cred.email}
              </Typography>
            </Button>
          ))}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
          Don&apos;t have an account?{' '}
          <Link
            component={RouterLink}
            to="/register"
            underline="hover"
            sx={{ color: 'primary.main', fontWeight: 600 }}
          >
            Create one
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;
