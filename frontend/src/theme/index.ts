import { createTheme, ThemeOptions } from '@mui/material/styles';

// Modern B2B / corporate palette — deep navy primary, slate neutrals.
const PRIMARY = '#0F4C81';
const PRIMARY_LIGHT = '#3A6FA5';
const PRIMARY_DARK = '#0A3559';
const ACCENT = '#0EA5A4';

const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: '-0.015em',
      lineHeight: 1.25,
    },
    h3: {
      fontSize: '1.375rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.55,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.55,
    },
    subtitle1: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.8125rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 18px',
          boxShadow: 'none',
          transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        },
        sizeSmall: {
          padding: '4px 12px',
        },
        sizeLarge: {
          padding: '10px 22px',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            borderColor: 'rgba(15, 76, 129, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            '&:hover fieldset': {
              borderColor: PRIMARY,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
          height: 24,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'default',
      },
      styleOverrides: {
        root: {
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 8px',
          paddingTop: 6,
          paddingBottom: 6,
          '&.Mui-selected': {
            backgroundColor: 'rgba(15, 76, 129, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(15, 76, 129, 0.12)',
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0F172A',
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: 4,
          padding: '6px 10px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          height: 4,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#475569',
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E2E8F0',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: PRIMARY,
      light: PRIMARY_LIGHT,
      dark: PRIMARY_DARK,
      contrastText: '#ffffff',
    },
    secondary: {
      main: ACCENT,
      light: '#5EEAD4',
      dark: '#0F766E',
      contrastText: '#ffffff',
    },
    success: { main: '#16A34A', light: '#86EFAC', dark: '#15803D' },
    warning: { main: '#D97706', light: '#FCD34D', dark: '#B45309' },
    error:   { main: '#DC2626', light: '#FCA5A5', dark: '#B91C1C' },
    info:    { main: '#0284C7', light: '#7DD3FC', dark: '#0369A1' },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
    action: {
      hover: '#F1F5F9',
      selected: '#E2E8F0',
      disabled: '#CBD5E1',
    },
  },
});

export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#5B8FB9',
      light: '#7AABCB',
      dark: '#3A6FA5',
      contrastText: '#0B1220',
    },
    secondary: {
      main: '#2DD4BF',
      light: '#5EEAD4',
      dark: '#0F766E',
      contrastText: '#0B1220',
    },
    success: { main: '#22C55E' },
    warning: { main: '#EAB308' },
    error:   { main: '#F87171' },
    info:    { main: '#38BDF8' },
    background: {
      default: '#0B1220',
      paper: '#111827',
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
    divider: '#1E293B',
    action: {
      hover: '#1E293B',
      selected: '#243044',
      disabled: '#475569',
    },
  },
});
