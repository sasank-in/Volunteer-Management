import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import { CreateEventRequest } from '../../types';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    requiredVolunteers: 10,
  });

  const [error, setError] = useState('');

  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventRequest) => apiService.createEvent(data),
    onSuccess: (event) => {
      navigate(`/events/${event.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create event. Please try again.');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateEventRequest) => ({
      ...prev,
      [name]: name === 'requiredVolunteers' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.description || !formData.location || !formData.eventDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.requiredVolunteers < 1) {
      setError('Required volunteers must be at least 1');
      return;
    }

    createEventMutation.mutate(formData);
  };

  return (
    <MainLayout>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/events')}
            sx={{ mb: 2 }}
          >
            Back to Events
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Create New Event
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Post a volunteer opportunity for your community
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Form Card */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Event Title */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Community Cleanup Drive"
                    helperText="Give your event a clear, descriptive title"
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    multiline
                    rows={5}
                    placeholder="Describe your event in detail. What will volunteers do? What impact will it have?"
                    helperText="Provide a clear and engaging description"
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Central Park, 123 Main Street"
                    helperText="Where will the event take place?"
                  />
                </Grid>

                {/* Event Date */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Event Date & Time"
                    name="eventDate"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Required Volunteers */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Required Volunteers"
                    name="requiredVolunteers"
                    type="number"
                    value={formData.requiredVolunteers}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 1, max: 1000 }}
                    helperText="How many volunteers do you need?"
                  />
                </Grid>

                {/* Divider */}
                <Grid item xs={12}>
                  <Box sx={{ my: 2 }} />
                </Grid>

                {/* Info Section */}
                <Grid item xs={12}>
                  <Card
                    sx={{
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Tips for a Great Event
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>
                          <Typography variant="body2" color="text.secondary">
                            Be specific about the location and date
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2" color="text.secondary">
                            Clearly describe what volunteers will be doing
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2" color="text.secondary">
                            Highlight the positive impact of participating
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2" color="text.secondary">
                            Be realistic about the number of volunteers needed
                          </Typography>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/events')}
                    disabled={createEventMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      createEventMutation.isPending ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default CreateEventPage;
