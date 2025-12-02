import React from 'react';
import { Alert, Stack, Button } from '@mui/material';

const ErrorBanner = ({ message, onRetry }) => {
  if (!message) return null;
  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      <Alert severity="error" action={onRetry ? (
        <Button color="inherit" size="small" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}>
        {message}
      </Alert>
    </Stack>
  );
};

export default ErrorBanner;
