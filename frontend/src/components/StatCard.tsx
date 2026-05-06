import React from 'react';
import { Box, Card, CardContent, Typography, alpha, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const accent = theme.palette[color].main;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 2.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1.1, mb: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              display="flex"
              alignItems="center"
              color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
              sx={{ fontWeight: 500, mt: 0.5 }}
            >
              {trend === 'up' && <TrendingUpIcon sx={{ fontSize: '0.95rem', mr: 0.5 }} />}
              {trend === 'down' && <TrendingDownIcon sx={{ fontSize: '0.95rem', mr: 0.5 }} />}
              {trendValue && `${trendValue} `}
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: alpha(accent, 0.1),
              color: accent,
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
