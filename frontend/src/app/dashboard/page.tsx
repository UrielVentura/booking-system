'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position='static' color='primary'>
        <Toolbar>
          <CalendarIcon sx={{ mr: 2 }} />
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            Booking System
          </Typography>
          <Typography sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            Welcome, {user.name}!
          </Typography>
          <Avatar
            src={user.picture || ''}
            alt={user.name || 'User'}
            sx={{ mr: 2 }}
          />
          <IconButton color='inherit' href='/api/auth/logout' component='a'>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant='h4' gutterBottom>
                Welcome to Your Dashboard
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Manage your appointments and calendar integrations all in one
                place.
              </Typography>
            </Paper>
          </Grid>

          {/* Profile Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Box display='flex' alignItems='center' mb={2}>
                  <PersonIcon color='primary' sx={{ mr: 1 }} />
                  <Typography variant='h6'>Your Profile</Typography>
                </Box>
                <Box
                  display='flex'
                  alignItems='center'
                  gap={2}
                  p={2}
                  bgcolor='grey.50'
                  borderRadius={2}
                >
                  <Avatar
                    src={user.picture || ''}
                    alt={user.name || 'User'}
                    sx={{ width: 60, height: 60 }}
                  />
                  <Box>
                    <Typography variant='body1' fontWeight='bold'>
                      {user.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Calendar Integration Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box textAlign='center' py={2}>
                  <CalendarIcon
                    sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
                  />
                  <Typography variant='h6' gutterBottom>
                    Calendar Integration Coming Soon
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 3 }}
                  >
                    Soon you&apos;ll be able to connect your Google Calendar and
                    manage all your bookings seamlessly.
                  </Typography>
                  <Button variant='outlined' disabled>
                    Connect Google Calendar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
