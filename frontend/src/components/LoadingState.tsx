import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

interface LoadingStateProps {
  count?: number;
  variant?: 'card' | 'table' | 'avatar' | 'text';
  height?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ count = 3, variant = 'card', height = 200 }) => {
  if (variant === 'card') {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: count }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card>
              <Skeleton variant="rectangular" height={height} />
              <CardContent>
                <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={16} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (variant === 'table') {
    return (
      <Box sx={{ p: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} width="80%" />
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'avatar') {
    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={60} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="text" height={20} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
};

export default LoadingState;
