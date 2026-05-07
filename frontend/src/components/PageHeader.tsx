import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  /** Optional uppercase eyebrow above the title (e.g. "Admin", "Volunteer"). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned actions — typically Buttons. */
  actions?: React.ReactNode;
}

/**
 * Standardised page heading. Replaces the various ad-hoc title rows that
 * differed in spacing, typography, and action alignment across pages.
 */
const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, description, actions }) => (
  <Box sx={{ mb: { xs: 3, sm: 4 } }}>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
      justifyContent="space-between"
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  </Box>
);

export default PageHeader;
