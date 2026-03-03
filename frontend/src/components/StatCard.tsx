import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | null;
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'primary',
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: `${color}.main`,
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.15)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              display="flex"
              alignItems="center"
              color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
              sx={{ fontWeight: 600 }}
            >
              {trend === 'up' && <TrendingUpIcon sx={{ fontSize: '1rem', mr: 0.5 }} />}
              {trend === 'down' && <TrendingDownIcon sx={{ fontSize: '1rem', mr: 0.5 }} />}
              {trendValue && `${trendValue} `}
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}.lighter`,
              color: `${color}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
