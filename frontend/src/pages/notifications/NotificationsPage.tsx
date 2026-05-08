import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  MarkEmailRead as MarkReadIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@components/Layout';
import PageSkeleton from '@components/PageSkeleton';
import { useToast } from '@components/Toast';
import apiService from '@services/api';
import type { Notification, NotificationType } from '@/types';
import { formatDateRelative } from '@utils/helpers';

interface CategoryConfig {
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
  label: string;
}

const CATEGORY: Record<NotificationType, CategoryConfig> = {
  EVENT_CREATED: { color: 'primary', icon: <EventIcon fontSize="small" />, label: 'Event' },
  EVENT_UPDATED: { color: 'info', icon: <EventIcon fontSize="small" />, label: 'Update' },
  EVENT_CANCELLED: { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'Cancelled' },
  EVENT_REMINDER: { color: 'warning', icon: <ScheduleIcon fontSize="small" />, label: 'Reminder' },
  EVENT_COMPLETED: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Completed' },
  VOLUNTEER_REGISTERED: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Registered' },
  VOLUNTEER_CANCELLED: { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'Cancelled' },
};

const isUnread = (n: Notification) => n.status !== 'READ' && !n.readAt;

const dayBucket = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This week';
  if (diffDays < 30) return 'This month';
  return 'Earlier';
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToast((s) => s.showToast);
  const theme = useTheme();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => apiService.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiService.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (err: any) =>
      showToast(err?.response?.data?.error ?? 'Could not mark as read.', 'error'),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast('All notifications marked as read.', 'success');
    },
    onError: () => showToast('Could not mark notifications as read.', 'error'),
  });

  const unreadCount = useMemo(() => notifications.filter(isUnread).length, [notifications]);

  const grouped = useMemo(() => {
    const visible = filter === 'unread' ? notifications.filter(isUnread) : notifications;
    const order = ['Today', 'Yesterday', 'This week', 'This month', 'Earlier'] as const;
    const buckets = new Map<string, Notification[]>();
    for (const n of visible) {
      const key = dayBucket(n.createdAt);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(n);
    }
    return order
      .filter((k) => buckets.has(k))
      .map((k) => [k, buckets.get(k)!] as const);
  }, [filter, notifications]);

  const handleClick = (n: Notification) => {
    if (isUnread(n)) markReadMutation.mutate(n.id);
    if (n.eventId) navigate(`/events/${n.eventId}`);
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
        {/* Compact contextual header — different from the eyebrow+title pattern */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NotificationsIcon />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount > 0
                  ? `${unreadCount} unread of ${notifications.length}`
                  : `${notifications.length} total — you're caught up.`}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup
              size="small"
              value={filter}
              exclusive
              onChange={(_, v) => v && setFilter(v)}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="unread">Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}</ToggleButton>
            </ToggleButtonGroup>
            {unreadCount > 0 && (
              <Button
                size="small"
                variant="contained"
                startIcon={<MarkReadIcon />}
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                Mark all read
              </Button>
            )}
          </Stack>
        </Stack>

        {isError ? (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="flex-start">
                <Typography variant="body2">Could not load notifications.</Typography>
                <Button variant="outlined" onClick={() => refetch()}>
                  Retry
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : grouped.length === 0 ? (
          <Card>
            <CardContent>
              <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
                {/* Pure-CSS empty illustration: concentric ring + bell */}
                <Box
                  sx={{
                    position: 'relative',
                    width: 96,
                    height: 96,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: '8px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 12,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                    }}
                  />
                  <NotificationsIcon
                    sx={{ fontSize: 36, color: 'primary.main', position: 'relative' }}
                  />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {filter === 'unread' ? 'No unread notifications' : 'Nothing to show yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, textAlign: 'center' }}>
                  {filter === 'unread'
                    ? "You've read everything. Great job staying on top of it."
                    : "When events update or someone registers for one of yours, you'll see it here."}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={3}>
            {grouped.map(([bucket, items]) => (
              <Box key={bucket}>
                {/* Date-bucket label */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                  }}
                >
                  {bucket}
                </Typography>
                <Card>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Stack
                      divider={
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
                      }
                    >
                      {items.map((n) => {
                        const cat = CATEGORY[n.type] ?? CATEGORY.EVENT_CREATED;
                        const accent = theme.palette[cat.color].main;
                        const unread = isUnread(n);
                        const clickable = !!n.eventId;
                        return (
                          <Stack
                            key={n.id}
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            sx={{
                              px: 2.5,
                              py: 2,
                              cursor: clickable ? 'pointer' : 'default',
                              position: 'relative',
                              transition: 'background-color 0.15s ease',
                              '&:hover': clickable ? { bgcolor: 'action.hover' } : {},
                            }}
                            onClick={() => handleClick(n)}
                            role={clickable ? 'button' : undefined}
                            tabIndex={clickable ? 0 : -1}
                            onKeyDown={(e) => {
                              if (clickable && e.key === 'Enter') handleClick(n);
                            }}
                          >
                            {/* Category color rail */}
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 3,
                                bgcolor: unread ? accent : 'transparent',
                              }}
                            />
                            {/* Category avatar */}
                            <Avatar
                              sx={{
                                bgcolor: alpha(accent, 0.12),
                                color: accent,
                                width: 36,
                                height: 36,
                                flexShrink: 0,
                              }}
                            >
                              {cat.icon}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.25 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: accent,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                  }}
                                >
                                  {cat.label}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                  · {formatDateRelative(n.createdAt)}
                                </Typography>
                              </Stack>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: unread ? 600 : 500, mb: 0.25 }}
                              >
                                {n.subject}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {n.message}
                              </Typography>
                            </Box>
                            {unread && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: accent,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </Stack>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </MainLayout>
  );
};

export default NotificationsPage;
