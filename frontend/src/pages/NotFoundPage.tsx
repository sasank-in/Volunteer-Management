import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <ErrorIcon
            sx={{
              fontSize: '120px',
              color: 'error.main',
              mb: 2,
              opacity: 0.8,
            }}
          />

          <Typography variant="h1" sx={{ fontWeight: 700, mb: 1, fontSize: '4rem' }}>
            404
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Page Not Found
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sorry, the page you're looking for doesn't exist or has been moved. Let's get you back
            on track.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/events')}>
              Browse Events
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
