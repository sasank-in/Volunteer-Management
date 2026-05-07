import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArrowForward,
  CheckCircle,
  TrendingUp,
  Security,
  Speed,
  Timeline,
  Group,
  Insights,
  VolunteerActivism as BrandIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/index';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const theme = useTheme();

  const primaryCta = isAuthenticated
    ? user?.role === 'ORGANIZER'
      ? { label: 'Create event', path: '/events/create' }
      : { label: user?.role === 'ADMIN' ? 'Manage events' : 'Browse events', path: '/events' }
    : { label: 'Get started', path: '/register' };

  const secondaryCta = isAuthenticated
    ? { label: 'Browse events', path: '/events' }
    : { label: 'Sign in', path: '/login' };

  const features = [
    { icon: <Security fontSize="small" />, title: 'Secure by default', description: 'Role-based access and verified participation history for every event.' },
    { icon: <Speed fontSize="small" />, title: 'Operational clarity', description: 'Track capacity, attendance, and outcomes without manual spreadsheets.' },
    { icon: <TrendingUp fontSize="small" />, title: 'Impact analytics', description: 'Measure volunteer hours and program outcomes in one place.' },
    { icon: <CheckCircle fontSize="small" />, title: 'Reliable coordination', description: 'Automated notifications keep organizers and volunteers aligned.' },
  ];

  const steps = [
    { title: 'Create and publish', description: 'Post events with clear locations, time, and capacity.', icon: <Timeline /> },
    { title: 'Recruit and confirm', description: 'Volunteers register and organizers track participation.', icon: <Group /> },
    { title: 'Track outcomes', description: 'Collect feedback and close the loop with reports.', icon: <Insights /> },
  ];

  const stats = [
    { label: 'Active volunteers', value: '12,480' },
    { label: 'Events this month', value: '142' },
    { label: 'Completion rate', value: '94%' },
    { label: 'Avg satisfaction', value: '4.7/5' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Top nav */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 2 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BrandIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                Volunteer Platform
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button onClick={() => navigate(secondaryCta.path)} sx={{ color: 'text.secondary' }}>
                {secondaryCta.label}
              </Button>
              <Button variant="contained" onClick={() => navigate(primaryCta.path)}>
                {primaryCta.label}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  color: 'primary.main',
                  mb: 1.5,
                }}
              >
                Community operations suite
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.1,
                  mb: 3,
                  fontSize: { xs: '2.25rem', md: '3rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                Run volunteer programs with clarity and speed.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 560 }}>
                A platform built for community organizations to plan events, recruit volunteers,
                and measure outcomes — without the manual overhead.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(primaryCta.path)}
                >
                  {primaryCta.label}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(secondaryCta.path)}
                >
                  {secondaryCta.label}
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
                Trusted by local councils and NGOs · 99.9% uptime commitment
              </Typography>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ overflow: 'hidden' }}>
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                    Live coordinator view
                  </Typography>
                </Box>
                <CardContent sx={{ p: 2.5 }}>
                  <Grid container spacing={2}>
                    {stats.map((stat) => (
                      <Grid item xs={6} key={stat.label}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            fontWeight: 600,
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.25 }}>
                          {stat.value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', borderBottom: '1px solid' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 5, maxWidth: 640 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
              }}
            >
              Platform capabilities
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
              Built for volunteer operations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Everything you need to publish events, coordinate teams, and report outcomes.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {features.map((feature) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Steps */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="flex-start">
            <Grid item xs={12} md={4}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                Workflow
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                A clean, repeatable flow
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Every event follows the same lifecycle, so teams stay aligned across roles.
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                {steps.map((step, index) => (
                  <Card key={step.title}>
                    <CardContent sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}
                        >
                          Step {index + 1}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
        <Container maxWidth="md">
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              Ready to run better volunteer programs?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 540 }}>
              Replace spreadsheets with a system built for community impact.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(primaryCta.path)}
              sx={{
                bgcolor: 'background.paper',
                color: 'primary.dark',
                '&:hover': { bgcolor: alpha('#ffffff', 0.9) },
              }}
            >
              {primaryCta.label}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', py: 5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0.75,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BrandIcon sx={{ fontSize: 14 }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Volunteer Platform
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                A platform for organizing volunteers and measuring outcomes.
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                {[
                  { heading: 'Product', items: ['Features', 'Security', 'Support'] },
                  { heading: 'Company', items: ['About', 'Careers', 'Contact'] },
                  { heading: 'Resources', items: ['Documentation', 'Community', 'API'] },
                  { heading: 'Legal', items: ['Privacy', 'Terms', 'Compliance'] },
                ].map((col) => (
                  <Grid item xs={6} sm={3} key={col.heading}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      {col.heading}
                    </Typography>
                    <Stack spacing={0.5}>
                      {col.items.map((item) => (
                        <Typography key={item} variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            © {new Date().getFullYear()} Volunteer Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
