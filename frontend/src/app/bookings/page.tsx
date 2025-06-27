/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addHours } from 'date-fns';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export default function BookingsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(
    addHours(new Date(), 1)
  );
  const [endTime, setEndTime] = useState<Date | null>(addHours(new Date(), 2));

  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const getToken = async () => {
    const response = await fetch('/api/auth/session');

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Failed to parse /api/auth/session response as JSON');
    }

    if (!data.session?.accessToken) {
      throw new Error('No access token found in session');
    }

    return data.session.accessToken;
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const response = await fetch('http://localhost:3001/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load bookings');

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error loading bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!title || !startTime || !endTime) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const token = await getToken();

      const response = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const newBooking = await response.json();
      setBookings([...bookings, newBooking]);
      setCreateDialogOpen(false);
      setTitle('');
      toast.success('Booking created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const token = await getToken();

      const response = await fetch(`http://localhost:3001/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete booking');

      setBookings(bookings.filter((b) => b.id !== id));
      toast.success('Booking deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  if (userLoading || loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={4}
        >
          <Typography variant='h4' fontWeight='bold'>
            My Bookings
          </Typography>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Booking
          </Button>
        </Box>

        <Box display='flex' flexWrap='wrap' gap={3}>
          {bookings.length === 0 ? (
            <Box width='100%' sx={{ flexGrow: 1 }}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CalendarIcon
                  sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant='h6' color='text.secondary' gutterBottom>
                  No bookings yet
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Create your first booking to get started
                </Typography>
              </Paper>
            </Box>
          ) : (
            bookings.map((booking) => (
              <Box
                key={booking.id}
                sx={{
                  flex: '1 1 calc(33.333% - 24px)',
                  minWidth: '300px',
                  maxWidth: '100%',
                }}
              >
                <Card>
                  <CardContent>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='start'
                    >
                      <Box>
                        <Typography variant='h6' gutterBottom>
                          {booking.title}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {format(new Date(booking.startTime), 'PPp')}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          to {format(new Date(booking.endTime), 'p')}
                        </Typography>
                      </Box>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
        </Box>

        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}
              >
                <TextField
                  label='Title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                />
                <DateTimePicker
                  label='Start Time'
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
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
                  minDateTime={startTime || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBooking} variant='contained'>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
