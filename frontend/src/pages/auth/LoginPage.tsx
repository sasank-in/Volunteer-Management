import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import apiService from '@services/api';
import { useAuthStore } from '@store/index';
import type { LoginRequest } from '../../types';

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
      console.log('[LoginPage] User authenticated, navigating to home');
      navigate('/events');
    }
  }, [user, isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credentials: LoginRequest = { email, password };
      console.log('[LoginPage] Attempting login with email:', credentials.email);
      
      const response = await apiService.login(credentials);
      console.log('[LoginPage] Login successful');
      
      if (!response.user) {
        console.error('[LoginPage] ERROR: No user in response!');
        setError('Login failed: Invalid server response');
        setLoading(false);
        return;
      }
      
      setUser(response.user);
      console.log('[LoginPage] User set in store, navigating...');
    } catch (err: any) {
      console.error('[LoginPage] Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Volunteer', email: 'volunteer@example.com', password: 'password123' },
    { role: 'Organizer', email: 'organizer@example.com', password: 'password123' },
    { role: 'Admin', email: 'admin@example.com', password: 'password123' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          filter: 'blur(40px)',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/landing')}
            sx={{
              mb: 3,
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            Back to Home
          </Button>

          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Email Input */}
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Password Input */}
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ p: 0 }}
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Forgot Password */}
            <Box sx={{ textAlign: 'right' }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                underline="hover"
                sx={{
                  fontSize: '0.875rem',
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                height: 48,
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            {/* Divider */}
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Demo Credentials */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 600 }}>
                Demo Credentials
              </Typography>
              <Stack spacing={1}>
                {demoCredentials.map((cred, index) => (
                  <Button
                    key={index}
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword(cred.password);
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Chip
                      label={cred.role}
                      size="small"
                      sx={{
                        mr: 1,
                        fontWeight: 700,
                      }}
                    />
                    {cred.email}
                  </Button>
                ))}
              </Stack>
            </Paper>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  underline="hover"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
