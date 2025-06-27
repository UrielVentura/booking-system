'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface BookingConflict {
  type: 'system' | 'calendar';
  title: string;
  startTime: string;
  endTime: string;
}

interface BookingConflictCheckerProps {
  name: string;
  startTime: string;
  endTime: string;
  onValidationChange: (isValid: boolean, conflicts: BookingConflict[]) => void;
}

export function BookingConflictChecker({
  name,
  startTime,
  endTime,
  onValidationChange,
}: BookingConflictCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [conflicts, setConflicts] = useState<BookingConflict[]>([]);
  const [lastChecked, setLastChecked] = useState<string>('');

  useEffect(() => {
    const checkKey = `${name}-${startTime}-${endTime}`;

    // Solo verificar si hay datos completos y han cambiado
    if (name && startTime && endTime && checkKey !== lastChecked) {
      const timeoutId = setTimeout(() => {
        checkConflicts();
        setLastChecked(checkKey);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [name, startTime, endTime]);

  const checkConflicts = async () => {
    if (!name || !startTime || !endTime) {
      setConflicts([]);
      onValidationChange(true, []);
      return;
    }

    try {
      setChecking(true);

      const response = await fetch('/api/bookings/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const result = await response.json();
      const foundConflicts = result.conflicts || [];

      setConflicts(foundConflicts);
      onValidationChange(foundConflicts.length === 0, foundConflicts);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      // En caso de error, permitir que continúe pero mostrar advertencia
      setConflicts([]);
      onValidationChange(true, []);
    } finally {
      setChecking(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getConflictIcon = (type: string) => {
    return type === 'calendar' ? <EventIcon /> : <ScheduleIcon />;
  };

  const getConflictColor = (type: string) => {
    return type === 'calendar' ? 'primary' : 'secondary';
  };

  if (checking) {
    return (
      <Box display='flex' alignItems='center' py={1}>
        <CircularProgress size={16} sx={{ mr: 1 }} />
        <Typography variant='body2' color='text.secondary'>
          Checking for conflicts...
        </Typography>
      </Box>
    );
  }

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <Alert severity='warning' sx={{ mt: 2 }}>
      <Box>
        <Typography variant='body2' fontWeight='bold' gutterBottom>
          <WarningIcon
            sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
          />
          Scheduling Conflicts Detected
        </Typography>

        <List dense sx={{ mt: 1 }}>
          {conflicts.map((conflict, index) => (
            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {getConflictIcon(conflict.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display='flex' alignItems='center' gap={1}>
                    <Typography variant='body2'>{conflict.title}</Typography>
                    <Chip
                      label={
                        conflict.type === 'calendar'
                          ? 'Google Calendar'
                          : 'System Booking'
                      }
                      size='small'
                      color={getConflictColor(conflict.type)}
                      variant='outlined'
                    />
                  </Box>
                }
                secondary={
                  <Typography variant='caption' color='text.secondary'>
                    {formatDateTime(conflict.startTime)} -{' '}
                    {formatDateTime(conflict.endTime)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          Please choose a different time slot to avoid conflicts.
        </Typography>
      </Box>
    </Alert>
  );
}
