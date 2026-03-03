import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useUIStore } from '@store/index';
import { lightTheme, darkTheme } from '@theme/index';
import ErrorBoundary from '@components/ErrorBoundary';
import { AuthProvider } from '@components/AuthProvider';

// Pages
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import EventsPage from '@pages/events/EventsPage';
import EventDetailPage from '@pages/events/EventDetailPage';
import CreateEventPage from '@pages/events/CreateEventPage';
import ProfilePage from '@pages/profile/ProfilePage';
import NotFoundPage from '@pages/NotFoundPage';

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

const App: React.FC = () => {
  const theme = useUIStore((state) => state.theme);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
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
                  <ProtectedRoute requiredRole="ORGANIZER">
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
