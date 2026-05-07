import React, { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import PageHeader from '@components/PageHeader';
import SectionCard from '@components/SectionCard';
import { useToast } from '@components/Toast';
import { CreateEventRequest } from '../../types';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const showToast = useToast((s) => s.showToast);

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
      showToast('Event created.', 'success');
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
    if (!formData.title || !formData.description || !formData.location || !formData.eventDate) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.requiredVolunteers < 1) {
      setError('Required volunteers must be at least 1.');
      return;
    }
    createEventMutation.mutate(formData);
  };

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Stack spacing={1} sx={{ mb: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/events')}
            size="small"
            sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
          >
            Back to events
          </Button>
        </Stack>

        <PageHeader
          eyebrow="Organizer"
          title="Create event"
          description="Give volunteers everything they need to know — when, where, and what to expect."
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <SectionCard
          title="Event details"
          description="Required fields are marked. You can edit any of these after publishing."
        >
          <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Riverbank Cleanup Drive"
              />
            </Grid>

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
                placeholder="What will volunteers do? What impact will this have? What should they bring?"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Address or venue"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date & time"
                name="eventDate"
                type="datetime-local"
                value={formData.eventDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Required volunteers"
                name="requiredVolunteers"
                type="number"
                value={formData.requiredVolunteers}
                onChange={handleChange}
                required
                inputProps={{ min: 1, max: 1000 }}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
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
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? 'Creating…' : 'Create event'}
              </Button>
            </Grid>
          </Grid>
        </SectionCard>
      </Container>
    </MainLayout>
  );
};

export default CreateEventPage;
