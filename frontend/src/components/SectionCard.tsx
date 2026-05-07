import React from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

interface SectionCardProps {
  title?: string;
  description?: string;
  /** Right-aligned actions for the section header (e.g. "View all" link). */
  action?: React.ReactNode;
  /** Drop default padding when the child renders its own (e.g. Tables). */
  noPadding?: boolean;
  children: React.ReactNode;
}

/**
 * Outlined card wrapper for page sections. Replaces the ad-hoc
 * `<Paper sx={{p:3}}><Typography variant="h6">...` pattern scattered across pages.
 */
const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  action,
  noPadding,
  children,
}) => (
  <Card>
    {(title || action) && (
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          {title && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Stack>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
    )}
    {noPadding ? children : <CardContent sx={{ p: 2.5 }}>{children}</CardContent>}
  </Card>
);

export default SectionCard;
