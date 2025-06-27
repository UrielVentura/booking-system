'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function Dashboard() {
  const { user: authUser, isLoading } = useUser();
  const router = useRouter();

  const user = authUser?.user || authUser;

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
    <DashboardLayout>
      <Container maxWidth='lg'>
        <Box display='flex' flexWrap='wrap' gap={3}>
          {/* Welcome Card - ocupa 100% */}
          <Box sx={{ flex: '1 1 100%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant='h4' gutterBottom>
                Welcome to Your Dashboard
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Manage your appointments and calendar integrations all in one
                place.
              </Typography>
            </Paper>
          </Box>

          {/* Profile Card */}
          <Box
            sx={{
              flex: '1 1 calc(50% - 24px)',
              minWidth: '300px',
            }}
          >
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
          </Box>

          {/* Quick Actions Card */}
          <Box
            sx={{
              flex: '1 1 calc(50% - 24px)',
              minWidth: '300px',
            }}
          >
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box textAlign='center' py={2}>
                  <CalendarIcon
                    sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
                  />
                  <Typography variant='h6' gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box
                    sx={{
                      mt: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Button
                      variant='contained'
                      fullWidth
                      component={Link}
                      href='/bookings'
                    >
                      View All Bookings
                    </Button>
                    <Button variant='outlined' disabled fullWidth>
                      Connect Google Calendar
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </DashboardLayout>
  );
}
