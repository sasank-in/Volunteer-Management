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
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import apiService from '@services/api';
import AuthLayout from '@components/AuthLayout';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('This reset link is missing its token. Request a new one to continue.');
      setTokenInvalid(true);
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must include both letters and digits.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiService.resetPassword(token, newPassword);
      setSuccess('Password reset successful. Redirecting to sign-in…');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      const message = err.response?.data?.error ?? '';
      const expired = /expired|invalid|not found/i.test(message);
      setTokenInvalid(expired);
      setError(message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
          Set a new password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose something you haven&apos;t used before. Reset links expire after 30 minutes.
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            tokenInvalid ? (
              <Button
                component={RouterLink}
                to="/forgot-password"
                color="inherit"
                size="small"
              >
                Request new link
              </Button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          size="medium"
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
          helperText="At least 10 characters, with both letters and digits."
          disabled={loading || tokenInvalid}
        />
        <TextField
          fullWidth
          size="medium"
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={loading || tokenInvalid}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading || tokenInvalid}
          sx={{ mt: 1, height: 44 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Reset password'}
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

export default ResetPasswordPage;
