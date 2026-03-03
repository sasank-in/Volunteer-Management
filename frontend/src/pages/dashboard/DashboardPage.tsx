import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
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
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import { formatDate, calculateProgressPercentage, getEventStatusColor, getEventStatusLabel } from '@utils/helpers';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    registeredEvents: 0,
    completedEvents: 0,
    averageRating: 0,
  });

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

  useEffect(() => {
    const calculateStats = async () => {
      const newStats = {
        totalEvents: events.length,
        registeredEvents: participations.length,
        completedEvents: participations.filter((p) => p.status === 'ATTENDED').length,
        averageRating: 0,
      };

      // Calculate average rating if volunteer
      if (user?.role === 'VOLUNTEER' && participations.length > 0) {
        const ratings = await Promise.all(
          participations.map((p) =>
            apiService
              .getAverageRating(p.eventId)
              .catch(() => 0)
          )
        );
        newStats.averageRating = 
          ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;
      }

      setStats(newStats);
    };

    calculateStats();
  }, [events, participations, user?.role]);

  const statCards = [
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: <EventIcon />,
      color: '#3b82f6',
    },
    {
      label: user?.role === 'VOLUNTEER' ? 'Registered Events' : 'Organized Events',
      value: user?.role === 'VOLUNTEER' ? stats.registeredEvents : organizedEvents.length,
      icon: <PeopleIcon />,
      color: '#8b5cf6',
    },
    {
      label: 'Completed Events',
      value: stats.completedEvents,
      icon: <TrendingUpIcon />,
      color: '#10b981',
    },
    {
      label: 'Avg Rating',
      value: stats.averageRating.toFixed(1),
      icon: <StarIcon />,
      color: '#f59e0b',
      visible: user?.role === 'VOLUNTEER',
    },
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.username}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.role === 'ORGANIZER'
              ? 'Manage your events and volunteers'
              : 'Discover volunteer opportunities and make a difference'}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statCards
            .filter((card) => card.visible !== false)
            .map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <CardContent>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        bgcolor: stat.color,
                        opacity: 0.1,
                      }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: stat.color,
                            color: 'white',
                            mr: 2,
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
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
                        {event.description.substring(0, 100)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        📍 {event.location}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        📅 {formatDate(event.eventDate)}
                      </Typography>
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
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* CTA Section */}
        {user?.role === 'VOLUNTEER' && (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Ready to make a difference?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Browse all available volunteer opportunities and join a cause you care about.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/events')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#f9fafb',
                },
              }}
            >
              Explore Events
            </Button>
          </Paper>
        )}
      </Container>
    </MainLayout>
  );
};

export default DashboardPage;
