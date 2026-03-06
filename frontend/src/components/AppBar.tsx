import React, { useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useUIStore } from '@store/index';
import { useAuth } from '@hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationCenter } from './NotificationCenter';

interface AppBarProps {
  onMenuClick: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme: uiTheme, toggleTheme } = useUIStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleNotificationsClick = () => {
    handleMenuClose();
    navigate('/notifications');
  };

  const getAvatarColor = (role?: string): string => {
    if (role === 'ORGANIZER') return '#8b5cf6';
    if (role === 'ADMIN') return '#ef4444';
    return '#3b82f6';
  };

  const getInitials = (username?: string): string => {
    return (username || 'U').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <MuiAppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
          backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.01))',
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 1, sm: 2 },
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{
              mr: 2,
              color: 'text.primary',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              transition: 'all 0.2s',
              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.02)',
              },
            }}
            onClick={() => navigate('/events')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/events');
            }}
          >
            Volunteer Platform
          </Typography>

          {user && location.pathname !== '/events' && (
            <Button
              startIcon={<HomeIcon />}
              onClick={() => navigate('/events')}
              sx={{
                ml: 2,
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              size="small"
              variant="text"
            >
              Events
            </Button>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                color: 'text.primary',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              aria-label={`Switch to ${uiTheme === 'light' ? 'dark' : 'light'} mode`}
            >
              {uiTheme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            {!isMobile && (
              <NotificationCenter />
            )}

            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0.5,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              aria-label="user menu"
            >
              <Avatar
                sx={{
                  bgcolor: getAvatarColor(user?.role),
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: (theme) =>
                      `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.primary.main}`,
                  },
                }}
              >
                {getInitials(user?.username)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </MuiAppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            elevation: 2,
            sx: {
              borderRadius: '12px',
              mt: 1,
            },
          },
        }}
      >
        <MenuItem disabled>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleProfileClick}
          sx={{
            borderRadius: '8px',
            mx: 0.5,
            my: 0.5,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <PersonIcon sx={{ mr: 1.5 }} fontSize="small" />
          <Typography variant="body2">Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={handleNotificationsClick}
          sx={{
            borderRadius: '8px',
            mx: 0.5,
            my: 0.5,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <NotificationsIcon sx={{ mr: 1.5 }} fontSize="small" />
          <Typography variant="body2">Notifications</Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            mx: 0.5,
            my: 0.5,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <LogoutIcon sx={{ mr: 1.5, color: 'error.main' }} fontSize="small" />
          <Typography variant="body2" color="error">
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AppBar;
