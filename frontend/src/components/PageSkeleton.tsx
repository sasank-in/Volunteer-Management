import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

interface PageSkeletonProps {
  /** Render N stat-card skeletons in a row. Defaults to 0. */
  stats?: number;
  /** Render N section/list skeletons stacked. Defaults to 1. */
  sections?: number;
}

/**
 * Generic page-shell loading skeleton. Keeps perceived performance
 * consistent across pages that share the title + cards + table layout.
 */
const PageSkeleton: React.FC<PageSkeletonProps> = ({ stats = 0, sections = 1 }) => (
  <Box>
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width="20%" height={18} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={36} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
    </Box>

    {stats > 0 && (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Array.from({ length: stats }).map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="70%" height={32} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )}

    <Stack spacing={3}>
      {Array.from({ length: sections }).map((_, i) => (
        <Card key={i}>
          <CardContent sx={{ p: 2.5 }}>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  </Box>
);

export default PageSkeleton;
