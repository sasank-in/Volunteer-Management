import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { People, Event, CheckCircle, TrendingUp } from '@mui/icons-material';
import apiService from '@services/api';
import type { UserAccount, Event as EventType } from '../../types';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@components/Layout';
import PageHeader from '@components/PageHeader';
import PageSkeleton from '@components/PageSkeleton';
import StatCard from '@components/StatCard';
import StatusChip from '@components/StatusChip';
import { useToast } from '@components/Toast';
import { useAuth } from '@hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDate, formatDateRelative, formatDateTime } from '@utils/helpers';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [usersPage, setUsersPage] = useState(0);
  const [usersRowsPerPage, setUsersRowsPerPage] = useState(25);
  const [eventsPage, setEventsPage] = useState(0);
  const [eventsRowsPerPage, setEventsRowsPerPage] = useState(25);
  const [auditPage, setAuditPage] = useState(0);
  const [auditRowsPerPage, setAuditRowsPerPage] = useState(25);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const showToast = useToast((s) => s.showToast);

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

  // Only fetch the audit log when the Activity tab is open — it can grow large.
  const auditQuery = useQuery({
    queryKey: ['admin', 'audit-log', auditPage, auditRowsPerPage],
    queryFn: () => apiService.getAuditLog(auditPage, auditRowsPerPage),
    enabled: user?.role === 'ADMIN' && tabValue === 2,
    placeholderData: (prev) => prev,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-log'] });
      showToast('User role updated.', 'success');
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.error ?? 'Could not update role.', 'error'),
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      apiService.updateUserStatus(userId, status),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-log'] });
      showToast(
        vars.status === 'ACTIVE' ? 'User activated.' : 'User deactivated.',
        'success',
      );
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.error ?? 'Could not update status.', 'error'),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-log'] });
      showToast('User deleted.', 'success');
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.error ?? 'Could not delete user.', 'error'),
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

  type StatColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  const stats: Array<{ title: string; value: number; icon: any; color: StatColor }> = [
    { title: 'Total users', value: users.length, icon: People, color: 'primary' },
    { title: 'Total events', value: events.length, icon: Event, color: 'success' },
    { title: 'Organizers', value: users.filter(u => u.role === 'ORGANIZER').length, icon: CheckCircle, color: 'info' },
    { title: 'Volunteers', value: users.filter(u => u.role === 'VOLUNTEER').length, icon: TrendingUp, color: 'warning' },
  ];

  const usersLoading = usersQuery.isLoading;
  const eventsLoading = eventsQuery.isLoading;
  const usersError = usersQuery.isError;
  const eventsError = eventsQuery.isError;

  if ((usersLoading || eventsLoading) && !(usersError || eventsError)) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <PageSkeleton stats={4} sections={1} />
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <PageHeader
          eyebrow="Admin"
          title="Workspace administration"
          description="Manage users, monitor events, and oversee platform activity."
          actions={
            <Button variant="outlined" onClick={() => navigate('/events')}>
              All events
            </Button>
          }
        />

        {(usersError || eventsError) && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            {usersError && (
              <Box sx={{ mb: eventsError ? 2 : 0 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Failed to load users.
                </Typography>
                <Button size="small" variant="outlined" onClick={() => usersQuery.refetch()}>
                  Retry users
                </Button>
              </Box>
            )}
            {eventsError && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Failed to load events.
                </Typography>
                <Button size="small" variant="outlined" onClick={() => eventsQuery.refetch()}>
                  Retry events
                </Button>
              </Box>
            )}
          </Paper>
        )}

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={<Icon fontSize="small" />}
                  color={stat.color}
                />
              </Grid>
            );
          })}
        </Grid>

        <Paper>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Users" />
            <Tab label="Events" />
            <Tab label="Activity" />
          </Tabs>

        {tabValue === 0 && (
          users.length === 0 && !usersLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                No users found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users will appear here once they register.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small" sx={{ minWidth: 720 }}>
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
                  {users
                    .slice(usersPage * usersRowsPerPage, usersPage * usersRowsPerPage + usersRowsPerPage)
                    .map(u => (
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
                        <StatusChip kind="user" status={isActiveUser(u) ? 'ACTIVE' : 'INACTIVE'} />
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
              <TablePagination
                component="div"
                count={users.length}
                page={usersPage}
                onPageChange={(_, p) => setUsersPage(p)}
                rowsPerPage={usersRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setUsersRowsPerPage(parseInt(e.target.value, 10));
                  setUsersPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </TableContainer>
          )
        )}

        {tabValue === 1 && (
          events.length === 0 && !eventsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Events will appear here once organizers create them.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Organizer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events
                    .slice(eventsPage * eventsRowsPerPage, eventsPage * eventsRowsPerPage + eventsRowsPerPage)
                    .map(e => (
                    <TableRow key={e.id}>
                      <TableCell>{e.title}</TableCell>
                      <TableCell>{e.organizerName}</TableCell>
                      <TableCell>{formatDate(e.eventDate)}</TableCell>
                      <TableCell><StatusChip kind="event" status={e.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={events.length}
                page={eventsPage}
                onPageChange={(_, p) => setEventsPage(p)}
                rowsPerPage={eventsRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setEventsRowsPerPage(parseInt(e.target.value, 10));
                  setEventsPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </TableContainer>
          )
        )}

        {tabValue === 2 && (
          <Box>
            {auditQuery.isError ? (
              <Box sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Could not load audit log.
                </Typography>
                <Button size="small" variant="outlined" onClick={() => auditQuery.refetch()}>
                  Retry
                </Button>
              </Box>
            ) : auditQuery.data && auditQuery.data.content.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  No admin actions recorded yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role changes, profile edits and deletions made by admins will appear here.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small" sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 180 }}>When</TableCell>
                      <TableCell sx={{ width: 160 }}>Actor</TableCell>
                      <TableCell sx={{ width: 180 }}>Action</TableCell>
                      <TableCell sx={{ width: 140 }}>Target</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(auditQuery.data?.content ?? []).map((entry) => (
                      <TableRow key={entry.id} hover>
                        <TableCell>
                          <Typography variant="body2">{formatDateTime(entry.occurredAt)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateRelative(entry.occurredAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {entry.actorUsername}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              fontFamily: 'monospace',
                            }}
                          >
                            {entry.action}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {entry.targetType ? (
                            <Typography
                              variant="caption"
                              sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                            >
                              {entry.targetType}
                              {entry.targetId ? `:${entry.targetId.slice(0, 8)}` : ''}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {entry.details ?? '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={auditQuery.data?.totalElements ?? 0}
                  page={auditPage}
                  onPageChange={(_, p) => setAuditPage(p)}
                  rowsPerPage={auditRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setAuditRowsPerPage(parseInt(e.target.value, 10));
                    setAuditPage(0);
                  }}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                />
              </TableContainer>
            )}
          </Box>
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
