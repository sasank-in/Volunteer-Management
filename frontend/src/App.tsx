import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useUIStore, useAuthStore } from '@store/index';
import { lightTheme, darkTheme } from '@theme/index';
import ErrorBoundary from '@components/ErrorBoundary';
import { AuthProvider } from '@components/AuthProvider';
import { Toast } from '@components/Toast';

// Pages
import LandingPage from '@pages/LandingPage';
import AdminDashboard from '@pages/admin/AdminDashboard';
import OrganizerDashboard from '@pages/organizer/OrganizerDashboard';
import VolunteerDashboard from '@pages/volunteer/VolunteerDashboard';
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@pages/auth/ResetPasswordPage';
import NotFoundPage from '@pages/NotFoundPage';
import EventsPage from '@pages/events/EventsPage';
import EventDetailPage from '@pages/events/EventDetailPage';
import CreateEventPage from '@pages/events/CreateEventPage';
import ProfilePage from '@pages/profile/ProfilePage';
import NotificationsPage from '@pages/notifications/NotificationsPage';

// Components
import ProtectedRoute from '@components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (previously cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Home Route Component - Routes to landing or dashboard based on auth
const HomeRoute: React.FC = () => {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuthStore();
  
  if (!isInitialized || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
        <CircularProgress />
      </Box>
    );
  }
  
  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <AdminDashboard />;
    if (user.role === 'ORGANIZER') return <OrganizerDashboard />;
    if (user.role === 'VOLUNTEER') return <VolunteerDashboard />;
  }
  
  return <LandingPage />;
};

const App: React.FC = () => {
  const theme = useUIStore((state) => state.theme);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          <Toast />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Home Route - Landing */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<Navigate to="/" replace />} />

                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <HomeRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:eventId"
                  element={
                    <ProtectedRoute>
                      <EventDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/create"
                  element={
                    <ProtectedRoute requiredRoles={['ORGANIZER', 'ADMIN']}>
                      <CreateEventPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
