import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@components/Layout';
import apiService from '@services/api';
import type { Notification, NotificationType } from '@/types';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'EVENT_CREATED':
    case 'EVENT_UPDATED':
    case 'EVENT_REMINDER':
      return <EventIcon fontSize="small" color="primary" />;
    case 'VOLUNTEER_REGISTERED':
      return <CheckCircleIcon fontSize="small" color="success" />;
    case 'VOLUNTEER_CANCELLED':
    case 'EVENT_CANCELLED':
      return <CancelIcon fontSize="small" color="error" />;
    default:
      return <InfoIcon fontSize="small" color="info" />;
  }
};

const isUnread = (notification: Notification) =>
  notification.status !== 'READ' && !notification.readAt;

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => apiService.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => apiService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => isUnread(n)).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => isUnread(n));
    }
    return notifications;
  }, [filter, notifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (isUnread(notification)) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.eventId) {
      navigate(`/events/${notification.eventId}`);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated on events and participation activity
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={1}>
            <Chip
              label="All"
              color={filter === 'all' ? 'primary' : 'default'}
              variant={filter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setFilter('all')}
              size="small"
            />
            <Chip
              label={`Unread (${unreadCount})`}
              color={filter === 'unread' ? 'primary' : 'default'}
              variant={filter === 'unread' ? 'filled' : 'outlined'}
              onClick={() => setFilter('unread')}
              size="small"
            />
          </Stack>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : visibleNotifications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No notifications
            </Typography>
            <Typography color="text.secondary">
              You are all caught up.
            </Typography>
          </Paper>
        ) : (
          <Paper>
            {visibleNotifications.map((notification, index) => (
              <Box key={notification.id}>
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    cursor: notification.eventId ? 'pointer' : 'default',
                    bgcolor: isUnread(notification) ? 'action.hover' : 'transparent',
                    '&:hover': {
                      bgcolor: notification.eventId ? 'action.hover' : 'transparent',
                    },
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  role={notification.eventId ? 'button' : undefined}
                  tabIndex={notification.eventId ? 0 : -1}
                  onKeyDown={(e) => {
                    if (notification.eventId && e.key === 'Enter') {
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  <Box sx={{ mt: 0.5 }}>{getNotificationIcon(notification.type)}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {notification.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  {isUnread(notification) && (
                    <Chip label="Unread" size="small" color="primary" variant="outlined" />
                  )}
                </Box>
                {index < visibleNotifications.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        )}
      </Container>
    </MainLayout>
  );
};

export default NotificationsPage;
