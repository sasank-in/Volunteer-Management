import React, { ReactNode, ErrorInfo } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              gap: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.paper',
                width: '100%',
              }}
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: '4rem',
                  color: 'error.main',
                  mb: 2,
                }}
              />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We encountered an unexpected error. Our team has been notified and is working on
                a fix.
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                }}
              >
                {this.state.error?.message}
              </Typography>
              <Button variant="contained" onClick={this.handleReset} size="large">
                Return to Home
              </Button>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
