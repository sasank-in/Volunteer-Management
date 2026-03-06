import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  Button,
  CircularProgress,
  LinearProgress,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  Divider,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Star as StarIcon,
  LocationOn as LocationOnIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import { formatDate, calculateProgressPercentage, getEventStatusColor, getEventStatusLabel } from '@utils/helpers';
import { Event, UserAccount } from '../../types';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [adminTab, setAdminTab] = useState(0);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', { upcomingOnly }],
    queryFn: () => apiService.getAllEvents(upcomingOnly),
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations', 'me'],
    queryFn: () => apiService.getMyParticipations(),
    enabled: user?.role === 'VOLUNTEER',
  });

  const { data: organizedEvents = [] } = useQuery({
    queryKey: ['events', 'organized'],
    queryFn: () => apiService.getMyOrganizedEvents(),
    enabled: user?.role === 'ORGANIZER',
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getAllUsers(),
    enabled: user?.role === 'ADMIN',
  });

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const eventStatusOptions = ['OPEN', 'FULL', 'COMPLETED', 'CANCELLED'];

  const isActiveUser = (u: UserAccount) => {
    if (u.status) return u.status === 'ACTIVE';
    if (typeof u.isActive === 'boolean') return u.isActive;
    return true;
  };

  const roleStats = useMemo(() => {
    if (user?.role === 'VOLUNTEER') {
      const attended = participations.filter((p) => p.status === 'ATTENDED').length;
      return [
        { label: 'Registered', value: participations.length },
        { label: 'Attended', value: attended },
        { label: 'Upcoming', value: events.filter((e) => e.status === 'OPEN').length },
      ];
    }
    if (user?.role === 'ORGANIZER') {
      const total = organizedEvents.length;
      const open = organizedEvents.filter((e) => e.status === 'OPEN').length;
      const volunteers = organizedEvents.reduce((sum, e) => sum + e.registeredVolunteers, 0);
      return [
        { label: 'My Events', value: total },
        { label: 'Open Events', value: open },
        { label: 'Volunteers', value: volunteers },
      ];
    }
    if (user?.role === 'ADMIN') {
      const organizers = users.filter((u) => u.role === 'ORGANIZER').length;
      return [
        { label: 'Total Users', value: users.length },
        { label: 'Total Events', value: events.length },
        { label: 'Organizers', value: organizers },
      ];
    }
    return [];
  }, [user?.role, participations, events, organizedEvents, users]);

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiService.updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      apiService.updateUserStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiService.deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
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

  const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Header with Status and Rating */}
      <Box
        sx={{
          px: 2,
          pt: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Chip
          label={getEventStatusLabel(event.status)}
          sx={{
            bgcolor: getEventStatusColor(event.status),
            color: 'white',
            fontWeight: 600,
          }}
          size="small"
        />
        {event.averageRating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ fontSize: '1rem', color: '#f59e0b' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {event.averageRating.toFixed(1)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1 }}>
        {/* Title and Organizer */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {event.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          by {event.organizerName}
        </Typography>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {event.description.substring(0, 100)}...
        </Typography>

        {/* Location and Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocationOnIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {event.location}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DateRangeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {formatDate(event.eventDate)}
          </Typography>
        </Box>
      </CardContent>

      {/* Volunteer Progress */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Volunteers
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {event.registeredVolunteers}/{event.requiredVolunteers}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={calculateProgressPercentage(
            event.registeredVolunteers,
            event.requiredVolunteers
          )}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      {/* Action Button */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant={event.status === 'OPEN' ? 'contained' : 'outlined'}
          disabled={event.status !== 'OPEN'}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/events/${event.id}`);
          }}
        >
          {event.status === 'OPEN' ? 'View Details' : getEventStatusLabel(event.status)}
        </Button>
      </Box>
    </Card>
  );

  return (
    <MainLayout>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Events
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.role === 'ADMIN'
                ? 'Oversee users and events'
                : user?.role === 'ORGANIZER'
                  ? 'Manage your events and volunteers'
                  : 'Find and join volunteer opportunities'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {(user?.role === 'ADMIN') && (
              <Button variant="outlined" onClick={() => setAdminTab(1)}>
                Manage Users
              </Button>
            )}
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/events/create')}
                size="large"
              >
                Create Event
              </Button>
            )}
          </Stack>
        </Box>

        {/* Role Summary */}
        {roleStats.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {roleStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {user?.role === 'ADMIN' && (
          <Paper sx={{ mb: 4 }}>
            <Tabs value={adminTab} onChange={(_, v) => setAdminTab(v)}>
              <Tab label="Events" />
              <Tab label="Users" />
            </Tabs>
          </Paper>
        )}

        {(user?.role !== 'ADMIN' || adminTab === 0) && (
          <>
            {/* Filters */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Grid container spacing={2}>
                {/* Search */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Status Filter */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 1 }}>
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label="All"
                        onClick={() => setStatusFilter(null)}
                        variant={statusFilter === null ? 'filled' : 'outlined'}
                        color={statusFilter === null ? 'primary' : 'default'}
                        size="small"
                      />
                      {eventStatusOptions.map((status) => (
                        <Chip
                          key={status}
                          label={status}
                          onClick={() => setStatusFilter(status)}
                          variant={statusFilter === status ? 'filled' : 'outlined'}
                          color={statusFilter === status ? 'primary' : 'default'}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Time Filter */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 1 }}>
                      Timeline
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label="All"
                        onClick={() => setUpcomingOnly(false)}
                        variant={!upcomingOnly ? 'filled' : 'outlined'}
                        color={!upcomingOnly ? 'primary' : 'default'}
                        size="small"
                      />
                      <Chip
                        label="Upcoming"
                        onClick={() => setUpcomingOnly(true)}
                        variant={upcomingOnly ? 'filled' : 'outlined'}
                        color={upcomingOnly ? 'primary' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        {/* Results */}
        {(user?.role !== 'ADMIN' || adminTab === 0) ? (
          isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : filteredEvents.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No events found
              </Typography>
              <Typography color="text.secondary">
                {searchTerm
                  ? 'Try adjusting your search filters'
                  : 'Check back later for new opportunities'}
              </Typography>
            </Paper>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredEvents.length} of {events.length} events
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {filteredEvents.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <EventCard event={event} />
                  </Grid>
                ))}
              </Grid>
            </>
          )
        ) : (
          <Paper>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update roles, activate/deactivate, or remove users.
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 2, overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        )}

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

export default EventsPage;
