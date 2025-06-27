// components/GoogleCalendarIntegration.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface CalendarStatus {
  connected: boolean;
  email?: string;
}

interface GoogleCalendarIntegrationProps {
  onStatusChange?: (connected: boolean) => void;
}

export function GoogleCalendarIntegration({
  onStatusChange,
}: GoogleCalendarIntegrationProps) {
  const [status, setStatus] = useState<CalendarStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-calendar/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        onStatusChange?.(data.connected);
      }
    } catch (err) {
      console.error('Failed to check calendar status:', err);
      setError('Failed to check calendar status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      const response = await fetch('/api/google-calendar/connect', {
        method: 'POST',
      });

      if (response.ok) {
        const { authUrl } = await response.json();
        // Redirect to Google OAuth
        window.location.href = authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (err) {
      console.error('Failed to connect calendar:', err);
      setError('Failed to connect to Google Calendar');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      const response = await fetch('/api/google-calendar/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setStatus({ connected: false });
        onStatusChange?.(false);
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (err) {
      console.error('Failed to disconnect calendar:', err);
      setError('Failed to disconnect Google Calendar');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box
            display='flex'
            alignItems='center'
            justifyContent='center'
            py={2}
          >
            <CircularProgress size={24} />
            <Typography variant='body2' sx={{ ml: 1 }}>
              Checking calendar status...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display='flex' alignItems='center' mb={2}>
          <CalendarIcon color='primary' sx={{ mr: 1 }} />
          <Typography variant='h6'>Google Calendar</Typography>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box>
            {status.connected ? (
              <Box>
                <Box display='flex' alignItems='center' mb={1}>
                  <CheckIcon color='success' sx={{ mr: 1, fontSize: 20 }} />
                  <Chip label='Connected' color='success' size='small' />
                </Box>
                {status.email && (
                  <Typography variant='body2' color='text.secondary'>
                    {status.email}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box>
                <Box display='flex' alignItems='center' mb={1}>
                  <WarningIcon color='warning' sx={{ mr: 1, fontSize: 20 }} />
                  <Chip label='Not Connected' color='warning' size='small' />
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  Connect to prevent booking conflicts
                </Typography>
              </Box>
            )}
          </Box>

          <Box>
            <Button
              variant={status.connected ? 'outlined' : 'contained'}
              color={status.connected ? 'error' : 'primary'}
              onClick={status.connected ? handleDisconnect : handleConnect}
              disabled={connecting}
              startIcon={connecting ? <CircularProgress size={16} /> : null}
            >
              {connecting
                ? status.connected
                  ? 'Disconnecting...'
                  : 'Connecting...'
                : status.connected
                ? 'Disconnect'
                : 'Connect'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
