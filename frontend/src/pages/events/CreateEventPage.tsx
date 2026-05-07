import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Image as ImageIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import apiService from '@services/api';
import MainLayout from '@components/Layout';
import PageHeader from '@components/PageHeader';
import SectionCard from '@components/SectionCard';
import { useToast } from '@components/Toast';
import { CreateEventRequest } from '../../types';

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const showToast = useToast((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    requiredVolunteers: 10,
  });

  const [error, setError] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState('');

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCoverError('');
    if (!file) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    if (!ALLOWED_COVER_TYPES.includes(file.type)) {
      setCoverError('Cover image must be JPEG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      setCoverError('Cover image must be 5MB or smaller.');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventRequest) => {
      const event = await apiService.createEvent(data);
      if (coverFile) {
        try {
          await apiService.uploadEventCover(event.id, coverFile);
        } catch {
          // Event was created — surface a softer warning without rolling back.
          showToast('Event created, but cover upload failed. You can retry from the event page.', 'warning');
        }
      }
      return event;
    },
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

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Cover image (optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Shown on event cards and the public share page. JPEG, PNG, or WebP, up to 5MB.
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverSelect}
                style={{ display: 'none' }}
              />
              {coverPreview ? (
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    maxWidth: 480,
                  }}
                >
                  <Box
                    component="img"
                    src={coverPreview}
                    alt="Cover preview"
                    sx={{ display: 'block', width: '100%', maxHeight: 240, objectFit: 'cover' }}
                  />
                  <Stack direction="row" spacing={1} sx={{ p: 1, bgcolor: 'background.paper' }}>
                    <Button size="small" onClick={() => fileInputRef.current?.click()}>
                      Replace
                    </Button>
                    <Button size="small" color="error" onClick={clearCover}>
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={createEventMutation.isPending}
                >
                  Choose image
                </Button>
              )}
              {coverError && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  {coverError}
                </Typography>
              )}
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
