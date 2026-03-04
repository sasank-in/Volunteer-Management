import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { create } from 'zustand';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
  showToast: (message: string, severity?: AlertColor) => void;
  hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
  open: false,
  message: '',
  severity: 'info',
  showToast: (message: string, severity: AlertColor = 'info') =>
    set({ open: true, message, severity }),
  hideToast: () => set({ open: false }),
}));

export const Toast: React.FC = () => {
  const { open, message, severity, hideToast } = useToast();

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={hideToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={hideToast} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
