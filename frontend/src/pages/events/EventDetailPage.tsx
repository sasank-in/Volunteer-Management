import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Divider,
  LinearProgress,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  DateRange as DateRangeIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@hooks/useAuth';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import { formatDate, calculateProgressPercentage, getEventStatusColor, getEventStatusLabel } from '@utils/helpers';
import { CreateFeedbackRequest } from '../../types';

const EventDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<CreateFeedbackRequest>({
    rating: 5,
    comment: '',
  });
  const [registrationMessage, setRegistrationMessage] = useState('');

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => apiService.getEventById(eventId!),
    enabled: !!eventId,
  });

  // Fetch participants
  const { data: participants = [] } = useQuery({
    queryKey: ['event-participants', eventId],
    queryFn: () => apiService.getEventParticipants(eventId!),
    enabled: !!eventId && user?.role === 'ORGANIZER',
  });

  // Fetch feedbacks
  const { data: feedbacks = [] } = useQuery({
    queryKey: ['event-feedbacks', eventId],
    queryFn: () => apiService.getEventFeedback(eventId!),
    enabled: !!eventId,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: () => apiService.registerForEvent(eventId!),
    onSuccess: () => {
      setRegistrationMessage('Successfully registered for event!');
      setTimeout(() => setRegistrationMessage(''), 3000);
    },
  });

  // Cancel participation mutation
  const cancelMutation = useMutation({
    mutationFn: () => apiService.cancelParticipation(eventId!),
    onSuccess: () => {
      setRegistrationMessage('Successfully cancelled registration.');
      setTimeout(() => setRegistrationMessage(''), 3000);
    },
  });

  // Submit feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: (data: CreateFeedbackRequest) => apiService.submitFeedback(eventId!, data),
    onSuccess: () => {
      setFeedbackOpen(false);
      setFeedbackData({ rating: 5, comment: '' });
    },
  });

  if (eventLoading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Event not found</Typography>
            <Button onClick={() => navigate('/events')} sx={{ mt: 2 }}>
              Back to Events
            </Button>
          </Paper>
        </Container>
      </MainLayout>
    );
  }

  const isOrganizer = user?.id === event.organizerId;
  const isRegistered = participants?.some((p) => p.volunteerId === user?.id);

  return (
    <MainLayout>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/events')}
          sx={{ mb: 3 }}
        >
          Back to Events
        </Button>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Event Header */}
            <Card sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body1">by {event.organizerName}</Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      bgcolor: getEventStatusColor(event.status),
                    }}
                  >
                    {getEventStatusLabel(event.status)}
                  </Box>
                </Box>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* Details Grid */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <DateRangeIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Event Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(event.eventDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocationOnIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {event.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Description */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    About this event
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {event.description}
                  </Typography>
                </Box>

                {/* Volunteer Progress */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Volunteers Needed
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">Progress</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: 'primary.main' }}
                      >
                        {event.registeredVolunteers}/{event.requiredVolunteers}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgressPercentage(
                        event.registeredVolunteers,
                        event.requiredVolunteers
                      )}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {event.requiredVolunteers - event.registeredVolunteers} more volunteers needed
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            {feedbacks.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Feedback & Reviews ({feedbacks.length})
                  </Typography>
                  {feedbacks.map((feedback, index) => (
                    <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {feedback.volunteerName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {feedback.volunteerName}
                            </Typography>
                            <Rating value={feedback.rating} readOnly size="small" />
                          </Box>
                          {feedback.comment && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {feedback.comment}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Action Card */}
            <Card sx={{ mb: 3, position: 'sticky', top: 80 }}>
              <CardContent>
                {registrationMessage && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {registrationMessage}
                  </Alert>
                )}

                {isOrganizer ? (
                  <Button
                    fullWidth
                    variant="contained"
                    disabled
                    sx={{ mb: 1 }}
                  >
                    You're the organizer
                  </Button>
                ) : isRegistered ? (
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CheckIcon />}
                      disabled
                      sx={{ mb: 1 }}
                    >
                      Registered
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<CloseIcon />}
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel Registration
                    </Button>
                  </>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={event.status !== 'OPEN' || registerMutation.isPending}
                    onClick={() => registerMutation.mutate()}
                  >
                    {event.status === 'OPEN' ? 'Register Now' : 'Event not available'}
                  </Button>
                )}

                {isRegistered && event.status === 'COMPLETED' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<StarIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => setFeedbackOpen(true)}
                  >
                    Leave Feedback
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Event Stats
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <PeopleIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Registered Volunteers
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, ml: 5 }}>
                    {event.registeredVolunteers}
                  </Typography>
                </Box>

                {event.averageRating && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <StarIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Average Rating
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {event.averageRating.toFixed(1)}
                      </Typography>
                      <Rating value={event.averageRating} readOnly size="small" />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Feedback Dialog */}
        <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Leave Feedback</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Rating
                </Typography>
                <Rating
                  value={feedbackData.rating}
                  onChange={(_, value) =>
                    setFeedbackData({ ...feedbackData, rating: value || 5 })
                  }
                  size="large"
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comments (Optional)"
                value={feedbackData.comment}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, comment: e.target.value })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFeedbackOpen(false)}>Cancel</Button>
            <Button
              onClick={() => feedbackMutation.mutate(feedbackData)}
              variant="contained"
              disabled={feedbackMutation.isPending}
            >
              Submit Feedback
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default EventDetailPage;
