import {
  Box,
  Button,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '@services/api';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@components/Layout';
import PageHeader from '@components/PageHeader';
import PageSkeleton from '@components/PageSkeleton';
import SectionCard from '@components/SectionCard';
import StatCard from '@components/StatCard';
import StatusChip from '@components/StatusChip';
import { calculateProgressPercentage, formatDate } from '@utils/helpers';

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

  const totalVolunteers = events.reduce((sum, e) => sum + e.registeredVolunteers, 0);
  const openEvents = events.filter((e) => e.status === 'OPEN').length;
  const ratedEvents = events.filter((e) => e.averageRating != null);
  const avgRating =
    ratedEvents.length > 0
      ? (ratedEvents.reduce((sum, e) => sum + (e.averageRating || 0), 0) / ratedEvents.length).toFixed(1)
      : '—';

  if (isLoading) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <PageSkeleton stats={4} sections={1} />
        </Container>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <PageHeader eyebrow="Organizer" title="Dashboard" />
          <SectionCard>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="body2">We couldn&apos;t load your events.</Typography>
              <Button variant="outlined" onClick={() => refetch()}>
                Retry
              </Button>
            </Stack>
          </SectionCard>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <PageHeader
          eyebrow="Organizer"
          title="Your events"
          description="Manage events you organize, track volunteer signups, and review feedback."
          actions={
            <>
              <Button variant="outlined" onClick={() => navigate('/events')}>
                All events
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/events/create')}>
                Create event
              </Button>
            </>
          }
        />

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total events"
              value={events.length}
              icon={<EventIcon fontSize="small" />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Volunteers"
              value={totalVolunteers}
              icon={<PeopleIcon fontSize="small" />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Open events"
              value={openEvents}
              icon={<TrendingUpIcon fontSize="small" />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg rating"
              value={avgRating}
              icon={<StarIcon fontSize="small" />}
              color="warning"
            />
          </Grid>
        </Grid>

        <SectionCard
          title="Your events"
          description="Click any row to open the event detail."
          action={
            <Button size="small" variant="text" onClick={() => navigate('/events/create')}>
              + New
            </Button>
          }
          noPadding
        >
          {events.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                No events yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first event to start recruiting volunteers.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/events/create')}
              >
                Create event
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell sx={{ minWidth: 140 }}>Volunteers</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((e) => {
                    const pct = calculateProgressPercentage(e.registeredVolunteers, e.requiredVolunteers);
                    return (
                      <TableRow
                        key={e.id}
                        hover
                        onClick={() => navigate(`/events/${e.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{e.title}</TableCell>
                        <TableCell>{formatDate(e.eventDate)}</TableCell>
                        <TableCell>{e.location}</TableCell>
                        <TableCell>
                          <Stack spacing={0.5} sx={{ minWidth: 120 }}>
                            <Typography variant="caption" color="text.secondary">
                              {e.registeredVolunteers}/{e.requiredVolunteers}
                            </Typography>
                            <LinearProgress variant="determinate" value={pct} />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <StatusChip kind="event" status={e.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </SectionCard>
      </Container>
    </MainLayout>
  );
};

export default OrganizerDashboard;
