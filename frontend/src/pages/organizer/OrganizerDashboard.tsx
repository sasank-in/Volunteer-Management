import { useMemo } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
  EventAvailable as EventAvailableIcon,
  ManageAccounts as ManageIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import PageSkeleton from '@components/PageSkeleton';
import Sparkline from '@components/Sparkline';
import StatusChip from '@components/StatusChip';
import { useAuth } from '@hooks/useAuth';
import {
  calculateProgressPercentage,
  formatDate,
  formatDateRelative,
} from '@utils/helpers';
import type { Event } from '../../types';

/** Builds a 14-day registration trend by bucketing event registeredVolunteers. */
function buildTrend(events: Event[], days: number): number[] {
  const buckets = new Array(days).fill(0);
  const now = Date.now();
  events.forEach((e) => {
    const created = new Date(e.createdAt).getTime();
    const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (ageDays >= 0 && ageDays < days) {
      buckets[days - 1 - ageDays] += e.registeredVolunteers || 0;
    }
  });
  return buckets;
}

const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const eventsQuery = useQuery({
    queryKey: ['events', 'organized'],
    queryFn: () => apiService.getMyOrganizedEvents(),
  });

  const events: Event[] = eventsQuery.data ?? [];

  const stats = useMemo(() => {
    const open = events.filter((e) => e.status === 'OPEN');
    const completed = events.filter((e) => e.status === 'COMPLETED');
    const totalRegistered = events.reduce((s, e) => s + (e.registeredVolunteers ?? 0), 0);
    const ratedEvents = events.filter((e) => e.averageRating != null);
    const avgRating =
      ratedEvents.length > 0
        ? ratedEvents.reduce((s, e) => s + (e.averageRating || 0), 0) / ratedEvents.length
        : null;

    // "Needs attention": OPEN events <7 days away, fewer than 60% filled.
    const now = Date.now();
    const needsAttention = events
      .filter((e) => e.status === 'OPEN')
      .filter((e) => {
        const daysOut = (new Date(e.eventDate).getTime() - now) / (1000 * 60 * 60 * 24);
        const fillRate = e.requiredVolunteers
          ? e.registeredVolunteers / e.requiredVolunteers
          : 0;
        return daysOut <= 7 && daysOut > 0 && fillRate < 0.6;
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    const trend = buildTrend(events, 14);

    const upcoming = events
      .filter((e) => new Date(e.eventDate).getTime() > now && e.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 4);

    const topRated = events
      .filter((e) => e.averageRating != null)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 3);

    return {
      total: events.length,
      open: open.length,
      completed: completed.length,
      totalRegistered,
      avgRating,
      needsAttention,
      trend,
      upcoming,
      topRated,
    };
  }, [events]);

  if (eventsQuery.isLoading) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <PageSkeleton stats={4} sections={2} />
        </Container>
      </MainLayout>
    );
  }

  if (eventsQuery.isError) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="flex-start" sx={{ py: 4 }}>
            <Typography variant="body2">We couldn&apos;t load your events.</Typography>
            <Button variant="outlined" onClick={() => eventsQuery.refetch()}>
              Retry
            </Button>
          </Stack>
        </Container>
      </MainLayout>
    );
  }

  // Greeting based on time of day — small thing but breaks template uniformity.
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <MainLayout>
      <Container maxWidth="lg">
        {/* Hero band — full-width, primary-tinted, replaces the standard PageHeader */}
        <Box
          sx={{
            mb: 4,
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            bgcolor: 'primary.dark',
            color: 'primary.contrastText',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative ring — pure CSS, no image asset */}
          <Box
            sx={{
              position: 'absolute',
              top: -120,
              right: -120,
              width: 320,
              height: 320,
              borderRadius: '50%',
              border: `40px solid ${alpha(theme.palette.primary.contrastText, 0.06)}`,
            }}
          />
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'flex-end' }}
            justifyContent="space-between"
            sx={{ position: 'relative' }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  opacity: 0.7,
                  mb: 1,
                }}
              >
                Organizer workspace
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
                {greeting}, {user?.username}.
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mt: 1, maxWidth: 520 }}>
                {stats.needsAttention.length > 0
                  ? `${stats.needsAttention.length} event${stats.needsAttention.length > 1 ? 's' : ''} need your attention this week.`
                  : stats.upcoming.length > 0
                    ? `${stats.upcoming.length} upcoming event${stats.upcoming.length > 1 ? 's' : ''} on your roster.`
                    : 'No events scheduled. Create your first one to get started.'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/events/create')}
                sx={{
                  bgcolor: 'background.paper',
                  color: 'primary.dark',
                  '&:hover': { bgcolor: alpha('#ffffff', 0.9) },
                }}
              >
                Create event
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/events')}
                sx={{
                  borderColor: alpha(theme.palette.primary.contrastText, 0.5),
                  color: 'primary.contrastText',
                  '&:hover': { borderColor: 'primary.contrastText' },
                }}
              >
                All events
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Two-column main grid — first time we use this outside EventDetailPage */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Hero metric — registration trend */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 600,
                      }}
                    >
                      Registrations · last 14 days
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {stats.totalRegistered.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      total volunteers across all events
                    </Typography>
                  </Box>
                  <Stack alignItems="flex-end">
                    <Sparkline data={stats.trend} variant="bars" width={240} height={56} />
                  </Stack>
                </Stack>

                {/* Tiny stat row beneath the chart */}
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <MetricCell
                      label="Total events"
                      value={stats.total}
                      icon={<EventIcon fontSize="small" />}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <MetricCell
                      label="Open"
                      value={stats.open}
                      icon={<EventAvailableIcon fontSize="small" />}
                      accent={theme.palette.success.main}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <MetricCell
                      label="Avg rating"
                      value={stats.avgRating != null ? stats.avgRating.toFixed(1) : '—'}
                      icon={<StarIcon fontSize="small" />}
                      accent={theme.palette.warning.main}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Needs attention */}
            {stats.needsAttention.length > 0 && (
              <Card
                sx={{
                  mb: 3,
                  borderLeft: '3px solid',
                  borderLeftColor: 'warning.main',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      px: 2.5,
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <WarningIcon fontSize="small" color="warning" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Needs your attention
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      under-filled events within 7 days
                    </Typography>
                  </Stack>
                  <Stack divider={<Divider />}>
                    {stats.needsAttention.map((event) => {
                      const fill = calculateProgressPercentage(
                        event.registeredVolunteers,
                        event.requiredVolunteers,
                      );
                      const slotsLeft =
                        event.requiredVolunteers - event.registeredVolunteers;
                      return (
                        <Box
                          key={event.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 2.5,
                            py: 1.75,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, mb: 0.25 }}
                              noWrap
                            >
                              {event.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(event.eventDate)} · {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left
                            </Typography>
                          </Box>
                          <Box sx={{ width: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={fill}
                              color={fill < 30 ? 'error' : 'warning'}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', textAlign: 'right', mt: 0.25 }}
                            >
                              {fill}%
                            </Typography>
                          </Box>
                          <ArrowForwardIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Upcoming events */}
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    px: 2.5,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Upcoming events
                    </Typography>
                  </Stack>
                  <Button size="small" onClick={() => navigate('/events')}>
                    View all
                  </Button>
                </Stack>
                {stats.upcoming.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No upcoming events scheduled.
                    </Typography>
                  </Box>
                ) : (
                  <Stack divider={<Divider />}>
                    {stats.upcoming.map((event) => {
                      const fill = calculateProgressPercentage(
                        event.registeredVolunteers,
                        event.requiredVolunteers,
                      );
                      const dateObj = new Date(event.eventDate);
                      return (
                        <Box
                          key={event.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2.5,
                            px: 2.5,
                            py: 2,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          {/* Date block — visual hierarchy */}
                          <Stack
                            alignItems="center"
                            sx={{
                              width: 56,
                              flexShrink: 0,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                py: 0.25,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                textAlign: 'center',
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                              }}
                            >
                              {dateObj.toLocaleString(undefined, { month: 'short' })}
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                              {dateObj.getDate()}
                            </Typography>
                          </Stack>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ mb: 0.5 }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                                noWrap
                              >
                                {event.title}
                              </Typography>
                              <StatusChip kind="event" status={event.status} />
                            </Stack>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <PeopleIcon
                                sx={{ fontSize: '0.875rem', color: 'text.secondary' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {event.registeredVolunteers}/{event.requiredVolunteers} volunteers · {fill}% filled
                              </Typography>
                            </Stack>
                          </Box>
                          <ArrowForwardIcon
                            fontSize="small"
                            sx={{ color: 'text.disabled' }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* SIDEBAR */}
          <Grid item xs={12} md={4}>
            {/* Quick actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                >
                  Quick actions
                </Typography>
                <Stack spacing={1}>
                  <ActionRow
                    icon={<AddIcon fontSize="small" />}
                    label="Create new event"
                    onClick={() => navigate('/events/create')}
                  />
                  <ActionRow
                    icon={<ManageIcon fontSize="small" />}
                    label="Manage all events"
                    onClick={() => navigate('/events')}
                  />
                  <ActionRow
                    icon={<PeopleIcon fontSize="small" />}
                    label="View profile"
                    onClick={() => navigate('/profile')}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Top-rated events */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 600,
                    }}
                  >
                    Top-rated events
                  </Typography>
                </Stack>
                {stats.topRated.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No feedback yet — your events haven&apos;t been rated.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {stats.topRated.map((event, idx) => (
                      <Stack
                        key={event.id}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.warning.main, 0.15),
                            color: 'warning.dark',
                          }}
                        >
                          {idx + 1}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                            {event.title}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <StarIcon
                              sx={{ fontSize: '0.75rem', color: 'warning.main' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {event.averageRating?.toFixed(1)} ·{' '}
                              {formatDateRelative(event.eventDate)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Tiny activity callout */}
            <Card
              sx={{
                mt: 3,
                bgcolor: alpha(theme.palette.success.main, 0.06),
                borderColor: alpha(theme.palette.success.main, 0.3),
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.dark' }}>
                    Completion rate
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.total > 0
                    ? `${Math.round((stats.completed / stats.total) * 100)}%`
                    : '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.completed} completed of {stats.total} total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
};

/** Small inline metric — doesn't deserve a full StatCard. */
const MetricCell: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}> = ({ label, value, icon, accent }) => {
  const theme = useTheme();
  const tint = accent ?? theme.palette.primary.main;
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 0.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(tint, 0.12),
          color: tint,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

const ActionRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <CardActionArea
    onClick={onClick}
    sx={{ borderRadius: 1, p: 1.25, display: 'flex', alignItems: 'center' }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
      <Box sx={{ color: 'primary.main' }}>{icon}</Box>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </Stack>
    <ArrowForwardIcon fontSize="small" sx={{ color: 'text.disabled' }} />
  </CardActionArea>
);

export default OrganizerDashboard;
