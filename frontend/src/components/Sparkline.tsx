import React from 'react';
import { Box, useTheme } from '@mui/material';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  /** Render as bars instead of an area chart. */
  variant?: 'area' | 'bars';
}

/**
 * Tiny inline SVG sparkline. No chart library — keeps the bundle slim and the
 * dashboard owns its own visual treatment.
 */
const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 240,
  height = 56,
  color,
  variant = 'area',
}) => {
  const theme = useTheme();
  const stroke = color ?? theme.palette.primary.main;

  if (data.length === 0) {
    return <Box sx={{ width, height }} />;
  }

  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min || 1;

  if (variant === 'bars') {
    const slot = width / data.length;
    const barWidth = Math.max(slot - 2, 1);
    return (
      <svg width={width} height={height} role="img" aria-hidden>
        {data.map((value, i) => {
          const h = ((value - min) / range) * (height - 4);
          const x = i * slot + (slot - barWidth) / 2;
          const y = height - h;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(h, 2)}
              rx={1}
              fill={stroke}
              opacity={value === 0 ? 0.25 : 0.9}
            />
          );
        })}
      </svg>
    );
  }

  const points = data.map((value, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const linePath = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(' ');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} role="img" aria-hidden>
      <path d={areaPath} fill={stroke} fillOpacity={0.12} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.75} strokeLinejoin="round" />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r={2.5}
          fill={stroke}
        />
      )}
    </svg>
  );
};

export default Sparkline;
