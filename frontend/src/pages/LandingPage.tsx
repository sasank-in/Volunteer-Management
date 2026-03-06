import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowForward,
  CheckCircle,
  TrendingUp,
  Security,
  Speed,
  Timeline,
  Group,
  Insights,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/index';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const primaryCta = isAuthenticated
    ? user?.role === 'ORGANIZER'
      ? { label: 'Create Event', path: '/events/create' }
      : { label: user?.role === 'ADMIN' ? 'Manage Events' : 'Browse Events', path: '/events' }
    : { label: 'Get Started', path: '/register' };

  const secondaryCta = isAuthenticated
    ? { label: 'Overview', path: '/overview' }
    : { label: 'Sign In', path: '/login' };

  const features = [
    {
      icon: <Security sx={{ fontSize: 30 }} />,
      title: 'Secure by default',
      description: 'Role-based access and verified participation history for every event.',
    },
    {
      icon: <Speed sx={{ fontSize: 30 }} />,
      title: 'Operational clarity',
      description: 'Track capacity, attendance, and outcomes without manual spreadsheets.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 30 }} />,
      title: 'Impact analytics',
      description: 'Measure volunteer hours and program outcomes in one place.',
    },
    {
      icon: <CheckCircle sx={{ fontSize: 30 }} />,
      title: 'Reliable coordination',
      description: 'Automated updates keep organizers and volunteers aligned.',
    },
  ];

  const steps = [
    {
      title: 'Create and publish',
      description: 'Post events with clear locations, time, and capacity.',
      icon: <Timeline />,
    },
    {
      title: 'Recruit and confirm',
      description: 'Volunteers register and organizers track participation.',
      icon: <Group />,
    },
    {
      title: 'Track outcomes',
      description: 'Collect feedback and close the loop with reports.',
      icon: <Insights />,
    },
  ];

  return (
    <Box sx={{ bgcolor: '#0b0f1a', color: 'white', position: 'relative', overflow: 'hidden' }}>
      {/* Background accents */}
      <Box
        sx={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(68,132,255,0.45), transparent 70%)',
          filter: 'blur(10px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 180,
          right: -120,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,204,153,0.35), transparent 70%)',
          filter: 'blur(6px)',
          zIndex: 0,
        }}
      />

      {/* Nav */}
      <Box sx={{ position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              Volunteer Management
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                onClick={() => navigate(secondaryCta.path)}
                sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}
              >
                {secondaryCta.label}
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate(primaryCta.path)}
                sx={{
                  bgcolor: '#4f8cff',
                  color: '#0b0f1a',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#3c7af0' },
                }}
              >
                {primaryCta.label}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Box sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="Community Operations Suite"
                sx={{
                  bgcolor: 'rgba(79,140,255,0.15)',
                  color: '#9bbcff',
                  fontWeight: 600,
                  mb: 2,
                }}
              />
              <Typography
                variant="h2"
                sx={{ fontWeight: 800, lineHeight: 1.1, mb: 3, fontSize: { xs: '2.6rem', md: '3.6rem' } }}
              >
                Run volunteer programs with clarity and speed.
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.72)', mb: 4, lineHeight: 1.7 }}>
                A professional platform built for community organizations to plan events, recruit volunteers,
                and measure outcomes without manual overhead.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(primaryCta.path)}
                  sx={{
                    bgcolor: '#4f8cff',
                    color: '#0b0f1a',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    '&:hover': { bgcolor: '#3c7af0' },
                  }}
                >
                  {primaryCta.label}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(secondaryCta.path)}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.35)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': { borderColor: 'rgba(255,255,255,0.65)', bgcolor: 'transparent' },
                  }}
                >
                  {secondaryCta.label}
                </Button>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 4, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Trusted by local councils and NGOs
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  99.9% uptime commitment
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 3,
                  p: 3,
                }}
              >
                <Grid container spacing={2}>
                  {[
                    { label: 'Active Volunteers', value: '12,480' },
                    { label: 'Events This Month', value: '142' },
                    { label: 'Completion Rate', value: '94%' },
                    { label: 'Avg. Satisfaction', value: '4.7/5' },
                  ].map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <Card
                        sx={{
                          bgcolor: 'rgba(15,23,42,0.9)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: 'none',
                        }}
                      >
                        <CardContent>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {stat.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Card
                  sx={{
                    mt: 2,
                    bgcolor: 'rgba(79,140,255,0.12)',
                    border: '1px solid rgba(79,140,255,0.4)',
                    boxShadow: 'none',
                  }}
                >
                  <CardContent>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      Live coordinator view
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                      Track registrations, volunteer roles, and event readiness in one dashboard.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ bgcolor: '#0f172a', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: '#9bbcff', fontWeight: 600, letterSpacing: 1.5 }}>
              Platform Capabilities
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 2 }}>
              Built for volunteer operations
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mt: 2 }}>
              Everything you need to publish events, coordinate teams, and report outcomes.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: 'none',
                  }}
                >
                  <CardContent>
                    <Box sx={{ color: '#9bbcff', mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
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
      <Box sx={{ bgcolor: '#0b0f1a', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                A clean, repeatable flow
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Every event follows the same professional lifecycle, so teams stay aligned.
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                {steps.map((step, index) => (
                  <Card
                    key={index}
                    sx={{
                      bgcolor: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ color: '#9bbcff' }}>{step.icon}</Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
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
      <Box sx={{ bgcolor: '#08101f', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Ready to run better volunteer programs?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
              Replace spreadsheets with a system built for community impact.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(primaryCta.path)}
              sx={{ bgcolor: '#4f8cff', color: '#0b0f1a', fontWeight: 700, px: 6, py: 1.5 }}
            >
              {primaryCta.label}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#05070f', color: 'rgba(255,255,255,0.6)', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
                Volunteer Management
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                A professional platform for organizing volunteers and measuring outcomes.
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Product
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">Features</Typography>
                    <Typography variant="body2">Security</Typography>
                    <Typography variant="body2">Support</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Company
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">About</Typography>
                    <Typography variant="body2">Careers</Typography>
                    <Typography variant="body2">Contact</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Resources
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">Documentation</Typography>
                    <Typography variant="body2">Community</Typography>
                    <Typography variant="body2">API</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Legal
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">Privacy</Typography>
                    <Typography variant="body2">Terms</Typography>
                    <Typography variant="body2">Compliance</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.12)' }} />
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            (c) 2026 Volunteer Management Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
