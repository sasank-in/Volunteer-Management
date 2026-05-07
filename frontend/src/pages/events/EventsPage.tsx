import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  TextField,
  Chip,
  Button,
  LinearProgress,
  InputAdornment,
  Paper,
  Stack,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Star as StarIcon,
  LocationOn as LocationOnIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import { formatDate, calculateProgressPercentage, getEventStatusColor, getEventStatusLabel } from '@utils/helpers';
import { Event } from '../../types';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  // Fetch events
  const { data: events = [], isLoading, isError, refetch } = useQuery({
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
    return [];
  }, [user?.role, participations, events, organizedEvents]);

  const truncateText = (value: string | undefined | null, maxLength: number) => {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    const trimmed = value.slice(0, maxLength);
    const lastSpace = trimmed.lastIndexOf(' ');
    return `${trimmed.slice(0, Math.max(0, lastSpace))}...`;
  };

  const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea onClick={() => navigate(`/events/${event.id}`)} sx={{ height: '100%' }}>
        {event.coverImageUrl && (
          <Box
            component="img"
            src={apiService.resolveImageUrl(event.coverImageUrl)}
            alt=""
            sx={{
              display: 'block',
              width: '100%',
              height: 140,
              objectFit: 'cover',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          />
        )}
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
            {truncateText(event.description, 110)}
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

        {/* Action Hint */}
        <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Chip
            label={event.status === 'OPEN' ? 'View details' : getEventStatusLabel(event.status)}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              fontWeight: 600,
            }}
          />
        </Box>
      </CardActionArea>
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
              {user?.role === 'ORGANIZER'
                ? 'Manage your events and volunteers'
                : 'Find and join volunteer opportunities'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
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

        {/* Results */}
        {isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
            sx={{ mb: 2 }}
          >
            Could not load events. Please try again.
          </Alert>
        ) : null}

        {isLoading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Skeleton variant="rectangular" height={20} sx={{ mb: 1, width: '40%' }} />
                    <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} sx={{ width: '70%' }} />
                    <Skeleton variant="rectangular" height={6} sx={{ mt: 2 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
        )}
      </Container>
    </MainLayout>
  );
};

export default EventsPage;
