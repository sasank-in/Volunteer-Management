import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const TestPage: React.FC = () => {
  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h1">Test Page - UI is Loading!</Typography>
        <Typography variant="body1">If you see this, the frontend is working correctly.</Typography>
      </Box>
    </Container>
  );
};

export default TestPage;
