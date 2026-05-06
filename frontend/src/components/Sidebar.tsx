import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Collapse,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Event as EventIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useState } from 'react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleMenuClick = (menuId: string) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const menuItems = [
    ...(user?.role !== 'ADMIN'
      ? [
          {
            label: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
          },
        ]
      : []),
    {
      label: 'Events',
      icon: <EventIcon />,
      submenu: true,
      submenuId: 'events',
      children: [
        { label: 'Browse Events', path: '/events' },
        ...((user?.role === 'ORGANIZER' || user?.role === 'ADMIN')
          ? [{ label: 'Create Event', path: '/events/create' }]
          : []),
      ],
    },
    {
      label: 'Profile',
      icon: <PersonIcon />,
      path: '/profile',
    },
    {
      label: 'Notifications',
      icon: <NotificationsIcon />,
      path: '/notifications',
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            label: 'Admin',
            icon: <AdminPanelSettingsIcon />,
            path: '/admin',
          },
        ]
      : []),
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
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
            fontWeight: 700,
            fontSize: '0.875rem',
          }}
        >
          V
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, letterSpacing: '-0.01em', color: 'text.primary' }}
        >
          Volunteer Platform
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flex: 1, py: 2, px: 1 }}>
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.submenu ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleMenuClick(item.submenuId!)}
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'action.selected',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                    {expandedMenu === item.submenuId ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={expandedMenu === item.submenuId} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 1 }}>
                    {item.children?.map((child, childIndex) => (
                      <ListItem key={childIndex} disablePadding>
                        <ListItemButton
                          onClick={() => handleNavigate(child.path)}
                          selected={isActive(child.path)}
                          sx={{
                            borderRadius: '8px',
                            ml: 2,
                            mb: 0.5,
                            bgcolor: isActive(child.path) ? 'action.selected' : 'transparent',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                            '&.Mui-selected': {
                              bgcolor: 'action.selected',
                              '&:hover': {
                                bgcolor: 'action.selected',
                              },
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <AddIcon sx={{ fontSize: '1.25rem' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.path!)}
                  selected={isActive(item.path!)}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    bgcolor: isActive(item.path!) ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )}
          </div>
        ))}
      </List>

      <Divider />

      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, mb: 0.5 }}
        >
          Signed in as
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {user?.username}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role === 'ORGANIZER'
            ? 'Event Organizer'
            : user?.role === 'ADMIN'
              ? 'Administrator'
              : 'Volunteer'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      variant={isMobile ? 'temporary' : 'persistent'}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          bgcolor: 'background.paper',
          boxShadow: isMobile ? 2 : 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
