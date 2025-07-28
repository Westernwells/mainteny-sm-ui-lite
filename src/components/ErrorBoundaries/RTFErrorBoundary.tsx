import React from 'react';
import {Box, Typography} from '@mui/material';

interface RTFErrorBoundaryProps {
  children: React.ReactNode;
}

interface RTFErrorBoundaryState {
  hasError: boolean;
}

export class RTFErrorBoundary extends React.Component<
  RTFErrorBoundaryProps,
  RTFErrorBoundaryState
> {
  constructor(props: RTFErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(): RTFErrorBoundaryState {
    return {hasError: true};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      'RichTextField ErrorBoundary caught an error',
      error,
      errorInfo,
    );
  }

  render() {
    const {hasError} = this.state;
    const {children} = this.props;

    if (hasError) {
      return (
        <Box
          sx={{
            width: '100%',
            padding: 2,
            backgroundColor: '#ffeef0',
            color: '#b71c1c',
            border: '1px solid #f44336',
            borderRadius: 2,
            textAlign: 'center',
          }}>
          <Typography variant="body2">
            An error occurred while loading the text field.
          </Typography>
        </Box>
      );
    }

    return children;
  }
}
