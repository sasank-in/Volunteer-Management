import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const formatDateTime = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
};

export const formatDateRelative = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const isDateInFuture = (dateString: string): boolean => {
  return new Date(dateString) > new Date();
};

export const isDateInPast = (dateString: string): boolean => {
  return new Date(dateString) < new Date();
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#10b981';
  if (rating >= 3.5) return '#3b82f6';
  if (rating >= 2.5) return '#f59e0b';
  return '#ef4444';
};

export const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Average';
  return 'Fair';
};

export const getEventStatusColor = (
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED'
): string => {
  switch (status) {
    case 'OPEN':
      return '#10b981';
    case 'FULL':
      return '#f59e0b';
    case 'COMPLETED':
      return '#3b82f6';
    case 'CANCELLED':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

export const getEventStatusLabel = (
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED'
): string => {
  switch (status) {
    case 'OPEN':
      return 'Open';
    case 'FULL':
      return 'Full';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export const calculateProgressPercentage = (registered: number, required: number): number => {
  if (required === 0) return 0;
  return Math.min(Math.round((registered / required) * 100), 100);
};

export const truncateText = (text: string, length: number): string => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
