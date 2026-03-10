import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tab, Tabs, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { People, Event, CheckCircle, TrendingUp } from '@mui/icons-material';
import apiService from '@services/api';
import type { UserAccount, Event as EventType } from '../../types';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@components/Layout';
import { useAuth } from '@hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiService.getAllUsers(),
    enabled: user?.role === 'ADMIN',
  });

  const eventsQuery = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: () => apiService.getAllEvents(),
    enabled: user?.role === 'ADMIN',
  });

  const users: UserAccount[] = usersQuery.data ?? [];
  const events: EventType[] = eventsQuery.data ?? [];

  const isActiveUser = (user: UserAccount) => {
    if (user.status) return user.status === 'ACTIVE';
    if (typeof user.isActive === 'boolean') return user.isActive;
    return true;
  };

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiService.updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      apiService.updateUserStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiService.deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const handleRoleChange = (userId: string, role: string) => {
    setActionUserId(userId);
    updateUserRoleMutation.mutate(
      { userId, role },
      { onSettled: () => setActionUserId(null) }
    );
  };

  const handleStatusToggle = (userId: string, nextStatus: 'ACTIVE' | 'INACTIVE') => {
    setActionUserId(userId);
    updateUserStatusMutation.mutate(
      { userId, status: nextStatus },
      { onSettled: () => setActionUserId(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setActionUserId(deleteTarget.id);
    deleteUserMutation.mutate(deleteTarget.id, {
      onSettled: () => {
        setActionUserId(null);
        setDeleteTarget(null);
      },
    });
  };

  const stats = [
    { title: 'Total Users', value: users.length, icon: People, color: '#3b82f6' },
    { title: 'Total Events', value: events.length, icon: Event, color: '#10b981' },
    { title: 'Organizers', value: users.filter(u => u.role === 'ORGANIZER').length, icon: CheckCircle, color: '#f59e0b' },
    { title: 'Volunteers', value: users.filter(u => u.role === 'VOLUNTEER').length, icon: TrendingUp, color: '#8b5cf6' },
  ];

  const usersLoading = usersQuery.isLoading;
  const eventsLoading = eventsQuery.isLoading;
  const usersError = usersQuery.isError;
  const eventsError = eventsQuery.isError;

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Admin Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">Manage users and events</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate('/events')}>Go to Events</Button>
        </Box>

        {(usersError || eventsError) && (
          <Paper sx={{ p: 3, mb: 4 }}>
            {usersError && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Failed to load users.
                </Typography>
                <Button variant="outlined" onClick={() => usersQuery.refetch()}>
                  Retry users
                </Button>
              </Box>
            )}
            {eventsError && (
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Failed to load events.
                </Typography>
                <Button variant="outlined" onClick={() => eventsQuery.refetch()}>
                  Retry events
                </Button>
              </Box>
            )}
          </Paper>
        )}

        {(usersLoading || eventsLoading) && !(usersError || eventsError) && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Loading admin data...
            </Typography>
          </Paper>
        )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: stat.color, color: 'white', mr: 2 }}>
                      <Icon />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Paper>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Users" />
          <Tab label="Events" />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={actionUserId === u.id}
                      >
                        <MenuItem value="VOLUNTEER">VOLUNTEER</MenuItem>
                        <MenuItem value="ORGANIZER">ORGANIZER</MenuItem>
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isActiveUser(u) ? 'ACTIVE' : 'INACTIVE'}
                        size="small"
                        color={isActiveUser(u) ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleStatusToggle(u.id, isActiveUser(u) ? 'INACTIVE' : 'ACTIVE')
                          }
                          disabled={actionUserId === u.id}
                        >
                          {isActiveUser(u) ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => setDeleteTarget(u)}
                          disabled={actionUserId === u.id}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>{e.organizerName}</TableCell>
                    <TableCell>{new Date(e.eventDate).toLocaleDateString()}</TableCell>
                    <TableCell><Chip label={e.status} size="small" color={e.status === 'OPEN' ? 'success' : 'default'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete {deleteTarget?.username}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={!!actionUserId}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </MainLayout>
  );
};

export default AdminDashboard;
