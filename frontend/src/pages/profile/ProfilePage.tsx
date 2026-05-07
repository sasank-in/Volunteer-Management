import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import PageHeader from '@components/PageHeader';
import PageSkeleton from '@components/PageSkeleton';
import SectionCard from '@components/SectionCard';
import { useToast } from '@components/Toast';
import { formatDate } from '@utils/helpers';
import type { UserAccount } from '@/types';

const ROLE_LABEL: Record<string, string> = {
  ORGANIZER: 'Event Organizer',
  ADMIN: 'Administrator',
  VOLUNTEER: 'Volunteer',
};

const avatarColor = (role?: string): string => {
  if (role === 'ORGANIZER') return '#0F766E';
  if (role === 'ADMIN') return '#B91C1C';
  return '#0F4C81';
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToast((s) => s.showToast);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    phoneNumber: user?.phoneNumber ?? '',
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiService.getProfile(),
  });

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        username: profile.username,
        email: profile.email,
        phoneNumber: profile.phoneNumber ?? '',
      });
    }
  }, [profile, isEditing]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserAccount>) => apiService.updateProfile(data),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Profile updated.', 'success');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? 'Could not update profile.', 'error');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => apiService.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      setPasswordError('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated.', 'success');
    },
    onError: (err: any) => {
      setPasswordError(err?.response?.data?.error ?? 'Could not update password.');
    },
  });

  const handleChangePassword = () => {
    setPasswordError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 10) {
      setPasswordError('New password must be at least 10 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError('New password must include both letters and digits.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    changePasswordMutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email,
        phoneNumber: profile.phoneNumber ?? '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Container maxWidth="md">
          <PageSkeleton sections={3} />
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="md">
        <PageHeader title="Your profile" description="Manage your account, security, and preferences." />

        <Stack spacing={3}>
          <SectionCard
            title="Account"
            description="The details other users see when you organize or attend events."
            action={
              isEditing ? (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={
                      updateMutation.isPending ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={() => updateMutation.mutate(formData)}
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </Button>
                </Stack>
              ) : (
                <Button size="small" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )
            }
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start" sx={{ mb: 3 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: avatarColor(profile?.role),
                  fontSize: '1.25rem',
                  fontWeight: 700,
                }}
              >
                {(profile?.username ?? 'U').substring(0, 2).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {profile?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ROLE_LABEL[profile?.role ?? ''] ?? profile?.role}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                  Joined {profile?.createdAt ? formatDate(profile.createdAt) : 'recently'}
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard
            title="Security"
            description="Use a password you don't reuse anywhere else."
          >
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError('')}>
                {passwordError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  helperText="At least 10 characters, with both letters and digits."
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Saving…' : 'Update password'}
                </Button>
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard
            title="Preferences"
            description="Notification settings and other workspace controls."
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Notifications
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Review your notification feed and mark items as read.
                </Typography>
              </Box>
              <Button variant="outlined" size="small" onClick={() => navigate('/notifications')}>
                Manage notifications
              </Button>
            </Stack>
          </SectionCard>
        </Stack>
      </Container>
    </MainLayout>
  );
};

export default ProfilePage;
