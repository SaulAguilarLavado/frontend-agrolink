import React from 'react';
import { Container, Typography, Button, Stack } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary atrapó un error:', error, errorInfo);
  }

  handleReload = () => {
    if (this.props.onReset) {
      try { this.props.onReset(); } catch (_) { /* ignore */ }
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container sx={{ py: 6 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h5" color="error">Ocurrió un error en la aplicación.</Typography>
            <Typography variant="body2" color="text.secondary">Intenta recargar la vista. Si el problema persiste, vuelve más tarde.</Typography>
            <Button variant="outlined" onClick={this.handleReload}>Recargar vista</Button>
          </Stack>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
