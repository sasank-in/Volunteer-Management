import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  EventAvailable as AvailableIcon,
} from '@mui/icons-material';
import apiService from '@services/api';
import type { Event as EventType, Participation } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MainLayout from '@components/Layout';
import PageHeader from '@components/PageHeader';
import PageSkeleton from '@components/PageSkeleton';
import SectionCard from '@components/SectionCard';
import StatCard from '@components/StatCard';
import StatusChip from '@components/StatusChip';
import { useToast } from '@components/Toast';
import { formatDate } from '@utils/helpers';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToast((s) => s.showToast);
  const [tabValue, setTabValue] = useState(0);

  const participationsQuery = useQuery({
    queryKey: ['participations', 'me'],
    queryFn: () => apiService.getMyParticipations(),
  });

  const eventsQuery = useQuery({
    queryKey: ['events', 'all'],
    queryFn: () => apiService.getAllEvents(),
  });

  const registerMutation = useMutation({
    mutationFn: (eventId: string) => apiService.registerForEvent(eventId),
    onSuccess: () => {
      showToast('Registered for event.', 'success');
      queryClient.invalidateQueries({ queryKey: ['participations', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? 'Could not register for event.', 'error');
    },
  });

  const participations: Participation[] = participationsQuery.data ?? [];
  const events: EventType[] = eventsQuery.data ?? [];

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);
  const registeredEventIds = useMemo(
    () => new Set(participations.filter((p) => p.status !== 'CANCELLED').map((p) => p.eventId)),
    [participations],
  );

  const attendedCount = participations.filter((p) => p.status === 'ATTENDED').length;
  const registeredCount = participations.filter((p) => p.status === 'REGISTERED').length;
  const upcomingCount = events.filter((e) => e.status === 'OPEN').length;

  const isLoading = participationsQuery.isLoading || eventsQuery.isLoading;
  const isError = participationsQuery.isError || eventsQuery.isError;

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
          <PageHeader eyebrow="Volunteer" title="Dashboard" />
          <SectionCard>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="body2">We couldn&apos;t load your dashboard data.</Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  participationsQuery.refetch();
                  eventsQuery.refetch();
                }}
              >
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
          eyebrow="Volunteer"
          title="Your dashboard"
          description="Track your participation, attendance, and upcoming opportunities."
          actions={
            <Button variant="contained" onClick={() => navigate('/events')}>
              Browse events
            </Button>
          }
        />

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Registered"
              value={registeredCount}
              icon={<EventIcon fontSize="small" />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Attended"
              value={attendedCount}
              icon={<CheckIcon fontSize="small" />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total participations"
              value={participations.length}
              icon={<TrendingUpIcon fontSize="small" />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Open events"
              value={upcomingCount}
              icon={<AvailableIcon fontSize="small" />}
              color="warning"
            />
          </Grid>
        </Grid>

        <SectionCard noPadding>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Tab label="My participations" />
            <Tab label="Available events" />
          </Tabs>

          {tabValue === 0 ? (
            participations.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  No participations yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Browse events and register to start volunteering.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/events')}>
                  Explore events
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small" sx={{ minWidth: 560 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participations.map((p) => (
                      <TableRow
                        key={p.id}
                        hover
                        onClick={() => navigate(`/events/${p.eventId}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{eventsById.get(p.eventId)?.title ?? 'Event'}</TableCell>
                        <TableCell>{formatDate(p.registeredAt)}</TableCell>
                        <TableCell>
                          <StatusChip kind="participation" status={p.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          ) : events.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                No events available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back later for new opportunities.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Organizer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((e) => {
                    const isRegistered = registeredEventIds.has(e.id);
                    const isOpen = e.status === 'OPEN';
                    return (
                      <TableRow key={e.id} hover>
                        <TableCell
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/events/${e.id}`)}
                        >
                          {e.title}
                        </TableCell>
                        <TableCell>{formatDate(e.eventDate)}</TableCell>
                        <TableCell>{e.location}</TableCell>
                        <TableCell>{e.organizerName}</TableCell>
                        <TableCell>
                          <StatusChip kind="event" status={e.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant={isRegistered ? 'outlined' : 'contained'}
                            onClick={() => registerMutation.mutate(e.id)}
                            disabled={registerMutation.isPending || isRegistered || !isOpen}
                          >
                            {isRegistered ? 'Registered' : isOpen ? 'Register' : 'Closed'}
                          </Button>
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

export default VolunteerDashboard;
