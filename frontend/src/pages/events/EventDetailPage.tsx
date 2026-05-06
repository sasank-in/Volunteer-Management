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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  DateRange as DateRangeIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@hooks/useAuth';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import { useToast } from '@components/Toast';
import { formatDate, calculateProgressPercentage, getEventStatusColor, getEventStatusLabel } from '@utils/helpers';
import { CreateFeedbackRequest, UpdateEventRequest } from '../../types';

const EventDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<CreateFeedbackRequest>({
    rating: 5,
    comment: '',
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<UpdateEventRequest>({});
  const [editError, setEditError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const showToast = useToast((s) => s.showToast);

  // Fetch event details
  const { data: event, isLoading: eventLoading, isError: eventError, refetch: refetchEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => apiService.getEventById(eventId!),
    enabled: !!eventId,
  });

  // Fetch participants
  const { data: participants = [] } = useQuery({
    queryKey: ['event-participants', eventId],
    queryFn: () => apiService.getEventParticipants(eventId!),
    enabled: !!eventId && (user?.role === 'ORGANIZER' || user?.role === 'ADMIN'),
  });

  // Fetch current user's participation
  const { data: myParticipations = [] } = useQuery({
    queryKey: ['my-participations'],
    queryFn: () => apiService.getMyParticipations(),
    enabled: user?.role === 'VOLUNTEER',
  });

  // Fetch feedbacks
  const { data: feedbacks = [] } = useQuery({
    queryKey: ['event-feedbacks', eventId],
    queryFn: () => apiService.getEventFeedback(eventId!),
    enabled: !!eventId,
  });

  const invalidateAfterParticipationChange = () => {
    queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    queryClient.invalidateQueries({ queryKey: ['event-participants', eventId] });
    queryClient.invalidateQueries({ queryKey: ['my-participations'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const registerMutation = useMutation({
    mutationFn: () => apiService.registerForEvent(eventId!),
    onSuccess: () => {
      showToast('You are registered for this event.', 'success');
      invalidateAfterParticipationChange();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? 'Could not register for event.', 'error');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiService.cancelParticipation(eventId!),
    onSuccess: () => {
      showToast('Registration cancelled.', 'success');
      invalidateAfterParticipationChange();
      setCancelConfirmOpen(false);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? 'Could not cancel registration.', 'error');
      setCancelConfirmOpen(false);
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (data: CreateFeedbackRequest) => apiService.submitFeedback(eventId!, data),
    onSuccess: () => {
      setFeedbackOpen(false);
      setFeedbackData({ rating: 5, comment: '' });
      queryClient.invalidateQueries({ queryKey: ['event-feedbacks', eventId] });
      showToast('Thanks for your feedback!', 'success');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? 'Could not submit feedback.', 'error');
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: (data: UpdateEventRequest) => apiService.updateEvent(eventId!, data),
    onSuccess: () => {
      setEditOpen(false);
      setEditError('');
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-participants', eventId] });
      showToast('Event updated.', 'success');
    },
    onError: (err: any) => {
      setEditError(err.response?.data?.error || 'Failed to update event. Please try again.');
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: (participationId: string) => apiService.markAttendance(participationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-participants', eventId] });
      showToast('Attendance marked.', 'success');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? 'Could not mark attendance.', 'error');
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: () => apiService.deleteEvent(eventId!),
    onSuccess: () => {
      setDeleteOpen(false);
      setDeleteError('');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showToast('Event deleted.', 'success');
      navigate('/events');
    },
    onError: (err: any) => {
      setDeleteError(err.response?.data?.error || 'Failed to delete event. Please try again.');
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

  if (eventError) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetchEvent()}>
                Retry
              </Button>
            }
            sx={{ mt: 4 }}
          >
            Could not load this event.
          </Alert>
        </Container>
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

  const toLocalInputValue = (dateString: string) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const isOrganizer = user?.id === event.organizerId;
  const isAdmin = user?.role === 'ADMIN';
  const remainingVolunteers = Math.max(
    event.requiredVolunteers - event.registeredVolunteers,
    0
  );
  const myParticipation = myParticipations.find(
    (p) => p.eventId === event.id && p.status !== 'CANCELLED'
  );
  const isRegistered = !!myParticipation;
  const canCancel = myParticipation?.status === 'REGISTERED';

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
                  <Chip
                    label={getEventStatusLabel(event.status)}
                    size="small"
                    sx={{
                      bgcolor: getEventStatusColor(event.status),
                      color: 'white',
                      fontWeight: 700,
                      px: 1,
                    }}
                  />
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
                    {remainingVolunteers === 0
                      ? 'Volunteer goal reached'
                      : `${remainingVolunteers} more volunteers needed`}
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

            {(isOrganizer || isAdmin) && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Participants ({participants.length})
                  </Typography>
                  {participants.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No volunteers have registered yet.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Volunteer</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Registered</TableCell>
                            <TableCell align="right">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {participants.map((participant) => (
                            <TableRow key={participant.id}>
                              <TableCell>{participant.volunteerName}</TableCell>
                              <TableCell>{participant.volunteerEmail}</TableCell>
                              <TableCell>
                                <Chip
                                  label={participant.status}
                                  size="small"
                                  color={participant.status === 'ATTENDED' ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(participant.registeredAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => markAttendanceMutation.mutate(participant.id)}
                                  disabled={
                                    participant.status !== 'REGISTERED' ||
                                    event.status !== 'COMPLETED' ||
                                    markAttendanceMutation.isPending
                                  }
                                >
                                  Mark Attended
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Action Card */}
            <Card sx={{ mb: 3, position: 'sticky', top: 80 }}>
              <CardContent>
                {isAdmin && (
                  <Chip
                    label="Admin mode"
                    color="warning"
                    size="small"
                    sx={{ mb: 2, fontWeight: 600 }}
                  />
                )}

                {isOrganizer || isAdmin ? (
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<EditIcon />}
                      sx={{ mb: 1 }}
                      onClick={() => {
                        setEditData({
                          title: event.title,
                          description: event.description,
                          location: event.location,
                          eventDate: toLocalInputValue(event.eventDate),
                          requiredVolunteers: event.requiredVolunteers,
                          status: event.status,
                        });
                        setEditError('');
                        setEditOpen(true);
                      }}
                    >
                      Edit Event
                    </Button>
                    <Divider sx={{ my: 1.5 }} />
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setDeleteError('');
                        setDeleteOpen(true);
                      }}
                      sx={{ mb: 1, borderWidth: 2 }}
                    >
                      Delete Event
                    </Button>
                    <Button fullWidth variant="outlined" disabled>
                      {isAdmin ? 'Admin access' : "You're the organizer"}
                    </Button>
                  </>
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
                      onClick={() => setCancelConfirmOpen(true)}
                      disabled={cancelMutation.isPending || !canCancel}
                    >
                      {canCancel ? 'Cancel Registration' : 'Cannot Cancel'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={
                        event.status !== 'OPEN' ||
                        registerMutation.isPending ||
                        user?.role !== 'VOLUNTEER'
                      }
                      onClick={() => registerMutation.mutate()}
                    >
                      {user?.role !== 'VOLUNTEER'
                        ? 'Registration unavailable'
                        : event.status === 'OPEN'
                          ? 'Register Now'
                          : event.status === 'FULL'
                            ? 'Event is full'
                            : event.status === 'COMPLETED'
                              ? 'Event has ended'
                              : event.status === 'CANCELLED'
                                ? 'Event cancelled'
                                : 'Event not available'}
                    </Button>
                    {user?.role === 'VOLUNTEER' && event.status !== 'OPEN' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {event.status === 'FULL'
                          ? 'All volunteer slots are filled. Check back if a slot opens.'
                          : event.status === 'COMPLETED'
                            ? 'This event already took place.'
                            : event.status === 'CANCELLED'
                              ? 'The organizer cancelled this event.'
                              : null}
                      </Typography>
                    )}
                  </>
                )}

                {myParticipation?.status === 'ATTENDED' && event.status === 'COMPLETED' && (
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

        {/* Edit Event Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {editError && <Alert severity="error">{editError}</Alert>}
              <TextField
                label="Event Title"
                value={editData.title || ''}
                onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Description"
                value={editData.description || ''}
                onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={4}
              />
              <TextField
                label="Location"
                value={editData.location || ''}
                onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Event Date & Time"
                type="datetime-local"
                value={editData.eventDate || ''}
                onChange={(e) => setEditData((prev) => ({ ...prev, eventDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Status"
                select
                value={editData.status || 'OPEN'}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    status: e.target.value as UpdateEventRequest['status'],
                  }))
                }
                fullWidth
              >
                {['OPEN', 'FULL', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Required Volunteers"
                type="number"
                value={editData.requiredVolunteers ?? ''}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    requiredVolunteers:
                      e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  }))
                }
                inputProps={{ min: 1 }}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() =>
                updateEventMutation.mutate({
                  ...editData,
                  eventDate: editData.eventDate
                    ? new Date(editData.eventDate).toISOString()
                    : undefined,
                })
              }
              disabled={updateEventMutation.isPending}
            >
              {updateEventMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {deleteError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {deleteError}
                </Alert>
              )}
              <Typography variant="body2">
                Are you sure you want to delete this event? This action cannot be undone.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => deleteEventMutation.mutate()}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? 'Deleting...' : 'Delete Event'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={cancelConfirmOpen}
          onClose={() => setCancelConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Cancel registration?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Your slot will be released and given to other volunteers. You can register again later
              if a slot is still available.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelConfirmOpen(false)} disabled={cancelMutation.isPending}>
              Keep registration
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling…' : 'Cancel registration'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default EventDetailPage;
