import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@hooks/useAuth';
import apiService from '@services/api';
import MainLayout from '@components/Layout';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiService.getProfile(),
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data) => apiService.updateProfile(data),
    onSuccess: () => {
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      username: profile?.username || '',
      email: profile?.email || '',
      phoneNumber: profile?.phoneNumber || '',
    });
    setIsEditing(false);
  };

  const getAvatarColor = (role?: string): string => {
    if (role === 'ORGANIZER') return '#8b5cf6';
    if (role === 'ADMIN') return '#ef4444';
    return '#3b82f6';
  };

  const getRoleLabel = (role?: string): string => {
    switch (role) {
      case 'ORGANIZER':
        return 'Event Organizer';
      case 'ADMIN':
        return 'Administrator';
      case 'VOLUNTEER':
        return 'Volunteer';
      default:
        return role || '';
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal information
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Profile Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: getAvatarColor(profile?.role),
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
              >
                {(profile?.username || 'U').substring(0, 2).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {profile?.username}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    mt: 1,
                  }}
                >
                  {getRoleLabel(profile?.role)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Form Section */}
            <Grid container spacing={3}>
              {/* Username */}
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

              {/* Email */}
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

              {/* Phone */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>

              {/* Role Badge */}
              <Grid item xs={12}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 1 }}>
                    Account Type
                  </Typography>
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      display: 'inline-block',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {getRoleLabel(profile?.role)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Timestamps */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Joined
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {profile?.updatedAt
                        ? new Date(profile.updatedAt).toLocaleDateString()
                        : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={
                        updateMutation.isPending ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      onClick={handleSubmit}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Account Settings
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Change Password
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Update your password to keep your account secure
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" size="small">
                    Change Password
                  </Button>
                </Box>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Notification Settings
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Control how you receive notifications
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" size="small">
                    Manage Notifications
                  </Button>
                </Box>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Privacy & Security
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Review your privacy settings and security options
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" size="small">
                    Privacy Settings
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default ProfilePage;
