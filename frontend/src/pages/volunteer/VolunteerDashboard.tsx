import React, { useMemo, useState } from 'react';
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
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import { Event, CheckCircle, Star, TrendingUp } from '@mui/icons-material';
import apiService from '@services/api';
import type { Participation, Event as EventType } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '@components/Layout';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['participations', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const participations: Participation[] = participationsQuery.data ?? [];
  const events: EventType[] = eventsQuery.data ?? [];

  const stats = [
    { title: 'Events Registered', value: participations.length, icon: Event, color: '#3b82f6' },
    { title: 'Events Attended', value: participations.filter(p => p.status === 'ATTENDED').length, icon: CheckCircle, color: '#10b981' },
    { title: 'Upcoming Events', value: events.filter(e => e.status === 'OPEN').length, icon: TrendingUp, color: '#f59e0b' },
    { title: 'Avg Rating', value: '4.5', icon: Star, color: '#8b5cf6' },
  ];

  const eventsById = new Map(events.map((event) => [event.id, event]));
  const registeredEventIds = useMemo(
    () => new Set(participations.filter((p) => p.status !== 'CANCELLED').map((p) => p.eventId)),
    [participations]
  );

  const isLoading = participationsQuery.isLoading || eventsQuery.isLoading;
  const isError = participationsQuery.isError || eventsQuery.isError;

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Volunteer Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">Track your volunteer activities</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate('/events')}>Events</Button>
        </Box>

        {isLoading && (
          <Paper sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading your dashboard...
            </Typography>
          </Paper>
        )}

        {isError && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              We couldn’t load your dashboard data.
            </Typography>
            <Button variant="outlined" onClick={() => {
              participationsQuery.refetch();
              eventsQuery.refetch();
            }}>
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
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="My Participations" />
            <Tab label="Available Events" />
          </Tabs>

          {tabValue === 0 && (
            participations.length === 0 && !isLoading && !isError ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No participations yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Browse events and register to start volunteering.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/events')}>
                  Explore Events
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Registered</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participations.map(p => (
                      <TableRow key={p.id} hover onClick={() => navigate(`/events/${p.eventId}`)} sx={{ cursor: 'pointer' }}>
                        <TableCell>{eventsById.get(p.eventId)?.title || 'Event'}</TableCell>
                        <TableCell>{new Date(p.registeredAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip label={p.status} size="small" color={p.status === 'ATTENDED' ? 'success' : 'default'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}

          {tabValue === 1 && (
            events.length === 0 && !isLoading && !isError ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No events available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check back later for new opportunities.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Organizer</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map(e => {
                      const isRegistered = registeredEventIds.has(e.id);
                      const isOpen = e.status === 'OPEN';
                      const actionLabel = isRegistered ? 'Registered' : (isOpen ? 'Register' : 'Closed');
                      return (
                        <TableRow key={e.id}>
                          <TableCell>{e.title}</TableCell>
                          <TableCell>{new Date(e.eventDate).toLocaleDateString()}</TableCell>
                          <TableCell>{e.location}</TableCell>
                          <TableCell>{e.organizerName}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant={isRegistered ? 'outlined' : 'contained'}
                              onClick={() => registerMutation.mutate(e.id)}
                              disabled={registerMutation.isPending || isRegistered || !isOpen}
                            >
                              {actionLabel}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default VolunteerDashboard;
