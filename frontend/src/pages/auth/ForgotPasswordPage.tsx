import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import apiService from '@services/api';
import AuthLayout from '@components/AuthLayout';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiService.requestPasswordReset(email);
      setSuccess('If an account exists for that email, a reset link has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
          Reset your password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter the email address on your account. We&apos;ll send a reset link if it matches a known user.
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          size="medium"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 1, height: 44 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Send reset link'}
        </Button>

        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/login" underline="hover" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Back to sign in
          </Link>
        </Stack>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
