import React from 'react';
import { Box, Container, Typography, Button, Stack, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/index';
import { Logout as LogOutIcon } from '@mui/icons-material';

const SimpleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome, {user?.username}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: <strong>{user?.role}</strong>
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogOutIcon />}
            onClick={handleLogout}
            sx={{ fontWeight: 700 }}
          >
            Logout
          </Button>
        </Box>

        {/* User Info */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  User Information
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.username}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.role}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.phoneNumber || 'Not provided'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  {user?.role === 'VOLUNTEER' && (
                    <>
                      <Button fullWidth variant="contained" sx={{ fontWeight: 700 }} onClick={() => navigate('/events')}>
                        Browse Events
                      </Button>
                      <Button fullWidth variant="outlined" sx={{ fontWeight: 700 }} onClick={() => navigate('/dashboard')}>
                        My Participations
                      </Button>
                    </>
                  )}
                  {user?.role === 'ORGANIZER' && (
                    <>
                      <Button fullWidth variant="contained" sx={{ fontWeight: 700 }} onClick={() => navigate('/events/create')}>
                        Create Event
                      </Button>
                      <Button fullWidth variant="outlined" sx={{ fontWeight: 700 }} onClick={() => navigate('/dashboard')}>
                        My Events
                      </Button>
                    </>
                  )}
                  {user?.role === 'ADMIN' && (
                    <>
                      <Button fullWidth variant="contained" sx={{ fontWeight: 700 }} onClick={() => navigate('/dashboard')}>
                        Manage Users
                      </Button>
                      <Button fullWidth variant="outlined" sx={{ fontWeight: 700 }} onClick={() => navigate('/events')}>
                        View Events
                      </Button>
                    </>
                  )}
                  <Button fullWidth variant="outlined" sx={{ fontWeight: 700 }} onClick={() => navigate('/profile')}>
                    View Profile
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              System Status
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Backend API</Typography>
                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700 }}>
                  Connected
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Authentication</Typography>
                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700 }}>
                  Authenticated
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Database</Typography>
                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700 }}>
                  Connected
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SimpleDashboard;
