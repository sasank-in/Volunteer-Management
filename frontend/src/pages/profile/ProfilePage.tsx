import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import PageSkeleton from '@components/PageSkeleton';
import { useToast } from '@components/Toast';
import { formatDate, formatDateRelative } from '@utils/helpers';
import type { Participation, UserAccount } from '@/types';

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
  const [tab, setTab] = useState(0);
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

  const participationsQuery = useQuery({
    queryKey: ['participations', 'me'],
    queryFn: () => apiService.getMyParticipations(),
    enabled: user?.role === 'VOLUNTEER',
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
          <PageSkeleton sections={2} />
        </Container>
      </MainLayout>
    );
  }

  const participations: Participation[] = participationsQuery.data ?? [];
  const attendedCount = participations.filter((p) => p.status === 'ATTENDED').length;
  const tint = avatarColor(profile?.role);

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ pt: 0 }}>
        {/* Identity band — distinct from the PageHeader pattern */}
        <Card sx={{ mb: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              height: 96,
              bgcolor: tint,
              backgroundImage: `linear-gradient(135deg, ${tint} 0%, ${alpha(tint, 0.6)} 100%)`,
            }}
          />
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2.5, pt: 0, position: 'relative' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
              sx={{ mt: -5, mb: 2 }}
            >
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  fontSize: '2rem',
                  fontWeight: 700,
                  border: '4px solid',
                  borderColor: 'background.paper',
                  bgcolor: tint,
                  color: 'common.white',
                }}
              >
                {(profile?.username ?? 'U').substring(0, 2).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, pb: 0.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
                  {profile?.username}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 0.5, color: 'text.secondary' }}
                >
                  <Typography variant="body2">{ROLE_LABEL[profile?.role ?? '']}</Typography>
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                  <Typography variant="body2">{profile?.email}</Typography>
                </Stack>
              </Box>
            </Stack>

            {/* Inline mini-stats. Volunteer-flavoured for now; organizers see joined date instead. */}
            <Stack
              direction="row"
              divider={<Box sx={{ width: '1px', bgcolor: 'divider' }} />}
              spacing={0}
              sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}
            >
              {user?.role === 'VOLUNTEER' ? (
                <>
                  <ProfileStat
                    icon={<EventIcon fontSize="small" />}
                    label="Registered"
                    value={participations.length}
                  />
                  <ProfileStat
                    icon={<CheckIcon fontSize="small" />}
                    label="Attended"
                    value={attendedCount}
                  />
                  <ProfileStat
                    icon={<StarIcon fontSize="small" />}
                    label="Member since"
                    value={profile?.createdAt ? formatDateRelative(profile.createdAt) : '—'}
                  />
                </>
              ) : (
                <>
                  <ProfileStat
                    icon={<EventIcon fontSize="small" />}
                    label="Account type"
                    value={ROLE_LABEL[profile?.role ?? ''] ?? '—'}
                  />
                  <ProfileStat
                    icon={<StarIcon fontSize="small" />}
                    label="Member since"
                    value={profile?.createdAt ? formatDate(profile.createdAt) : '—'}
                  />
                </>
              )}
            </Stack>
          </Box>
        </Card>

        {/* Tabs replace the stacked SectionCard pattern */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Account" />
            {user?.role === 'VOLUNTEER' && (
              <Tab icon={<EventIcon fontSize="small" />} iconPosition="start" label="Activity" />
            )}
            <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="Security" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Account details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    What other users see when you organize or attend events.
                  </Typography>
                </Box>
                {isEditing ? (
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
                )}
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
            </CardContent>
          </Card>
        )}

        {tab === 1 && user?.role === 'VOLUNTEER' && (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your registrations across all events.
                </Typography>
              </Box>
              {participations.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    You haven&apos;t registered for any events yet.
                  </Typography>
                  <Button variant="contained" size="small" onClick={() => navigate('/events')}>
                    Browse events
                  </Button>
                </Box>
              ) : (
                <Stack divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
                  {participations.slice(0, 12).map((p) => (
                    <Stack
                      key={p.id}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ px: 3, py: 1.75 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor:
                            p.status === 'ATTENDED'
                              ? 'success.main'
                              : p.status === 'CANCELLED'
                                ? 'text.disabled'
                                : p.status === 'NO_SHOW'
                                  ? 'error.main'
                                  : 'info.main',
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                          Event {p.eventId.substring(0, 8)}…
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.status} · registered {formatDateRelative(p.registeredAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        )}

        {(tab === 2 || (tab === 1 && user?.role !== 'VOLUNTEER')) && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Security
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use a password you don&apos;t reuse anywhere else.
                </Typography>
              </Box>

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
            </CardContent>
          </Card>
        )}
      </Container>
    </MainLayout>
  );
};

const ProfileStat: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <Box sx={{ flex: 1, px: { xs: 1, sm: 2 }, py: 0.5 }}>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary', mb: 0.25 }}>
      {icon}
      <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
        {label}
      </Typography>
    </Stack>
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export default ProfilePage;
