import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { useNavigate } from 'react-router-dom';
import { Notification, NotificationType } from '../types';

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

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Fetch unread notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => apiService.getUnreadNotifications(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => apiService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => apiService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setAnchorEl(null);
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    markReadMutation.mutate(notification.id);
    if (notification.eventId) {
      navigate(`/events/${notification.eventId}`);
    }
    handleClose();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} sx={{ color: 'text.primary' }}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon sx={{ color: 'text.primary' }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Button
              size="small"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {/* Notifications List */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                px: 2,
                whiteSpace: 'normal',
                alignItems: 'flex-start',
              }}
            >
              <ListItemIcon sx={{ mt: 0.5 }}>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={notification.subject}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </>
                }
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 600,
                  sx: { mb: 0.5 },
                }}
              />
            </MenuItem>
          ))
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button fullWidth size="small" onClick={() => { navigate('/notifications'); handleClose(); }}>
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};
