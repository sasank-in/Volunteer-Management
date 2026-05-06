import React, { useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  LocationOn as LocationOnIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import StatCard from '@components/StatCard';
import { formatDate, calculateProgressPercentage, getEventStatusColor, getEventStatusLabel } from '@utils/helpers';

type StatColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const truncateText = (value: string | undefined | null, maxLength: number) => {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    const trimmed = value.slice(0, maxLength);
    const lastSpace = trimmed.lastIndexOf(' ');
    return `${trimmed.slice(0, Math.max(0, lastSpace))}...`;
  };

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'dashboard'],
    queryFn: async () => {
      const allEvents = await apiService.getAllEvents();
      return allEvents.slice(0, 5); // Get latest 5 events
    },
  });

  // Fetch user participations
  const { data: participations = [] } = useQuery({
    queryKey: ['participations', 'me'],
    queryFn: () => apiService.getMyParticipations(),
    enabled: user?.role === 'VOLUNTEER',
  });

  // Fetch organized events
  const { data: organizedEvents = [] } = useQuery({
    queryKey: ['events', 'organized'],
    queryFn: () => apiService.getMyOrganizedEvents(),
    enabled: user?.role === 'ORGANIZER',
  });

  const baseStats = useMemo(() => {
    return {
      totalEvents: events.length,
      registeredEvents: participations.length,
      completedEvents: participations.filter((p) => p.status === 'ATTENDED').length,
    };
  }, [events.length, participations]);

  const avgRatingQuery = useQuery({
    queryKey: ['avg-rating', participations.map((p) => p.eventId).join('|')],
    queryFn: async () => {
      if (participations.length === 0) {
        return 0;
      }
      const ratings = await Promise.all(
        participations.map((p) => apiService.getAverageRating(p.eventId).catch(() => 0))
      );
      return ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;
    },
    enabled: user?.role === 'VOLUNTEER',
  });

  const statCards: Array<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: StatColor;
    visible?: boolean;
  }> = [
    {
      label: 'Total Events',
      value: baseStats.totalEvents,
      icon: <EventIcon fontSize="small" />,
      color: 'primary',
    },
    {
      label: user?.role === 'VOLUNTEER' ? 'Registered Events' : 'Organized Events',
      value: user?.role === 'VOLUNTEER' ? baseStats.registeredEvents : organizedEvents.length,
      icon: <PeopleIcon fontSize="small" />,
      color: 'secondary',
    },
    {
      label: 'Completed Events',
      value: baseStats.completedEvents,
      icon: <TrendingUpIcon fontSize="small" />,
      color: 'success',
    },
    {
      label: 'Avg Rating',
      value: avgRatingQuery.data?.toFixed(1) ?? '0.0',
      icon: <StarIcon fontSize="small" />,
      color: 'warning',
      visible: user?.role === 'VOLUNTEER',
    },
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.role === 'ORGANIZER'
              ? 'Manage your events and volunteers'
              : 'Discover volunteer opportunities and make a difference'}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statCards
            .filter((card) => card.visible !== false)
            .map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard
                  title={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              </Grid>
            ))}
        </Grid>

        {/* Recent/Featured Events */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {user?.role === 'ORGANIZER' ? 'Your Events' : 'Featured Events'}
            </Typography>
            {user?.role === 'ORGANIZER' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/events/create')}
              >
                Create Event
              </Button>
            )}
          </Box>

          {eventsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (events.length === 0) ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {user?.role === 'ORGANIZER'
                  ? 'No events created yet. Start by creating your first event!'
                  : 'No events available at the moment.'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {(user?.role === 'ORGANIZER' ? organizedEvents : events).map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea onClick={() => navigate(`/events/${event.id}`)} sx={{ height: '100%' }}>
                      {/* Status Badge */}
                      <Box
                        sx={{
                          px: 2,
                          pt: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: getEventStatusColor(event.status),
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {getEventStatusLabel(event.status)}
                        </Box>
                        {event.averageRating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ fontSize: '1rem', color: '#f59e0b' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {event.averageRating.toFixed(1)}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {truncateText(event.description, 110)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
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

                    {/* Progress Bar */}
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Volunteers
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
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
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {user?.role === 'VOLUNTEER' && (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                Find your next opportunity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse open events and sign up in a few clicks.
              </Typography>
            </Box>
            <Button variant="contained" size="large" onClick={() => navigate('/events')}>
              Explore events
            </Button>
          </Paper>
        )}
      </Container>
    </MainLayout>
  );
};

export default DashboardPage;
