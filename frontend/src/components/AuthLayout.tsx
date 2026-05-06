import React from 'react';
import { Box, Typography, Stack, useMediaQuery, useTheme } from '@mui/material';
import { VolunteerActivism as BrandIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const highlights = [
  'Coordinate events with your team',
  'Track volunteer participation in real time',
  'Send notifications and reminders automatically',
];

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isDesktop && (
        <Box
          sx={{
            flex: 1,
            bgcolor: 'primary.dark',
            color: 'primary.contrastText',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <BrandIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
              Volunteer Platform
            </Typography>
          </Stack>

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.2 }}>
              Run your volunteer program with confidence.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85, mb: 4, maxWidth: 480 }}>
              Manage events, participation, and communications from a single workspace built for nonprofit teams.
            </Typography>
            <Stack spacing={1.5}>
              {highlights.map((h) => (
                <Stack key={h} direction="row" spacing={1.5} alignItems="center">
                  <CheckIcon sx={{ fontSize: 20, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {h}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} Volunteer Platform. All rights reserved.
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
