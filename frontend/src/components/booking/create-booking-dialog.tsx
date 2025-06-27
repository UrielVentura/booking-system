'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addHours, isAfter, isBefore } from 'date-fns';
import { bookingsAPI } from '@/lib/api/bookings';

interface CreateBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (booking: any) => void;
}

export function CreateBookingDialog({
  open,
  onClose,
  onCreate,
}: CreateBookingDialogProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(addHours(new Date(), 1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title || !startTime || !endTime) {
      setError('Please fill all fields');
      return;
    }

    if (isBefore(endTime, startTime)) {
      setError('End time must be after start time');
      return;
    }

    if (isBefore(startTime, new Date())) {
      setError('Cannot create bookings in the past');
      return;
    }

    setLoading(true);
    setError(null);
    setConflictError(null);

    try {
      // Check for conflicts first
      const conflicts = await bookingsAPI.checkConflicts(
        startTime.toISOString(),
        endTime.toISOString()
      );

      if (conflicts.hasConflicts) {
        setConflictError('This time slot conflicts with an existing booking');
        setLoading(false);
        return;
      }

      // Create the booking
      await onCreate({
        title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      // Reset form
      setTitle('');
      setStartTime(new Date());
      setEndTime(addHours(new Date(), 1));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setError(null);
      setConflictError(null);
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>Create New Booking</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {error && <Alert severity='error'>{error}</Alert>}
            {conflictError && <Alert severity='warning'>{conflictError}</Alert>}

            <TextField
              label='Title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            <DateTimePicker
              label='Start Time'
              value={startTime}
              onChange={(newValue) => {
                setStartTime(newValue);
                if (newValue && endTime && isBefore(endTime, newValue)) {
                  setEndTime(addHours(newValue, 1));
                }
              }}
              disabled={loading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />

            <DateTimePicker
              label='End Time'
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              disabled={loading}
              minDateTime={startTime || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant='contained'
            disabled={loading || !title || !startTime || !endTime}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
