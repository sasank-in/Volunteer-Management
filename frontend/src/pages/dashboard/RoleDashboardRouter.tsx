import React from 'react';
import { useAuthStore } from '@store/index';
import AdminDashboardPage from '../admin/AdminDashboardPage';
import OrganizerDashboardPage from '../organizer/OrganizerDashboardPage';
import VolunteerDashboardPage from '../volunteer/VolunteerDashboardPage';
import { Box, Typography, Container } from '@mui/material';

const RoleDashboardRouter: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboardPage />;
    case 'ORGANIZER':
      return <OrganizerDashboardPage />;
    case 'VOLUNTEER':
      return <VolunteerDashboardPage />;
    default:
      return <VolunteerDashboardPage />;
  }
};

export default RoleDashboardRouter;
