import React from 'react';
import { Chip, ChipProps } from '@mui/material';

type EventStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
type ParticipationStatus = 'REGISTERED' | 'ATTENDED' | 'NO_SHOW' | 'CANCELLED';
type UserStatus = 'ACTIVE' | 'INACTIVE';

type StatusKind = 'event' | 'participation' | 'user';

interface StatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  kind: StatusKind;
  status: EventStatus | ParticipationStatus | UserStatus | string;
}

const EVENT_MAP: Record<string, { label: string; color: ChipProps['color'] }> = {
  OPEN: { label: 'Open', color: 'success' },
  FULL: { label: 'Full', color: 'warning' },
  COMPLETED: { label: 'Completed', color: 'info' },
  CANCELLED: { label: 'Cancelled', color: 'error' },
};

const PARTICIPATION_MAP: Record<string, { label: string; color: ChipProps['color'] }> = {
  REGISTERED: { label: 'Registered', color: 'info' },
  ATTENDED: { label: 'Attended', color: 'success' },
  NO_SHOW: { label: 'No-show', color: 'error' },
  CANCELLED: { label: 'Cancelled', color: 'default' },
};

const USER_MAP: Record<string, { label: string; color: ChipProps['color'] }> = {
  ACTIVE: { label: 'Active', color: 'success' },
  INACTIVE: { label: 'Inactive', color: 'default' },
};

/**
 * One source of truth for status label + colour across the app.
 * Drop-in replacement for the various inline `<Chip label={...} color={...}/>` pairs.
 */
const StatusChip: React.FC<StatusChipProps> = ({ kind, status, size = 'small', ...rest }) => {
  const map = kind === 'event' ? EVENT_MAP : kind === 'participation' ? PARTICIPATION_MAP : USER_MAP;
  const entry = map[status] ?? { label: String(status), color: 'default' as ChipProps['color'] };
  return <Chip size={size} variant="outlined" label={entry.label} color={entry.color} {...rest} />;
};

export default StatusChip;
