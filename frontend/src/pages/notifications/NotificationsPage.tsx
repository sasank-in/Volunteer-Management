import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@components/Layout';
import PageHeader from '@components/PageHeader';
import PageSkeleton from '@components/PageSkeleton';
import SectionCard from '@components/SectionCard';
import { useToast } from '@components/Toast';
import apiService from '@services/api';
import type { Notification, NotificationType } from '@/types';
import { formatDateRelative } from '@utils/helpers';

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
  const showToast = useToast((s) => s.showToast);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => apiService.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => apiService.markNotificationRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast('All notifications marked as read.', 'success');
    },
    onError: () => showToast('Could not mark notifications as read.', 'error'),
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => isUnread(n)).length,
    [notifications],
  );

  const visibleNotifications = useMemo(
    () => (filter === 'unread' ? notifications.filter(isUnread) : notifications),
    [filter, notifications],
  );

  const handleClick = (notification: Notification) => {
    if (isUnread(notification)) markReadMutation.mutate(notification.id);
    if (notification.eventId) navigate(`/events/${notification.eventId}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Container maxWidth="md">
          <PageSkeleton sections={1} />
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="md">
        <PageHeader
          title="Notifications"
          description="Updates about events you organize and participate in."
          actions={
            unreadCount > 0 ? (
              <Button
                variant="outlined"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                Mark all read
              </Button>
            ) : undefined
          }
        />

        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            size="small"
            value={filter}
            exclusive
            onChange={(_, v) => v && setFilter(v)}
          >
            <ToggleButton value="all">All ({notifications.length})</ToggleButton>
            <ToggleButton value="unread">Unread ({unreadCount})</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {isError ? (
          <SectionCard>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="body2">Could not load notifications.</Typography>
              <Button variant="outlined" onClick={() => refetch()}>
                Retry
              </Button>
            </Stack>
          </SectionCard>
        ) : visibleNotifications.length === 0 ? (
          <SectionCard>
            <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === 'unread'
                  ? 'You are all caught up.'
                  : 'When something happens, it will show up here.'}
              </Typography>
            </Stack>
          </SectionCard>
        ) : (
          <SectionCard noPadding>
            {visibleNotifications.map((notification, index) => {
              const unread = isUnread(notification);
              const clickable = !!notification.eventId;
              return (
                <Box key={notification.id}>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                      cursor: clickable ? 'pointer' : 'default',
                      borderLeft: '3px solid',
                      borderLeftColor: unread ? 'primary.main' : 'transparent',
                      transition: 'background-color 0.15s ease',
                      '&:hover': clickable ? { bgcolor: 'action.hover' } : {},
                    }}
                    onClick={() => handleClick(notification)}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : -1}
                    onKeyDown={(e) => {
                      if (clickable && e.key === 'Enter') handleClick(notification);
                    }}
                  >
                    <Box sx={{ mt: 0.25 }}>{getNotificationIcon(notification.type)}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: unread ? 600 : 500, mb: 0.5 }}
                      >
                        {notification.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatDateRelative(notification.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  {index < visibleNotifications.length - 1 && <Divider />}
                </Box>
              );
            })}
          </SectionCard>
        )}
      </Container>
    </MainLayout>
  );
};

export default NotificationsPage;
