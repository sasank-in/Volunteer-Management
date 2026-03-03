import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import {
  InboxOutlined as InboxOutlinedIcon,
  SearchOff as SearchOffIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'inbox' | 'search' | 'folder';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'inbox',
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return <SearchOffIcon sx={{ fontSize: 64 }} />;
      case 'folder':
        return <FolderOpenIcon sx={{ fontSize: 64 }} />;
      default:
        return <InboxOutlinedIcon sx={{ fontSize: 64 }} />;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2 }}>
        {icon || getDefaultIcon()}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
