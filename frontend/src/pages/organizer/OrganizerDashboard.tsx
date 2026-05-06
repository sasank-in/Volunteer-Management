import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Event, People, Star, TrendingUp, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '@services/api';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@components/Layout';

const OrganizerDashboard = () => {
  const navigate = useNavigate();

  const {
    data: events = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['events', 'organized'],
    queryFn: () => apiService.getMyOrganizedEvents(),
  });

  const stats = [
    { title: 'Total Events', value: events.length, icon: Event, color: '#3b82f6' },
    { title: 'Total Volunteers', value: events.reduce((sum, e) => sum + e.registeredVolunteers, 0), icon: People, color: '#10b981' },
    { title: 'Avg Rating', value: (events.reduce((sum, e) => sum + (e.averageRating || 0), 0) / Math.max(events.length, 1)).toFixed(1), icon: Star, color: '#f59e0b' },
    { title: 'Open Events', value: events.filter(e => e.status === 'OPEN').length, icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Organizer Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">Manage your events</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate('/events')}>Go to Events</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/events/create')}>
              Create Event
            </Button>
          </Box>
        </Box>

        {(isLoading) && (
          <Paper sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading your events...
            </Typography>
          </Paper>
        )}

        {isError && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              We couldn’t load your events.
            </Typography>
            <Button variant="outlined" onClick={() => refetch()}>
              Retry
            </Button>
          </Paper>
        )}

        {!isLoading && !isError && (
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
        )}

        <Paper>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Your Events</Typography>
          </Box>
          {events.length === 0 && !isLoading && !isError ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                No events yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first event to start recruiting volunteers.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/events/create')}>
                Create Event
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Volunteers</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map(e => (
                    <TableRow key={e.id} hover onClick={() => navigate(`/events/${e.id}`)} sx={{ cursor: 'pointer' }}>
                      <TableCell>{e.title}</TableCell>
                      <TableCell>{new Date(e.eventDate).toLocaleDateString()}</TableCell>
                      <TableCell>{e.location}</TableCell>
                      <TableCell>{e.registeredVolunteers}/{e.requiredVolunteers}</TableCell>
                      <TableCell>
                        <Chip label={e.status} size="small" color={e.status === 'OPEN' ? 'success' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default OrganizerDashboard;
