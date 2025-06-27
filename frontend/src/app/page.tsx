'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Security as ShieldIcon,
  AccessTime as ClockIcon,
  Bolt as ZapIcon,
} from '@mui/icons-material';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #e3f2fd, #e8eaf6)',
      }}
    >
      <Container maxWidth='lg' sx={{ py: 8 }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={8}
        >
          <Typography variant='h5' fontWeight='bold'>
            Booking System
          </Typography>
          <Button
            variant='contained'
            color='primary'
            size='large'
            href='/api/auth/login'
          >
            Sign In with Google
          </Button>
        </Box>

        <Box textAlign='center' mb={8}>
          <Typography variant='h2' fontWeight='bold' gutterBottom>
            Smart Scheduling,{' '}
            <Box component='span' color='primary.main'>
              Simplified
            </Box>
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
            maxWidth='md'
            mx='auto'
          >
            Book appointments seamlessly with Google Calendar integration. No
            double bookings, no conflicts, just smooth scheduling.
          </Typography>
        </Box>

        <Box
          display='flex'
          flexWrap='wrap'
          gap={4}
          mb={8}
          justifyContent='center'
        >
          <Box
            sx={{
              flex: '1 1 calc(25% - 32px)',
              minWidth: '250px',
              maxWidth: '100%',
            }}
          >
            <FeatureCard
              icon={<CalendarIcon sx={{ fontSize: 40 }} />}
              title='Google Calendar Sync'
              description='Automatically sync with your existing calendar'
            />
          </Box>
          <Box
            sx={{
              flex: '1 1 calc(25% - 32px)',
              minWidth: '250px',
              maxWidth: '100%',
            }}
          >
            <FeatureCard
              icon={<ShieldIcon sx={{ fontSize: 40 }} />}
              title='Conflict Prevention'
              description='Never double-book with smart conflict detection'
            />
          </Box>
          <Box
            sx={{
              flex: '1 1 calc(25% - 32px)',
              minWidth: '250px',
              maxWidth: '100%',
            }}
          >
            <FeatureCard
              icon={<ClockIcon sx={{ fontSize: 40 }} />}
              title='Real-time Updates'
              description='Instant updates across all your devices'
            />
          </Box>
          <Box
            sx={{
              flex: '1 1 calc(25% - 32px)',
              minWidth: '250px',
              maxWidth: '100%',
            }}
          >
            <FeatureCard
              icon={<ZapIcon sx={{ fontSize: 40 }} />}
              title='Fast & Intuitive'
              description='Book appointments in seconds, not minutes'
            />
          </Box>
        </Box>

        <Box textAlign='center'>
          <Button
            variant='contained'
            color='primary'
            size='large'
            href='/api/auth/login'
            sx={{ py: 2, px: 4, fontSize: '1.1rem' }}
          >
            Get Started Free →
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card sx={{ height: '100%', textAlign: 'center' }}>
      <CardContent>
        <Box color='primary.main' mb={2}>
          {icon}
        </Box>
        <Typography variant='h6' gutterBottom fontWeight='bold'>
          {title}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
