import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}
          >
            404 — Not found
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            We couldn&apos;t find that page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The link may be broken or the page may have moved. Try heading back to your dashboard.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate('/dashboard')}>
              Go to dashboard
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
