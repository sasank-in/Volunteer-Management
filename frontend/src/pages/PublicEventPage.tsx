import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  VolunteerActivism as BrandIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import StatusChip from '@components/StatusChip';
import { useAuthStore } from '@store/index';
import { calculateProgressPercentage, formatDate } from '@utils/helpers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface PublicEvent {
  slug: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  requiredVolunteers: number;
  registeredVolunteers: number;
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
  organizerName: string;
  coverImageUrl?: string | null;
}

const IMAGE_BASE = API_BASE_URL.replace(/\/api\/?$/, '');
const resolveImageUrl = (url?: string | null) => {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${IMAGE_BASE}${url}`;
};

const fetchPublicEvent = async (slug: string): Promise<PublicEvent> => {
  // Public endpoint — no auth, no credentials.
  const { data } = await axios.get<PublicEvent>(`${API_BASE_URL}/public/events/${slug}`);
  return data;
};

const PublicEventPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => fetchPublicEvent(slug!),
    enabled: !!slug,
    retry: 1,
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Lightweight nav — public surface, no app shell */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 2 }}
          >
            <Stack
              component={RouterLink}
              to="/"
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ textDecoration: 'none', color: 'text.primary' }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BrandIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Volunteer Platform
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              {isAuthenticated ? (
                <Button component={RouterLink} to="/events" variant="outlined" size="small">
                  Open in app
                </Button>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" size="small">
                    Sign in
                  </Button>
                  <Button component={RouterLink} to="/register" variant="contained" size="small">
                    Sign up
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {isLoading && (
          <Stack spacing={2}>
            <Skeleton variant="text" width="20%" height={20} />
            <Skeleton variant="text" width="70%" height={48} />
            <Skeleton variant="rectangular" height={120} />
            <Skeleton variant="rectangular" height={80} />
          </Stack>
        )}

        {isError && (
          <Alert severity="error">
            We couldn&apos;t find this event. The link may be broken or the event was removed.
          </Alert>
        )}

        {data && (
          <>
            <Stack spacing={1.5} sx={{ mb: 4 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                  }}
                >
                  Volunteer event
                </Typography>
                <StatusChip kind="event" status={data.status} />
              </Stack>
              <Typography variant="h1" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
                {data.title}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ color: 'text.secondary' }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <DateRangeIcon fontSize="small" />
                  <Typography variant="body2">{formatDate(data.eventDate)}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOnIcon fontSize="small" />
                  <Typography variant="body2">{data.location}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PersonIcon fontSize="small" />
                  <Typography variant="body2">Hosted by {data.organizerName}</Typography>
                </Stack>
              </Stack>
            </Stack>

            {data.coverImageUrl && (
              <Box
                component="img"
                src={resolveImageUrl(data.coverImageUrl)}
                alt=""
                sx={{
                  display: 'block',
                  width: '100%',
                  maxHeight: 360,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 3,
                }}
              />
            )}

            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  About this event
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {data.description}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Volunteers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.registeredVolunteers}/{data.requiredVolunteers}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgressPercentage(
                    data.registeredVolunteers,
                    data.requiredVolunteers,
                  )}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </CardContent>
            </Card>

            <Divider sx={{ mb: 3 }} />

            <Card sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Want to volunteer?
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {isAuthenticated
                        ? 'Open the event in your workspace to register.'
                        : 'Create an account or sign in to register for this event.'}
                    </Typography>
                  </Box>
                  {isAuthenticated ? (
                    <Button
                      component={RouterLink}
                      to="/events"
                      variant="contained"
                      sx={{ bgcolor: 'background.paper', color: 'primary.dark' }}
                    >
                      Open in app
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        component={RouterLink}
                        to={`/register?next=/e/${data.slug}`}
                        variant="contained"
                        sx={{ bgcolor: 'background.paper', color: 'primary.dark' }}
                      >
                        Sign up
                      </Button>
                      <Button
                        component={RouterLink}
                        to={`/login?next=/e/${data.slug}`}
                        variant="outlined"
                        sx={{
                          borderColor: 'rgba(255,255,255,0.6)',
                          color: 'primary.contrastText',
                          '&:hover': { borderColor: 'primary.contrastText' },
                        }}
                      >
                        Sign in
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default PublicEventPage;
